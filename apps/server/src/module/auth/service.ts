// Mock auth service for demo purposes
// In production, this would integrate with the database and better-auth

interface User {
	id: string;
	email: string;
	name: string;
	image?: string;
	createdAt: Date;
}

interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

// Mock storage
const users: Map<string, User & { password: string }> = new Map();
const sessions: Map<string, Session> = new Map();
const resetTokens: Map<string, { email: string; expiresAt: Date }> = new Map();

// Initialize with demo user
users.set("user-123", {
	id: "user-123",
	email: "sarah.johnson@example.com",
	password: "demo1234", // In production, this would be hashed
	name: "Sarah Johnson",
	image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
	createdAt: new Date("2023-06-15")
});

export const authService = {
	async register(data: { email: string; password: string; name: string }) {
		// Check if user already exists
		const existingUser = Array.from(users.values()).find(u => u.email === data.email);
		if (existingUser) {
			throw new Error("User already exists");
		}
		
		// Create new user
		const user: User & { password: string } = {
			id: `user-${Date.now()}`,
			email: data.email,
			password: data.password, // In production, hash this
			name: data.name,
			createdAt: new Date()
		};
		
		users.set(user.id, user);
		
		// Return user without password
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},
	
	async login(email: string, password: string) {
		// Find user by email
		const user = Array.from(users.values()).find(u => u.email === email);
		
		if (!user || user.password !== password) {
			return null;
		}
		
		// Create session
		const session: Session = {
			id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			userId: user.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
		};
		
		sessions.set(session.id, session);
		
		// Return user without password
		const { password: _, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			session
		};
	},
	
	async getUserBySession(sessionId: string) {
		const session = sessions.get(sessionId);
		
		if (!session || session.expiresAt < new Date()) {
			return null;
		}
		
		const user = users.get(session.userId);
		if (!user) {
			return null;
		}
		
		// Return user without password
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},
	
	async requestPasswordReset(email: string) {
		// Find user by email
		const user = Array.from(users.values()).find(u => u.email === email);
		
		if (!user) {
			// Don't reveal if user exists or not
			return;
		}
		
		// Create reset token
		const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
		resetTokens.set(token, {
			email: user.email,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
		});
		
		// In production, send email with reset link
		console.log(`Password reset token for ${email}: ${token}`);
	},
	
	async resetPassword(token: string, newPassword: string) {
		const resetToken = resetTokens.get(token);
		
		if (!resetToken || resetToken.expiresAt < new Date()) {
			return false;
		}
		
		// Find user by email
		const user = Array.from(users.values()).find(u => u.email === resetToken.email);
		
		if (!user) {
			return false;
		}
		
		// Update password
		user.password = newPassword; // In production, hash this
		
		// Remove used token
		resetTokens.delete(token);
		
		return true;
	},
	
	async logout(sessionId: string) {
		sessions.delete(sessionId);
	}
};