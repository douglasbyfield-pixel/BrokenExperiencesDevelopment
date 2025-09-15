import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Comment, Reaction, ReactionType, UserComment } from '../types/comments';
import { Issue } from '../data/mockData';

interface CommentContextType {
  // Comments
  addComment: (issueId: string, text: string, parentId?: string) => void;
  editComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  getCommentsForIssue: (issueId: string) => Comment[];
  getUserComments: () => UserComment[];
  
  // Reactions
  addReaction: (commentId: string, reactionType: ReactionType) => void;
  removeReaction: (commentId: string, reactionType: ReactionType) => void;
  getUserReaction: (commentId: string) => ReactionType | null;
  getReactionCount: (commentId: string, reactionType: ReactionType) => number;
  
  // Issue reactions
  addIssueReaction: (issueId: string, reactionType: ReactionType) => void;
  removeIssueReaction: (issueId: string, reactionType: ReactionType) => void;
  getUserIssueReaction: (issueId: string) => ReactionType | null;
  getIssueReactionCount: (issueId: string, reactionType: ReactionType) => number;
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

// Mock current user ID - in a real app, this would come from auth context
const CURRENT_USER_ID = 'user_123';
const CURRENT_USER_NAME = 'John Doe';

export const CommentProvider: React.FC<CommentProviderProps> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [issueReactions, setIssueReactions] = useState<Record<string, Reaction[]>>({});

  // Load data from storage on app start
  useEffect(() => {
    loadComments();
    loadIssueReactions();
  }, []);

  // Save data to storage whenever it changes
  useEffect(() => {
    saveComments();
  }, [comments]);

  useEffect(() => {
    saveIssueReactions();
  }, [issueReactions]);

