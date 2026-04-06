import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '/logo.jpg';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage(data.message);
      
      // Show reset URL in development
      if (data.resetUrl) {
        setMessage(`${data.message}\n\nDevelopment Reset Link: ${data.resetUrl}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-yellow-50 relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="glass p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src={logoImage} alt="Dire Dawa Customs" className="w-full h-full rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">Enter your email to reset your password</p>
        </div>
        
        {error && (
          <div className="bg-red-100/80 backdrop-blur-sm border border-red-400/50 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100/80 backdrop-blur-sm border border-green-400/50 text-green-700 px-4 py-3 rounded-xl mb-4 whitespace-pre-line">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
