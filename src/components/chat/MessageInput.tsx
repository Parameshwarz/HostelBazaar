import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { isValidMessageContent } from './messageUtils';

// Enhanced CSS for typing indicator animation - make it more visible
const typingAnimationStyle = `
  @keyframes bounce-delay {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
  }
  .typing-dot {
    animation: bounce-delay 1.4s infinite ease-in-out;
    display: inline-block;
    height: 10px !important;
    width: 10px !important;
    background-color: #4f46e5 !important;
    margin: 0 3px !important;
    border-radius: 50% !important;
  }
  .typing-indicator {
    background-color: #e0e7ff;
    border-radius: 16px;
    padding: 10px 16px;
    margin: 8px 12px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    max-width: 300px;
    border: 2px solid #c7d2fe;
    position: relative;
    z-index: 9999 !important;
  }
`;

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onReply?: (message: Message) => void;
  onCancelReply?: () => void;
  replyTo?: Message | null;
  disabled?: boolean;
  onTyping?: () => void;
  typingUsers?: { userId: string; username: string; isTyping: boolean }[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onReply,
  onCancelReply,
  replyTo,
  disabled = false,
  onTyping,
  typingUsers = []
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTime = useRef<number>(0);

  // Enhanced logging for typing users
  useEffect(() => {
    console.log('[TYPING INDICATOR] Current typing users:', typingUsers);
    
    if (typingUsers.length > 0) {
      console.log('[TYPING INDICATOR] Users are typing:', typingUsers.map(u => u.username).join(', '));
    } else {
      console.log('[TYPING INDICATOR] No users are typing');
    }
  }, [typingUsers]);

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
    
    // Always trigger typing when there's input
    if (e.target.value.trim() && onTyping) {
      // Frequently trigger typing events - any keystroke triggers it
      console.log('[TYPING INDICATOR] Triggering typing event');
      onTyping();
      // Update last typing time
      lastTypingTime.current = Date.now();
    }
  };

  // Check if typing indicator should be shown
  const shouldShowTypingIndicator = typingUsers && typingUsers.length > 0;
  console.log('[TYPING INDICATOR] Should show indicator:', shouldShowTypingIndicator);

  return (
    <div className="relative">
      {/* Add style element for typing animation */}
      <style dangerouslySetInnerHTML={{ __html: typingAnimationStyle }} />
      
      {/* Enhanced typing indicator with absolute positioning and high z-index */}
      {shouldShowTypingIndicator && (
        <div className="absolute bottom-full left-0 right-0 z-50 pointer-events-none">
          <div className="typing-indicator mx-auto">
            <span className="text-sm text-indigo-700 font-semibold mr-2">
              {typingUsers.length === 1
                ? `${typingUsers[0].username} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
            <div className="flex items-end h-5">
              <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
              <div className="typing-dot" style={{ animationDelay: '200ms' }}></div>
              <div className="typing-dot" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default MessageInput; 