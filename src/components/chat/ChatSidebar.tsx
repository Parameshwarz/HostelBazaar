import React from 'react';
import { Chat } from '../../types';
import { formatMessageTime } from '../../utils/dateUtils';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onChatSelect
}) => {
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="w-80 border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Chats</h2>
        <div className="space-y-2">
          {sortedChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-3 rounded-lg flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                activeChat === chat.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={chat.other_user?.avatar_url || '/default-avatar.png'}
                  alt={chat.other_user?.username || 'User'}
                  className="w-12 h-12 rounded-full"
                />
                {chat.other_user?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">
                    {chat.other_user?.username || 'Unknown User'}
                  </h3>
                  {chat.last_message_at && (
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(chat.last_message_at)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.last_message || 'No messages yet'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 