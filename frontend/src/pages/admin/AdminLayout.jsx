import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Plus, ArrowLeft, Settings, Shield, LogOut, BarChart3, Download, Users, Bell, Mail, KeyRound, Globe } from 'lucide-react';
import AdminLogin from './AdminLogin';
import { adminApi } from '../../services/api';

const AdminLayout = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    const onForceLogout = () => setIsAuthenticated(false);
    window.addEventListener('admin-logout', onForceLogout);
    return () => window.removeEventListener('admin-logout', onForceLogout);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/pending-comments`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setPendingCount(data.comments?.length || 0); })
        .catch(() => {});
      
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/notifications?limit=1`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setNotificationCount(data.unreadCount || 0); })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await adminApi.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }
  
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/site-analytics', icon: Globe, label: 'Site Traffic' },
    { path: '/admin/poems', icon: FileText, label: 'All Poems' },
    { path: '/admin/poems/new', icon: Plus, label: 'New Poem' },
    { path: '/admin/moderation', icon: Shield, label: 'Moderation', badge: pendingCount },
    { path: '/admin/comments', icon: MessageSquare, label: 'All Comments' },
    { path: '/admin/subscribers', icon: Users, label: 'Subscribers' },
    { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/admin/export', icon: Download, label: 'Export' },
    { path: '/admin/settings', icon: KeyRound, label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#1e73be] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6" />
              <h1 className="text-xl font-bold">RhymeMosaic Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                data-testid="admin-logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-[#1e73be]/10 text-[#1e73be] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
