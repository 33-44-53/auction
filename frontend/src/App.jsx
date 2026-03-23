import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, Upload, BarChart3, Users, Calculator, FolderOpen, Printer, CheckCircle, ArrowRight, Zap, Shield, TrendingUp, Mail, Phone, MapPin, Github, Twitter, Linkedin, LayoutDashboard, FileText, UserCircle, ClipboardList, Settings } from 'lucide-react';
import ModernLanding from './components/ModernLanding';

// Context for auth
const AuthContext = createContext(null);

// API client
const api = axios.create({
  baseURL: '/api',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="glass p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Tender Management System</p>
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
              placeholder="admin@tender.com"
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
              placeholder="••••••••"
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Default credentials:</p>
          <p className="font-mono bg-gray-100/80 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
            admin@tender.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Layout
function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <header className="glass-dark text-white shadow-2xl relative z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Tender Management</h1>
              <span className="text-xs text-blue-200">Auction System</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
        <aside className="w-56 glass shadow-xl p-3">
          <nav>
            <ul className="space-y-1">
              <li>
                <a href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all text-sm font-medium text-gray-700">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="/tenders" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all text-sm font-medium text-gray-700">
                  <FileText className="w-5 h-5" />
                  <span>Tenders</span>
                </a>
              </li>
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/bidders" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all text-sm font-medium text-gray-700">
                    <Users className="w-5 h-5" />
                    <span>Bidders</span>
                  </a>
                </li>
              )}
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/audit" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all text-sm font-medium text-gray-700">
                    <ClipboardList className="w-5 h-5" />
                    <span>Audit Logs</span>
                  </a>
                </li>
              )}
              {user?.role === 'ADMIN' && (
                <li>
                  <a href="/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all text-sm font-medium text-gray-700">
                    <UserCircle className="w-5 h-5" />
                    <span>Users</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4">
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
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const [groupFormData, setGroupFormData] = useState({ code: '', name: '' });

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', {
        tenderId: parseInt(tenderId),
        code: groupFormData.code,
        name: groupFormData.name
      });
      setShowGroupModal(false);
      setGroupFormData({ code: '', name: '' });
      loadTender();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create group');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!tender) {
    return <div className="text-center py-8 text-red-500">Tender not found</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tender.tenderNumber}</h2>
            <p className="text-gray-600">{tender.title || 'No title'}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded text-sm ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' : tender.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {tender.status}
            </span>
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
        {tender.vehiclePlate && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Vehicle Plate:</span> {tender.vehiclePlate}
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
                <span className={`px-2 py-1 rounded text-xs ${group.status === 'OPEN' ? 'bg-green-100 text-green-800' : group.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {group.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{group.name}</p>
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
          <table>
            <thead>
              <tr>
                <th>Code</th>
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
      )}
    </div>
  );
}

// Group Detail Page
function GroupDetailPage() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAddBidderModal, setShowAddBidderModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [availableBidders, setAvailableBidders] = useState([]);
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
  }, [groupId]);

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

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${groupId}/bids`, {
        bidderId: selectedBidder,
        bidPrice: parseFloat(bidAmount)
      });
      setShowBidModal(false);
      setSelectedBidder('');
      setBidAmount('');
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit bid');
    }
  };

  const handleNextRound = async () => {
    try {
      await api.post(`/groups/${groupId}/next-round`);
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to advance round');
    }
  };

  const handleSelectWinner = async (bidderId) => {
    try {
      await api.post(`/groups/${groupId}/select-winner`, { bidderId });
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to select winner');
    }
  };

  const handleAddBidder = async (bidderId) => {
    try {
      await api.post(`/groups/${groupId}/bidders`, { bidderId });
      setShowAddBidderModal(false);
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add bidder');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${groupId}/items`, itemFormData);
      setShowAddItemModal(false);
      setItemFormData({
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
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add item');
    }
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

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/groups/${groupId}/items/${editingItem.id}`, itemFormData);
      setShowEditItemModal(false);
      setEditingItem(null);
      setItemFormData({
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
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update item');
    }
  };

  const loadAvailableBidders = async () => {
    try {
      const response = await api.get('/bidders');
      const assignedIds = group.bidders?.map(bg => bg.bidder.id) || [];
      setAvailableBidders(response.data.filter(b => !assignedIds.includes(b.id)));
    } catch (error) {
      console.error('Failed to load bidders:', error);
    }
  };

  useEffect(() => {
    if (showAddBidderModal && group) {
      loadAvailableBidders();
    }
  }, [showAddBidderModal, group]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center py-8 text-red-500">Group not found</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{group.code}</h2>
            <p className="text-gray-600">{group.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <span className="block text-sm text-gray-500">Round</span>
              <span className={`round-indicator ${group.currentRound === 'CIF' ? 'round-cif' : group.currentRound === 'FOB' ? 'round-fob' : 'round-tax'}`}>
                {group.currentRound}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm text-gray-500">Status</span>
              <span className={`status-badge ${group.status === 'OPEN' ? 'status-open' : group.status === 'SOLD' ? 'status-sold' : 'status-split'}`}>
                {group.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
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
            <button
              onClick={() => setShowBidModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Add Bid
            </button>
            {group.currentRound !== 'TAX' && (
              <button
                onClick={handleNextRound}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Next Round
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assigned Bidders */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold">Bidders</h3>
          <button
            onClick={() => setShowAddBidderModal(true)}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            + Add Bidder
          </button>
        </div>
        {group.bidders?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {group.bidders.map((bg) => (
                <tr key={bg.bidder.id}>
                  <td className="font-medium">{bg.bidder.name}</td>
                  <td>{bg.bidder.companyName}</td>
                  <td>{bg.bidder.phone}</td>
                  <td>{bg.bidder.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No bidders assigned
          </div>
        )}
      </div>

      {/* Add Bidder Modal */}
      {showAddBidderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Bidder</h3>
            <div className="max-h-64 overflow-y-auto">
              {availableBidders.map((bidder) => (
                <div
                  key={bidder.id}
                  onClick={() => handleAddBidder(bidder.id)}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-medium">{bidder.name}</p>
                  <p className="text-sm text-gray-500">{bidder.companyName}</p>
                </div>
              ))}
              {availableBidders.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No available bidders
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddBidderModal(false)}
              className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bids Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-bold">Bids</h3>
        </div>
        {group.bids?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Company</th>
                <th>Price</th>
                <th>Round</th>
                <th>Winner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.bids.map((bid) => (
                <tr key={bid.id} className={bid.isWinner ? 'winner-row' : ''}>
                  <td className="font-medium">{bid.bidder.name}</td>
                  <td>{bid.bidder.companyName}</td>
                  <td className="font-bold">{formatCurrency(bid.bidPrice)}</td>
                  <td>{bid.round}</td>
                  <td>{bid.isWinner ? '✓' : '-'}</td>
                  <td>
                    {group.status === 'OPEN' && !bid.isWinner && (
                      <button
                        onClick={() => handleSelectWinner(bid.bidderId)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Select Winner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No bids yet
          </div>
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
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Serial</th>
              <th>Name</th>
              <th>Type</th>
              <th>Brand</th>
              <th>Country</th>
              <th>Unit</th>
              <th>W1</th>
              <th>W2</th>
              <th>W3</th>
              <th>Total</th>
              <th>CIF</th>
              <th>FOB</th>
              <th>Tax</th>
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
                <td>{formatCurrency(item.cif)}</td>
                <td>{formatCurrency(item.fob)}</td>
                <td>{formatCurrency(item.tax)}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td className="font-medium">{formatCurrency(item.totalPrice)}</td>
                <td>
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold gradient-text mb-4">Edit Item</h3>
            <form onSubmit={handleUpdateItem}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Code *</label>
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
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Item Code *</label>
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

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Submit Bid</h3>
            <form onSubmit={handleSubmitBid}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bidder
                </label>
                <select
                  value={selectedBidder}
                  onChange={(e) => setSelectedBidder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">-- Select --</option>
                  {group.bidders?.map((bg) => (
                    <option key={bg.bidder.id} value={bg.bidder.id}>
                      {bg.bidder.name} - {bg.bidder.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bid Price (Min {formatCurrency(group.basePrice)})
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  min={group.basePrice}
                  step="0.01"
                  required
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
                  onClick={() => setShowBidModal(false)}
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
  const [formData, setFormData] = useState({
    tenderNumber: '',
    title: '',
    location: '',
    exchangeRate: 1,
    date: '',
    responsibleBody: '',
    vehiclePlate: ''
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      const response = await api.get('/tenders');
      setTenders(response.data);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (file) {
      data.append('file', file);
    }

    try {
      const response = await api.post('/tenders', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setShowForm(false);
      setFormData({
        tenderNumber: '',
        title: '',
        location: '',
        exchangeRate: 1,
        date: '',
        responsibleBody: '',
        vehiclePlate: ''
      });
      setFile(null);
      loadTenders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tender');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tenderId) => {
    if (!confirm('Are you sure you want to delete this tender?')) return;
    try {
      await api.delete(`/tenders/${tenderId}`);
      loadTenders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete tender');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tenders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : '+ Add New Tender'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Tender</h3>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Tender Number *</label>
                <input
                  type="text"
                  value={formData.tenderNumber}
                  onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Responsible Body</label>
                <input
                  type="text"
                  value={formData.responsibleBody}
                  onChange={(e) => setFormData({ ...formData, responsibleBody: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Vehicle Plate</label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Exchange Rate *</label>
              <input
                type="number"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Excel File (Optional)</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Upload an Excel file to import groups and items automatically</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Tender'}
            </button>
          </form>
        </div>
      )}

      {/* Tenders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Tender Number</th>
              <th>Title</th>
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
                <td>{tender.title || '-'}</td>
                <td>{tender.location || '-'}</td>
                <td>{tender.exchangeRate}</td>
                <td>{tender.groups?.length || 0}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' : tender.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {tender.status}
                  </span>
                </td>
                <td className="space-x-2">
                  <a
                    href={`/tenders/${tender.id}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(tender.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tenders found
          </div>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bidders', formData);
      setShowModal(false);
      setFormData({
        name: '',
        companyName: '',
        phone: '',
        email: '',
        address: '',
        tin: ''
      });
      loadBidders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create bidder');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
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
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
                <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ModernLanding />} />
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
    </BrowserRouter>
  );
}

export default App;
