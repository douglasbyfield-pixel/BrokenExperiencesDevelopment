import { supabase } from './supabase';
import type { Database, Issue, Profile, Comment } from '../types/database';

// Note: road_maintenance is a valid enum value in the database

export class DataService {
  // Issues
  static async getIssues() {
    try {
      console.log('DataService: Fetching issues with counts');
      
      // Use a direct query that should be more cache-resistant
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:reported_by (
            id,
            name,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DataService: Error fetching issues:', error);
        throw error;
      }

      // Get counts separately to avoid caching issues
      const issuesWithCounts = await Promise.all(
        (data || []).map(async (issue) => {
          const [upvotesResult, commentsResult] = await Promise.all([
            supabase
              .from('upvotes')
              .select('id', { count: 'exact', head: true })
              .eq('issue_id', issue.id),
            supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('issue_id', issue.id)
          ]);

          return {
            ...issue,
            upvotes: [{ count: upvotesResult.count || 0 }],
            comments: [{ count: commentsResult.count || 0 }]
          };
        })
      );
      
      console.log('DataService: Fetched', issuesWithCounts.length, 'issues with fresh counts');
      if (issuesWithCounts.length > 0) {
        console.log('DataService: Sample issue with fresh counts:', {
          id: issuesWithCounts[0].id,
          title: issuesWithCounts[0].title,
          upvotes: issuesWithCounts[0].upvotes,
          comments: issuesWithCounts[0].comments
        });
      }
      
      return issuesWithCounts;
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

  static async deleteIssue(issueId: string) {
    try {
      console.log('DataService: Deleting issue with ID:', issueId);
      
      // First check if the issue exists and get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('DataService: Current user ID:', user.id);
      
      // Check if user owns this issue
      const { data: issue, error: fetchError } = await supabase
        .from('issues')
        .select('reported_by')
        .eq('id', issueId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching issue:', fetchError);
        throw new Error('Issue not found');
      }
      
      if (issue.reported_by !== user.id) {
        throw new Error('You can only delete your own issues');
      }
      
      console.log('DataService: User owns issue, proceeding with delete');
      
      // First, delete related records that might have foreign key constraints
      try {
        // Delete comments for this issue
        await supabase
          .from('comments')
          .delete()
          .eq('issue_id', issueId);
          
        // Delete upvotes for this issue  
        await supabase
          .from('upvotes')
          .delete()
          .eq('issue_id', issueId);
          
        console.log('DataService: Related records deleted');
      } catch (relatedError) {
        console.warn('DataService: Error deleting related records:', relatedError);
        // Continue anyway, as these might not exist or have different constraints
      }
      
      // Now delete the main issue
      const { data, error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId)
        .eq('reported_by', user.id); // Double-check ownership
        
      console.log('DataService: Delete response:', { data, error });

      if (error) {
        console.error('DataService: Delete error:', error);
        
        // If it's a policy error, provide more specific message
        if (error.code === '42501' || error.message.includes('policy')) {
          throw new Error('Database policy prevents deletion. Please check if you own this issue.');
        }
        
        throw error;
      }
      
      console.log('DataService: Issue deleted successfully');
      return true;
    } catch (error) {
      console.error('DataService: Error deleting issue:', error);
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
      console.log('DataService: Checking existing upvote for issue:', issueId, 'user:', userId);
      
      // Check current authentication context
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      console.log('DataService: Current auth user:', currentUser?.id, 'provided userId:', userId);
      if (authError) {
        console.error('DataService: Auth error:', authError);
      }
      
      // Check if user already upvoted
      const { data: existingUpvote, error: checkError } = await supabase
        .from('upvotes')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('DataService: Error checking existing upvote:', checkError);
        throw checkError;
      }

      console.log('DataService: Existing upvote:', existingUpvote);

      if (existingUpvote) {
        // Remove upvote using the specific ID
        console.log('DataService: Removing upvote with ID:', existingUpvote.id);
        const { data: deleteData, error, count } = await supabase
          .from('upvotes')
          .delete()
          .eq('id', existingUpvote.id)
          .select();

        console.log('DataService: Delete result:', { deleteData, error, count });

        if (error) {
          console.error('DataService: Error removing upvote:', error);
          throw error;
        }
        
        // Check if deletion actually happened
        if (!deleteData || deleteData.length === 0) {
          console.error('DataService: Delete returned no data - likely RLS policy issue');
          throw new Error('Unable to delete upvote - permission denied. Please check if you own this upvote.');
        }
        
        // Verify deletion by checking if the record still exists
        const { data: verifyData, error: verifyError } = await supabase
          .from('upvotes')
          .select('id')
          .eq('id', existingUpvote.id)
          .single();
          
        console.log('DataService: Verification check:', { verifyData, verifyError });
        
        if (verifyData) {
          console.error('DataService: WARNING - Upvote still exists after deletion!');
          throw new Error('Upvote deletion failed - record still exists in database');
        } else {
          console.log('DataService: Upvote successfully deleted and verified');
        }
        
        return false; // Upvote removed
      } else {
        // Add upvote
        console.log('DataService: Adding upvote');
        const { error } = await supabase
          .from('upvotes')
          .insert({
            issue_id: issueId,
            user_id: userId
          });

        if (error) {
          console.error('DataService: Error adding upvote:', error);
          throw error;
        }
        console.log('DataService: Upvote added successfully');
        return true; // Upvote added
      }
    } catch (error) {
      console.error('DataService: Error toggling upvote:', error);
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

  // Bookmarks
  static async toggleBookmark(issueId: string, userId: string) {
    try {
      console.log('DataService: Toggling bookmark for issue:', issueId, 'user:', userId);
      
      // Check if bookmark already exists
      const { data: existingBookmark, error: checkError } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('DataService: Error checking existing bookmark:', checkError);
        throw checkError;
      }

      console.log('DataService: Existing bookmark:', existingBookmark);

      if (existingBookmark) {
        // Remove bookmark
        console.log('DataService: Removing bookmark with ID:', existingBookmark.id);
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmark.id);

        if (error) {
          console.error('DataService: Error removing bookmark:', error);
          throw error;
        }
        console.log('DataService: Bookmark removed successfully');
        return false; // Bookmark removed
      } else {
        // Add bookmark
        console.log('DataService: Adding bookmark');
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            issue_id: issueId,
            user_id: userId
          });

        if (error) {
          console.error('DataService: Error adding bookmark:', error);
          throw error;
        }
        console.log('DataService: Bookmark added successfully');
        return true; // Bookmark added
      }
    } catch (error) {
      console.error('DataService: Error toggling bookmark:', error);
      throw error;
    }
  }

  static async getUserBookmarks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('issue_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(bookmark => bookmark.issue_id) || [];
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  static async getBookmarkedIssues(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          issue_id,
          created_at,
          issues (
            *,
            profiles:reported_by (
              id,
              name,
              avatar
            ),
            upvotes (count),
            comments (count)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to return just the issues
      return data?.map(bookmark => bookmark.issues).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching bookmarked issues:', error);
      return [];
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