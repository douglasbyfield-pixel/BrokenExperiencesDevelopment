// Real Supabase Authentication Service for BrokenExp PWA
import { supabase, getCurrentUser, createUserProfile, onAuthStateChange, signOut } from './supabase.js';

export class AuthService {
    constructor() {
        this.user = null;
        this.profile = null;
        this.initializeAuthListener();
    }

    // Initialize auth state listener
    initializeAuthListener() {
        onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session?.user) {
                this.user = session.user;
                await this.handleUserSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.profile = null;
                this.handleUserSignOut();
            }
        });

        // Check current session
        this.checkCurrentSession();
    }

    async checkCurrentSession() {
        try {
            const user = await getCurrentUser();
            if (user) {
                this.user = user;
                await this.loadUserProfile(user.id);
            }
        } catch (error) {
            console.error('Error checking current session:', error);
        }
    }

    async handleUserSignIn(user) {
        try {
            // Load or create user profile
            await this.loadUserProfile(user.id);
            
            // Update localStorage for PWA compatibility
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                email: user.email,
                loginTime: new Date().toISOString()
            }));

            console.log('User signed in successfully:', user.email);
        } catch (error) {
            console.error('Error handling user sign in:', error);
        }
    }

    handleUserSignOut() {
        // Clear localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        
        console.log('User signed out');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
    }

    async loadUserProfile(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const newProfile = {
                    id: userId,
                    name: this.user?.user_metadata?.full_name || this.user?.email?.split('@')[0] || 'User',
                    email: this.user?.email,
                    avatar: this.user?.user_metadata?.avatar_url || null,
                    created_at: new Date().toISOString()
                };

                const { data: createdProfile, error: createError } = await createUserProfile(newProfile);
                if (createError) {
                    console.error('Error creating user profile:', createError);
                    return;
                }
                
                this.profile = createdProfile;
                localStorage.setItem('userProfile', JSON.stringify(createdProfile));
                console.log('Created new user profile:', createdProfile);
            } else if (error) {
                console.error('Error loading user profile:', error);
            } else {
                this.profile = profile;
                localStorage.setItem('userProfile', JSON.stringify(profile));
                console.log('Loaded user profile:', profile);
            }
        } catch (error) {
            console.error('Error in loadUserProfile:', error);
        }
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            console.log('Attempting to sign in user:', email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('Sign in successful:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign up with email and password
    async signUpWithEmail(email, password) {
        try {
            console.log('Attempting to sign up user:', email);
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            console.log('Sign up successful:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/home.html'
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with Apple
    async signInWithApple() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: window.location.origin + '/home.html'
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Apple sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            const { error } = await signOut();
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get current user profile
    getCurrentProfile() {
        return this.profile;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateProfile(updates) {
        try {
            if (!this.user) {
                throw new Error('No authenticated user');
            }

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', this.user.id)
                .select()
                .single();

            if (error) throw error;

            this.profile = data;
            localStorage.setItem('userProfile', JSON.stringify(data));
            
            return { success: true, data };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global auth service instance
export const authService = new AuthService();

console.log('AuthService initialized with Supabase backend');