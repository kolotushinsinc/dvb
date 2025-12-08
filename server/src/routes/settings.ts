import express, { Request, Response } from 'express';
import Settings from '../models/Settings';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get settings
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        address: 'г. Находка, ул. Ленинская 10, офис 10',
        phone: '+7 (914) 731-99-09',
        email: 'siriusdark999@yandex.ru',
        telegram: '',
      });
    }
    
    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении настроек',
      error: error.message,
    });
  }
});

// Update settings (requires authentication)
router.put('/', auth, async (req: Request, res: Response) => {
  try {
    const { address, phone, email, telegram } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create({
        address,
        phone,
        email,
        telegram,
      });
    } else {
      // Update existing settings
      settings.address = address;
      settings.phone = phone;
      settings.email = email;
      settings.telegram = telegram || '';
      await settings.save();
    }
    
    res.json({
      success: true,
      data: settings,
      message: 'Настройки успешно обновлены',
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении настроек',
      error: error.message,
    });
  }
});

export default router;
