import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import { formatMessageTime } from '../../utils/dateUtils';

interface MessageListProps {
  messages: Message[];
  user: any;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, content: string) => Promise<void>;
  loadingMessages: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  onReply,
  onDelete,
  onEdit,
  loadingMessages
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const shouldShowSender = (message: Message, index: number, messages: Message[]) => {
    if (message.sender_id === user?.id) return false;
    if (index === 0) return true;
    return message.sender_id !== messages[index - 1].sender_id;
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-6"
    >
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            {formatMessageTime(date)}
          </div>
          <div className="space-y-2">
            {dateMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user?.id}
                showSender={shouldShowSender(message, index, dateMessages)}
                onReply={() => onReply(message)}
                onDelete={() => onDelete(message.id)}
                onEdit={(content) => onEdit(message.id, content)}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 