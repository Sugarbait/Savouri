import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialUserType?: 'customer' | 'business_owner';
  onSuccess?: (userType: 'customer' | 'business_owner') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signin', initialUserType = 'customer', onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [userType, setUserType] = useState<'customer' | 'business_owner'>(initialUserType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation for signup
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.displayName,
          userType
        );
        if (error) throw error;

        // Call onSuccess if provided, otherwise just close
        if (onSuccess) {
          onSuccess(userType);
        } else {
          onClose();
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100">
        {/* Header */}
        <div className="relative px-6 md:px-8 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl mb-3">
              {mode === 'signin' ? (
                <User className="w-6 h-6 text-gray-700" />
              ) : (
                <Sparkles className="w-6 h-6 text-gray-700" />
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === 'signin'
                ? 'Welcome to Savouri'
                : 'Join Savouri to get started'}
            </p>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-6">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Min. 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none transition-all bg-gray-50 focus:bg-white text-sm ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 ml-1">
                      Passwords don't match
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                {initialUserType === 'business_owner' && (
                  <div className="p-3 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Business Account</div>
                        <div className="text-xs text-gray-600">Manage your restaurant</div>
                      </div>
                    </div>
                  </div>
                )}
                {initialUserType === 'customer' && (
                  <div className="p-3 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Customer Account</div>
                        <div className="text-xs text-gray-600">Browse and order meals</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">
                  {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="mt-3 text-gray-900 font-semibold hover:underline transition-all text-sm"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
