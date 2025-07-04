import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskStatus } from './task.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog, EventLogDocument } from '../event-log/event-log.schema';
import { TaskGateway } from '../gateway/task.gateway';
import redisClient from 'src/redis';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectModel(EventLog.name)
    private eventLogModel: Model<EventLogDocument>,
    private gateway: TaskGateway,
  ) {}

  async createTask(
    title: string,
    description: string,
    createdById: string,
    assignedToId: string,
  ) {
    const creator = await this.userRepo.findOne({ where: { id: createdById } });
    const assignee = await this.userRepo.findOne({
      where: { id: assignedToId },
    });
    if (!creator) throw new NotFoundException(`Creator user not found`);
    if (creator.role !== 'admin') {
      throw new ForbiddenException('Only admin users can create tasks.');
    }
    if (!assignee) throw new NotFoundException(`Assigned user not found`);

    const task = this.taskRepo.create({
      title,
      description,
      createdBy: creator,
      assignedTo: assignee,
      status: TaskStatus.TODO,
    });
    await this.taskRepo.save(task);

    await this.logEvent(
      'task_created',
      `Task "${title}" created`,
      task.id,
      creator.id,
    );
    try {
      this.gateway.emitTaskUpdate('taskCreated', task);
    } catch (err) {
      console.error('WebSocket Emit Error:', err.message);
    }
    // Invalidate cache
    await redisClient.del('tasks:all');
    return task;
  }

  async getAllTasks(requestingUser: User) {
    const cacheKey = `tasks:all:${requestingUser.role}:${requestingUser.id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    let tasks;
    if (requestingUser.role === 'admin') {
      tasks = await this.taskRepo.find({
        relations: ['createdBy', 'assignedTo'],
      });
    } else {
      tasks = await this.taskRepo.find({
        where: [{ assignedTo: { id: requestingUser.id } }],
        relations: ['createdBy', 'assignedTo'],
      });
    }
    await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 }); // cache for 60s
    return tasks;
  }

  async getTaskById(id: string) {
    const cacheKey = `tasks:one:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo'],
    });
    if (!task) throw new NotFoundException('Task not found');
    await redisClient.set(cacheKey, JSON.stringify(task), { EX: 60 });
    return task;
  }

  async updateTask(id: string, data: Partial<Task>, updatedBy: User) {
    const task = await this.getTaskById(id);

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;

    if (data.assignedToId !== undefined) {
      const newAssignee = await this.userRepo.findOne({
        where: { id: data.assignedToId },
      });
      if (!newAssignee) {
        throw new NotFoundException(
          `User with ID ${data.assignedToId} not found`,
        );
      }
      task.assignedTo = newAssignee;
    }

    await this.taskRepo.save(task);

    await this.logEvent(
      'task_updated',
      `Task #${id} updated`,
      id,
      updatedBy?.id ?? '',
    );
    await this.gateway.emitTaskUpdate('taskUpdated', task);
    // Invalidate cache immediately for all users
    const keys = await redisClient.keys('tasks:all:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key: string) => redisClient.del(key)));
    }
    await redisClient.del(`tasks:one:${id}`);
    return task;
  }

  async deleteTask(id: string, deletedBy: User) {
    const task = await this.getTaskById(id);

    // Only admin users can delete tasks
    if (deletedBy.role !== 'admin') {
      throw new NotFoundException(
        'You are not authorized to delete this task.',
      );
    }

    await this.taskRepo.remove(task);

    await this.logEvent(
      'task_deleted',
      `Task #${id} deleted`,
      id,
      deletedBy.id,
    );

    await this.gateway.emitTaskUpdate('taskDeleted', task);
    // Invalidate cache immediately for all users
    const keys = await redisClient.keys('tasks:all:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key: string) => redisClient.del(key)));
    }
    await redisClient.del(`tasks:one:${id}`);
    return { message: 'Task deleted' };
  }

  async assignTask(taskId: string, userId: string, assignedBy: User) {
    const task = await this.getTaskById(taskId);
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    task.assignedTo = user;
    await this.taskRepo.save(task);

    await this.logEvent(
      'task_assigned',
      `Task #${taskId} assigned to user #${userId}`,
      taskId,
      assignedBy.id,
    );
    await this.gateway.emitTaskUpdate('taskAssigned', {
      taskId: task.id,
      assignedTo: user.id,
    });
    return task;
  }

  private async logEvent(
    eventType: string,
    message: string,
    taskId: string,
    userId: string,
  ) {
    if (!userId) {
      console.error(`[logEvent] Missing userId for event: ${eventType}`);
      return;
    }

    const log = new this.eventLogModel({ eventType, message, taskId, userId });
    await log.save();
  }
}
