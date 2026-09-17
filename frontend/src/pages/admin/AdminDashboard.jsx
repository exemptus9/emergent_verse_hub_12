import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Star, TrendingUp, Plus, RefreshCw, Download, Upload } from 'lucide-react';
import { adminApi, poemsApi } from '../../services/api';
import { Button } from '../../components/ui/button';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleExportPoems = async () => {
    try {
      const poems = await poemsApi.getAll('newest');
      const dataStr = JSON.stringify(poems, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rhymemosaic-poems-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {

    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPoems}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link
            to="/admin/poems/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5fa0] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Poem
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Poems</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.poemsCount || 0}</p>
            </div>
          </div>
          <Link to="/admin/poems" className="mt-4 text-xs text-[#1e73be] hover:underline block">
            View all poems →
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Comments</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.commentsCount || 0}</p>
            </div>
          </div>
          <Link to="/admin/comments" className="mt-4 text-xs text-[#1e73be] hover:underline block">
            Manage comments →
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Ratings</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalRatings || 0}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Unique voter sessions
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.averageRating || 0}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Across all poems
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/poems/new"
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-[#1e73be]/10 rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4 text-[#1e73be]" />
              Add New Poem
            </Link>
            <Link
              to="/admin/poems"
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-[#1e73be]/10 rounded-lg transition-colors text-sm"
            >
              <FileText className="w-4 h-4 text-[#1e73be]" />
              Manage Poems
            </Link>
            <Link
              to="/admin/comments"
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-[#1e73be]/10 rounded-lg transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#1e73be]" />
              View Comments
            </Link>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-[#1e73be]/10 rounded-lg transition-colors text-sm"
            >
              <TrendingUp className="w-4 h-4 text-[#1e73be]" />
              View Site
            </Link>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Search poems</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">⌘</kbd>
                <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">K</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Go to home</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">H</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Go to admin</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">A</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Close search / Clear</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Esc</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Comments</h3>
          <Link to="/admin/comments" className="text-sm text-[#1e73be] hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {stats?.recentComments?.length > 0 ? (
            stats.recentComments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{comment.author}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No comments yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
