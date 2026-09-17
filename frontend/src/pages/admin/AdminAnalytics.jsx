import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Eye, Star, MessageSquare, Users, TrendingUp, 
  FileText, Tag, Folder, RefreshCw, Activity
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-28"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  const { summary, mostViewed, topRated, categoryStats, tagStats, recentRatings } = analytics || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics Dashboard
        </h2>
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard icon={FileText} label="Poems" value={summary?.totalPoems} color="blue" />
        <StatCard icon={Eye} label="Total Views" value={summary?.totalViews} color="purple" />
        <StatCard icon={Star} label="Ratings" value={summary?.totalRatings} color="amber" />
        <StatCard icon={MessageSquare} label="Comments" value={summary?.totalComments} color="green" />
        <StatCard icon={Users} label="Subscribers" value={summary?.totalSubscribers} color="pink" />
        <StatCard icon={TrendingUp} label="New (30d)" value={summary?.newSubscribers30d} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Most Viewed Poems */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">Most Viewed Poems</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mostViewed?.length > 0 ? (
              mostViewed.map((poem, index) => (
                <div key={poem.id} className="p-3 hover:bg-gray-50 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/poem/${poem.slug}`} className="text-sm text-[#1e73be] hover:underline truncate block">
                      {poem.title}
                    </Link>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{poem.views?.toLocaleString()} views</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No view data yet</div>
            )}
          </div>
        </div>

        {/* Top Rated Poems */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-800">Top Rated Poems</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topRated?.length > 0 ? (
              topRated.map((poem, index) => (
                <div key={poem.id} className="p-3 hover:bg-gray-50 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/poem/${poem.slug}`} className="text-sm text-[#1e73be] hover:underline truncate block">
                      {poem.title}
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-amber-600">★ {poem.rating?.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 ml-1">({poem.ratingCount})</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No ratings yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Category Performance</h3>
          </div>
          <div className="p-4">
            {categoryStats?.length > 0 ? (
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/category/${encodeURIComponent(cat._id)}`} className="text-sm text-[#1e73be] hover:underline">
                          {cat._id}
                        </Link>
                        <span className="text-xs text-gray-500">{cat.poemCount} poems</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (cat.poemCount / (categoryStats[0]?.poemCount || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">{cat.totalViews || 0} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No category data</div>
            )}
          </div>
        </div>

        {/* Tag Cloud */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-800">Popular Tags</h3>
          </div>
          <div className="p-4">
            {tagStats?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tagStats.map((tag) => {
                  const maxCount = tagStats[0]?.poemCount || 1;
                  const intensity = Math.max(0.3, tag.poemCount / maxCount);
                  return (
                    <Link 
                      key={tag._id}
                      to={`/tag/${encodeURIComponent(tag._id)}`}
                      className="px-3 py-1 rounded-full text-white transition-transform hover:scale-105"
                      style={{ 
                        backgroundColor: `rgba(30, 115, 190, ${intensity})`,
                        fontSize: `${0.75 + intensity * 0.25}rem`
                      }}
                      title={`${tag.poemCount} poems, ${tag.totalViews || 0} views`}
                    >
                      {tag._id}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500">No tag data</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-gray-800">Recent Ratings Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentRatings?.length > 0 ? (
            recentRatings.map((rating, index) => (
              <div key={index} className="p-3 hover:bg-gray-50 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rating.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/poem/${rating.poemSlug}`} className="text-sm text-[#1e73be] hover:underline truncate block">
                    {rating.poemTitle || 'Unknown Poem'}
                  </Link>
                </div>
                <span className="text-xs text-gray-400">
                  {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    pink: 'bg-pink-100 text-pink-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value?.toLocaleString() || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
