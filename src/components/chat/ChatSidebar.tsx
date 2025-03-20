import React from 'react';
import { Chat } from '../../types';
import { getInitialAvatar } from './messageUtils';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => void;
  loading: boolean;
  error: string | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateChat}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chats yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chats.map((chat) => {
              const { initial, bgColor } = getInitialAvatar(chat.other_user?.username || '');
              const isSelected = selectedChat?.id === chat.id;
              const isOnline = chat.other_user?.last_seen && 
                new Date(chat.other_user.last_seen).getTime() > Date.now() - 5 * 60 * 1000;

              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                    isSelected ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
                      {initial}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.other_user?.username || 'Unknown User'}
                      </p>
                      {chat.last_message_at && (
                        <p className="text-xs text-gray-500">
                          {new Date(chat.last_message_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar; 