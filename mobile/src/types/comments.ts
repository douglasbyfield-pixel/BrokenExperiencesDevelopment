export interface Reaction {
  id: string;
  userId: string;
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  createdAt: string;
}

export interface Comment {
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
  reactions: Reaction[];
  replies: Comment[];
  parentId?: string;
  depth: number;
  isEdited?: boolean;
  issueId: string;
}

export interface CommentInput {
  text: string;
  parentId?: string;
  issueId: string;
}

export interface UserComment {
  id: string;
  text: string;
  issueId: string;
  issueTitle: string;
  createdAt: string;
  reactions: Reaction[];
  replies: Comment[];
  depth: number;
}

export const EMOJI_REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
] as const;

export type ReactionType = typeof EMOJI_REACTIONS[number]['type'];
