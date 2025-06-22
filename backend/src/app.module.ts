import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Task } from './tasks/task.entity';
import { EventLog, EventLogSchema } from './event-log/event-log.schema';
import { TasksModule } from './tasks/tasks.module';
import { TaskGateway } from './gateway/task.gateway';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Task],
      synchronize: true, // ❗ turn off in production
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost/taskmanager-mongo',
    ),
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
    AuthModule,
    UsersModule,
    TasksModule,
    GatewayModule,
  ],
  providers: [TaskGateway],
  controllers: [],
})
export class AppModule {}
