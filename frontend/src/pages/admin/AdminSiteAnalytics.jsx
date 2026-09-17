import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Eye, Users, Clock, TrendingUp, Monitor,
  RefreshCw, ArrowUp, ArrowDown, Activity, Link2, Calendar, MapPin
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import WorldMap from '../../components/WorldMap';

const AdminSiteAnalytics = () => {
  const [data, setData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      const [result, geo] = await Promise.all([
        adminApi.getSiteAnalytics(range),
        adminApi.getGeoAnalytics(),
      ]);
      setData(result);
      setGeoData(geo);
    } catch {
      // analytics fetch failed — dashboard stays empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6" data-testid="site-analytics-loading">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-lg h-28"></div>)}
        </div>
        <div className="bg-white rounded-lg h-72"></div>
      </div>
    );
  }

  const { overview, live, dailyTrend, topPages, peakHours, dayOfWeek, visitorTypes, topReferrers, sessions } = data || {};

  return (
    <div data-testid="site-analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Site Traffic
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={e => setRange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20"
            data-testid="analytics-range-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} data-testid="analytics-refresh-btn">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Live Pulse */}
      {live && (live.viewsLastHour > 0 || live.visitorsLastHour > 0) && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3" data-testid="live-pulse">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm text-emerald-800">
            <strong>{live.viewsLastHour}</strong> page view{live.viewsLastHour !== 1 ? 's' : ''} from{' '}
            <strong>{live.visitorsLastHour}</strong> visitor{live.visitorsLastHour !== 1 ? 's' : ''} in the last hour
          </span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Eye} label="Total Page Views" value={overview?.totalViews} sub={`${overview?.todayViews || 0} today`} color="blue" />
        <MetricCard icon={Users} label="Unique Visitors" value={overview?.totalUnique} sub={`${overview?.todayUnique || 0} today`} color="violet" />
        <MetricCard icon={Activity} label="This Week" value={overview?.weekViews} sub={`${overview?.weekUnique || 0} unique`} color="emerald" />
        <MetricCard icon={Monitor} label="Avg Pages / Visit" value={sessions?.avgPagesPerSession || 0} sub={`${sessions?.totalSessions || 0} sessions`} color="amber" />
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-testid="daily-trend-chart">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Daily Traffic</h3>
        </div>
        <div className="p-4">
          {dailyTrend && dailyTrend.length > 0 ? (
            <BarChart data={dailyTrend} />
          ) : (
            <div className="text-center text-gray-400 py-12">No traffic data yet. Views will appear as visitors browse the site.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="top-pages-table">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">Top Pages</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {topPages?.length > 0 ? topPages.map((page, i) => (
              <div key={page.path} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate" title={page.path}>{formatPageName(page.path)}</p>
                  <p className="text-xs text-gray-400">{page.path}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700">{page.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{page.visitors} unique</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400">No page data yet</div>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="peak-hours-chart">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-800">Peak Hours (UTC)</h3>
          </div>
          <div className="p-4">
            {peakHours && peakHours.length > 0 ? (
              <HourHeatmap data={peakHours} />
            ) : (
              <div className="text-center text-gray-400 py-8">No hourly data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* New vs Returning */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="visitor-types">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Visitor Types</h3>
          </div>
          <div className="p-6">
            {visitorTypes && (visitorTypes.new + visitorTypes.returning > 0) ? (
              <VisitorDonut newCount={visitorTypes.new} returningCount={visitorTypes.returning} />
            ) : (
              <div className="text-center text-gray-400 py-4">No visitor data</div>
            )}
          </div>
        </div>

        {/* Day of Week */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="day-of-week-chart">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-800">Day of Week</h3>
          </div>
          <div className="p-4">
            {dayOfWeek ? (
              <DayOfWeekBars data={dayOfWeek} />
            ) : (
              <div className="text-center text-gray-400 py-4">No data</div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="top-referrers">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-gray-800">Top Referrers</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {topReferrers?.length > 0 ? topReferrers.map((ref, i) => (
              <div key={i} className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate flex-1" title={ref.referrer}>
                  {formatReferrer(ref.referrer)}
                </span>
                <span className="text-sm font-medium text-gray-500 ml-2">{ref.count}</span>
              </div>
            )) : (
              <div className="p-6 text-center text-gray-400 text-sm">No referrer data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Visitor Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-testid="geo-map-section">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-800">Visitor Geography</h3>
          </div>
          {geoData && (
            <span className="text-xs text-gray-400">
              {geoData.resolved} of {geoData.totalIPs} IPs resolved
            </span>
          )}
        </div>
        <div className="p-4">
          {geoData && geoData.countries.length > 0 ? (
            <WorldMap countries={geoData.countries} markers={geoData.markers} />
          ) : (
            <div className="text-center text-gray-400 py-12">
              Geographic data will appear as visitors browse the site. IP geolocation runs automatically in the background.
            </div>
          )}
        </div>
      </div>

      {geoData && geoData.countries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Countries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="top-countries">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Top Countries</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {geoData.countries.map((c, i) => {
                const maxViews = geoData.countries[0]?.views || 1;
                return (
                  <div key={c.countryCode} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{c.country}</span>
                        <span className="text-xs text-gray-400">{c.countryCode}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.views / maxViews) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-medium text-gray-700">{c.views}</p>
                      <p className="text-xs text-gray-400">{c.visitors} unique</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="top-cities">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-800">Top Cities</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {geoData.cities.length > 0 ? geoData.cities.map((c, i) => (
                <div key={`${c.city}-${c.countryCode}`} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{c.city}</p>
                    <p className="text-xs text-gray-400">{c.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-700">{c.views}</p>
                    <p className="text-xs text-gray-400">{c.visitors} unique</p>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-400 text-sm">No city data yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============ Sub-components ============ */

const MetricCard = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`metric-${color}`}>
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-4 h-4" /></div>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const BarChart = ({ data }) => {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  return (
    <div className="space-y-1">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm inline-block"></span> Views</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-400 rounded-sm inline-block"></span> Visitors</span>
      </div>
      <div className="flex items-end gap-[2px] h-40">
        {data.map(d => {
          const viewH = (d.views / maxViews) * 100;
          const visitorH = (d.visitors / maxViews) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-[1px] group relative" title={`${d.date}\n${d.views} views, ${d.visitors} visitors`}>
              <div className="w-full flex flex-col justify-end h-full gap-[1px]">
                <div className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600" style={{ height: `${Math.max(viewH, 2)}%` }}></div>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {d.date}: {d.views} views, {d.visitors} unique
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-400 pt-1">
        <span>{data[0]?.date?.slice(5)}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.date?.slice(5)}</span>}
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
};

const HourHeatmap = ({ data }) => {
  const hourMap = {};
  data.forEach(h => { hourMap[h.hour] = h.views; });
  const maxVal = Math.max(...data.map(h => h.views), 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div className="grid grid-cols-12 gap-1">
        {hours.map(h => {
          const val = hourMap[h] || 0;
          const intensity = val / maxVal;
          return (
            <div
              key={h}
              className="aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium cursor-default transition-transform hover:scale-110"
              style={{
                backgroundColor: val > 0 ? `rgba(30, 115, 190, ${0.15 + intensity * 0.85})` : '#f3f4f6',
                color: intensity > 0.5 ? 'white' : '#6b7280'
              }}
              title={`${h}:00 UTC — ${val} views`}
            >
              {h}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};

const VisitorDonut = ({ newCount, returningCount }) => {
  const total = newCount + returningCount;
  const newPct = Math.round((newCount / total) * 100);
  const retPct = 100 - newPct;
  const circumference = 2 * Math.PI * 40;
  const newDash = (newPct / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12"
            strokeDasharray={`${newDash} ${circumference}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
          {total}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="text-sm text-gray-700">New — {newCount} ({newPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
          <span className="text-sm text-gray-700">Returning — {returningCount} ({retPct}%)</span>
        </div>
      </div>
    </div>
  );
};

const DayOfWeekBars = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.views), 1);
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.day} className="flex items-center gap-2">
          <span className="w-8 text-xs text-gray-500 font-medium">{d.day}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.max((d.views / maxVal) * 100, d.views > 0 ? 4 : 0)}%` }}
            ></div>
          </div>
          <span className="w-10 text-xs text-gray-500 text-right">{d.views}</span>
        </div>
      ))}
    </div>
  );
};

/* ============ Helpers ============ */

function formatPageName(path) {
  if (path === '/') return 'Home';
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'poem' && parts[1]) return `Poem: ${parts[1].replace(/-/g, ' ')}`;
  if (parts[0] === 'category' && parts[1]) return `Category: ${decodeURIComponent(parts[1])}`;
  if (parts[0] === 'tag' && parts[1]) return `Tag: ${decodeURIComponent(parts[1])}`;
  const nameMap = { about: 'About', contact: 'Contact', categories: 'Categories', tags: 'Tags', bookmarks: 'Bookmarks' };
  if (parts.length === 1 && nameMap[parts[0]]) return nameMap[parts[0]];
  return path.replace(/\//g, ' / ').trim();
}

function formatReferrer(ref) {
  try {
    const url = new URL(ref);
    return url.hostname.replace('www.', '');
  } catch {
    return ref?.slice(0, 40) || 'Unknown';
  }
}

export default AdminSiteAnalytics;
