import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('current_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('current_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, pin) => {
    try {
      // Get stored users
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.pin !== pin) {
        throw new Error('Invalid PIN');
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.email === email ? user : u);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      
      setUser(user);
      localStorage.setItem('current_user', JSON.stringify(user));
      
      return { user };
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, pin) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        pin,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('app_users', JSON.stringify(users));
      
      setUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      
      return { user: newUser };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  const resetPin = async (email) => {
    try {
      // Generate a temporary PIN
      const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Get users
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user with temporary PIN
      users[userIndex].pin = tempPin;
      users[userIndex].tempPin = true;
      localStorage.setItem('app_users', JSON.stringify(users));
      
      // In a real app, you'd send this via email
      // For demo purposes, we'll show it in an alert
      alert(`Your temporary PIN is: ${tempPin}\n\nPlease use this to log in and set a new PIN.`);
      
      return { message: 'Temporary PIN sent to your email' };
    } catch (error) {
      throw error;
    }
  };

  const changePin = async (newPin) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update PIN
      users[userIndex].pin = newPin;
      users[userIndex].tempPin = false;
      localStorage.setItem('app_users', JSON.stringify(users));
      
      // Update current user
      const updatedUser = { ...user, pin: newPin, tempPin: false };
      setUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      
      return { message: 'PIN updated successfully' };
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPin,
    changePin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};