  const loadComments = async () => {
    try {
      const stored = await AsyncStorage.getItem('comments');
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        // Add some sample comments for testing
        const sampleComments: Comment[] = [
          {
            id: 'comment_1',
            text: 'This is a sample comment to test the system.',
            author: {
              id: 'user_123',
              name: 'John Doe',
              verified: true,
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            reactions: [
              {
                id: 'reaction_1',
                userId: 'user_456',
                type: 'like',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
              }
            ],
            replies: [],
            depth: 0,
            issueId: '1',
          },
          {
            id: 'comment_2',
            text: 'This is a reply to the first comment.',
            author: {
              id: 'user_456',
              name: 'Jane Smith',
              verified: false,
            },
            createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            reactions: [],
            replies: [],
            parentId: 'comment_1',
            depth: 1,
            issueId: '1',
          }
        ];
        setComments(sampleComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const saveComments = async () => {
    try {
      await AsyncStorage.setItem('comments', JSON.stringify(comments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const loadIssueReactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('issueReactions');
      if (stored) {
        setIssueReactions(JSON.parse(stored));
      } else {
        // Add some sample issue reactions for testing
        const sampleReactions: Record<string, Reaction[]> = {
          '1': [
            {
              id: 'issue_reaction_1',
              userId: 'user_456',
              type: 'like',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
            }
          ]
        };
        setIssueReactions(sampleReactions);
      }
    } catch (error) {
      console.error('Error loading issue reactions:', error);
    }
  };

  const saveIssueReactions = async () => {
    try {
      await AsyncStorage.setItem('issueReactions', JSON.stringify(issueReactions));
    } catch (error) {
      console.error('Error saving issue reactions:', error);
    }
  };

  const generateId = () => {
    return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const addComment = (issueId: string, text: string, parentId?: string) => {
    const parentComment = parentId ? comments.find(c => c.id === parentId) : null;
    const depth = parentComment ? parentComment.depth + 1 : 0;

    if (depth > 5) {
      console.warn('Maximum comment depth reached');
      return;
    }

    const newComment: Comment = {
      id: generateId(),
      text,
      author: {
        id: CURRENT_USER_ID,
        name: CURRENT_USER_NAME,
        verified: true,
      },
      createdAt: new Date().toISOString(),
      reactions: [],
      replies: [],
      parentId,
      depth,
      issueId, // Add issueId to the comment
    };

    setComments(prev => [...prev, newComment]);
  };

  const editComment = (commentId: string, text: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, text, updatedAt: new Date().toISOString(), isEdited: true }
        : comment
    ));
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const getCommentsForIssue = (issueId: string): Comment[] => {
    return comments.filter(comment => comment.issueId === issueId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getUserComments = (): UserComment[] => {
    return comments
      .filter(comment => comment.author.id === CURRENT_USER_ID)
      .map(comment => ({
        id: comment.id,
        text: comment.text,
        issueId: comment.issueId,
        issueTitle: `Issue ${comment.issueId}`, // In a real app, this would be fetched from issues
        createdAt: comment.createdAt,
        reactions: comment.reactions,
        replies: comment.replies,
        depth: comment.depth,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const addReaction = (commentId: string, reactionType: ReactionType) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.userId === CURRENT_USER_ID);
        if (existingReaction) {
          // Update existing reaction
          return {
            ...comment,
            reactions: comment.reactions.map(r => 
              r.userId === CURRENT_USER_ID 
                ? { ...r, type: reactionType, createdAt: new Date().toISOString() }
                : r
            )
          };
        } else {
          // Add new reaction
          return {
            ...comment,
            reactions: [
              ...comment.reactions,
              {
                id: generateId(),
                userId: CURRENT_USER_ID,
                type: reactionType,
                createdAt: new Date().toISOString(),
              }
            ]
          };
        }
      }
      return comment;
    }));
  };

  const removeReaction = (commentId: string, reactionType: ReactionType) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: comment.reactions.filter(r => !(r.userId === CURRENT_USER_ID && r.type === reactionType))
        };
      }
      return comment;
    }));
  };

  const getUserReaction = (commentId: string): ReactionType | null => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return null;
    
    const userReaction = comment.reactions.find(r => r.userId === CURRENT_USER_ID);
    return userReaction ? userReaction.type : null;
  };

  const getReactionCount = (commentId: string, reactionType: ReactionType): number => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return 0;
    
    return comment.reactions.filter(r => r.type === reactionType).length;
  };

  const addIssueReaction = (issueId: string, reactionType: ReactionType) => {
    setIssueReactions(prev => {
      const currentReactions = prev[issueId] || [];
      const existingReaction = currentReactions.find(r => r.userId === CURRENT_USER_ID);
      
      if (existingReaction) {
        // Update existing reaction
        return {
          ...prev,
          [issueId]: currentReactions.map(r => 
            r.userId === CURRENT_USER_ID 
              ? { ...r, type: reactionType, createdAt: new Date().toISOString() }
              : r
          )
        };
      } else {
        // Add new reaction
        return {
          ...prev,
          [issueId]: [
            ...currentReactions,
            {
              id: generateId(),
              userId: CURRENT_USER_ID,
              type: reactionType,
              createdAt: new Date().toISOString(),
            }
          ]
        };
      }
    });
  };

  const removeIssueReaction = (issueId: string, reactionType: ReactionType) => {
    setIssueReactions(prev => ({
      ...prev,
      [issueId]: (prev[issueId] || []).filter(r => !(r.userId === CURRENT_USER_ID && r.type === reactionType))
    }));
  };

  const getUserIssueReaction = (issueId: string): ReactionType | null => {
    const reactions = issueReactions[issueId] || [];
    const userReaction = reactions.find(r => r.userId === CURRENT_USER_ID);
    return userReaction ? userReaction.type : null;
  };

  const getIssueReactionCount = (issueId: string, reactionType: ReactionType): number => {
    const reactions = issueReactions[issueId] || [];
    return reactions.filter(r => r.type === reactionType).length;
  };

  const value: CommentContextType = {
    addComment,
    editComment,
    deleteComment,
    getCommentsForIssue,
    getUserComments,
    addReaction,
    removeReaction,
    getUserReaction,
    getReactionCount,
    addIssueReaction,
    removeIssueReaction,
    getUserIssueReaction,
    getIssueReactionCount,
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};
