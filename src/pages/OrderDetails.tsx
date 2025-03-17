import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  MessageSquare,
  Star,
  FileText,
  Upload,
  RefreshCw,
  Shield,
  ChevronRight,
  Download,
  Send
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

interface OrderDetails {
  id: string;
  service: {
    id: string;
    title: string;
    provider: {
      id: string;
      username: string;
      avatar_url?: string;
    };
  };
  client: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  service_level: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  requirements: string;
  delivery_date: string;
  created_at: string;
  rating?: number;
  review_comment?: string;
  milestones?: {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    amount: number;
  }[];
  deliverables?: {
    id: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
  }[];
  revision_requests?: {
    id: string;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
  }[];
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [revisionRequest, setRevisionRequest] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders/' + id);
      return;
    }
    fetchOrderDetails();
  }, [id, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services (
            id,
            title,
            provider:profiles!services_provider_id_fkey (
              id,
              username,
              avatar_url
            )
          ),
          client:profiles!orders_client_id_fkey (
            id,
            username,
            avatar_url
          ),
          milestones:order_milestones (
            id,
            title,
            description,
            due_date,
            status,
            amount
          ),
          deliverables:order_deliverables (
            id,
            file_name,
            file_url,
            uploaded_at
          ),
          revision_requests:order_revisions (
            id,
            description,
            status,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderDetails['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Order status updated successfully');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(`orders/${id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Create deliverable record
      const { error: deliverableError } = await supabase
        .from('order_deliverables')
        .insert({
          order_id: id,
          file_name: file.name,
          file_url: uploadData.path,
          uploaded_at: new Date().toISOString()
        });

      if (deliverableError) throw deliverableError;

      toast.success('File uploaded successfully');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!revisionRequest.trim()) return;

    try {
      const { error } = await supabase
        .from('order_revisions')
        .insert({
          order_id: id,
          description: revisionRequest.trim(),
          status: 'pending'
        });

      if (error) throw error;

      setRevisionRequest('');
      toast.success('Revision request submitted');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast.error('Failed to submit revision request');
    }
  };

  const handleReview = async () => {
    if (!rating) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          rating,
          review_comment: review.trim(),
          status: 'completed'
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Review submitted successfully');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
            <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isProvider = user?.id === order.service.provider.id;
  const isClient = user?.id === order.client.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order.service.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{order.price}</p>
              <p className="text-sm text-gray-500 capitalize">{order.service_level} Package</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Due by {new Date(order.delivery_date).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Status Actions */}
          {(isProvider || isClient) && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="mt-6 flex gap-2">
              {isProvider && order.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Accept Order
                </button>
              )}
              {isProvider && order.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}
              {(isProvider || isClient) && order.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{order.requirements}</p>
            </div>

            {/* Milestones */}
            {order.milestones && order.milestones.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
                <div className="space-y-4">
                  {order.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </span>
                          <span className="text-gray-500">₹{milestone.amount}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h2>
              {isProvider && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Deliverable
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                    {uploadingFile && <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />}
                  </div>
                </div>
              )}
              
              {order.deliverables && order.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {order.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{deliverable.file_name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(deliverable.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(deliverable.file_url)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium
                          hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No deliverables uploaded yet.</p>
              )}
            </div>

            {/* Revision Requests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revision Requests</h2>
              {isClient && order.status === 'completed' && (
                <div className="mb-4">
                  <textarea
                    value={revisionRequest}
                    onChange={(e) => setRevisionRequest(e.target.value)}
                    placeholder="Describe what needs to be revised..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <button
                    onClick={handleRevisionRequest}
                    disabled={!revisionRequest.trim()}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                      hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Revision Request
                  </button>
                </div>
              )}

              {order.revision_requests && order.revision_requests.length > 0 ? (
                <div className="space-y-3">
                  {order.revision_requests.map((revision) => (
                    <div
                      key={revision.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-gray-900">{revision.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          Requested on {new Date(revision.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          revision.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          revision.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {revision.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No revision requests yet.</p>
              )}
            </div>

            {/* Review Section */}
            {isClient && order.status === 'completed' && !order.rating && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 rounded-full hover:bg-yellow-50 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comment
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleReview}
                    disabled={!rating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                      hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isProvider ? 'Client' : 'Service Provider'}
              </h2>
              <div className="flex items-center gap-4">
                {isProvider ? (
                  order.client.avatar_url ? (
                    <img
                      src={order.client.avatar_url}
                      alt={order.client.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {order.client.username[0].toUpperCase()}
                      </span>
                    </div>
                  )
                ) : (
                  order.service.provider.avatar_url ? (
                    <img
                      src={order.service.provider.avatar_url}
                      alt={order.service.provider.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {order.service.provider.username[0].toUpperCase()}
                      </span>
                    </div>
                  )
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {isProvider ? order.client.username : order.service.provider.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/messages?order=${order.id}`)}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                  hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
            </div>

            {/* Payment Protection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Protection</h2>
              </div>
              <p className="text-sm text-gray-600">
                Your payment is held securely until you approve the work and release the funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 