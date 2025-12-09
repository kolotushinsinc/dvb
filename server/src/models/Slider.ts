import mongoose, { Document, Schema } from 'mongoose';

export interface ISlide {
  _id?: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface ISlider extends Document {
  slides: ISlide[];
  createdAt: Date;
  updatedAt: Date;
}

const slideSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  buttonLink: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: true });

const sliderSchema = new Schema<ISlider>(
  {
    slides: {
      type: [slideSchema],
      default: [
        {
          title: 'Эксклюзивные очки из Китая',
          subtitle: 'Уникальные модели, которых нет больше нигде',
          buttonText: 'Смотреть коллекцию',
          buttonLink: '/catalog',
          image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200',
          order: 0,
          isActive: true,
        },
        {
          title: 'Европейская одежда премиум-класса',
          subtitle: 'Качество и стиль от ведущих брендов',
          buttonText: 'Выбрать одежду',
          buttonLink: '/catalog',
          image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
          order: 1,
          isActive: true,
        },
        {
          title: 'Стильная обувь из Европы и Турции',
          subtitle: 'Комфорт и элегантность в каждой паре',
          buttonText: 'Подобрать обувь',
          buttonLink: '/catalog',
          image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200',
          order: 2,
          isActive: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISlider>('Slider', sliderSchema);
