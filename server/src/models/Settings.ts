import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  address: string;
  phone: string;
  email: string;
  telegram?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    address: {
      type: String,
      required: true,
      default: 'г. Находка, ул. Ленинская 10, офис 10',
    },
    phone: {
      type: String,
      required: true,
      default: '+7 (914) 731-99-09',
    },
    email: {
      type: String,
      required: true,
      default: 'siriusdark999@yandex.ru',
    },
    telegram: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
