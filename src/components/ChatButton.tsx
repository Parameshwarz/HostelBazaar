import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

type Props = {
  itemId: string;
  sellerId: string;
};

export default function ChatButton({ itemId, sellerId }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleChat = async () => {
    if (!user) {
      localStorage.setItem('chatRedirect', JSON.stringify({ itemId, action: 'chat' }));
      navigate('/login');
      return;
    }

    if (user.id === sellerId) {
      toast.error("You can't chat with yourself!");
      return;
    }

    try {
      // Check if chat exists
      const { data: existingChat, error: searchError } = await supabase
        .from('chats')
        .select('id')
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),` +
          `and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`
        )
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([{
          participant_1: user.id,
          participant_2: sellerId,
          item_id: itemId,
          other_user_id: sellerId,
          created_at: new Date().toISOString(),
          last_message: 'Chat started',
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      if (!newChat) throw new Error('Failed to create chat');

      navigate(`/messages/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  return (
    <button
      onClick={handleChat}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Chat with Seller
    </button>
  );
} 