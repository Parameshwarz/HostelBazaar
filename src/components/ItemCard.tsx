import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Info } from 'lucide-react';
import { Item } from '../types';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

type Props = {
  item: Item;
};

export default function ItemCard({ item }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to start a chat');
      navigate('/login');
      return;
    }

    if (user.id === item.uploader_id) {
      toast.error("You can't chat with yourself!");
      return;
    }

    try {
      // Check if chat already exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${item.uploader_id}),` +
          `and(participant_1.eq.${item.uploader_id},participant_2.eq.${user.id})`
        )
        .eq('item_id', item.id)
        .single();

      if (chatError && chatError.code !== 'PGRST116') {
        throw chatError;
      }

      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([
          {
            participant_1: user.id,
            participant_2: item.uploader_id,
            item_id: item.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      if (newChat) {
        // Create initial message
        await supabase
          .from('messages')
          .insert([
            {
              chat_id: newChat.id,
              sender_id: user.id,
              content: `Chat started about: ${item.title}`,
              created_at: new Date().toISOString(),
              status: 'sent'
            }
          ]);

        navigate(`/messages/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    }
  };

  return (
    <div 
      className="bg-white rounded-[10px] shadow-[0px_4px_8px_rgba(0,0,0,0.1)] p-3 
        hover:shadow-[0px_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200"
      role="article"
      aria-label={`${item.title} - ${formatPrice(item.price)}`}
    >
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-lg mb-3">
        <img
          src={item.images?.[0] || '/placeholder.png'}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
          {item.title}
        </h3>

        {/* Price and Condition */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900" aria-label={`Price: ${formatPrice(item.price)}`}>
            {formatPrice(item.price)}
          </p>
          <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
            {item.condition}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[#777777] line-clamp-2" aria-label={`Description: ${item.description}`}>
          {item.description}
        </p>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-between">
          {/* Seller Info */}
          <div className="flex items-center gap-2" aria-label={`Seller: ${item.uploader_username || 'Unknown'}`}>
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={item.uploader_avatar_url || '/default-avatar.png'}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </div>
            <span className="text-sm text-gray-600">
              {item.uploader_username || 'Unknown'}
            </span>
          </div>

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A90E2] hover:bg-[#3A7BCD] 
              text-white rounded-lg text-sm font-medium transition-colors focus:outline-none 
              focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-2"
            aria-label={`Chat with seller about ${item.title}`}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}