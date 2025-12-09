import express, { Request, Response } from 'express';
import Slider from '../models/Slider';
import { auth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/slider';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'));
    }
  },
});

// Get slider data (public route)
router.get('/', async (req: Request, res: Response) => {
  try {
    let slider = await Slider.findOne();
    
    // If no slider exists, create default slider
    if (!slider) {
      slider = await Slider.create({});
    }
    
    // Filter only active slides and sort by order
    const activeSlides = slider.slides
      .filter(slide => slide.isActive)
      .sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: {
        slides: activeSlides,
      },
    });
  } catch (error: any) {
    console.error('Error fetching slider:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении слайдера',
      error: error.message,
    });
  }
});

// Get all slides including inactive (admin only)
router.get('/admin', auth, async (req: Request, res: Response) => {
  try {
    let slider = await Slider.findOne();
    
    if (!slider) {
      slider = await Slider.create({});
    }
    
    // Sort by order
    const sortedSlides = slider.slides.sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: {
        slides: sortedSlides,
      },
    });
  } catch (error: any) {
    console.error('Error fetching slider:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении слайдера',
      error: error.message,
    });
  }
});

// Add new slide (admin only)
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { title, subtitle, buttonText, buttonLink, image, order, isActive } = req.body;
    
    let slider = await Slider.findOne();
    
    if (!slider) {
      slider = await Slider.create({ slides: [] });
    }
    
    // Add new slide
    slider.slides.push({
      title,
      subtitle,
      buttonText,
      buttonLink: buttonLink || '',
      image,
      order: order !== undefined ? order : slider.slides.length,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    await slider.save();
    
    res.json({
      success: true,
      data: slider,
      message: 'Слайд успешно добавлен',
    });
  } catch (error: any) {
    console.error('Error adding slide:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении слайда',
      error: error.message,
    });
  }
});

// Update slide (admin only)
router.put('/:slideId', auth, async (req: Request, res: Response) => {
  try {
    const { slideId } = req.params;
    const { title, subtitle, buttonText, buttonLink, image, order, isActive } = req.body;
    
    const slider = await Slider.findOne();
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Слайдер не найден',
      });
    }
    
    const slideIndex = slider.slides.findIndex(
      (slide) => slide._id?.toString() === slideId
    );
    
    if (slideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Слайд не найден',
      });
    }
    
    // Update slide
    if (title !== undefined) slider.slides[slideIndex].title = title;
    if (subtitle !== undefined) slider.slides[slideIndex].subtitle = subtitle;
    if (buttonText !== undefined) slider.slides[slideIndex].buttonText = buttonText;
    if (buttonLink !== undefined) slider.slides[slideIndex].buttonLink = buttonLink;
    if (image !== undefined) slider.slides[slideIndex].image = image;
    if (order !== undefined) slider.slides[slideIndex].order = order;
    if (isActive !== undefined) slider.slides[slideIndex].isActive = isActive;
    
    await slider.save();
    
    res.json({
      success: true,
      data: slider,
      message: 'Слайд успешно обновлен',
    });
  } catch (error: any) {
    console.error('Error updating slide:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении слайда',
      error: error.message,
    });
  }
});

// Delete slide (admin only)
router.delete('/:slideId', auth, async (req: Request, res: Response) => {
  try {
    const { slideId } = req.params;
    
    const slider = await Slider.findOne();
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Слайдер не найден',
      });
    }
    
    const slideIndex = slider.slides.findIndex(
      (slide) => slide._id?.toString() === slideId
    );
    
    if (slideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Слайд не найден',
      });
    }
    
    // Remove slide
    slider.slides.splice(slideIndex, 1);
    await slider.save();
    
    res.json({
      success: true,
      data: slider,
      message: 'Слайд успешно удален',
    });
  } catch (error: any) {
    console.error('Error deleting slide:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении слайда',
      error: error.message,
    });
  }
});

// Upload slide image (admin only)
router.post('/upload', auth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не загружен',
      });
    }
    
    const imageUrl = `/uploads/slider/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
      },
      message: 'Изображение успешно загружено',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке изображения',
      error: error.message,
    });
  }
});

export default router;
