import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { DataService } from '../services/dataService';
import { useAuth } from './AuthContext';
import type { Issue } from '../types/database';

interface BookmarkContextType {
  bookmarkedIssues: string[];
  isBookmarked: (issueId: string) => boolean;
  toggleBookmark: (issueId: string) => Promise<void>;
  getBookmarkedIssues: () => Promise<Issue[]>;
  loadUserBookmarks: () => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: React.ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [bookmarkedIssues, setBookmarkedIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load bookmarks when user changes
  useEffect(() => {
    if (user) {
      loadUserBookmarks();
    } else {
      setBookmarkedIssues([]);
    }
  }, [user]);

  const loadUserBookmarks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const bookmarks = await DataService.getUserBookmarks(user.id);
      setBookmarkedIssues(bookmarks);
      console.log('BookmarkContext: Loaded', bookmarks.length, 'bookmarks');
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (issueId: string): boolean => {
    return bookmarkedIssues.includes(issueId);
  };

  const toggleBookmark = async (issueId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to bookmark issues.');
      return;
    }

    const wasBookmarked = isBookmarked(issueId);
    
    // Optimistic update
    if (wasBookmarked) {
      setBookmarkedIssues(prev => prev.filter(id => id !== issueId));
    } else {
      setBookmarkedIssues(prev => [...prev, issueId]);
    }

    try {
      console.log('BookmarkContext: Toggling bookmark for issue:', issueId);
      const isBookmarked = await DataService.toggleBookmark(issueId, user.id);
      console.log('BookmarkContext: Bookmark result:', isBookmarked);
      
      // Verify optimistic update was correct
      if (isBookmarked === wasBookmarked) {
        console.log('BookmarkContext: Optimistic update was wrong, reverting');
        // Revert if our optimistic update was wrong
        if (wasBookmarked) {
          setBookmarkedIssues(prev => [...prev, issueId]);
        } else {
          setBookmarkedIssues(prev => prev.filter(id => id !== issueId));
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Revert optimistic update on error
      if (wasBookmarked) {
        setBookmarkedIssues(prev => [...prev, issueId]);
      } else {
        setBookmarkedIssues(prev => prev.filter(id => id !== issueId));
      }
      
      Alert.alert('Error', 'Failed to update bookmark. Please try again.');
    }
  };

  const getBookmarkedIssues = async (): Promise<Issue[]> => {
    if (!user) return [];
    
    try {
      const issues = await DataService.getBookmarkedIssues(user.id);
      return issues;
    } catch (error) {
      console.error('Error fetching bookmarked issues:', error);
      return [];
    }
  };

  const value: BookmarkContextType = {
    bookmarkedIssues,
    isBookmarked,
    toggleBookmark,
    getBookmarkedIssues,
    loadUserBookmarks,
    loading,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

