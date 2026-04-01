import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, Upload, BarChart3, Users, Calculator, FolderOpen, Printer, CheckCircle, ArrowRight, Zap, Shield, TrendingUp, Mail, Phone, MapPin, Github, Twitter, Linkedin, LayoutDashboard, FileText, UserCircle, ClipboardList, Settings, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import ModernLanding from './components/ModernLanding';
import EnhancedModernLanding from './components/EnhancedModernLanding';
import logoImage from '/logo.jpg';

// Context for auth
const AuthContext = createContext(null);
const ThemeContext = createContext(null);

// API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// Theme Provider
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

// Protected Route Component
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Use ModernLanding instead of old LandingPage
// Login Page
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-yellow-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="glass p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src={logoImage} alt="Dire Dawa Customs" className="w-full h-full rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Dire Dawa Customs Commission</p>
        </div>
        
        {error && (
          <div className="bg-red-100/80 backdrop-blur-sm border border-red-400/50 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard Layout
function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <header className="glass-dark text-white shadow-2xl relative z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logoImage} alt="Diredawa Auction" className="w-10 h-10 rounded-lg shadow-lg" />
            <div>
              <h1 className="text-lg font-bold">Diredawa Auction</h1>
              <span className="text-xs text-blue-200">Tender Management System</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-white/30 transition text-sm font-medium flex items-center space-x-2"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>
            <div className="glass px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium">
                {user?.name}
              </span>
              <span className="text-xs text-blue-200 ml-2">({user?.role})</span>
            </div>
            <button
              onClick={logout}
              className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        <aside className={`${sidebarExpanded ? 'w-56' : 'w-16'} shadow-xl p-3 transition-all duration-300 relative ${
          isDark 
            ? 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900' 
            : 'bg-gradient-to-b from-blue-600 via-blue-400 to-white'
        }`}>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-r from-blue-500 to-white text-blue-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 border-2 border-blue-300"
          >
            {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <nav>
            <ul className="space-y-1">
              <li>
                <a href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm hover:shadow-md transition-all text-sm font-medium text-white hover:text-blue-900">
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  {sidebarExpanded && <span>Dashboard</span>}
                </a>
              </li>
              <li>
                <a href="/tenders" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm hover:shadow-md transition-all text-sm font-medium text-white hover:text-blue-900">
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  {sidebarExpanded && <span>Tenders</span>}
                </a>
              </li>
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/bidders" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm hover:shadow-md transition-all text-sm font-medium text-white hover:text-blue-900">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    {sidebarExpanded && <span>Bidders</span>}
                  </a>
                </li>
              )}
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/audit" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm hover:shadow-md transition-all text-sm font-medium text-white hover:text-blue-900">
                    <ClipboardList className="w-5 h-5 flex-shrink-0" />
                    {sidebarExpanded && <span>Audit Logs</span>}
                  </a>
                </li>
              )}
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm hover:shadow-md transition-all text-sm font-medium text-white hover:text-blue-900">
                    <UserCircle className="w-5 h-5 flex-shrink-0" />
                    {sidebarExpanded && <span>Users</span>}
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4 min-w-0 overflow-hidden">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value || 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back, {stats?.user?.name || 'User'}</p>
        </div>
        <a
          href="/tenders"
          className="btn-primary"
        >
          + New Tender
        </a>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass rounded-3xl shadow-xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Tenders</p>
              <p className="text-3xl font-bold gradient-text">{stats?.totalTenders || 0}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-semibold">
            {stats?.openTenders || 0} Open
          </div>
        </div>

        <div className="glass rounded-3xl shadow-xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Groups</p>
              <p className="text-3xl font-bold gradient-text">{stats?.totalGroups || 0}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-600 font-semibold">
            {stats?.soldGroups || 0} Sold
          </div>
        </div>

        <div className="glass rounded-3xl shadow-xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Bidders</p>
              <p className="text-3xl font-bold gradient-text">{stats?.totalBidders || 0}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-orange-600 font-semibold">
            {stats?.totalBids || 0} Bids placed
          </div>
        </div>

        <div className="glass rounded-3xl shadow-xl p-6 card-hover">
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium">Total Value</p>
              <p className="text-2xl font-bold gradient-text truncate">{formatCurrency(stats?.totalValue)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-semibold truncate">
            Sold: {formatCurrency(stats?.soldValue)}
          </div>
        </div>
      </div>

      {/* Groups by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl shadow-lg p-4">
          <h3 className="text-lg font-bold gradient-text mb-4">Groups by Status</h3>
          <div className="space-y-2">
            {stats?.groupsByStatus?.map((group) => (
              <div key={group.status} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition">
                <span className="text-gray-700 font-medium text-sm">{group.status}</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  group.status === 'OPEN' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                  group.status === 'SOLD' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {group._count.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl shadow-lg p-4">
          <h3 className="text-lg font-bold gradient-text mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/tenders" className="block p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
              View All Tenders
            </a>
            <a href="/bidders" className="block p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
              Manage Bidders
            </a>
            <a href="/audit" className="block p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
              View Audit Logs
            </a>
          </div>
        </div>
      </div>

      {/* Recent Tenders */}
      <div className="glass rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-500 to-indigo-500">
          <h3 className="text-lg font-bold text-white">Recent Tenders</h3>
        </div>
        {stats?.recentTenders?.length > 0 ? (
          <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Tender Number</th>
                <th>Title</th>
                <th>Groups</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="font-medium">{tender.tenderNumber}</td>
                  <td>{tender.title || '-'}</td>
                  <td>{tender._count.groups}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' : tender.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tender.status}
                    </span>
                  </td>
                  <td>
                    <a href={`/tenders/${tender.id}`} className="text-primary-600 hover:text-primary-800">
                      <Eye className="w-4 h-4 inline" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No tenders yet
          </div>
        )}
      </div>
    </div>
  );
}

