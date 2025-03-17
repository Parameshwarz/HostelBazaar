import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Target,
  DollarSign,
  Clock,
  GraduationCap,
  Globe,
  Tag,
  Plus,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useServiceCategories } from '../../hooks/useServiceCategories';

export default function AIPreferences() {
  const {
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
  } = useUserPreferences();

  const { categories } = useServiceCategories();
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    await addInterest(newInterest.trim());
    setNewInterest('');
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    const updatedLanguages = [...(preferences?.preferred_languages || []), newLanguage.trim()];
    await updateLanguages(updatedLanguages);
    setNewLanguage('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Trigger a refresh of compatibility scores
      await fetch('/api/refresh-compatibility-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: preferences?.user_id }),
      });
    } catch (error) {
      console.error('Error refreshing compatibility scores:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900">AI Matchmaker Preferences</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Updating...' : 'Update Preferences'}
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            Preferred Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  if (preferences?.preferred_categories.includes(category.id)) {
                    removePreferredCategory(category.id);
                  } else {
                    addPreferredCategory(category.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  preferences?.preferred_categories.includes(category.id)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            Price Range
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                value={preferences?.preferred_price_range[0]}
                onChange={(e) => updatePriceRange([
                  parseInt(e.target.value),
                  preferences?.preferred_price_range[1] || 1000
                ])}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                value={preferences?.preferred_price_range[1]}
                onChange={(e) => updatePriceRange([
                  preferences?.preferred_price_range[0] || 0,
                  parseInt(e.target.value)
                ])}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Preferred Delivery Time
          </h3>
          <select
            value={preferences?.preferred_delivery_time}
            onChange={(e) => updateDeliveryTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="24h">Up to 24 hours</option>
            <option value="3d">Up to 3 days</option>
            <option value="7d">Up to 7 days</option>
            <option value="14d">Up to 14 days</option>
            <option value="30d">Up to 30 days</option>
          </select>
        </div>

        {/* Experience Levels */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Experience Levels
          </h3>
          <div className="flex flex-wrap gap-2">
            {['beginner', 'intermediate', 'expert'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  const current = preferences?.preferred_experience_levels || [];
                  if (current.includes(level)) {
                    updateExperienceLevels(current.filter(l => l !== level));
                  } else {
                    updateExperienceLevels([...current, level]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  preferences?.preferred_experience_levels.includes(level)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            Preferred Languages
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences?.preferred_languages.map((language) => (
              <div
                key={language}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600
                  flex items-center gap-2"
              >
                {language}
                <button
                  onClick={() => updateLanguages(
                    preferences.preferred_languages.filter(l => l !== language)
                  )}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add a language..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
            />
            <button
              onClick={handleAddLanguage}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            Interests
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {preferences?.interests.map((interest) => (
              <div
                key={interest}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600
                  flex items-center gap-2"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <button
              onClick={handleAddInterest}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 