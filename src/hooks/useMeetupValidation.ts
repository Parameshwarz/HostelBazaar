import { useState } from 'react';

export const useMeetupValidation = () => {
  const [error, setError] = useState<string | null>(null);

  const validateMeetupTime = (date: Date): boolean => {
    const now = new Date();
    const meetupTime = new Date(date);
    
    // Must be at least 1 hour in the future
    if (meetupTime.getTime() - now.getTime() < 3600000) {
      setError('Meetup must be scheduled at least 1 hour in advance');
      return false;
    }
    
    // Must be within next 30 days
    if (meetupTime.getTime() - now.getTime() > 30 * 24 * 3600000) {
      setError('Meetup must be scheduled within the next 30 days');
      return false;
    }

    // Must be during daytime hours (8 AM to 8 PM)
    const hours = meetupTime.getHours();
    if (hours < 8 || hours >= 20) {
      setError('Meetup must be scheduled between 8 AM and 8 PM');
      return false;
    }

    // Must be on a weekday
    const day = meetupTime.getDay();
    if (day === 0 || day === 6) {
      setError('Meetup must be scheduled on a weekday');
      return false;
    }

    return true;
  };

  return {
    validateMeetupTime,
    error,
    setError
  };
}; 