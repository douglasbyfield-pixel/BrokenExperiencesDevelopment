import { supabase } from './supabase';
import type { Database, Issue, Profile, Comment } from '../types/database';

// Note: road_maintenance is a valid enum value in the database

export class DataService {
  // Issues
  static async getIssues() {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
  }

  static async getIssueById(issueId: string) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (
            *,
            profiles:author_id (
              id,
              name,
              avatar
            )
          )
        `)
        .eq('id', issueId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      return null;
    }
  }

  static async createIssue(issue: Database['public']['Tables']['issues']['Insert']) {
    try {
      console.log('Creating issue with data:', issue);
      
      const { data, error } = await supabase
        .from('issues')
        .insert(issue)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  static async updateIssue(issueId: string, updates: Database['public']['Tables']['issues']['Update']) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  // Comments
  static async getComments(issueId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            avatar
          )
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async addComment(comment: Database['public']['Tables']['comments']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            avatar
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Upvotes
  static async toggleUpvote(issueId: string, userId: string) {
    try {
      // Check if user already upvoted
      const { data: existingUpvote } = await supabase
        .from('upvotes')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', userId)
        .single();

      if (existingUpvote) {
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('issue_id', issueId)
          .eq('user_id', userId);

        if (error) throw error;
        return false; // Upvote removed
      } else {
        // Add upvote
        const { error } = await supabase
          .from('upvotes')
          .insert({
            issue_id: issueId,
            user_id: userId
          });

        if (error) throw error;
        return true; // Upvote added
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      throw error;
    }
  }

  static async getUserUpvotes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('issue_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(upvote => upvote.issue_id) || [];
    } catch (error) {
      console.error('Error fetching user upvotes:', error);
      return [];
    }
  }

  // Profiles
  static async createOrUpdateProfile(profile: Database['public']['Tables']['profiles']['Insert'] | Database['public']['Tables']['profiles']['Update']) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      throw error;
    }
  }

  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  // Search
  static async searchIssues(query: string) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (count)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching issues:', error);
      return [];
    }
  }

  // Filter issues
  static async getFilteredIssues(filters: {
    status?: string;
    priority?: string;
    category?: string;
  }) {
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          ),
          upvotes (count),
          comments (count)
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering issues:', error);
      return [];
    }
  }
}