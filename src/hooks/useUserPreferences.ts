import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { UserPreferences } from '../types/services';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default preferences
          await createDefaultPreferences();
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const defaultPreferences: Partial<UserPreferences> = {
        user_id: user?.id,
        preferred_categories: [],
        preferred_price_range: [0, 1000],
        preferred_delivery_time: '7 days',
        preferred_experience_levels: ['intermediate'],
        preferred_languages: ['English'],
        interests: [],
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { data: null, error };
    }
  };

  const addInterest = async (interest: string) => {
    if (!preferences) return;
    const updatedInterests = [...new Set([...preferences.interests, interest])];
    return updatePreferences({ interests: updatedInterests });
  };

  const removeInterest = async (interest: string) => {
    if (!preferences) return;
    const updatedInterests = preferences.interests.filter(i => i !== interest);
    return updatePreferences({ interests: updatedInterests });
  };

  const addPreferredCategory = async (categoryId: string) => {
    if (!preferences) return;
    const updatedCategories = [...new Set([...preferences.preferred_categories, categoryId])];
    return updatePreferences({ preferred_categories: updatedCategories });
  };

  const removePreferredCategory = async (categoryId: string) => {
    if (!preferences) return;
    const updatedCategories = preferences.preferred_categories.filter(id => id !== categoryId);
    return updatePreferences({ preferred_categories: updatedCategories });
  };

  const updatePriceRange = async (range: [number, number]) => {
    return updatePreferences({ preferred_price_range: range });
  };

  const updateDeliveryTime = async (time: string) => {
    return updatePreferences({ preferred_delivery_time: time });
  };

  const updateExperienceLevels = async (levels: string[]) => {
    return updatePreferences({ preferred_experience_levels: levels });
  };

  const updateLanguages = async (languages: string[]) => {
    return updatePreferences({ preferred_languages: languages });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    addInterest,
    removeInterest,
    addPreferredCategory,
    removePreferredCategory,
    updatePriceRange,
    updateDeliveryTime,
    updateExperienceLevels,
    updateLanguages,
  };
} 