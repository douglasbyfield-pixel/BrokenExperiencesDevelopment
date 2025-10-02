# Backend API Implementation for User Settings

## Required API Endpoints

### 1. GET /settings
**Purpose**: Fetch user settings
**Authentication**: Required (Bearer token)
**Response**: User settings object

```javascript
app.get('/settings', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id; // From JWT token
        
        // Query the database for user settings
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
        }
        
        if (!data) {
            // Return default settings if none found
            return res.json({
                notifications: {
                    email: true,
                    push: true,
                    issueUpdates: true,
                    weeklyReport: false
                },
                privacy: {
                    showProfile: true,
                    showActivity: true,
                    showStats: true
                },
                display: {
                    theme: 'light',
                    language: 'en',
                    mapStyle: 'satellite-v9'
                }
            });
        }
        
        // Transform database format to frontend format
        const settings = {
            notifications: {
                email: data.email_notifications,
                push: data.push_notifications,
                issueUpdates: data.issue_updates,
                weeklyReport: data.weekly_report
            },
            privacy: {
                showProfile: data.show_profile,
                showActivity: data.show_activity,
                showStats: data.show_stats
            },
            display: {
                theme: data.theme,
                language: data.language,
                mapStyle: data.map_style
            }
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});
```

### 2. PATCH /settings
**Purpose**: Update user settings
**Authentication**: Required (Bearer token)
**Body**: Partial settings object

```javascript
app.patch('/settings', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        
        // Transform frontend format to database format
        const dbUpdates = {};
        
        if (updates.notifications) {
            if (updates.notifications.email !== undefined) 
                dbUpdates.email_notifications = updates.notifications.email;
            if (updates.notifications.push !== undefined) 
                dbUpdates.push_notifications = updates.notifications.push;
            if (updates.notifications.issueUpdates !== undefined) 
                dbUpdates.issue_updates = updates.notifications.issueUpdates;
            if (updates.notifications.weeklyReport !== undefined) 
                dbUpdates.weekly_report = updates.notifications.weeklyReport;
        }
        
        if (updates.privacy) {
            if (updates.privacy.showProfile !== undefined) 
                dbUpdates.show_profile = updates.privacy.showProfile;
            if (updates.privacy.showActivity !== undefined) 
                dbUpdates.show_activity = updates.privacy.showActivity;
            if (updates.privacy.showStats !== undefined) 
                dbUpdates.show_stats = updates.privacy.showStats;
        }
        
        if (updates.display) {
            if (updates.display.theme !== undefined) 
                dbUpdates.theme = updates.display.theme;
            if (updates.display.language !== undefined) 
                dbUpdates.language = updates.display.language;
            if (updates.display.mapStyle !== undefined) 
                dbUpdates.map_style = updates.display.mapStyle;
        }
        
        // Update in database using upsert
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                ...dbUpdates,
                updated_at: new Date().toISOString()
            });
            
        if (error) throw error;
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
});
```

### 3. DELETE /settings/account
**Purpose**: Delete user account
**Authentication**: Required (Bearer token)
**Body**: { confirmPassword: string }

```javascript
app.delete('/settings/account', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { confirmPassword } = req.body;
        
        if (!confirmPassword) {
            return res.status(400).json({ message: 'Password confirmation required' });
        }
        
        // Verify password with Supabase Auth
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: req.user.email,
            password: confirmPassword
        });
        
        if (verifyError) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        // Delete user data from your custom tables first
        await supabase.from('user_settings').delete().eq('user_id', userId);
        await supabase.from('experiences').delete().eq('reported_by', userId);
        // Add other table cleanups as needed
        
        // Delete user from Supabase Auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteError) throw deleteError;
        
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
});
```

## Authentication Middleware

```javascript
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};
```