import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

type Props = {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
};

export const MessageEditor = ({ initialContent, onSave, onCancel }: Props) => {
  const [content, setContent] = useState(initialContent);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content !== initialContent) {
      onSave(content);
    } else {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 px-3 py-1 border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        type="submit"
        className="p-1 text-green-600 hover:bg-green-50 rounded-full"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-red-600 hover:bg-red-50 rounded-full"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}; 