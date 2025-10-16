import React from 'react';
import { POPULAR_COLORS, ColorOption, getColorByName } from '../lib/colors';

interface ColorSelectorProps {
  selectedColor?: string;
  onColorChange: (colorName: string) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  onColorChange,
  className = ''
}) => {
  const handleColorSelect = (color: ColorOption) => {
    onColorChange(color.name);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Выберите цвет</label>
      <div className="grid grid-cols-5 gap-2">
        {POPULAR_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              selectedColor === color.name
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => handleColorSelect(color)}
            title={color.name}
          >
            {selectedColor === color.name && (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
      
      {selectedColor && (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-600">Выбранный цвет:</span>
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: getColorByName(selectedColor)?.value || '#000000' }}
          />
          <span className="text-sm font-medium">{selectedColor}</span>
        </div>
      )}
    </div>
  );
};