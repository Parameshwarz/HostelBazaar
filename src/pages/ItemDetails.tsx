import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Item } from '../types';
import { MessageCircle, Heart, Share2, Clock, Tag, CircleDollarSign, User, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { formatDistanceToNow } from 'date-fns';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            profiles (
              id,
              username,
              avatar_url
            ),
            category:categories (
              id,
              name,
              slug
            ),
            subcategory:subcategories (
              id,
              name,
              slug
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setItem(data);

        // Check if item is in user's wishlist
        if (user) {
          const { data: wishlistData } = await supabase
            .from('wishlists')
            .select()
            .eq('user_id', user.id)
            .eq('item_id', id)
            .single();

          setIsLiked(!!wishlistData);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setIsLoadingLike(true);
      
      if (isLiked) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id);

        if (error) throw error;
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            item_id: id
          });

        if (error) throw error;
        toast.success('Added to wishlist');
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: item?.title,
        text: `Check out ${item?.title} on HostelBazaar`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleChat = async () => {
    if (!user) {
      toast.error('Please login to start a chat');
      navigate('/login');
      return;
    }

    if (user.id === item?.profiles?.id) {
      toast.error("You can't chat with yourself!");
      return;
    }

    try {
      // Check if chat exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${item?.profiles?.id}),` +
          `and(participant_1.eq.${item?.profiles?.id},participant_2.eq.${user.id})`
        )
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
        .insert([{
          participant_1: user.id,
          participant_2: item?.profiles?.id,
          item_id: item?.id,
          created_at: new Date().toISOString(),
          last_message: `Chat started about: ${item?.title}`,
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      if (newChat) {
        navigate(`/messages/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-200 h-96 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
        <p className="text-gray-500 mb-8">The item you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  const images = item.images?.map(url => ({
    original: url,
    thumbnail: url
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Image Gallery */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <ImageGallery
            items={images}
            showPlayButton={false}
            showFullscreenButton={true}
            showNav={images.length > 1}
            showThumbnails={images.length > 1}
          />
        </div>

        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {item.category?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={isLoadingLike}
              className={`p-2 rounded-full ${
                isLiked 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-50 text-gray-500'
              } hover:bg-gray-100 transition-colors`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Price and Condition */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-6 h-6 text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(item.price)}
              </span>
              {item.is_negotiable && (
                <span className="text-sm text-gray-500">(Negotiable)</span>
              )}
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {item.condition}
            </span>
          </div>
          <button
            onClick={handleChat}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Seller
          </button>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              {item.profiles?.avatar_url ? (
                <img
                  src={item.profiles.avatar_url}
                  alt={item.profiles.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{item.profiles?.username}</h3>
              {(item.profiles?.hostel_name || item.profiles?.room_number) && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {item.profiles.hostel_name}
                  {item.profiles.room_number && `, Room ${item.profiles.room_number}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}