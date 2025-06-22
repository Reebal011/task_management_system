import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventLogDocument = EventLog & Document;

@Schema()
export class EventLog {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, type: String }) 
  taskId: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);
