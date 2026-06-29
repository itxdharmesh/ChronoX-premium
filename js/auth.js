/**
 * ChronoX - Authentication Manager
 * Handles user authentication, sessions, and authorization
 * @version 1.0.0
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.rememberMe = false;
        
        // Load session from storage
        this.loadSession();
    }

    /**
     * Load existing session from storage
     */
    loadSession() {
        const session = storage.get('session');
        const rememberMe = storage.get('rememberMe', false);
        
        if (session && session.token) {
            this.sessionToken = session.token;
            this.currentUser = session.user;
            this.isAuthenticated = true;
            this.rememberMe = rememberMe;
            
            // Validate session expiry
            if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
                this.logout();
            }
        }
    }

    /**
     * Save session to storage
     */
    saveSession() {
        if (this.rememberMe) {
            const session = {
                token: this.sessionToken,
                user: this.currentUser,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
            storage.set('session', session);
            storage.set('rememberMe', true);
        } else {
            const session = {
                token: this.sessionToken,
                user: this.currentUser,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };
            storage.set('session', session);
            storage.set('rememberMe', false);
        }
    }

    /**
     * Sign up new user
     * @param {Object} userData - { username, email, password, displayName }
     * @returns {Promise}
     */
    async signup(userData) {
        // Validate input
        if (!userData.username || !userData.email || !userData.password) {
            throw new Error('All fields are required');
        }

        if (!isValidUsername(userData.username)) {
            throw new Error('Invalid username format');
        }

        if (!isValidEmail(userData.email)) {
            throw new Error('Invalid email format');
        }

        const passwordCheck = validatePassword(userData.password);
        if (!passwordCheck.valid) {
            throw new Error(passwordCheck.message);
        }

        // Check if user already exists
        const existingUsers = await db.query('users', 'username', userData.username);
        if (existingUsers.length > 0) {
            throw new Error('Username already taken');
        }

        const existingEmails = await db.query('users', 'email', userData.email);
        if (existingEmails.length > 0) {
            throw new Error('Email already registered');
        }

        // Create user object
        const user = {
            id: generateUniqueId(),
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password), // Simple hash for demo
            displayName: userData.displayName || userData.username,
            bio: '',
            avatar: 'assets/avatars/default.png',
            banner: 'assets/backgrounds/default-banner.png',
            badges: [],
            xp: 0,
            level: 1,
            coins: 100, // Starting bonus
            achievements: [],
            friends: [],
            followers: [],
            following: [],
            createdAt: new Date().toISOString(),
            isVerified: false,
            theme: 'dark',
            language: 'en'
        };

        // Save to database
        await db.add('users', user);

        // Auto login after signup
        return this.login(userData.email, userData.password);
    }

    /**
     * Login user
     * @param {string} emailOrUsername
     * @param {string} password
     * @param {boolean} remember
     * @returns {Promise}
     */
    async login(emailOrUsername, password, remember = false) {
        // Find user by email or username
        let users = await db.query('users', 'email', emailOrUsername);
        
        if (users.length === 0) {
            users = await db.query('users', 'username', emailOrUsername);
        }

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];

        // Verify password
        if (user.password !== this.hashPassword(password)) {
            throw new Error('Invalid password');
        }

        // Create session
        this.currentUser = user;
        this.isAuthenticated = true;
        this.sessionToken = this.generateToken();
        this.rememberMe = remember;

        // Remove password from current user object
        delete this.currentUser.password;

        // Save session
        this.saveSession();

        // Update last login
        user.lastLogin = new Date().toISOString();
        await db.update('users', user);

        return {
            user: this.currentUser,
            token: this.sessionToken
        };
    }

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        
        // Clear storage
        storage.remove('session');
        storage.remove('rememberMe');
        
        // Redirect to login
        window.location.hash = '#/login';
    }

    /**
     * Get current user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    /**
     * Update user profile
     * @param {Object} updates
     * @returns {Promise}
     */
    async updateProfile(updates) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        // Prevent updating sensitive fields
        delete updates.id;
        delete updates.password;
        delete updates.email;
        delete updates.coins;
        delete updates.xp;

        const updatedUser = { ...this.currentUser, ...updates };
        await db.update('users', updatedUser);
        
        this.currentUser = updatedUser;
        this.saveSession();
        
        return this.currentUser;
    }

    /**
     * Change password
     * @param {string} currentPassword
     * @param {string} newPassword
     * @returns {Promise}
     */
    async changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        // Verify current password
        const user = await db.get('users', this.currentUser.id);
        if (user.password !== this.hashPassword(currentPassword)) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.valid) {
            throw new Error(passwordCheck.message);
        }

        // Update password
        user.password = this.hashPassword(newPassword);
        await db.update('users', user);

        return true;
    }

    /**
     * Reset password (forgot password flow)
     * @param {string} email
     * @returns {Promise}
     */
    async resetPassword(email) {
        const users = await db.query('users', 'email', email);
        
        if (users.length === 0) {
            throw new Error('No account found with this email');
        }

        // In real app, send email with reset link
        // For demo, just return success
        return {
            success: true,
            message: 'Password reset link sent to your email'
        };
    }

    /**
     * Verify email
     * @param {string} token
     * @returns {Promise}
     */
    async verifyEmail(token) {
        // In real app, validate token and mark email as verified
        if (this.isAuthenticated) {
            const user = await db.get('users', this.currentUser.id);
            user.isVerified = true;
            await db.update('users', user);
            this.currentUser.isVerified = true;
            this.saveSession();
        }
        return true;
    }

    /**
     * Add XP to user
     * @param {number} amount
     * @returns {Promise}
     */
    async addXP(amount) {
        if (!this.isAuthenticated) return;

        const user = await db.get('users', this.currentUser.id);
        user.xp += amount;
        
        // Check level up
        const newLevel = Math.floor(user.xp / 1000) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            user.coins += 50; // Level up bonus
        }
        
        await db.update('users', user);
        this.currentUser = user;
        this.saveSession();
        
        return { xp: user.xp, level: user.level, leveledUp: newLevel > user.level };
    }

    /**
     * Add coins to user
     * @param {number} amount
     * @returns {Promise}
     */
    async addCoins(amount) {
        if (!this.isAuthenticated) return;

        const user = await db.get('users', this.currentUser.id);
        user.coins += amount;
        
        await db.update('users', user);
        this.currentUser = user;
        this.saveSession();
        
        return user.coins;
    }

    /**
     * Simple password hashing (for demo purposes only)
     * In production, use proper hashing like bcrypt
     * @param {string} password
     * @returns {string}
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'hashed_' + Math.abs(hash).toString(36);
    }

    /**
     * Generate session token
     * @returns {string}
     */
    generateToken() {
        return 'token_' + generateUniqueId() + '_' + Date.now().toString(36);
    }

    /**
     * Check if user has required role/permission
     * @param {string} permission
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        const roles = {
            'admin': ['all'],
            'moderator': ['delete_posts', 'ban_users', 'manage_community'],
            'user': ['create_posts', 'comment', 'like']
        };
        
        return this.currentUser.badges.some(badge => 
            roles[badge] && roles[badge].includes(permission)
        );
    }
}

// Create global auth instance
const auth = new AuthManager();
