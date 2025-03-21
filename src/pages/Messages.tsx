import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message, Chat } from '../types';
import { useChat } from '../components/chat/useChat';
import { useMessages } from '../components/chat/useMessages';
import { usePresence } from '../hooks/usePresence';
import { useTyping } from '../hooks/useTyping';
import ChatHeader from '../components/chat/ChatHeader';
import ChatSidebar from '../components/chat/ChatSidebar';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { AnimatePresence, motion } from 'framer-motion';
import DealProgress from '../components/DealProgress';

export const Messages = () => {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [dealStatus, setDealStatus] = useState<any>(null);
  const [showDealProgress, setShowDealProgress] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    selectedChat,
    setSelectedChat,
    blockUser,
    unblockUser,
    archiveChat,
    fetchChats
  } = useChat();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    fetchMessages
  } = useMessages(selectedChat?.id || null, user?.id || '');

  // Add presence tracking for online status
  const { isUserOnline } = usePresence(user?.id || null);

  // Add typing indicator functionality
  const {
    typingUsers,
    indicateTyping
  } = useTyping(
    selectedChat?.id || null,
    user?.id || null,
    user?.user_metadata?.username || 'User'
  );

  // Initialize chat and fetch messages when component mounts
  useEffect(() => {
    if (user) {
    fetchChats();
    }
  }, [user, fetchChats]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(1);
      fetchDealStatus(selectedChat.id);
    }
  }, [selectedChat, fetchMessages]);

  const fetchDealStatus = async (chatId: string) => {
    // This would be an actual API call in a real app
    setDealStatus({
      status: 'in-progress',
      steps: ['contact', 'agreement', 'meetup', 'complete'],
      currentStep: 1,
      chatId
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !user || !content.trim()) return;
    
    try {
      await sendMessage(content, selectedChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateChat = () => {
    // This would open a modal to select a user to chat with
    console.log('Create chat clicked');
  };

  const handleBlockUser = async () => {
    if (!selectedChat) return;
    await blockUser(selectedChat.id);
  };

  const handleUnblockChat = async () => {
    if (!selectedChat) return;
    await unblockUser(selectedChat.id);
  };

  const handleArchiveChat = async () => {
    if (!selectedChat) return;
    await archiveChat(selectedChat.id);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Sidebar - conditionally shown on mobile */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-full md:w-80 border-r border-gray-200 flex flex-col h-full md:relative absolute z-10 bg-white"
            >
              <ChatSidebar
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={(chat) => {
                  setSelectedChat(chat);
                  if (window.innerWidth < 768) {
                    setShowSidebar(false);
                  }
                }}
                onCreateChat={handleCreateChat}
                loading={chatsLoading}
                error={chatsError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <ChatHeader
            chat={selectedChat}
            onBack={() => setShowSidebar(true)}
            onArchive={handleArchiveChat}
            onBlock={handleBlockUser}
            onUnblock={handleUnblockChat}
            isUserOnline={selectedChat ? isUserOnline(selectedChat.other_user.id) : false}
          />

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
            {selectedChat ? (
              <MessageList
                messages={messages}
                currentUserId={user?.id || ''}
                loading={messagesLoading}
                error={messagesError}
                onRetry={() => fetchMessages()}
                onReply={setReplyingTo}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  Select a chat or create a new one to start messaging
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedChat && (
            <MessageInput
              onSendMessage={handleSendMessage}
              onReply={(message) => setReplyingTo(message)}
              onCancelReply={() => setReplyingTo(null)}
              replyTo={replyingTo}
              disabled={!selectedChat || selectedChat.is_blocked}
              onTyping={indicateTyping}
              typingUsers={typingUsers}
            />
          )}
        </div>

        {/* Deal Progress Modal */}
        <AnimatePresence>
          {showDealProgress && (
            <DealProgress
              chatId={selectedChat?.id || ''}
              status={dealStatus}
              onClose={() => setShowDealProgress(false)}
              onSave={(newStatus) => {
                setDealStatus(newStatus);
                setShowDealProgress(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};