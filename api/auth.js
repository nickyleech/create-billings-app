const authService = require('../src/utils/auth.js');
const database = require('../src/utils/database.js');

// Initialize database connection
let dbInitialized = false;

async function initDatabase() {
  if (!dbInitialized) {
    await database.init();
    dbInitialized = true;
  }
}

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await initDatabase();

    const { action } = req.query;

    switch (action) {
      case 'register':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleRegister(req, res);

      case 'login':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleLogin(req, res);

      case 'profile':
        if (req.method === 'GET') {
          return await handleGetProfile(req, res);
        } else if (req.method === 'PUT') {
          return await handleUpdateProfile(req, res);
        }
        return res.status(405).json({ error: 'Method not allowed' });

      case 'change-password':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleChangePassword(req, res);

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleRegister(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    throw error;
  }
}

async function handleGetProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.id);

    res.status(200).json({ user });
  } catch (error) {
    if (error.message === 'Invalid token' || error.message === 'User not found') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    throw error;
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    const { firstName, lastName, email } = req.body;
    
    const user = await authService.updateProfile(decoded.id, {
      firstName,
      lastName,
      email
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (error.message === 'Email already taken') {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
}

async function handleChangePassword(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    await authService.changePassword(decoded.id, currentPassword, newPassword);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
}

module.exports = handler;