import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { isValidMessageContent } from './messageUtils';
import { useTyping } from '../../hooks/useTyping';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onReply?: (message: Message) => void;
  onCancelReply?: () => void;
  replyTo?: Message | null;
  disabled?: boolean;
  chatId: string | null;
  userId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onReply,
  onCancelReply,
  replyTo,
  disabled = false,
  chatId,
  userId
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setUserTyping } = useTyping(chatId, userId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSendMessage(message.trim());
      setMessage('');
      if (onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setUserTyping(); // Trigger typing indicator
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      {replyTo && (
        <div className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded">
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Replying to:</span>
            <span className="ml-2 text-sm font-medium text-gray-900">
              {replyTo.sender.username}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending || disabled}
          className={`px-4 py-2 rounded-lg ${
            !message.trim() || isSending || disabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-medium`}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Send'
          )}
        </button>
      </div>
      {message.length > 0 && !isValidMessageContent(message) && (
        <p className="mt-1 text-sm text-red-500">
          Message must be between 2 and 1000 characters
        </p>
      )}
    </form>
  );
};

export default MessageInput; 