import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, User2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Item } from '../types';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            category:categories(name),
            subcategory:subcategories(name),
            uploader:profiles(username, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem();
  }, [id, navigate]);

  const handleChatClick = async () => {
    if (!user || !item) return;

    try {
      // Check if chat exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${item.uploader_id}),and(participant_1.eq.${item.uploader_id},participant_2.eq.${user.id})`)
        .eq('item_id', item.id)
        .single();

      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_1: user.id,
          participant_2: item.uploader_id,
          item_id: item.id
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/messages/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Image Gallery */}
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              <p className="text-gray-500">{item.category?.name} • {item.condition}</p>
            </div>
            <div className="text-2xl font-bold text-gray-900">₹{item.price}</div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{item.description}</p>
          </div>

          {/* Seller Info and Chat Button */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                {item.uploader?.avatar_url ? (
                  <img
                    src={item.uploader.avatar_url}
                    alt={item.uploader.username}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <User2 className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{item.uploader?.username}</p>
                <p className="text-sm text-gray-500">{item.hostel_name}, Room {item.room_number}</p>
              </div>
            </div>

            {user && user.id !== item.uploader_id && (
              <button
                onClick={handleChatClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}