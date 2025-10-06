import { useState, useEffect } from 'react';
import { createClient } from '@web/lib/supabase/client';
import type { LeaderboardUser } from '@web/features/leaderboard/leaderboard-card';

interface UserRankStats {
  rank: number;
  totalUsers: number;
  currentPoints: number;
  nextLevelPoints: number;
  currentLevel: number;
}

export function useLeaderboard(category: string = 'overall', limit: number = 10, offset: number = 0) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
        const endpoint = category === 'overall' 
          ? `${apiUrl}/scoring/leaderboard?limit=${limit}&offset=${offset}`
          : `${apiUrl}/scoring/leaderboard/${category}?limit=${limit}&offset=${offset}`;
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setLeaderboardData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch leaderboard');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category, limit, offset]);

  return { leaderboardData, loading, error };
}

export function useUserRankStats() {
  const [rankStats, setRankStats] = useState<UserRankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/scoring/user/${session.user.id}/rank`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user rank: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setRankStats(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch user rank');
        }
      } catch (err) {
        console.error('Error fetching user rank:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user rank');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRank();
  }, []);

  return { rankStats, loading, error };
}

export async function awardPoints(activityType: string, experienceId?: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/scoring/award`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityType,
        experienceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to award points: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to award points');
    }
    
    return result.data;
  } catch (err) {
    console.error('Error awarding points:', err);
    throw err;
  }
}