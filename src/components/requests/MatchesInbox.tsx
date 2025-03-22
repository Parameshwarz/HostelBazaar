import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Clock,
  Bell,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Match {
  id: string;
  request_id: string;
  user_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  item_details: {
    title: string;
    condition: string;
    price: number;
    item_id?: string;
    images?: string[];
  };
  // Joined fields
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  requested_items: {
    title: string;
    description: string;
    min_budget: number;
    max_budget: number;
    user_id: string;
  };
}

interface Notification {
  id: string;
  match_id: string;
  type: 'new_match' | 'match_accepted' | 'match_rejected' | 'match_completed';
  is_read: boolean;
  created_at: string;
}

export default function MatchesInbox() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        // First fetch matches where user is the sender
        const { data: sentMatches, error: sentError } = await supabase
          .from('request_matches')
          .select(`
            id,
            request_id,
            user_id,
            message,
            status,
            created_at,
            item_id,
            requested_items!inner (
              title,
              description,
              min_budget,
              max_budget,
              user_id
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sentError) throw sentError;

        // Then fetch user profiles for the matches
        const userIds = sentMatches?.map(match => match.user_id) || [];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Then fetch matches where user is the request owner
        const { data: receivedMatches, error: receivedError } = await supabase
          .from('request_matches')
          .select(`
            id,
            request_id,
            user_id,
            message,
            status,
            created_at,
            item_id,
            requested_items!inner (
              title,
              description,
              min_budget,
              max_budget,
              user_id
            )
          `)
          .eq('requested_items.user_id', user.id)
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;

        // Get item details for matches that have item_id
        const allMatchesRaw = [...(sentMatches || []), ...(receivedMatches || [])];
        const itemIds = allMatchesRaw
          .filter(match => match.item_id)
          .map(match => match.item_id);
        
        let itemDetailsMap: Record<string, any> = {};
        if (itemIds.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('items')
            .select('id, title, images, condition, price')
            .in('id', itemIds);
            
          if (itemsError) throw itemsError;
          
          itemDetailsMap = (itemsData || []).reduce((acc: Record<string, any>, item: any) => {
            acc[item.id] = {
              title: item.title,
              condition: item.condition,
              price: item.price,
              item_id: item.id,
              images: item.images
            };
            return acc;
          }, {});
        }

        // Get profiles for received matches
        const receivedUserIds = receivedMatches?.map(match => match.user_id) || [];
        const { data: receivedProfilesData, error: receivedProfilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', receivedUserIds);

        if (receivedProfilesError) throw receivedProfilesError;

        // Create a map of user_id to profile data
        const profilesMap = [...(profilesData || []), ...(receivedProfilesData || [])].reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        // Combine both sets of matches and process the item details
        const matchesMap = new Map();
        allMatchesRaw.forEach(match => {
          if (!matchesMap.has(match.id)) {
            // Get item details from our map or create default
            const itemDetails = match.item_id && itemDetailsMap[match.item_id] 
              ? itemDetailsMap[match.item_id]
              : {
                  title: "Unknown Item",
                  condition: "Unknown", 
                  price: 0
                };

            matchesMap.set(match.id, {
              ...match,
              item_details: itemDetails,
              profiles: profilesMap[match.user_id],
              requested_items: Array.isArray(match.requested_items) ? match.requested_items[0] : match.requested_items
            });
          }
        });
        
        const allMatches = Array.from(matchesMap.values()) as Match[];
        console.log('All matches:', allMatches);
        setMatches(allMatches);

        // Fetch notifications
        const { data: notifData, error: notifError } = await supabase
          .from('request_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (notifError) throw notifError;
        setNotifications(notifData || []);
      } catch (err) {
        console.error('Error fetching matches:', err);
        toast.error('Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('request_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId 
            ? { ...match, status: 'accepted' } 
            : match
        )
      );

      toast.success('Match accepted!');
    } catch (err) {
      console.error('Error accepting match:', err);
      toast.error('Failed to accept match');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('request_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;

      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId 
            ? { ...match, status: 'rejected' } 
            : match
        )
      );

      toast.success('Match rejected');
    } catch (err) {
      console.error('Error rejecting match:', err);
      toast.error('Failed to reject match');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('request_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const filteredMatches = matches.filter(match => 
    activeTab === 'received' 
      ? match.requested_items.user_id === user?.id
      : match.user_id === user?.id
  );

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'received'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Received Matches
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'sent'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sent Matches
            </button>
          </div>
          {unreadNotifications.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">{unreadNotifications.length} new</span>
            </div>
          )}
        </div>
      </div>

      {/* Matches list */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No {activeTab} matches yet.
            </p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Item image */}
                  {match.item_details?.item_id ? (
                    <Link to={`/items/${match.item_details.item_id}`}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {match.item_details.images?.[0] ? (
                          <img 
                            src={match.item_details.images[0]} 
                            alt={match.item_details.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Quick Response</p>
                    </div>
                  )}

                  {/* Match details */}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {activeTab === 'received' ? (
                        <>
                          {match.profiles.username} {match.item_details?.item_id ? (
                            <Link to={`/items/${match.item_details.item_id}`} className="text-indigo-600 hover:text-indigo-700">
                              offered their {match.item_details.title}
                            </Link>
                          ) : (
                            'made a quick response'
                          )}
                        </>
                      ) : (
                        <>
                          You {match.item_details?.item_id ? (
                            <Link to={`/items/${match.item_details.item_id}`} className="text-indigo-600 hover:text-indigo-700">
                              offered your {match.item_details.title}
                            </Link>
                          ) : (
                            'made a quick response'
                          )}
                        </>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      For your request: {match.requested_items.title}
                    </p>
                    {match.item_details && (
                      <p className="text-sm text-gray-600 mt-1">
                        Condition: {match.item_details.condition} • Price: ₹{match.item_details.price}
                      </p>
                    )}
                    {match.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{match.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : match.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : match.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {match.status === 'pending' && activeTab === 'received' && (
                    <>
                      <button
                        onClick={() => handleAcceptMatch(match.id)}
                        className="p-2 rounded-full hover:bg-emerald-100 text-emerald-600"
                        title="Accept"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRejectMatch(match.id)}
                        className="p-2 rounded-full hover:bg-rose-100 text-rose-600"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      if (!user) {
                        toast.error('Please login to start a chat');
                        navigate('/login');
                        return;
                      }

                      try {
                        // Check if chat exists
                        const { data: existingChat, error: chatError } = await supabase
                          .from('chats')
                          .select('id')
                          .or(
                            `and(participant_1.eq.${user.id},participant_2.eq.${match.user_id}),` +
                            `and(participant_1.eq.${match.user_id},participant_2.eq.${user.id})`
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
                            participant_2: match.user_id,
                            item_id: match.request_id,
                            other_user_id: match.user_id,
                            created_at: new Date().toISOString(),
                            last_message: `Chat started about: ${match.requested_items.title}`,
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
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    title="Chat"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 