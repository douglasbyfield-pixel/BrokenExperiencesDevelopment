// Real Supabase Authentication functionality for BrokenExp PWA
import { AuthService } from './authService.js';
import { supabase } from './supabase.js';

class AuthManager {
    constructor() {
        this.isSignUpMode = false;
        this.isLoading = false;
        this.authService = new AuthService();
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadRememberedCredentials();
    }

    initializeElements() {
        // Form elements
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        this.rememberMeContainer = document.getElementById('rememberMeContainer');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        
        // Button elements
        this.authButton = document.getElementById('authButton');
        this.authButtonText = document.getElementById('authButtonText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.switchModeButton = document.getElementById('switchMode');
        this.googleButton = document.getElementById('googleButton');
        this.appleButton = document.getElementById('appleButton');
        
        // Password toggle elements
        this.passwordToggle = document.getElementById('passwordToggle');
        this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    }

    attachEventListeners() {
        // Form submission
        this.loginForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Mode switching
        this.switchModeButton.addEventListener('click', () => this.toggleMode());
        
        // Password visibility toggles
        this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility('password'));
        this.confirmPasswordToggle.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
        
        // Social login buttons
        this.googleButton.addEventListener('click', () => this.handleGoogleSignIn());
        this.appleButton.addEventListener('click', () => this.handleAppleSignIn());
        
        // Remember me
        this.rememberMeCheckbox.addEventListener('change', () => this.handleRememberMeChange());
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        // Validation
        if (!email || !password) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (this.isSignUpMode) {
            if (password !== confirmPassword) {
                this.showMessage('Passwords do not match.', 'error');
                return;
            }
            
            if (password.length < 6) {
                this.showMessage('Password must be at least 6 characters long.', 'error');
                return;
            }
        }
        
        this.setLoading(true);
        
        try {
            if (this.isSignUpMode) {
                await this.signUp(email, password);
            } else {
                await this.signIn(email, password);
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showMessage(error.message || 'Authentication failed. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async signUp(email, password) {
        const result = await this.authService.signUpWithEmail(email, password);
        
        if (result.success) {
            this.showMessage('Account created successfully! Please check your email for verification.', 'success');
            this.switchToSignIn();
        } else {
            throw new Error(result.error);
        }
    }

    async signIn(email, password) {
        const result = await this.authService.signInWithEmail(email, password);
        
        if (result.success) {
            // Handle remember me
            if (this.rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPassword', password);
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPassword');
            }
            
            this.showMessage('Sign in successful! Redirecting...', 'success');
            
            // Wait a moment then redirect to home page
            setTimeout(() => {
                window.location.replace('home.html');
            }, 1000);
        } else {
            throw new Error(result.error);
        }
    }

    async handleGoogleSignIn() {
        if (this.isLoading) return;
        
        this.setButtonLoading(this.googleButton, true);
        
        try {
            const result = await this.authService.signInWithGoogle();
            
            if (result.success) {
                this.showMessage('Redirecting to Google...', 'info');
                // OAuth will handle the redirect
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showMessage('Failed to sign in with Google. Please try again.', 'error');
        } finally {
            this.setButtonLoading(this.googleButton, false);
        }
    }

    async handleAppleSignIn() {
        if (this.isLoading) return;
        
        this.setButtonLoading(this.appleButton, true);
        
        try {
            const result = await this.authService.signInWithApple();
            
            if (result.success) {
                this.showMessage('Redirecting to Apple...', 'info');
                // OAuth will handle the redirect
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Apple sign-in error:', error);
            this.showMessage('Failed to sign in with Apple. Please try again.', 'error');
        } finally {
            this.setButtonLoading(this.appleButton, false);
        }
    }

    toggleMode() {
        this.isSignUpMode = !this.isSignUpMode;
        this.updateUI();
    }

    switchToSignIn() {
        this.isSignUpMode = false;
        this.updateUI();
        this.clearForm();
    }

    updateUI() {
        if (this.isSignUpMode) {
            // Switch to sign up mode
            this.authButtonText.textContent = 'Sign Up';
            this.switchModeButton.textContent = 'Already have an account? Sign In';
            this.confirmPasswordGroup.style.display = 'block';
            this.rememberMeContainer.style.display = 'none';
            this.confirmPasswordInput.required = true;
        } else {
            // Switch to sign in mode
            this.authButtonText.textContent = 'Sign In';
            this.switchModeButton.textContent = "Don't have an account? Sign Up";
            this.confirmPasswordGroup.style.display = 'none';
            this.rememberMeContainer.style.display = 'block';
            this.confirmPasswordInput.required = false;
        }
    }

    togglePasswordVisibility(inputType) {
        const input = inputType === 'password' ? this.passwordInput : this.confirmPasswordInput;
        const toggle = inputType === 'password' ? this.passwordToggle : this.confirmPasswordToggle;
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.innerHTML = `
                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <path d="M1 1l22 22"/>
                </svg>
            `;
        } else {
            input.type = 'password';
            toggle.innerHTML = `
                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        }
    }

    handleRememberMeChange() {
        if (!this.rememberMeCheckbox.checked) {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
        }
    }

    loadRememberedCredentials() {
        try {
            const rememberedEmail = localStorage.getItem('rememberedEmail');
            const rememberedPassword = localStorage.getItem('rememberedPassword');
            
            if (rememberedEmail && rememberedPassword) {
                this.emailInput.value = rememberedEmail;
                this.passwordInput.value = rememberedPassword;
                this.rememberMeCheckbox.checked = true;
            }
        } catch (error) {
            console.error('Error loading remembered credentials:', error);
        }
    }

    clearForm() {
        this.emailInput.value = '';
        this.passwordInput.value = '';
        this.confirmPasswordInput.value = '';
        this.rememberMeCheckbox.checked = false;
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.authButton.disabled = loading;
        
        if (loading) {
            this.authButtonText.style.display = 'none';
            this.loadingSpinner.style.display = 'block';
        } else {
            this.authButtonText.style.display = 'block';
            this.loadingSpinner.style.display = 'none';
        }
    }

    setButtonLoading(button, loading) {
        const span = button.querySelector('span');
        const icon = button.querySelector('.social-icon');
        
        button.disabled = loading;
        
        if (loading) {
            span.textContent = 'Redirecting...';
            if (icon) icon.style.display = 'none';
        } else {
            if (button === this.googleButton) {
                span.textContent = 'Continue with Google';
            } else if (button === this.appleButton) {
                span.textContent = 'Continue with Apple';
            }
            if (icon) icon.style.display = 'block';
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing message
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `auth-message auth-message--${type}`;
        messageElement.textContent = message;
        
        // Add styles
        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: 'calc(100vw - 40px)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: type === 'error' ? '#FEF2F2' : type === 'success' ? '#F0FDF4' : '#F8FAFC',
            color: type === 'error' ? '#DC2626' : type === 'success' ? '#16A34A' : '#475569',
            border: `1px solid ${type === 'error' ? '#FECACA' : type === 'success' ? '#BBF7D0' : '#E2E8F0'}`
        });
        
        document.body.appendChild(messageElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add a delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Check if user is already authenticated with Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('User already authenticated, redirecting to home');
            window.location.replace('home.html'); // Use replace to prevent back button issues
            return;
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
    
    // User not authenticated, show login form
    new AuthManager();
});

console.log('Real Supabase Auth Manager loaded');