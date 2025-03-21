import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message, Chat } from '../types';
import { useChat } from '../components/chat/useChat';
import { useMessages } from '../components/chat/useMessages';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
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
  
  // Initialize online status tracking
  const { isOnline } = useOnlineStatus(user?.id || '');
  
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    selectedChat,
    setSelectedChat,
    createChat,
    updateChatStatus,
    fetchChats
  } = useChat();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    hasMore,
    sendMessage,
    loadMore,
    fetchMessages
  } = useMessages(selectedChat?.id || null, user?.id || '');

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
    if (!selectedChat || !user) return;

    try {
      setSendingMessage(true);
      await sendMessage(content, selectedChat.id);
      setMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateChat = () => {
    // This would open a modal to select a user to chat with
    console.log('Create chat clicked');
  };

  const handleBlockUser = async () => {
    if (!selectedChat) return;
    await updateChatStatus(selectedChat.id, 'blocked');
  };

  const handleArchiveChat = async () => {
    if (!selectedChat) return;
    await updateChatStatus(selectedChat.id, 'archived');
  };

  const handleUnblockChat = async () => {
    if (!selectedChat) return;
    await updateChatStatus(selectedChat.id, 'active');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onCreateChat={handleCreateChat}
          loading={chatsLoading}
          error={chatsError}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onBack={() => setShowSidebar(!showSidebar)}
              onArchive={handleArchiveChat}
              onBlock={handleBlockUser}
              onUnblock={handleUnblockChat}
              userId={user?.id || ''}
            />
            <MessageList
              messages={messages}
              loading={messagesLoading}
              error={messagesError}
              hasMore={hasMore}
              onLoadMore={loadMore}
              userId={user?.id || ''}
              messagesContainerRef={messagesContainerRef}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              onReply={(message) => setReplyingTo(message)}
              onCancelReply={() => setReplyingTo(null)}
              replyTo={replyingTo}
              disabled={false}
              chatId={selectedChat.id}
              userId={user?.id || ''}
            />
            
            {/* Deal progress component if needed */}
                <AnimatePresence>
                  {showDealProgress && dealStatus && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <DealProgress {...dealStatus} />
                    </motion.div>
                  )}
                </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a chat to start messaging</p>
              </div>
        )}
      </div>
    </div>
  );
};