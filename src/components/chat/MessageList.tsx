import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import { shouldShowSender, shouldShowTimestamp, formatMessageTimestamp, getInitialAvatar } from './messageUtils';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  userId: string;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  error,
  hasMore,
  onLoadMore,
  userId,
  messagesContainerRef
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, messagesContainerRef]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {loading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreTriggerRef} className="h-4" />
      )}

      {messages.map((message, index) => {
        const showSender = shouldShowSender(message, index, messages, userId);
        const showTimestamp = shouldShowTimestamp(message, index, messages);
        const { initial, bgColor } = getInitialAvatar(message.sender.username);

        return (
          <div key={message.id} className="flex flex-col">
            {showSender && (
              <div className="flex items-center mb-1">
                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold mr-2`}>
                  {initial}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {message.sender.username}
                </span>
              </div>
            )}
            <div className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
              <MessageBubble
                message={message}
                isOwnMessage={message.sender_id === userId}
                showTimestamp={showTimestamp}
                timestamp={formatMessageTimestamp(message.created_at)}
              />
            </div>
          </div>
        );
      })}

      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default MessageList; 