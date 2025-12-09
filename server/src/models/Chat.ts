import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: 'CLIENT' | 'ADMIN';
  senderName: string; // Имя отправителя (для админов)
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IChat extends Document {
  clientId: Types.ObjectId;
  clientName: string; // Кэшированное имя клиента для быстрого доступа
  clientEmail: string; // Кэшированный email клиента
  messages: IMessage[];
  lastMessageAt: Date;
  unreadByAdminCount: number; // Количество непрочитанных сообщений от клиента
  unreadByClientCount: number; // Количество непрочитанных сообщений от админа
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['CLIENT', 'ADMIN'],
    required: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new Schema<IChat>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Один клиент - один чат
    index: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  unreadByAdminCount: {
    type: Number,
    default: 0,
    min: 0
  },
  unreadByClientCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Индекс для быстрого поиска чатов с непрочитанными сообщениями
chatSchema.index({ unreadByAdminCount: 1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
