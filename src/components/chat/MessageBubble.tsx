import React, { useState } from 'react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender: boolean;
  onReply: () => void;
  onDelete: () => Promise<void>;
  onEdit: (content: string) => Promise<void>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showSender,
  onReply,
  onDelete,
  onEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = async () => {
    if (editedContent.trim() !== message.content) {
      await onEdit(editedContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3`}>
        {showSender && !isOwnMessage && (
          <div className="text-sm font-semibold mb-1">{message.sender.username}</div>
        )}
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 bg-transparent border-b border-white focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleEdit}
              className="text-sm hover:text-gray-200"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {message.reply_to && (
                <div className="text-sm opacity-75 mb-1">
                  Replied to: {message.reply_to.content}
                </div>
              )}
              <div className="break-words">{message.content}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onReply}
                className="text-sm hover:opacity-75"
              >
                Reply
              </button>
              {isOwnMessage && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm hover:opacity-75"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="text-sm hover:opacity-75"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs mt-1 opacity-75">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 