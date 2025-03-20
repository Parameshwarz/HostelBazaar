import React from 'react';
import { Chat } from '../../types';

interface ChatHeaderProps {
  chat: Chat | null;
  onPinChat: (chatId: string) => Promise<void>;
  onMuteChat: (chatId: string) => Promise<void>;
  onBlockUser: (userId: string) => Promise<void>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onPinChat,
  onMuteChat,
  onBlockUser
}) => {
  if (!chat) {
    return (
      <div className="h-16 border-b flex items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={chat.other_user?.avatar_url || '/default-avatar.png'}
            alt={chat.other_user?.username || 'User'}
            className="w-10 h-10 rounded-full"
          />
          {chat.other_user?.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{chat.other_user?.username || 'Unknown User'}</h2>
          <p className="text-sm text-gray-500">
            {chat.other_user?.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPinChat(chat.id)}
          className="p-2 hover:bg-gray-100 rounded-full"
          title={chat.pinned ? 'Unpin chat' : 'Pin chat'}
        >
          {chat.pinned ? '📌' : '📍'}
        </button>
        <button
          onClick={() => onMuteChat(chat.id)}
          className="p-2 hover:bg-gray-100 rounded-full"
          title={chat.muted ? 'Unmute chat' : 'Mute chat'}
        >
          {chat.muted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={() => onBlockUser(chat.other_user?.id || '')}
          className="p-2 hover:bg-gray-100 rounded-full text-red-500"
          title="Block user"
        >
          ⚠️
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 