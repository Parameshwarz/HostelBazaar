import React from 'react';
import { Chat } from '../../types';

interface ChatHeaderProps {
  chat: Chat | null;
  onBack: () => void;
  onArchive: () => Promise<void>;
  onBlock: () => Promise<void>;
  onUnblock: () => Promise<void>;
  isUserOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack,
  onArchive,
  onBlock,
  onUnblock,
  isUserOnline = false
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
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="relative">
          <img
            src={chat.other_user?.avatar_url || '/default-avatar.svg'}
            alt={chat.other_user?.username || 'User'}
            className="w-10 h-10 rounded-full"
          />
          {isUserOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{chat.other_user?.username || 'Unknown User'}</h2>
          <p className="text-sm text-gray-500">
            {isUserOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {chat.is_blocked ? (
          <button
            onClick={onUnblock}
            className="p-2 hover:bg-gray-100 rounded-full text-green-500"
            title="Unblock user"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        ) : (
          <>
            <button
              onClick={onArchive}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Archive chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <button
              onClick={onBlock}
              className="p-2 hover:bg-gray-100 rounded-full text-red-500"
              title="Block user"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader; 