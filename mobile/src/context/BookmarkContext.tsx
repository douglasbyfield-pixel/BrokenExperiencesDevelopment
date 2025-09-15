import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Issue } from '../data/mockData';

interface BookmarkContextType {
  bookmarkedIssues: string[];
  isBookmarked: (issueId: string) => boolean;
  toggleBookmark: (issueId: string) => void;
  getBookmarkedIssues: (allIssues: Issue[]) => Issue[];
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
  const [bookmarkedIssues, setBookmarkedIssues] = useState<string[]>([]);

  // Load bookmarks from storage on app start
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Save bookmarks to storage whenever they change
  useEffect(() => {
    saveBookmarks();
  }, [bookmarkedIssues]);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarkedIssues');
      if (stored) {
        setBookmarkedIssues(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveBookmarks = async () => {
    try {
      await AsyncStorage.setItem('bookmarkedIssues', JSON.stringify(bookmarkedIssues));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const isBookmarked = (issueId: string): boolean => {
    return bookmarkedIssues.includes(issueId);
  };

  const toggleBookmark = (issueId: string) => {
    setBookmarkedIssues(prev => {
      if (prev.includes(issueId)) {
        // Remove bookmark
        return prev.filter(id => id !== issueId);
      } else {
        // Add bookmark
        return [...prev, issueId];
      }
    });
  };

  const getBookmarkedIssues = (allIssues: Issue[]): Issue[] => {
    return allIssues.filter(issue => bookmarkedIssues.includes(issue.id));
  };

  const value: BookmarkContextType = {
    bookmarkedIssues,
    isBookmarked,
    toggleBookmark,
    getBookmarkedIssues,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

