import { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  value: number | string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

export const useAnimatedStats = (stats: StatItem[]) => {
  const [animatedStats, setAnimatedStats] = useState<(number | string)[]>(
    stats.map(stat => typeof stat.value === 'number' ? 0 : stat.value)
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const animateStats = () => {
      setAnimatedStats(prev => 
        prev.map((value, i) => {
          if (typeof stats[i].value === 'number' && typeof value === 'number') {
            const target = stats[i].value as number;
            const increment = Math.ceil(target / 5);
            return Math.min(value + increment, target);
          }
          return value;
        })
      );
    };

    const interval = setInterval(animateStats, 100);
    
    timeout = setTimeout(() => {
      clearInterval(interval);
      setAnimatedStats(stats.map(stat => stat.value));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [stats]);

  return { animatedStats };
}; 