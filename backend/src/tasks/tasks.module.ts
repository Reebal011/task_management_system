import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { EventLog, EventLogSchema } from '../event-log/event-log.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
    GatewayModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
