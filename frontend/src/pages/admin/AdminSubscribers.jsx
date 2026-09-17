import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Download, RefreshCw, Search } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubscribers = useCallback(async () => {
    try {
      const data = await adminApi.getSubscribers();
      setSubscribers(data.subscribers);
      setFilteredSubscribers(data.subscribers);
    } catch {
      // network error — subscribers list stays empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubscribers(subscribers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSubscribers(
        subscribers.filter(sub => sub.email.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, subscribers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscribers();
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = adminApi.exportSubscribersCSV();
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="bg-white rounded-lg p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Newsletter Subscribers
          </h2>
          <p className="text-gray-500 mt-1">{subscribers.length} total subscribers</p>
        </div>
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
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
          />
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="flex-1 font-medium text-gray-700">Email</div>
          <div className="w-48 font-medium text-gray-700 text-right">Subscribed Date</div>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredSubscribers.length > 0 ? (
            filteredSubscribers.map((subscriber) => (
              <div 
                key={subscriber.id || subscriber.email} 
                className="p-4 hover:bg-gray-50 flex items-center"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-[#1e73be]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#1e73be]" />
                  </div>
                  <span className="text-gray-800">{subscriber.email}</span>
                </div>
                <div className="w-48 text-right text-sm text-gray-500">
                  {subscriber.subscribedAt 
                    ? new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              {searchQuery ? 'No subscribers match your search' : 'No subscribers yet'}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {subscribers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Subscribers</p>
            <p className="text-2xl font-bold text-gray-800">{subscribers.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-bold text-green-600">
              {subscribers.filter(s => {
                const subDate = new Date(s.subscribedAt);
                const now = new Date();
                return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Matching Search</p>
            <p className="text-2xl font-bold text-[#1e73be]">{filteredSubscribers.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribers;
