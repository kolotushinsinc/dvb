import express, { Request, Response } from 'express';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { Types } from 'mongoose';

const router = express.Router();

// Получить или создать чат для клиента
router.get('/my-chat', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, что пользователь - клиент
    const user = await User.findById(userId);
    if (!user || !user.isClient) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Ищем существующий чат
    let chat = await Chat.findOne({ clientId: userId });

    // Если чата нет, создаем новый
    if (!chat) {
      chat = new Chat({
        clientId: userId,
        clientName: `${user.firstName} ${user.lastName}`,
        clientEmail: user.email,
        messages: [],
        lastMessageAt: new Date(),
        unreadByAdminCount: 0,
        unreadByClientCount: 0
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting client chat:', error);
    res.status(500).json({ message: 'Ошибка при получении чата' });
  }
});

// Отправить сообщение от клиента
router.post('/my-chat/messages', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Сообщение не может быть пустым' });
    }

    // Проверяем, что пользователь - клиент
    const user = await User.findById(userId);
    if (!user || !user.isClient) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Ищем или создаем чат
    let chat = await Chat.findOne({ clientId: userId });
    
    if (!chat) {
      chat = new Chat({
        clientId: userId,
        clientName: `${user.firstName} ${user.lastName}`,
        clientEmail: user.email,
        messages: [],
        lastMessageAt: new Date(),
        unreadByAdminCount: 0,
        unreadByClientCount: 0
      });
    }

    // Добавляем сообщение
    const newMessage = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(userId),
      senderType: 'CLIENT' as const,
      senderName: `${user.firstName} ${user.lastName}`,
      content: content.trim(),
      isRead: false,
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    chat.unreadByAdminCount += 1;

    await chat.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Ошибка при отправке сообщения' });
  }
});

// Пометить сообщения как прочитанные для клиента
router.post('/my-chat/mark-read', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const chat = await Chat.findOne({ clientId: userId });
    
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Помечаем все сообщения от админа как прочитанные
    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.senderType === 'ADMIN' && !msg.isRead) {
        msg.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      chat.unreadByClientCount = 0;
      await chat.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса сообщений' });
  }
});

// ADMIN ROUTES

// Получить все чаты (только для админов)
router.get('/admin/chats', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, что пользователь - админ или менеджер
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && !user.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Получаем все чаты, отсортированные по последнему сообщению
    const chats = await Chat.find()
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json(chats);
  } catch (error) {
    console.error('Error getting admin chats:', error);
    res.status(500).json({ message: 'Ошибка при получении чатов' });
  }
});

// Получить конкретный чат по ID клиента (только для админов)
router.get('/admin/chats/:clientId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clientId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, что пользователь - админ или менеджер
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && !user.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const chat = await Chat.findOne({ clientId });
    
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ message: 'Ошибка при получении чата' });
  }
});

// Отправить сообщение от админа
router.post('/admin/chats/:clientId/messages', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clientId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Сообщение не может быть пустым' });
    }

    // Проверяем, что пользователь - админ или менеджер
    const admin = await User.findById(userId);
    if (!admin || (!admin.isAdmin && !admin.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Проверяем, что клиент существует
    const client = await User.findById(clientId);
    if (!client || !client.isClient) {
      return res.status(404).json({ message: 'Клиент не найден' });
    }

    // Ищем или создаем чат
    let chat = await Chat.findOne({ clientId });
    
    if (!chat) {
      chat = new Chat({
        clientId: new Types.ObjectId(clientId),
        clientName: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        messages: [],
        lastMessageAt: new Date(),
        unreadByAdminCount: 0,
        unreadByClientCount: 0
      });
    }

    // Добавляем сообщение
    const newMessage = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(userId),
      senderType: 'ADMIN' as const,
      senderName: `${admin.firstName} ${admin.lastName}`,
      content: content.trim(),
      isRead: false,
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    chat.unreadByClientCount += 1;

    await chat.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending admin message:', error);
    res.status(500).json({ message: 'Ошибка при отправке сообщения' });
  }
});

// Пометить сообщения как прочитанные для админа
router.post('/admin/chats/:clientId/mark-read', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clientId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, что пользователь - админ или менеджер
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && !user.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const chat = await Chat.findOne({ clientId });
    
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Помечаем все сообщения от клиента как прочитанные
    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.senderType === 'CLIENT' && !msg.isRead) {
        msg.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      chat.unreadByAdminCount = 0;
      await chat.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса сообщений' });
  }
});

// Получить количество непрочитанных сообщений для админа
router.get('/admin/unread-count', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, что пользователь - админ или менеджер
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && !user.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Подсчитываем общее количество непрочитанных сообщений
    const result = await Chat.aggregate([
      {
        $group: {
          _id: null,
          totalUnread: { $sum: '$unreadByAdminCount' }
        }
      }
    ]);

    const unreadCount = result.length > 0 ? result[0].totalUnread : 0;

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Ошибка при получении количества непрочитанных сообщений' });
  }
});

// Long polling endpoint для получения новых сообщений (клиент)
router.get('/my-chat/poll', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const lastMessageId = req.query.lastMessageId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(userId);
    if (!user || !user.isClient) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const chat = await Chat.findOne({ clientId: userId });
    
    if (!chat) {
      return res.json({ messages: [] });
    }

    // Если указан lastMessageId, возвращаем только новые сообщения
    if (lastMessageId) {
      const lastIndex = chat.messages.findIndex(
        msg => msg._id.toString() === lastMessageId
      );
      
      if (lastIndex !== -1) {
        const newMessages = chat.messages.slice(lastIndex + 1);
        return res.json({ messages: newMessages });
      }
    }

    // Возвращаем все сообщения
    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error polling messages:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Long polling endpoint для получения новых сообщений (админ)
router.get('/admin/chats/:clientId/poll', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { clientId } = req.params;
    const lastMessageId = req.query.lastMessageId as string;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && !user.isManager)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const chat = await Chat.findOne({ clientId });
    
    if (!chat) {
      return res.json({ messages: [] });
    }

    // Если указан lastMessageId, возвращаем только новые сообщения
    if (lastMessageId) {
      const lastIndex = chat.messages.findIndex(
        msg => msg._id.toString() === lastMessageId
      );
      
      if (lastIndex !== -1) {
        const newMessages = chat.messages.slice(lastIndex + 1);
        return res.json({ messages: newMessages });
      }
    }

    // Возвращаем все сообщения
    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error polling messages:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

export default router;
