import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Post()
  async createTask(@Body() body: CreateTaskDto, @Request() req) {
    const createdBy = req.user;
    return this.taskService.createTask(
      body.title,
      body.description ?? '',
      createdBy.id,
      body.assignedToId,
    );
  }

  @Get()
  async getTasks(@Request() req) {
    return this.taskService.getAllTasks(req.user);
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Patch(':id')
  async updateTask(@Param('id') id: string, @Body() body: any, @Request() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Missing user in request');
    }
    return this.taskService.updateTask(id, body, req.user);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Request() req) {
    return this.taskService.deleteTask(id, req.user);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN)
  async assignTask(
    @Param('id') taskId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    return this.taskService.assignTask(taskId, body.userId, req.user);
  }
}
