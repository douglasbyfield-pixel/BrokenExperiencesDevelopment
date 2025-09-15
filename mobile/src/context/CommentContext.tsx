import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/dataService';
import { useAuth } from './AuthContext';
import type { Comment as DBComment } from '../types/database';

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  reactions: never[]; // We'll handle reactions separately for now
  replies: never[];   // We'll handle replies separately for now
  parentId?: string;
  depth: number;
  isEdited?: boolean;
  issueId: string;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';

interface CommentContextType {
  // Comments
  addComment: (issueId: string, text: string, parentId?: string) => Promise<void>;
  editComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  getCommentsForIssue: (issueId: string) => Comment[];
  getUserComments: () => Comment[];
  loadCommentsForIssue: (issueId: string) => Promise<void>;
  
  // Issue reactions (simplified to just upvotes for now)
  toggleUpvote: (issueId: string) => Promise<void>;
  getUserUpvotes: () => string[];
  
  // Comment reactions (stubbed for compatibility)
  addReaction: (commentId: string, reactionType: ReactionType) => void;
  removeReaction: (commentId: string, reactionType: ReactionType) => void;
  getUserReaction: (commentId: string) => ReactionType | null;
  getReactionCount: (commentId: string, reactionType: ReactionType) => number;
  
  // Issue reactions (stubbed for compatibility)
  addIssueReaction: (issueId: string, reactionType: ReactionType) => void;
  removeIssueReaction: (issueId: string, reactionType: ReactionType) => void;
  getUserIssueReaction: (issueId: string) => ReactionType | null;
  getIssueReactionCount: (issueId: string, reactionType: ReactionType) => number;
  
  // Loading states
  loading: boolean;
  commentsLoading: boolean;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
};

interface CommentProviderProps {
  children: React.ReactNode;
}

export const CommentProvider: React.FC<CommentProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [commentsByIssue, setCommentsByIssue] = useState<Record<string, Comment[]>>({});
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Load user upvotes when user changes
  useEffect(() => {
    if (user) {
      loadUserUpvotes();
    }
  }, [user]);

  const loadUserUpvotes = async () => {
    if (!user) return;
    try {
      const upvotes = await DataService.getUserUpvotes(user.id);
      setUserUpvotes(upvotes);
    } catch (error) {
      console.error('Error loading user upvotes:', error);
    }
  };

  const loadCommentsForIssue = useCallback(async (issueId: string) => {
    try {
      setCommentsLoading(true);
      const dbComments = await DataService.getComments(issueId);
      
      // Transform database comments to match our interface
      const transformedComments: Comment[] = dbComments.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        author: {
          id: comment.profiles?.id || '',
          name: comment.profiles?.name || 'Unknown User',
          avatar: comment.profiles?.avatar || undefined,
          verified: false,
        },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at || undefined,
        reactions: [],
        replies: [],
        depth: 0,
        issueId: comment.issue_id,
      }));
      
      setCommentsByIssue(prev => ({
        ...prev,
        [issueId]: transformedComments
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
      setCommentsByIssue(prev => ({
        ...prev,
        [issueId]: []
      }));
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const addComment = async (issueId: string, text: string, parentId?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to add comments');
    }

    try {
      setLoading(true);
      const commentData = {
        issue_id: issueId,
        author_id: user.id,
        text: text.trim(),
      };

      const newComment = await DataService.addComment(commentData);
      
      if (newComment) {
        // Transform and add to local state
        const transformedComment: Comment = {
          id: newComment.id,
          text: newComment.text,
          author: {
            id: newComment.profiles?.id || user.id,
            name: newComment.profiles?.name || 'You',
            avatar: newComment.profiles?.avatar || undefined,
            verified: false,
          },
          createdAt: newComment.created_at,
          reactions: [],
          replies: [],
          depth: 0,
          issueId: newComment.issue_id,
        };
        
        setCommentsByIssue(prev => ({
          ...prev,
          [issueId]: [...(prev[issueId] || []), transformedComment]
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editComment = async (commentId: string, text: string) => {
    // For now, we'll just update locally since we don't have an edit endpoint
    console.log('Edit comment not implemented yet');
  };

  const deleteComment = async (commentId: string) => {
    // For now, we'll just remove locally since we don't have a delete endpoint
    setCommentsByIssue(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(issueId => {
        updated[issueId] = updated[issueId].filter(comment => comment.id !== commentId);
      });
      return updated;
    });
  };

  const getCommentsForIssue = (issueId: string): Comment[] => {
    return (commentsByIssue[issueId] || [])
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getUserComments = (): Comment[] => {
    if (!user) return [];
    const allComments = Object.values(commentsByIssue).flat();
    return allComments
      .filter(comment => comment.author.id === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const toggleUpvote = async (issueId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to vote');
    }

    try {
      setLoading(true);
      const isUpvoted = await DataService.toggleUpvote(issueId, user.id);
      
      // Update local state
      if (isUpvoted) {
        setUserUpvotes(prev => [...prev, issueId]);
      } else {
        setUserUpvotes(prev => prev.filter(id => id !== issueId));
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserUpvotes = (): string[] => {
    return userUpvotes;
  };

  // Stub implementations for compatibility
  const addReaction = (commentId: string, reactionType: ReactionType) => {
    console.log('Comment reactions not implemented yet');
  };

  const removeReaction = (commentId: string, reactionType: ReactionType) => {
    console.log('Comment reactions not implemented yet');
  };

  const getUserReaction = (commentId: string): ReactionType | null => {
    return null;
  };

  const getReactionCount = (commentId: string, reactionType: ReactionType): number => {
    return 0;
  };

  const addIssueReaction = (issueId: string, reactionType: ReactionType) => {
    console.log('Issue reactions not implemented yet');
  };

  const removeIssueReaction = (issueId: string, reactionType: ReactionType) => {
    console.log('Issue reactions not implemented yet');
  };

  const getUserIssueReaction = (issueId: string): ReactionType | null => {
    return null;
  };

  const getIssueReactionCount = (issueId: string, reactionType: ReactionType): number => {
    return 0;
  };

  const value: CommentContextType = {
    addComment,
    editComment,
    deleteComment,
    getCommentsForIssue,
    getUserComments,
    loadCommentsForIssue,
    toggleUpvote,
    getUserUpvotes,
    addReaction,
    removeReaction,
    getUserReaction,
    getReactionCount,
    addIssueReaction,
    removeIssueReaction,
    getUserIssueReaction,
    getIssueReactionCount,
    loading,
    commentsLoading,
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};