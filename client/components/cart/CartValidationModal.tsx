'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle } from 'lucide-react';
import { CartValidationIssue } from '@/lib/api';

interface CartValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: CartValidationIssue[];
  onRemoveItem: (itemId: string) => Promise<void>;
  onContinue: () => void;
}

export function CartValidationModal({
  isOpen,
  onClose,
  issues,
  onRemoveItem,
  onContinue,
}: CartValidationModalProps) {
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await onRemoveItem(itemId);
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const outOfStockIssues = issues.filter(i => i.type === 'OUT_OF_STOCK');
  const priceChangedIssues = issues.filter(i => i.type === 'PRICE_CHANGED');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Внимание! Обнаружены изменения в корзине
          </DialogTitle>
          <DialogDescription>
            Некоторые товары в вашей корзине требуют вашего внимания перед оформлением заказа.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Out of Stock Items */}
          {outOfStockIssues.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Товары отсутствуют в наличии ({outOfStockIssues.length})
              </h3>
              {outOfStockIssues.map((issue) => (
                <div
                  key={issue.itemId}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{issue.productName}</p>
                      <p className="text-sm text-red-600 mt-1">{issue.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Количество: {issue.quantity} шт.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(issue.itemId)}
                      disabled={removingItems.has(issue.itemId)}
                    >
                      {removingItems.has(issue.itemId) ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price Changed Items */}
          {priceChangedIssues.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Изменилась цена ({priceChangedIssues.length})
              </h3>
              {priceChangedIssues.map((issue) => (
                <div
                  key={issue.itemId}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{issue.productName}</p>
                      <p className="text-sm text-yellow-700 mt-1">{issue.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Было:</span>{' '}
                          <span className="line-through text-gray-400">{issue.oldPrice}₽</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Стало:</span>{' '}
                          <span className="font-semibold text-gray-900">{issue.newPrice}₽</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Количество: {issue.quantity} шт.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(issue.itemId)}
                        disabled={removingItems.has(issue.itemId)}
                      >
                        {removingItems.has(issue.itemId) ? 'Удаление...' : 'Удалить'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {outOfStockIssues.length > 0 ? (
            <p className="text-sm text-red-600 flex-1">
              Удалите недоступные товары, чтобы продолжить оформление заказа
            </p>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Остаться в корзине
              </Button>
              <Button onClick={onContinue}>
                Оформить заказ
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
