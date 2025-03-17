import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, ChevronLeft, ChevronRight, Play, Maximize2, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'before_after';
  content: {
    before?: string;
    after?: string;
    url?: string;
    thumbnail?: string;
  };
  timeline?: {
    start_date: string;
    end_date: string;
    milestones: {
      date: string;
      title: string;
      description: string;
    }[];
  };
  testimonial?: {
    client_name: string;
    client_avatar?: string;
    video_url?: string;
    text: string;
  };
  tags: string[];
  created_at: string;
}

interface ServicePortfolioProps {
  serviceId: string;
  providerId: string;
}

export default function ServicePortfolio({ serviceId, providerId }: ServicePortfolioProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'before_after'>('all');

  useEffect(() => {
    fetchPortfolioItems();
  }, [serviceId]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_portfolio')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    item => filter === 'all' || item.type === filter
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? filteredItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === filteredItems.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-video bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Portfolio Showcase</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Items</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="before_after">Before/After</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            layoutId={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer"
            onClick={() => {
              setSelectedItem(item);
              setCurrentIndex(index);
            }}
          >
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
              {item.type === 'before_after' ? (
                <div className="relative w-full h-full">
                  <img
                    src={item.content.after}
                    alt={`${item.title} - After`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                    <img
                      src={item.content.before}
                      alt={`${item.title} - Before`}
                      className="h-full w-1/2 object-cover"
                    />
                  </div>
                </div>
              ) : item.type === 'video' ? (
                <div className="relative w-full h-full">
                  <img
                    src={item.content.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 bg-white/90 rounded-full">
                      <Play className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.content.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
              {item.testimonial && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Client Testimonial</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  {selectedItem.type === 'before_after' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={selectedItem.content.after}
                        alt={`${selectedItem.title} - After`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                        <img
                          src={selectedItem.content.before}
                          alt={`${selectedItem.title} - Before`}
                          className="h-full w-1/2 object-cover"
                        />
                      </div>
                    </div>
                  ) : selectedItem.type === 'video' ? (
                    <video
                      src={selectedItem.content.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={selectedItem.content.url}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedItem.title}
                  </h3>
                  <p className="text-gray-600">{selectedItem.description}</p>

                  {selectedItem.timeline && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Project Timeline</h4>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                        <div className="space-y-4">
                          {selectedItem.timeline.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 relative z-10">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {milestone.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(milestone.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {milestone.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.testimonial && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {selectedItem.testimonial.client_avatar ? (
                          <img
                            src={selectedItem.testimonial.client_avatar}
                            alt={selectedItem.testimonial.client_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {selectedItem.testimonial.client_name[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedItem.testimonial.client_name}
                          </p>
                          <p className="text-sm text-gray-500">Client Testimonial</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{selectedItem.testimonial.text}</p>
                      {selectedItem.testimonial.video_url && (
                        <button className="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                          <Play className="h-4 w-4" />
                          <span>Watch Video Testimonial</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 