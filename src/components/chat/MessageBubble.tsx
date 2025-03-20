import React from 'react';
import { MessageBubbleProps } from '../../types';

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showTimestamp,
  timestamp
}) => {
  const bubbleClasses = isOwnMessage
    ? 'bg-blue-500 text-white rounded-lg rounded-tr-none'
    : 'bg-gray-100 text-gray-900 rounded-lg rounded-tl-none';

  return (
    <div className="flex flex-col max-w-[70%]">
      <div className={`p-3 ${bubbleClasses}`}>
        {message.reply_to && (
          <div className="mb-2 pb-2 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              {message.reply_to.sender.username}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {message.reply_to.content}
            </p>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      {showTimestamp && (
        <span className="text-xs text-gray-500 mt-1 self-end">
          {timestamp}
        </span>
      )}
    </div>
  );
};

export default MessageBubble; 