import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { User, Hash, Eye, EyeOff, RotateCcw } from 'lucide-react';

const LoginForm = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    pin: '',
    confirmPin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, register, resetPin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For PIN inputs, only allow 4 digits
    if ((name === 'pin' || name === 'confirmPin') && value.length > 4) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (mode !== 'reset') {
      if (!formData.pin) {
        newErrors.pin = 'PIN is required';
      } else if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
        newErrors.pin = 'PIN must be exactly 4 digits';
      }
      
      if (mode === 'register') {
        if (!formData.confirmPin) {
          newErrors.confirmPin = 'Please confirm your PIN';
        } else if (formData.pin !== formData.confirmPin) {
          newErrors.confirmPin = 'PINs do not match';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.pin);
      } else if (mode === 'register') {
        await register(formData.email, formData.pin);
      } else if (mode === 'reset') {
        await resetPin(formData.email);
        setMessage('Temporary PIN sent! Check your email.');
        setMode('login');
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', pin: '', confirmPin: '' });
    setErrors({});
    setMessage('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'reset': return 'Reset PIN';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in with your email and 4-digit PIN';
      case 'register': return 'Create a new account with a 4-digit PIN';
      case 'reset': return 'Enter your email to receive a temporary PIN';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-gray-900 mb-2">{getTitle()}</h2>
          <p className="text-gray-600 text-sm">{getSubtitle()}</p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-red-600 text-xs">{errors.email}</p>}
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                4-Digit PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="pin"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  value={formData.pin}
                  onChange={handleChange}
                  maxLength="4"
                  pattern="[0-9]{4}"
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest ${
                    errors.pin ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.pin && <p className="mt-1 text-red-600 text-xs">{errors.pin}</p>}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPin"
                  name="confirmPin"
                  type={showPin ? 'text' : 'password'}
                  value={formData.confirmPin}
                  onChange={handleChange}
                  maxLength="4"
                  pattern="[0-9]{4}"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest ${
                    errors.confirmPin ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••"
                />
              </div>
              {errors.confirmPin && <p className="mt-1 text-red-600 text-xs">{errors.confirmPin}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              'Please wait...'
            ) : mode === 'login' ? (
              'Sign In'
            ) : mode === 'register' ? (
              'Create Account'
            ) : (
              'Send Reset PIN'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {mode === 'login' && (
            <>
              <div className="text-center">
                <button
                  onClick={() => switchMode('reset')}
                  className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Forgot your PIN?</span>
                </button>
              </div>
              <div className="text-center border-t pt-3">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchMode('register')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your PIN?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Your PIN is stored securely and used only for authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;