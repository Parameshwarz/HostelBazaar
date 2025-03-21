import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/index';
import { shouldShowSender, shouldShowTimestamp, formatMessageTimestamp, getInitialAvatar } from './messageUtils';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReply: (message: Message) => void;
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  error,
  onRetry,
  onReply,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {loading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {messages.map((message, index) => {
        const showSender = shouldShowSender(message, index, messages, currentUserId);
        const showTimestamp = shouldShowTimestamp(message, index, messages);
        const { initial, bgColor } = getInitialAvatar(message.sender.username);
        const isOwnMessage = message.sender_id === currentUserId;

        return (
          <div key={message.id} className="flex flex-col">
            {showSender && !isOwnMessage && (
              <div className="flex items-center mb-1">
                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold mr-2`}>
                  {initial}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {message.sender.username}
                </span>
              </div>
            )}
            <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div 
                className="relative group max-w-[80%]" 
                onClick={() => onReply(message)}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showTimestamp={showTimestamp}
                  timestamp={formatMessageTimestamp(message.created_at)}
                />
                {/* Show reply icon on hover */}
                <div className="absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOwnMessage ? (
                    <div className="right-full mr-2">
                      <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="left-full ml-2">
                      <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 