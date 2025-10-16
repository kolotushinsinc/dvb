import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  defaultMessage?: string;
  showToast?: boolean;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, options: ErrorHandlerOptions = {}) => {
    const { defaultMessage = 'Произошла ошибка', showToast = true } = options;
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      // Ошибка ответа от сервера
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMessage = 'Требуется авторизация';
      } else if (status === 403) {
        errorMessage = 'Доступ запрещен';
      } else if (status === 404) {
        errorMessage = 'Ресурс не найден';
      } else if (status === 422) {
        // Ошибка валидации
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map((err: any) => err.msg).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (status >= 500) {
        errorMessage = 'Ошибка сервера';
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // Ошибка запроса (нет ответа от сервера)
      errorMessage = 'Не удалось подключиться к серверу';
    } else if (error.message) {
      // Другие ошибки
      errorMessage = error.message;
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }, []);

  const handleApiError = useCallback((error: any) => {
    // Специальная обработка для API ошибок
    if (error.response?.status === 401) {
      // Перенаправление на страницу входа при истечении токена
      window.location.href = '/auth/login';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return 'Сессия истекла. Пожалуйста, войдите снова.';
    }
    
    return handleError(error);
  }, [handleError]);

  const handleFormError = useCallback((error: any) => {
    // Обработка ошибок форм
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {};
      return errors;
    }
    
    // Для других ошибок показываем тост
    handleError(error);
    return {};
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleFormError,
  };
};