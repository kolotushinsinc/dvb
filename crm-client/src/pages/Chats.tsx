import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

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

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  // Автоматическая прокрутка вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка всех чатов
  const loadChats = async () => {
    try {
      const response = await api.get('/chat/admin/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка конкретного чата
  const loadChat = async (clientId: string) => {
    try {
      const response = await api.get(`/chat/admin/chats/${clientId}`);
      setSelectedChat(response.data);
      setMessages(response.data.messages || []);
      
      // Помечаем сообщения как прочитанные
      if (response.data.unreadByAdminCount > 0) {
        markAsRead(clientId);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Не удалось загрузить чат');
    }
  };

  // Пометить сообщения как прочитанные
  const markAsRead = async (clientId: string) => {
    try {
      await api.post(`/chat/admin/chats/${clientId}/mark-read`);
      
      // Обновляем счетчик в списке чатов
      setChats(prev =>
        prev.map(chat =>
          chat.clientId === clientId
            ? { ...chat, unreadByAdminCount: 0 }
            : chat
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Long polling для получения новых сообщений
  const pollMessages = async () => {
    if (!selectedChat) return;

    try {
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : '';
      const response = await api.get(
        `/chat/admin/chats/${selectedChat.clientId}/poll?lastMessageId=${lastMessageId}`
      );

      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(prev => [...prev, ...response.data.messages]);
        markAsRead(selectedChat.clientId);
        
        // Обновляем список чатов
        loadChats();
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Оптимистичное обновление UI
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: '',
      senderType: 'ADMIN',
      senderName: 'Вы',
      content: messageContent,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await api.post(
        `/chat/admin/chats/${selectedChat.clientId}/messages`,
        { content: messageContent }
      );

      // Заменяем оптимистичное сообщение на реальное
      setMessages(prev =>
        prev.map(msg => (msg._id === optimisticMessage._id ? response.data : msg))
      );

      // Обновляем список чатов
      loadChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Не удалось отправить сообщение');

      // Удаляем оптимистичное сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Инициализация
  useEffect(() => {
    loadChats();
  }, []);

  // Запуск polling для выбранного чата
  useEffect(() => {
    if (selectedChat) {
      pollingIntervalRef.current = setInterval(pollMessages, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedChat, messages]);

  // Фильтрация чатов по поиску
  const filteredChats = chats.filter(
    chat =>
      chat.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getTotalUnread = () => {
    return chats.reduce((sum, chat) => sum + chat.unreadByAdminCount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Чат-поддержка</h1>
          <p className="text-slate-600 mt-1">
            Управление обращениями клиентов
            {getTotalUnread() > 0 && (
              <Badge className="ml-2 bg-red-500">{getTotalUnread()} новых</Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список чатов */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Чаты ({chats.length})
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Нет чатов</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredChats.map(chat => (
                    <div
                      key={chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadChat(chat.clientId);
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.clientId === chat.clientId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.clientName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{chat.clientEmail}</p>
                          {chat.messages.length > 0 && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {chat.messages[chat.messages.length - 1].content}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex flex-col items-end">
                          <p className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageAt)}
                          </p>
                          {chat.unreadByAdminCount > 0 && (
                            <Badge className="mt-1 bg-red-500">
                              {chat.unreadByAdminCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Окно чата */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {selectedChat.clientName}
                </CardTitle>
                <p className="text-sm text-gray-500">{selectedChat.clientEmail}</p>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[600px]">
                {/* Сообщения */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">Нет сообщений</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const showDate =
                          index === 0 ||
                          formatDate(messages[index - 1].createdAt) !==
                            formatDate(message.createdAt);

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
                                message.senderType === 'ADMIN'
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  message.senderType === 'ADMIN'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                {message.senderType === 'CLIENT' && (
                                  <p className="text-xs font-medium mb-1 opacity-70">
                                    {message.senderName}
                                  </p>
                                )}
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.senderType === 'ADMIN'
                                      ? 'text-white/70'
                                      : 'text-gray-500'
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
                <div className="border-t p-4">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
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
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[680px]">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Выберите чат для начала общения</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
