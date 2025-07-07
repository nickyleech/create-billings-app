const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Register new user
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const result = await database.run(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName]
    );

    // Get the created user
    const user = await database.get(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
      [result.id]
    );

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  // Login user
  async login(email, password) {
    // Get user with password hash
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    // Generate token
    const token = this.generateToken(userWithoutPassword);

    return { user: userWithoutPassword, token };
  }

  // Get user by ID
  async getUserById(id) {
    const user = await database.get(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId, updates) {
    const { firstName, lastName, email } = updates;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await database.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser) {
        throw new Error('Email already taken');
      }
    }

    await database.run(
      `UPDATE users 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           email = COALESCE(?, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, email, userId]
    );

    return await this.getUserById(userId);
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with current password hash
    const user = await database.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await this.verifyPassword(currentPassword, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await database.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    return { success: true };
  }

  // Middleware for protecting routes
  authMiddleware() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Access token required' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = this.verifyToken(token);
        
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    };
  }
}

module.exports = new AuthService();