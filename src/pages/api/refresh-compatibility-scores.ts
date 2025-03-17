import { supabase } from '../../lib/supabaseClient';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (preferencesError) throw preferencesError;

    // Get all active services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (servicesError) throw servicesError;

    // Calculate compatibility scores for each service
    const compatibilityScores = services.map(service => {
      let score = 0;
      const reasons = [];

      // Category match (30%)
      if (preferences.preferred_categories.includes(service.category_id)) {
        score += 30;
        reasons.push({
          type: 'category_match',
          weight: 30,
          details: 'Service category matches your preferences'
        });
      }

      // Price match (25%)
      const [minPrice, maxPrice] = preferences.preferred_price_range;
      if (service.starting_price >= minPrice && service.starting_price <= maxPrice) {
        score += 25;
        reasons.push({
          type: 'price_match',
          weight: 25,
          details: 'Price is within your preferred range'
        });
      }

      // Experience level match (25%)
      if (preferences.preferred_experience_levels.includes(service.experience_level)) {
        score += 25;
        reasons.push({
          type: 'experience_match',
          weight: 25,
          details: 'Experience level matches your preference'
        });
      }

      // Skills/interests match (20%)
      const matchingSkills = service.skills.filter((skill: string) =>
        preferences.interests.includes(skill.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        const skillScore = Math.min(20, (matchingSkills.length / service.skills.length) * 20);
        score += skillScore;
        reasons.push({
          type: 'skills_match',
          weight: skillScore,
          details: `${matchingSkills.length} skills match your interests`
        });
      }

      return {
        service_id: service.id,
        user_id,
        compatibility_score: score,
        match_reasons: reasons
      };
    });

    // Update compatibility scores in the database
    const { error: updateError } = await supabase
      .from('service_compatibility')
      .upsert(compatibilityScores, {
        onConflict: 'service_id,user_id'
      });

    if (updateError) throw updateError;

    return res.status(200).json({
      message: 'Compatibility scores updated successfully',
      updated: compatibilityScores.length
    });
  } catch (error: unknown) {
    console.error('Error refreshing compatibility scores:', error);
    return res.status(500).json({
      message: 'Error refreshing compatibility scores',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 