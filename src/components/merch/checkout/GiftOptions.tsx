import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Palette, Type, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GiftOptionsProps {
  onGiftOptionSelect: (options: {
    wrapping: {
      style: string;
      color: string;
    };
    message: {
      text: string;
      font: string;
    };
    recipientEmail?: string;
  }) => void;
}

const GiftOptions: React.FC<GiftOptionsProps> = ({ onGiftOptionSelect }) => {
  const [wrappingStyle, setWrappingStyle] = useState('classic');
  const [wrappingColor, setWrappingColor] = useState('blue');
  const [messageText, setMessageText] = useState('');
  const [messageFont, setMessageFont] = useState('handwritten');
  const [recipientEmail, setRecipientEmail] = useState('');

  const wrappingStyles = [
    { id: 'classic', name: 'Classic', price: 5 },
    { id: 'premium', name: 'Premium', price: 8 },
    { id: 'eco', name: 'Eco-Friendly', price: 6 }
  ];

  const wrappingColors = [
    { id: 'blue', name: 'Ocean Blue', hex: '#2563eb' },
    { id: 'red', name: 'Ruby Red', hex: '#dc2626' },
    { id: 'green', name: 'Emerald', hex: '#059669' },
    { id: 'purple', name: 'Royal Purple', hex: '#7c3aed' },
    { id: 'gold', name: 'Golden', hex: '#d97706' }
  ];

  const fontStyles = [
    { id: 'handwritten', name: 'Handwritten' },
    { id: 'elegant', name: 'Elegant Script' },
    { id: 'modern', name: 'Modern Sans' },
    { id: 'classic', name: 'Classic Serif' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      toast.error('Please enter a gift message');
      return;
    }

    const selectedOptions = {
      wrapping: {
        style: wrappingStyle,
        color: wrappingColor
      },
      message: {
        text: messageText.trim(),
        font: messageFont
      },
      ...(recipientEmail && { recipientEmail: recipientEmail.trim() })
    };

    onGiftOptionSelect(selectedOptions);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gift Options</h2>
          <button
            onClick={() => onGiftOptionSelect({ wrapping: { style: '', color: '' }, message: { text: '', font: '' } })}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wrapping Style */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Gift size={20} />
                <span>Gift Wrapping Style</span>
              </div>
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {wrappingStyles.map((style) => (
                <label
                  key={style.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    wrappingStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="wrappingStyle"
                    value={style.id}
                    checked={wrappingStyle === style.id}
                    onChange={(e) => setWrappingStyle(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{style.name}</p>
                    <p className="text-sm text-gray-500">+${style.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Wrapping Color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Palette size={20} />
                <span>Wrapping Color</span>
              </div>
            </label>
            <div className="flex flex-wrap gap-4">
              {wrappingColors.map((color) => (
                <label
                  key={color.id}
                  className={`flex cursor-pointer flex-col items-center gap-2 transition-transform hover:scale-105 ${
                    wrappingColor === color.id ? 'scale-105' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="wrappingColor"
                    value={color.id}
                    checked={wrappingColor === color.id}
                    onChange={(e) => setWrappingColor(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`h-8 w-8 rounded-full border-2 ${
                      wrappingColor === color.id ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm">{color.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gift Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Type size={20} />
                <span>Gift Message</span>
              </div>
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your gift message here..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              maxLength={200}
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{messageText.length}/200 characters</span>
              <span>Font: {fontStyles.find((f) => f.id === messageFont)?.name}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {fontStyles.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setMessageFont(font.id)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    messageFont === font.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Mail size={20} />
                <span>Recipient's Email (Optional)</span>
              </div>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient's email for digital notification"
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll send a digital card preview to this email
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <Gift size={20} />
            <span>Save Gift Options</span>
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default GiftOptions; 