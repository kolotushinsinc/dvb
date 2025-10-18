'use client';

import { Button } from '@/components/ui/button';
import { POPULAR_COLORS, getColorByName } from '@/lib/colors';

export interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onColorChange: (color: string) => void;
  compact?: boolean;
}

export const ColorSelector = ({ colors, selectedColor, onColorChange, compact = false }: ColorSelectorProps) => {
  return (
    <div>
      {!compact && <h3 className="font-medium mb-2">Цвет</h3>}
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(colors)).map((color) => {
          const colorInfo = getColorByName(color);
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                isSelected 
                  ? 'border-primary-500 ring-2 ring-offset-2 ring-primary-200' 
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
              style={{ 
                backgroundColor: colorInfo?.value || '#CCCCCC',
                borderColor: color === 'Белый' ? '#E5E7EB' : undefined
              }}
              onClick={() => onColorChange(color)}
              title={color}
              aria-label={`Выбрать цвет ${color}`}
            />
          );
        })}
      </div>
      {selectedColor && !compact && (
        <p className="text-sm text-charcoal-600 mt-2">
          Выбран: {selectedColor}
        </p>
      )}
    </div>
  );
};