// Tender Detail Page
function TenderDetailPage() {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupFormData, setGroupFormData] = useState({ code: '', name: '', vehiclePlate: '' });

  const { id: tenderId } = useParams();

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  const loadTender = async () => {
    try {
      const response = await api.get(`/tenders/${tenderId}`);
      setTender(response.data);
    } catch (error) {
      console.error('Failed to load tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value || 0);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const data = { tenderId: parseInt(tenderId), ...groupFormData };
    setShowGroupModal(false);
    setGroupFormData({ code: '', name: '', vehiclePlate: '' });
    api.post('/groups', data).then(() => loadTender()).catch(e => alert(e.response?.data?.error || 'Failed to create group'));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!tender) {
    return <div className="text-center py-8 text-red-500">Tender not found</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tender.tenderNumber}</h2>
            <p className="text-gray-600">{tender.title || 'No title'}</p>
            <div className="flex gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                tender.tenderType === 'HARAJ' ? 'bg-orange-100 text-orange-800' :
                tender.tenderType === 'YASBELA' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {tender.tenderType === 'HARAJ' ? `🔨 Haraj${tender.harajRound > 1 ? ` Round ${tender.harajRound}` : ''}` :
                 tender.tenderType === 'YASBELA' ? '↩ Yasbela' : '🏛 Auction'}
              </span>
              {tender.originalTenderId && (
                <span className="text-xs text-gray-500">Ref: Tender #{tender.originalTenderId}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded text-sm ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' : tender.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {tender.status}
            </span>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const apiUrl = import.meta.env.VITE_API_URL || '/api';
                  const response = await fetch(`${apiUrl}/export/excel/${tender.id}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!response.ok) throw new Error('Download failed');
                  const blob = await response.blob();
                  if (blob.size === 0) throw new Error('Downloaded file is empty');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tender_${tender.tenderNumber}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }, 100);
                } catch (error) {
                  alert('Failed to download Excel file: ' + error.message);
                }
              }}
              className="btn-success text-xs"
            >
              ⬇ Excel
            </button>
            <a
              href={`/api/export/pdf/${tender.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs"
            >
              ⬇ PDF
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Date</span>
            <p className="font-medium">{tender.date || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Location</span>
            <p className="font-medium">{tender.location || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Exchange Rate</span>
            <p className="font-medium">{tender.exchangeRate}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Groups</span>
            <p className="font-medium">{tender.groups?.length || 0}</p>
          </div>
        </div>

        {tender.responsibleBody && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Responsible Body:</span> {tender.responsibleBody}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-2 px-4 ${activeTab === 'groups' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          Groups ({tender.groups?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2 px-4 ${activeTab === 'items' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          All Items
        </button>
      </div>

      {activeTab === 'groups' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowGroupModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Group
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tender.groups?.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{group.code}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  group.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                  group.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                  group.status === 'HARAJ' ? 'bg-orange-100 text-orange-800' :
                  group.status === 'YASBELA' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {group.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{group.name}</p>
              {group.vehiclePlate && (
                <p className="text-xs text-gray-500 mb-3">Vehicle: {group.vehiclePlate}</p>
              )}
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Round</span>
                  <p className="font-medium">{group.currentRound}</p>
                </div>
                <div>
                  <span className="text-gray-500">Bidders</span>
                  <p className="font-medium">{group.bidders?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Bids</span>
                  <p className="font-medium">{group.bids?.length || 0}</p>
                </div>
              </div>
              <div className="text-sm mb-3">
                <span className="text-gray-500">Base Price:</span>
                <p className="font-medium">{formatCurrency(group.basePrice)}</p>
              </div>
              <a
                href={`/groups/${group.id}`}
                className="block text-center bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
              >
                Manage
              </a>
            </div>
          ))}
          {tender.groups?.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No groups found
            </div>
          )}
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Group Code *</label>
                <input
                  type="text"
                  value={groupFormData.code}
                  onChange={(e) => setGroupFormData({ ...groupFormData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., CODE-10"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., Contraband materials from location X"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Vehicle Plate</label>
                <input
                  type="text"
                  value={groupFormData.vehiclePlate}
                  onChange={(e) => setGroupFormData({ ...groupFormData, vehiclePlate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="e.g., Aw 034 B/2018"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Serial</th>
                <th>Name</th>
                <th>Type</th>
                <th>Brand</th>
                <th>Country</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>CIF</th>
                <th>FOB</th>
                <th>Tax</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {tender.groups?.flatMap(group => 
                group.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemCode}</td>
                    <td>{item.serialNumber || '-'}</td>
                    <td>{item.name}</td>
                    <td>{item.itemType || '-'}</td>
                    <td>{item.brand || '-'}</td>
                    <td>{item.country || '-'}</td>
                    <td>{item.unit}</td>
                    <td>{item.totalQuantity}</td>
                    <td>{formatCurrency(item.cif)}</td>
                    <td>{formatCurrency(item.fob)}</td>
                    <td>{formatCurrency(item.tax)}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td className="font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Group Detail Page
function GroupDetailPage() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showHarajModal, setShowHarajModal] = useState(false);
  const [showYasbelaModal, setShowYasbelaModal] = useState(false);
  const [harajFormData, setHarajFormData] = useState({ harajPrice: '', harajRound: '1' });
  const [yasbelaFormData, setYasbelaFormData] = useState({ reason: '', yasbelaTenderId: '' });
  const [allTenders, setAllTenders] = useState([]);
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [bidderSearch, setBidderSearch] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [allBidders, setAllBidders] = useState([]);
  const [showBidderDropdown, setShowBidderDropdown] = useState(false);
  const [useNewBidder, setUseNewBidder] = useState(false);
  const [newBidderData, setNewBidderData] = useState({
    name: '',
    companyName: '',
    phone: ''
  });
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    itemCode: '',
    serialNumber: '',
    name: '',
    itemType: '',
    brand: '',
    country: '',
    unit: '',
    warehouse1: 0,
    warehouse2: 0,
    warehouse3: 0,
    fob: 0,
    cif: 0,
    tax: 0
  });

  const { id: groupId } = useParams();

  useEffect(() => {
    loadGroup();
    loadAllBidders();
    loadAllTenders();
  }, [groupId]);

  const loadAllTenders = async () => {
    try {
      const res = await api.get('/tenders');
      setAllTenders(res.data);
    } catch (e) { console.error(e); }
  };

  const loadGroup = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value || 0);
  };

  const loadAllBidders = async () => {
    try {
      const response = await api.get('/bidders');
      setAllBidders(response.data);
    } catch (error) {
      console.error('Failed to load bidders:', error);
    }
  };

  const filteredBidders = allBidders.filter(bidder => {
    const searchLower = bidderSearch.toLowerCase();
    return (
      bidder.name.toLowerCase().includes(searchLower) ||
      bidder.companyName.toLowerCase().includes(searchLower) ||
      bidder.phone.includes(searchLower)
    );
  });

  const handleSelectBidder = (bidder) => {
    setSelectedBidder(bidder);
    setBidderSearch(`${bidder.name} - ${bidder.companyName}`);
    setShowBidderDropdown(false);
  };

  const handleBidderSearchChange = (e) => {
    setBidderSearch(e.target.value);
    setSelectedBidder(null);
    setShowBidderDropdown(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      let bidderId;
      if (useNewBidder) {
        if (!newBidderData.name || !newBidderData.companyName || !newBidderData.phone) {
          alert('Please fill in all bidder fields (Name, Company, Phone)');
          return;
        }
        const bidderResponse = await api.post('/bidders', newBidderData);
        bidderId = bidderResponse.data.id;
      } else {
        if (!selectedBidder) { alert('Please select a bidder'); return; }
        bidderId = selectedBidder.id;
      }
      setShowBidModal(false);
      setSelectedBidder(null); setBidderSearch(''); setBidAmount('');
      setUseNewBidder(false); setNewBidderData({ name: '', companyName: '', phone: '' });
      api.post(`/groups/${groupId}/bids`, { bidderId: parseInt(bidderId), bidPrice: parseFloat(bidAmount) })
        .then(() => { loadGroup(); loadAllBidders(); })
        .catch(e => { alert(e.response?.data?.error || 'Failed to submit bid'); loadGroup(); });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit bid');
    }
  };

  const handleDownloadBidsExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/export/excel/group/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group_${group.code}_bids.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download Excel file: ' + error.message);
    }
  };

  const handleDownloadClosedReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/export/excel/group/${groupId}/closed`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group_${group.code}_closed_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download closed report: ' + error.message);
    }
  };

  const handleDownloadWinnerLetter = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/export/winner-letter/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `winner_letter_${group.code}.docx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download winner letter: ' + error.message);
    }
  };

  const handleNextRound = () => {
    api.post(`/groups/${groupId}/next-round`)
      .then((res) => {
        loadGroup();
      })
      .catch(e => {
        alert(e.response?.data?.error || 'Failed to advance round');
      });
  };

  const handlePrevRound = () => {
    api.post(`/groups/${groupId}/prev-round`)
      .then((res) => {
        loadGroup();
      })
      .catch(e => {
        alert(e.response?.data?.error || 'Failed to go back round');
      });
  };

  // Determine if we can navigate rounds
  const canNavigateRounds = () => {
    if (!group || !group.items || group.items.length === 0) return { canNext: false, canPrev: false };
    if (group.currentRound === 'HARAJ') return { canNext: false, canPrev: false };
    const firstItem = group.items[0];
    const prices = [
      { name: 'CIF', value: firstItem.cif },
      { name: 'FOB', value: firstItem.fob },
      { name: 'TAX', value: firstItem.tax }
    ];
    prices.sort((a, b) => b.value - a.value);
    const rounds = [prices[0].name, prices[1].name, prices[2].name];
    const currentIndex = rounds.indexOf(group.currentRound);
    return {
      canNext: currentIndex < rounds.length - 1,
      canPrev: currentIndex > 0
    };
  };

  const { canNext, canPrev } = group ? canNavigateRounds() : { canNext: false, canPrev: false };

  const handleCloseGroup = () => {
    if (!confirm('Are you sure you want to close this group? The highest bidder will be selected as winner and the group will be marked as SOLD.')) return;
    setGroup(g => ({ ...g, status: 'SOLD' }));
    api.post(`/groups/${groupId}/close`).then(res => {
      alert(`Winner: ${res.data.winner.bidderName} — ${formatCurrency(res.data.winner.price)}`);
      loadGroup();
    }).catch(e => {
      alert(e.response?.data?.error || 'Failed to close group');
      loadGroup();
    });
  };

  const handleSendToHaraj = (e) => {
    e.preventDefault();
    setShowHarajModal(false);
    api.post(`/groups/${groupId}/send-to-haraj`, {
      harajPrice: parseFloat(harajFormData.harajPrice) || undefined,
      harajRound: parseInt(harajFormData.harajRound)
    }).then(() => { loadGroup(); alert('Group converted to Haraj successfully'); })
      .catch(e => { alert(e.response?.data?.error || 'Failed to send to Haraj'); loadGroup(); });
  };

  const handleRevertFromHaraj = () => {
    if (!confirm('Revert from Haraj back to normal rounds (CIF/FOB/TAX)?')) return;
    api.post(`/groups/${groupId}/revert-from-haraj`)
      .then(() => { loadGroup(); alert('Group reverted from Haraj successfully'); })
      .catch(e => { alert(e.response?.data?.error || 'Failed to revert from Haraj'); loadGroup(); });
  };

  const handleReopenGroup = () => {
    if (!confirm('Reopen this group? This will clear the winner and allow new bids.')) return;
    api.post(`/groups/${groupId}/reopen`)
      .then(() => { loadGroup(); alert('Group reopened successfully'); })
      .catch(e => { alert(e.response?.data?.error || 'Failed to reopen group'); loadGroup(); });
  };

  const handleYasbela = (e) => {
    e.preventDefault();
    if (!confirm('Apply Yasbela? A 5% penalty will be deducted from the winner price and the group will be re-auctioned.')) return;
    setShowYasbelaModal(false);
    api.post(`/groups/${groupId}/yasbela`, {
      reason: yasbelaFormData.reason,
      yasbelaTenderId: yasbelaFormData.yasbelaTenderId ? parseInt(yasbelaFormData.yasbelaTenderId) : undefined
    }).then(res => {
      alert(`Yasbela applied. Penalty: ${formatCurrency(res.data.penalty)}. New group created in tender.`);
      loadGroup();
    }).catch(e => { alert(e.response?.data?.error || 'Failed to apply Yasbela'); loadGroup(); });
  };



  const blank = { itemCode:'',serialNumber:'',name:'',itemType:'',brand:'',country:'',unit:'',warehouse1:0,warehouse2:0,warehouse3:0,fob:0,cif:0,tax:0 };

  const handleAddItem = (e) => {
    e.preventDefault();
    const data = { ...itemFormData };
    setShowAddItemModal(false);
    setItemFormData(blank);
    api.post(`/groups/${groupId}/items`, data)
      .then(() => loadGroup())
      .catch(e => { alert(e.response?.data?.error || 'Failed to add item'); loadGroup(); });
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    const id = editingItem.id;
    const data = { ...itemFormData };
    setShowEditItemModal(false);
    setEditingItem(null);
    setItemFormData(blank);
    api.patch(`/groups/${groupId}/items/${id}`, data)
      .then(() => loadGroup())
      .catch(e => { alert(e.response?.data?.error || 'Failed to update item'); loadGroup(); });
  };

  const handleDeleteItem = (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setGroup(g => ({ ...g, items: g.items.filter(i => i.id !== itemId) }));
    api.delete(`/groups/${groupId}/items/${itemId}`)
      .then(() => loadGroup())
      .catch(e => { alert(e.response?.data?.error || 'Failed to delete item'); loadGroup(); });
  };

  const handleDeleteBid = (bidId) => {
    if (!confirm('Are you sure you want to delete this bid?')) return;
    setGroup(g => ({ ...g, bids: g.bids.filter(b => b.id !== bidId) }));
    api.delete(`/groups/${groupId}/bids/${bidId}`)
      .then(() => loadGroup())
      .catch(e => { alert(e.response?.data?.error || 'Failed to delete bid'); loadGroup(); });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      itemCode: item.itemCode || '',
      serialNumber: item.serialNumber || '',
      name: item.name || '',
      itemType: item.itemType || '',
      brand: item.brand || '',
      country: item.country || '',
      unit: item.unit || '',
      warehouse1: item.warehouse1 || 0,
      warehouse2: item.warehouse2 || 0,
      warehouse3: item.warehouse3 || 0,
      fob: item.fob || 0,
      cif: item.cif || 0,
      tax: item.tax || 0
    });
    setShowEditItemModal(true);
  };



  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center py-8 text-red-500">Group not found</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{group.code}</h2>
            <p className="text-gray-600">{group.name}</p>
            {group.vehiclePlate && (
              <p className="text-sm text-gray-500 mt-1">Vehicle Plate: {group.vehiclePlate}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadBidsExcel}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-xs font-medium flex items-center space-x-1"
              title="Download bids (without prices)"
            >
              <span>⬇</span>
              <span>Bids Excel</span>
            </button>
            {group.status === 'SOLD' && (
              <button
                onClick={handleDownloadClosedReport}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center space-x-1"
                title="Download closed group report with calculations"
              >
                <span>📊</span>
                <span>Winners Excel</span>
              </button>
            )}
            {group.status === 'SOLD' && (
              <button
                onClick={handleDownloadWinnerLetter}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-xs font-medium flex items-center space-x-1"
                title="Download winner letter (የመሸኛ ደብደዳቤ)"
              >
                <span>📄</span>
                <span>Winner Letter</span>
              </button>
            )}
            <div className="text-center">
              <span className="block text-sm text-gray-500">Round</span>
              <span className={`round-indicator ${
                group.currentRound === 'TAX' ? 'round-tax' :
                group.currentRound === 'CIF' ? 'round-cif' :
                group.currentRound === 'HARAJ' ? 'bg-orange-100/80 text-orange-700 border border-orange-200/50' :
                'round-fob'
              }`}>
                {group.currentRound}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm text-gray-500">Status</span>
              <span className={`status-badge ${group.status === 'OPEN' ? 'status-open' : group.status === 'SOLD' ? 'status-sold' : 'status-split'}`}>
                {group.status}
              </span>
            </div>
            {group.status === 'SOLD' && (() => {
              const winnerBid = group.bids?.find(b => b.isWinner);
              return winnerBid ? (
                <div className="text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg px-4 py-2">
                  <span className="block text-xs font-semibold text-yellow-700 uppercase tracking-wide">🏆 Winner</span>
                  <p className="text-sm font-bold text-gray-800 mt-1">{winnerBid.bidder.name}</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(winnerBid.bidPrice)}</p>
                </div>
              ) : null;
            })()}
            {group.status === 'YASBELA' && (
              <div className="text-center bg-purple-50 border-2 border-purple-400 rounded-lg px-4 py-2">
                <span className="block text-xs font-semibold text-purple-700 uppercase tracking-wide">↩ Yasbela</span>
                <p className="text-sm text-gray-700 mt-1">Penalty: <strong className="text-red-600">{formatCurrency(group.yasbelaPenalty)}</strong></p>
                {group.yasbelaReason && <p className="text-xs text-gray-500 mt-1">{group.yasbelaReason}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Base Price</span>
            <p className="font-medium text-lg">{formatCurrency(group.basePrice)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Bidders</span>
            <p className="font-medium text-lg">{group.bidders?.length || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Bids</span>
            <p className="font-medium text-lg">{group.bids?.length || 0}</p>
          </div>
        </div>

        {group.status === 'OPEN' && (
          <div className="flex space-x-2 mt-4">
            {group.currentRound === 'HARAJ' ? (
              <button onClick={handleRevertFromHaraj} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
                ← Revert from Haraj
              </button>
            ) : (
              <>
                {canPrev && (
                  <button onClick={handlePrevRound} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                    ← Prev Round
                  </button>
                )}
                {canNext && (
                  <button onClick={handleNextRound} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Next Round →
                  </button>
                )}
              </>
            )}
            <button onClick={handleCloseGroup} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">
              ✓ Close Group
            </button>
            {group.tender?.tenderType !== 'HARAJ' && group.currentRound !== 'HARAJ' && (
              <button onClick={() => setShowHarajModal(true)} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-semibold">
                🔨 Send to Haraj
              </button>
            )}
          </div>
        )}
        {group.currentRound === 'HARAJ' && group.status !== 'OPEN' && (
          <div className="flex space-x-2 mt-4">
            <button onClick={handleRevertFromHaraj} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
              ← Revert from Haraj
            </button>
          </div>
        )}
        {group.status === 'SOLD' && (
          <div className="flex space-x-2 mt-4">
            <button onClick={handleReopenGroup} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-semibold">
              🔓 Reopen Group
            </button>
            <button onClick={() => setShowYasbelaModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold">
              ↩ Apply Yasbela
            </button>
          </div>
        )}
      </div>



      {/* Bids Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold">Bids</h3>
          {group.status === 'OPEN' && (
            <button onClick={() => setShowBidModal(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium">
              + Add Bid
            </button>
          )}
        </div>
        {group.bids?.length > 0 ? (
          <div className="overflow-x-auto">
            {(() => {
              const rounds = [...new Set(group.bids.map(b => b.round))];
              return rounds.map(round => (
                <div key={round}>
                  <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    round === 'TAX' ? 'bg-orange-50 text-orange-700' :
                    round === 'CIF' ? 'bg-blue-50 text-blue-700' :
                    round === 'HARAJ' ? 'bg-orange-50 text-orange-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    Round: {round} {round === group.currentRound && group.status === 'OPEN' ? '(current)' : ''}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Bidder</th>
                        <th>Company</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.bids.filter(b => b.round === round).map((bid) => (
                        <tr key={bid.id}>
                          <td className="font-medium">
                            {bid.bidder.name}
                          </td>
                          <td>{bid.bidder.companyName}</td>
                          <td className="font-bold">
                            {formatCurrency(bid.bidPrice)}
                          </td>
                          <td>
                            {bid.isWinner && group.status === 'SOLD' ? (
                              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">✓ WINNER</span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td>
                            {group.status === 'OPEN' && (
                              <button onClick={() => handleDeleteBid(bid.id)} className="text-red-600 hover:text-red-800" title="Delete bid">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No bids yet</div>
        )}
      </div>

      {/* Items */}
      <div className="glass rounded-2xl shadow-lg overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-500 to-indigo-500 flex justify-between items-center">
          <h3 className="font-bold text-white">Items</h3>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg hover:bg-white/30 transition"
          >
            + Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Serial</th>
              <th>Name</th>
              <th>Type</th>
              <th>Brand</th>
              <th>Country</th>
              <th>Unit</th>
              <th>W1</th>
              <th>W2</th>
              <th>W3</th>
              <th>Qty</th>
              {group.currentRound !== 'HARAJ' && (
                <>
                  <th>CIF</th>
                  <th>FOB</th>
                  <th>Tax</th>
                </>
              )}
              <th>Unit Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {group.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.itemCode}</td>
                <td>{item.serialNumber || '-'}</td>
                <td>{item.name}</td>
                <td>{item.itemType || '-'}</td>
                <td>{item.brand || '-'}</td>
                <td>{item.country || '-'}</td>
                <td>{item.unit}</td>
                <td>{item.warehouse1 || 0}</td>
                <td>{item.warehouse2 || 0}</td>
                <td>{item.warehouse3 || 0}</td>
                <td>{item.totalQuantity}</td>
                {group.currentRound !== 'HARAJ' && (
                  <>
                    <td>{formatCurrency(item.cif)}</td>
                    <td>{formatCurrency(item.fob)}</td>
                    <td>{formatCurrency(item.tax)}</td>
                  </>
                )}
                <td>{formatCurrency(item.unitPrice)}</td>
                <td className="font-medium">{formatCurrency(item.totalPrice)}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold gradient-text mb-4">Edit Item</h3>
            <form onSubmit={handleUpdateItem}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Model *</label>
                  <input
                    type="text"
                    value={itemFormData.itemCode}
                    onChange={(e) => setItemFormData({ ...itemFormData, itemCode: e.target.value })}
                    placeholder="e.g., 52155001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={itemFormData.serialNumber}
                    onChange={(e) => setItemFormData({ ...itemFormData, serialNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    placeholder="e.g., Laptop Computer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Type</label>
                  <input
                    type="text"
                    value={itemFormData.itemType}
                    onChange={(e) => setItemFormData({ ...itemFormData, itemType: e.target.value })}
                    placeholder="e.g., Electronics"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Brand</label>
                  <input
                    type="text"
                    value={itemFormData.brand}
                    onChange={(e) => setItemFormData({ ...itemFormData, brand: e.target.value })}
                    placeholder="e.g., Dell"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    value={itemFormData.country}
                    onChange={(e) => setItemFormData({ ...itemFormData, country: e.target.value })}
                    placeholder="e.g., USA"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Unit *</label>
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    placeholder="e.g., PCS, KG, BOX"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Warehouse Quantities</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 1</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse1}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse1: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 2</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse2}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse2: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 3</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse3}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse3: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Prices (System will select highest)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">CIF Price</label>
                    <input
                      type="number"
                      value={itemFormData.cif}
                      onChange={(e) => setItemFormData({ ...itemFormData, cif: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">FOB Price</label>
                    <input
                      type="number"
                      value={itemFormData.fob}
                      onChange={(e) => setItemFormData({ ...itemFormData, fob: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Tax Price</label>
                    <input
                      type="number"
                      value={itemFormData.tax}
                      onChange={(e) => setItemFormData({ ...itemFormData, tax: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Update Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditItemModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold gradient-text mb-4">Add New Item</h3>
            <form onSubmit={handleAddItem}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Model *</label>
                  <input
                    type="text"
                    value={itemFormData.itemCode}
                    onChange={(e) => setItemFormData({ ...itemFormData, itemCode: e.target.value })}
                    placeholder="e.g., 52155001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={itemFormData.serialNumber}
                    onChange={(e) => setItemFormData({ ...itemFormData, serialNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    placeholder="e.g., Laptop Computer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Type</label>
                  <input
                    type="text"
                    value={itemFormData.itemType}
                    onChange={(e) => setItemFormData({ ...itemFormData, itemType: e.target.value })}
                    placeholder="e.g., Electronics"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Brand</label>
                  <input
                    type="text"
                    value={itemFormData.brand}
                    onChange={(e) => setItemFormData({ ...itemFormData, brand: e.target.value })}
                    placeholder="e.g., Dell"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    value={itemFormData.country}
                    onChange={(e) => setItemFormData({ ...itemFormData, country: e.target.value })}
                    placeholder="e.g., USA"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Unit *</label>
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    placeholder="e.g., PCS, KG, BOX"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Warehouse Quantities</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 1</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse1}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse1: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 2</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse2}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse2: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Warehouse 3</label>
                    <input
                      type="number"
                      value={itemFormData.warehouse3}
                      onChange={(e) => setItemFormData({ ...itemFormData, warehouse3: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Prices (System will select highest)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">CIF Price</label>
                    <input
                      type="number"
                      value={itemFormData.cif}
                      onChange={(e) => setItemFormData({ ...itemFormData, cif: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">FOB Price</label>
                    <input
                      type="number"
                      value={itemFormData.fob}
                      onChange={(e) => setItemFormData({ ...itemFormData, fob: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Tax Price</label>
                    <input
                      type="number"
                      value={itemFormData.tax}
                      onChange={(e) => setItemFormData({ ...itemFormData, tax: e.target.value })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 btn-success"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send to Haraj Modal */}
      {showHarajModal && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 w-full max-w-md">
            <h3 className="text-xl font-bold gradient-text mb-1">🔨 Send to Haraj</h3>
            <p className="text-sm text-gray-500 mb-4">This group will be converted to Haraj mode. CIF/FOB/TAX rounds are replaced with a single base price.</p>
            <form onSubmit={handleSendToHaraj}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Haraj Round</label>
                <div className="flex gap-2">
                  {['1', '2', '3'].map(r => (
                    <button key={r} type="button"
                      onClick={() => setHarajFormData({ ...harajFormData, harajRound: r })}
                      className={`w-12 h-12 rounded-full text-sm font-bold border transition ${
                        harajFormData.harajRound === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                      }`}>{r}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">1st Haraj uses same base price. 2nd/3rd also use same price.</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Haraj Base Price (optional)</label>
                <input
                  type="number"
                  value={harajFormData.harajPrice}
                  onChange={(e) => setHarajFormData({ ...harajFormData, harajPrice: e.target.value })}
                  placeholder={`Default: ${formatCurrency(group.basePrice)}`}
                  step="0.01" min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current base price</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 font-semibold">Convert to Haraj</button>
                <button type="button" onClick={() => setShowHarajModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yasbela Modal */}
      {showYasbelaModal && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 w-full max-w-md">
            <h3 className="text-xl font-bold gradient-text mb-1">↩ Apply Yasbela</h3>
            <p className="text-sm text-gray-500 mb-4">Winner cancelled. A 5% CPO penalty will be applied to <strong>{formatCurrency(group.winnerPrice)}</strong> = <strong className="text-red-600">{formatCurrency((group.winnerPrice || 0) * 0.05)}</strong></p>
            <form onSubmit={handleYasbela}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Reason</label>
                <textarea
                  value={yasbelaFormData.reason}
                  onChange={(e) => setYasbelaFormData({ ...yasbelaFormData, reason: e.target.value })}
                  placeholder="Written cancellation request or 5-day no-show..."
                  rows={3}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Re-auction Under Tender</label>
                <select
                  value={yasbelaFormData.yasbelaTenderId}
                  onChange={(e) => setYasbelaFormData({ ...yasbelaFormData, yasbelaTenderId: e.target.value })}
                  className="w-full"
                >
                  <option value="">-- Same tender (default) --</option>
                  {allTenders.filter(t => t.id !== group.tenderId).map(t => (
                    <option key={t.id} value={t.id}>{t.tenderNumber} ({t.tenderType})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a different tender number if re-announced under new auction</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold">Apply Yasbela</button>
                <button type="button" onClick={() => setShowYasbelaModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Submit Bid</h3>
            <form onSubmit={handleSubmitBid}>
              {/* Toggle between existing and new bidder */}
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseNewBidder(false)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    !useNewBidder 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Existing Bidder
                </button>
                <button
                  type="button"
                  onClick={() => setUseNewBidder(true)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    useNewBidder 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  + New Bidder
                </button>
              </div>

              {/* Existing Bidder Search */}
              {!useNewBidder && (
                <div className="mb-4 relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Search Bidder *
                  </label>
                  <input
                    type="text"
                    value={bidderSearch}
                    onChange={handleBidderSearchChange}
                    onFocus={() => setShowBidderDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Type bidder name, company, or phone..."
                    autoComplete="off"
                  />
                  {selectedBidder && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <p className="font-medium text-green-800">✓ Selected: {selectedBidder.name}</p>
                      <p className="text-green-600 text-xs">{selectedBidder.companyName} - {selectedBidder.phone}</p>
                    </div>
                  )}
                  
                  {/* Dropdown */}
                  {showBidderDropdown && bidderSearch && !selectedBidder && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredBidders.length > 0 ? (
                        filteredBidders.map((bidder) => (
                          <div
                            key={bidder.id}
                            onClick={() => handleSelectBidder(bidder)}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                          >
                            <p className="font-medium text-gray-800">{bidder.name}</p>
                            <p className="text-sm text-gray-600">{bidder.companyName}</p>
                            <p className="text-xs text-gray-500">{bidder.phone}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-gray-500 text-sm mb-2">No bidders found</p>
                          <button
                            type="button"
                            onClick={() => setUseNewBidder(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            + Add as New Bidder
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Type to search by name, company, or phone number
                  </p>
                </div>
              )}

              {/* New Bidder Form */}
              {useNewBidder && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Bidder Name *
                    </label>
                    <input
                      type="text"
                      value={newBidderData.name}
                      onChange={(e) => setNewBidderData({ ...newBidderData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Enter bidder name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={newBidderData.companyName}
                      onChange={(e) => setNewBidderData({ ...newBidderData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={newBidderData.phone}
                      onChange={(e) => setNewBidderData({ ...newBidderData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <p className="text-xs text-blue-600">
                    ℹ This bidder will be added to the system
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bid Amount *
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Enter bid amount"
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Base Price: {formatCurrency(group.basePrice)}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
                >
                  Submit Bid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false);
                    setSelectedBidder(null);
                    setBidderSearch('');
                    setBidAmount('');
                    setShowBidderDropdown(false);
                    setUseNewBidder(false);
                    setNewBidderData({ name: '', companyName: '', phone: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tenders List Page
function NewTenderPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState('excel'); // 'excel' | 'manual'
  const [formData, setFormData] = useState({
    tenderNumber: '', title: '', location: '',
    exchangeRate: '', date: '', responsibleBody: '',
    tenderType: 'AUCTION', originalTenderId: '', harajRound: '1'
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadTenders(); }, []);

  const loadTenders = async () => {
    try {
      const response = await api.get('/tenders');
      setTenders(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
    setError('');
    setPreviewing(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await api.post('/tenders/preview-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(res.data);
      // Auto-fill form from Excel metadata
      const m = res.data.tenderMeta || {};
      setFormData({
        tenderNumber:    m.tenderNumber    || '',
        title:           m.title           || '',
        location:        m.location        || '',
        responsibleBody: m.responsibleBody || '',
        exchangeRate:    m.exchangeRate    || '',
        date:            m.date ? m.date.slice(0, 10) : ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to read Excel file');
    } finally {
      setPreviewing(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setMode('excel');
    setFormData({ tenderNumber: '', title: '', location: '', exchangeRate: '', date: '', responsibleBody: '', tenderType: 'AUCTION', originalTenderId: '', harajRound: '1' });
    setFile(null);
    setPreview(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'excel' && !file) { setError('Please select an Excel file'); return; }
    if (!formData.tenderNumber) { setError('Tender Number is required'); return; }
    if (!formData.exchangeRate) { setError('Exchange Rate is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (file) fd.append('file', file);
      await api.post('/tenders', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      resetForm();
      loadTenders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tender');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (tenderId) => {
    if (!confirm('Are you sure you want to delete this tender?')) return;
    setTenders(ts => ts.filter(t => t.id !== tenderId));
    api.delete(`/tenders/${tenderId}`).catch(err => { alert(err.response?.data?.error || 'Failed to delete tender'); loadTenders(); });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const Field = ({ label, required, children }) => (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">Tenders</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Tender'}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold gradient-text mb-4">Create New Tender</h3>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100/80 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => { setMode('excel'); setPreview(null); setFile(null); setFormData({ tenderNumber: '', title: '', location: '', exchangeRate: '', date: '', responsibleBody: '', tenderType: formData.tenderType, originalTenderId: formData.originalTenderId, harajRound: formData.harajRound }); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'excel' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📂 Upload Excel
            </button>
            <button
              type="button"
              onClick={() => { setMode('manual'); setPreview(null); setFile(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'manual' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✏️ Manual Entry
            </button>
          </div>

          {/* Tender Type */}
          <div className="flex gap-2 mb-4">
            {['AUCTION', 'HARAJ', 'YASBELA'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, tenderType: type })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  formData.tenderType === type
                    ? type === 'AUCTION' ? 'bg-blue-700 text-white border-blue-700'
                      : type === 'HARAJ' ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {type === 'AUCTION' ? '🏛 ጨረታ (Auction)' : type === 'HARAJ' ? '🔨 ሀራጅ (Haraj)' : '↩ ያስበላ (Yasbela)'}
              </button>
            ))}
          </div>

          {/* Haraj round selector */}
          {formData.tenderType === 'HARAJ' && (
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Haraj Round:</label>
              {['1', '2', '3'].map(r => (
                <button key={r} type="button"
                  onClick={() => setFormData({ ...formData, harajRound: r })}
                  className={`w-10 h-10 rounded-full text-sm font-bold border transition ${
                    formData.harajRound === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'
                  }`}>{r}</button>
              ))}
            </div>
          )}

          {/* Original tender reference for Yasbela */}
          {formData.tenderType === 'YASBELA' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Original Tender ID (optional)</label>
              <input
                type="number"
                value={formData.originalTenderId}
                onChange={(e) => setFormData({ ...formData, originalTenderId: e.target.value })}
                placeholder="e.g. 3"
                className="w-48"
              />
              <p className="text-xs text-gray-500 mt-1">Reference to the original auction tender</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Excel upload section */}
            {mode === 'excel' && (
              <div>
                <Field label="Excel File" required>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    file ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label htmlFor="excel-upload" className="cursor-pointer">
                      {previewing ? (
                        <p className="text-blue-600 font-medium">Reading file...</p>
                      ) : file ? (
                        <div>
                          <p className="text-green-700 font-semibold">✓ {file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 font-medium">Click to select Excel file</p>
                          <p className="text-xs text-gray-400 mt-1">.xlsx or .xls</p>
                        </div>
                      )}
                    </label>
                  </div>
                </Field>

                {/* Excel preview summary */}
                {preview && (
                  <div className="mt-3 p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                    <p className="text-sm font-semibold text-blue-800 mb-2">📊 Excel Preview</p>
                    <div className="flex gap-4 text-sm text-blue-700">
                      <span>Groups: <strong>{preview.groupCount}</strong></span>
                      <span>Items: <strong>{preview.itemCount}</strong></span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {preview.groups.map(g => (
                        <div key={g.code} className="text-xs text-gray-600 flex gap-2">
                          <span className="font-mono bg-white px-1 rounded">{g.code}</span>
                          <span>{g.name}</span>
                          <span className="text-gray-400">({g.itemCount} items)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tender info fields — always shown, auto-filled from Excel in excel mode */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tender Number" required>
                <input
                  type="text"
                  value={formData.tenderNumber}
                  onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                  placeholder="e.g. TND-2024-001"
                  required
                />
              </Field>
              <Field label="Title">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Seized Goods Auction"
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Dire Dawa Customs Gate 1"
                />
              </Field>
              <Field label="Responsible Body">
                <input
                  type="text"
                  value={formData.responsibleBody}
                  onChange={(e) => setFormData({ ...formData, responsibleBody: e.target.value })}
                  placeholder="e.g. Dire Dawa Customs Commission"
                />
              </Field>
              <Field label="Exchange Rate" required>
                <input
                  type="number"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  placeholder="e.g. 57.5"
                  step="0.01"
                  min="0"
                  required
                />
              </Field>
            </div>

            {mode === 'excel' && preview && (
              <p className="text-xs text-blue-600">ℹ Fields auto-filled from Excel. You can edit them before submitting.</p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Tender'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tenders Table */}
      <div className="glass rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-800 to-blue-600">
          <h3 className="text-sm font-bold text-white">All Tenders</h3>
        </div>
        <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Tender Number</th>
              <th>Type</th>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Exchange Rate</th>
              <th>Groups</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender) => (
              <tr key={tender.id}>
                <td className="font-medium">{tender.tenderNumber}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    tender.tenderType === 'HARAJ' ? 'bg-orange-100 text-orange-800' :
                    tender.tenderType === 'YASBELA' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>{tender.tenderType || 'AUCTION'}{tender.tenderType === 'HARAJ' && tender.harajRound > 1 ? ` #${tender.harajRound}` : ''}</span>
                </td>
                <td>{tender.title || '-'}</td>
                <td>{tender.date ? new Date(tender.date).toLocaleDateString() : '-'}</td>
                <td>{tender.location || '-'}</td>
                <td>{tender.exchangeRate}</td>
                <td>{tender.groups?.length || 0}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    tender.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    tender.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>{tender.status}</span>
                </td>
                <td className="space-x-2">
                  <a href={`/tenders/${tender.id}`} className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                    <Eye className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(tender.id)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {tenders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No tenders found</div>
        )}
      </div>
    </div>
  );
}

// Bidders Page (Admin)
function BiddersPage() {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    tin: ''
  });

  useEffect(() => {
    loadBidders();
  }, []);

  const loadBidders = async () => {
    try {
      const response = await api.get('/bidders');
      setBidders(response.data);
    } catch (error) {
      console.error('Failed to load bidders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    setShowModal(false);
    setFormData({ name:'',companyName:'',phone:'',email:'',address:'',tin:'' });
    api.post('/bidders', data).then(() => loadBidders()).catch(e => alert(e.response?.data?.error || 'Failed to create bidder'));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bidders</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Add Bidder
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Email</th>
              <th>TIN</th>
            </tr>
          </thead>
          <tbody>
            {bidders.map((bidder) => (
              <tr key={bidder.id}>
                <td className="font-medium">{bidder.name}</td>
                <td>{bidder.companyName}</td>
                <td>{bidder.phone}</td>
                <td>{bidder.email || '-'}</td>
                <td>{bidder.tin || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {bidders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No bidders found
          </div>
        )}
      </div>

      {/* Add Bidder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Bidder</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Company *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">TIN</label>
                <input
                  type="text"
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Audit Page (Admin)
function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  useEffect(() => {
    loadLogs();
  }, [pagination.page]);

  const loadLogs = async () => {
    try {
      const response = await api.get(`/audit?page=${pagination.page}&limit=20`);
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="text-sm">{formatDate(log.timestamp)}</td>
                <td className="text-sm">{log.user?.name}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${log.action === 'LOGIN' ? 'bg-blue-100' : log.action === 'BID' ? 'bg-green-100' : log.action === 'SELECT_WINNER' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="text-sm">{log.entity}</td>
                <td className="text-sm text-gray-500 max-w-xs truncate">
                  {log.details ? JSON.parse(log.details).body?.tenderNumber || log.details.slice(0, 50) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={pagination.page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={pagination.page >= pagination.pages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Users Page (Admin)
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'STAFF' });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setUsers(us => us.filter(u => u.id !== userId));
    api.delete(`/users/${userId}`).catch(e => { alert(e.response?.data?.error || 'Failed to delete user'); loadUsers(); });
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
    api.patch(`/users/${userId}`, { role: newRole }).catch(e => { alert(e.response?.data?.error || 'Failed to update role'); loadUsers(); });
  };

  const handleToggleActive = (userId) => {
    setUsers(us => us.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    api.patch(`/users/${userId}/toggle-active`).catch(e => { alert(e.response?.data?.error || 'Failed to toggle user status'); loadUsers(); });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={!user.isActive}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`text-sm inline-flex items-center ${
                      user.isActive 
                        ? 'text-orange-600 hover:text-orange-800' 
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm inline-flex items-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  minLength={6}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<EnhancedModernLanding />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders"
            element={
              <ProtectedRoute roles={['ADMIN', 'STAFF']}>
                <DashboardLayout>
                  <NewTenderPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TenderDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute roles={['ADMIN', 'STAFF']}>
                <DashboardLayout>
                  <GroupDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidders"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardLayout>
                  <BiddersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardLayout>
                  <AuditPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
