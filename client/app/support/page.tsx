'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Message {
  _id: string;
  senderId: string;
  senderType: 'CLIENT' | 'ADMIN';
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  messages: Message[];
  lastMessageAt: string;
  unreadByAdminCount: number;
  unreadByClientCount: number;
}

const SupportPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автоматическая прокрутка вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Фокус на поле ввода при загрузке страницы и после отправки/получения сообщений
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Используем setTimeout чтобы фокус применился после прокрутки
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 100);
    }
  }, [loading, isAuthenticated, messages]);

  // Загрузка чата
  const loadChat = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru';
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/api/chat/my-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load chat');
      }

      const data = await response.json();
      setChat(data);
      setMessages(data.messages || []);
      
      // Помечаем сообщения как прочитанные
      if (data.unreadByClientCount > 0) {
        markAsRead();
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Не удалось загрузить чат');
    } finally {
      setLoading(false);
    }
  };

  // Пометить сообщения как прочитанные
  const markAsRead = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru';
      const token = localStorage.getItem('authToken');
      await fetch(`${apiUrl}/api/chat/my-chat/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Long polling для получения новых сообщений
  const pollMessages = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru';
      const token = localStorage.getItem('authToken');
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : '';
      const response = await fetch(
        `${apiUrl}/api/chat/my-chat/poll?lastMessageId=${lastMessageId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => [...prev, ...data.messages]);
        markAsRead();
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  // Отправка сообщения с оптимистичным обновлением
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Оптимистичное обновление UI
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: user?._id || '',
      senderType: 'CLIENT',
      senderName: user ? `${user.firstName} ${user.lastName}` : 'Вы',
      content: messageContent,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru';
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/api/chat/my-chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: messageContent })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      
      // Заменяем оптимистичное сообщение на реальное
      setMessages(prev => 
        prev.map(msg => msg._id === optimisticMessage._id ? sentMessage : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Не удалось отправить сообщение');
      
      // Удаляем оптимистичное сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      setNewMessage(messageContent); // Возвращаем текст в поле ввода
    } finally {
      setSending(false);
    }
  };

  // Инициализация
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadChat();
    }
  }, [authLoading, isAuthenticated]);

  // Запуск polling
  useEffect(() => {
    if (isAuthenticated && !loading) {
      pollingIntervalRef.current = setInterval(pollMessages, 3000); // Опрос каждые 3 секунды

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, loading, messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка чата...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Необходимо войти в систему</h1>
          <p className="mb-6 text-muted-foreground">Для доступа к поддержке необходимо авторизоваться</p>
          <Link href="/auth/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Поддержка
          </h1>
          <p className="text-lg text-gray-600">
            Задайте вопрос нашей команде поддержки
          </p>
        </div>

        <Card className="h-[600px] flex flex-col shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-secondary to-secondary/90">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="h-5 w-5" />
              Чат с администрацией
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Начните разговор
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Отправьте сообщение, и наша команда поддержки ответит вам в ближайшее время
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`flex ${
                            message.senderType === 'CLIENT' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                              message.senderType === 'CLIENT'
                                ? 'bg-secondary text-white'
                                : 'bg-white border border-border text-foreground'
                            }`}
                          >
                            {message.senderType === 'ADMIN' && (
                              <p className="text-xs font-semibold mb-1 text-primary">
                                Администрация
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                            <p
                              className={`text-xs mt-1.5 ${
                                message.senderType === 'CLIENT'
                                  ? 'text-white/60'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <div className="border-t p-4 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  disabled={sending}
                  className="flex-1"
                  maxLength={5000}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SupportPage;
