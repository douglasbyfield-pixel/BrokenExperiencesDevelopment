export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          issue_id: string;
          text: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          text: string;
          author_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          text?: string;
          author_id?: string | null;
          created_at?: string;
        };
      };
      issues: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'pending' | 'in_progress' | 'resolved';
          priority: 'low' | 'medium' | 'high' | 'critical';
          category: 'infrastructure' | 'safety' | 'environment' | 'maintenance' | 'accessibility' | 'road_maintenance';
          latitude: number;
          longitude: number;
          address: string;
          image_url: string | null;
          reported_by: string | null;
          created_at: string;
          updated_at: string;
          is_pinned: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          category: 'infrastructure' | 'safety' | 'environment' | 'maintenance' | 'accessibility' | 'road_maintenance';
          latitude: number;
          longitude: number;
          address: string;
          image_url?: string | null;
          reported_by?: string | null;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          category?: 'infrastructure' | 'safety' | 'environment' | 'maintenance' | 'accessibility' | 'road_maintenance';
          latitude?: number;
          longitude?: number;
          address?: string;
          image_url?: string | null;
          reported_by?: string | null;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          avatar: string | null;
          reputation: number;
          joined_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name: string;
          avatar?: string | null;
          reputation?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          avatar?: string | null;
          reputation?: number;
          joined_at?: string;
        };
      };
      upvotes: {
        Row: {
          id: string;
          issue_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      issue_status: 'pending' | 'in_progress' | 'resolved' | 'closed';
      issue_priority: 'low' | 'medium' | 'high';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier use
export type Issue = Database['public']['Tables']['issues']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type Upvote = Database['public']['Tables']['upvotes']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];

export type IssueStatus = Database['public']['Enums']['issue_status'];
export type IssuePriority = Database['public']['Enums']['issue_priority'];