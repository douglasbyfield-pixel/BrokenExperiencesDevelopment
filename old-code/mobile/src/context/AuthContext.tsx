import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { DataService } from '../services/dataService';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  setIsAuthenticated: (value: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Fetch or create user profile
          let profileData = await DataService.getProfile(session.user.id);
          
          if (!profileData) {
            // Create profile if it doesn't exist
            profileData = await DataService.createOrUpdateProfile({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              avatar: session.user.user_metadata?.avatar_url || null,
              reputation: 0
            });
          }
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Fetch or create user profile
        let profileData = await DataService.getProfile(session.user.id);
        
        if (!profileData) {
          // Create profile if it doesn't exist
          profileData = await DataService.createOrUpdateProfile({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url || null,
            reputation: 0
          });
        }
        
        if (profileData) {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    profile,
    setIsAuthenticated,
    signOut,
  };

  // Show loading state while checking authentication
  if (loading) {
    return null; // You could show a loading spinner here
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};