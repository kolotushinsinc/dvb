'use client';

import { Button } from '@/components/ui/button';
import { POPULAR_COLORS, getColorByName } from '@/lib/colors';

interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onColorChange: (color: string) => void;
}

export const ColorSelector = ({ colors, selectedColor, onColorChange }: ColorSelectorProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Цвет</h3>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(colors)).map((color) => {
          const colorInfo = getColorByName(color);
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                isSelected 
                  ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-300' 
                  : 'border-gray-300 hover:border-gray-400'
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
      {selectedColor && (
        <p className="text-sm text-gray-600 mt-2">
          Выбран: {selectedColor}
        </p>
      )}
    </div>
  );
};