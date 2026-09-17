import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { taxonomyApi, poemsApi, newsletterApi } from '../services/api';
import { ChevronDown, ChevronUp, Bookmark, TrendingUp, Eye, Mail, Check, Loader2, BookOpen } from 'lucide-react';
import RandomPoemButton from './RandomPoemButton';
import PoemOfTheDay from './PoemOfTheDay';

const Sidebar = () => {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [bookmarkedPoems, setBookmarkedPoems] = useState([]);
  const [totalPoems, setTotalPoems] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData, poemsData, mostViewedData] = await Promise.all([
          taxonomyApi.getCategories(),
          taxonomyApi.getTags(),
          poemsApi.getAll('rating-high'),
          poemsApi.getMostViewed(5)
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
        setTopRated(poemsData.slice(0, 5));
        setMostViewed(mostViewedData);
        setTotalPoems(poemsData.length);
        
        const bookmarkIds = JSON.parse(localStorage.getItem('rhymemosaic_bookmarks') || '[]');
        const bookmarked = poemsData.filter(p => bookmarkIds.includes(p.id));
        setBookmarkedPoems(bookmarked);
        
        const readPoems = JSON.parse(localStorage.getItem('rhymemosaic_read') || '[]');
        setReadCount(readPoems.length);
      } catch {
        // sidebar data fetch failed — sections stay empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.pathname]);

  const displayedCategories = useMemo(
    () => showAllCategories ? categories : categories.slice(0, 10),
    [showAllCategories, categories]
  );
  const displayedTags = useMemo(
    () => showAllTags ? tags : tags.slice(0, 15),
    [showAllTags, tags]
  );
  const filteredMostViewed = useMemo(
    () => mostViewed.filter(p => p.views > 0).slice(0, 5),
    [mostViewed]
  );

  return (
    <aside className="w-full lg:w-64 space-y-6 stagger-children">
      {/* Poem of the Day */}
      <PoemOfTheDay />

      {/* Random Poem - Surprise Me! */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 card-hover">
        <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200">
          Discover Poetry
        </h3>
        <p className="text-sm text-gray-600 mb-3 font-sans">
          Let fate guide you to your next favorite poem.
        </p>
        <RandomPoemButton />
      </div>

      {/* Top Rated */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 card-hover">
        <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1e73be]" />
          Top Rated
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full skeleton-shimmer"></div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {topRated.map((poem, index) => (
              <li key={poem.id}>
                <Link
                  to={`/poem/${poem.slug}`}
                  className="flex items-start gap-2 text-sm group"
                >
                  <span className="text-xs font-bold text-gray-400 mt-0.5">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e73be] group-hover:underline line-clamp-1">
                      {poem.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      ★ {poem.rating?.toFixed(1)} ({poem.ratingCount})
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Most Viewed */}
      {filteredMostViewed.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            Most Viewed
          </h3>
          <ul className="space-y-2">
            {filteredMostViewed.map((poem, index) => (
              <li key={poem.id}>
                <Link
                  to={`/poem/${poem.slug}`}
                  className="flex items-start gap-2 text-sm group"
                >
                  <span className="text-xs font-bold text-gray-400 mt-0.5">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e73be] group-hover:underline line-clamp-1">
                      {poem.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {poem.views} views
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarkedPoems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#1e73be]" />
            Your Bookmarks
          </h3>
          <ul className="space-y-2">
            {bookmarkedPoems.slice(0, 5).map((poem) => (
              <li key={poem.id}>
                <Link
                  to={`/poem/${poem.slug}`}
                  className="text-sm text-[#1e73be] hover:underline line-clamp-1"
                >
                  {poem.title}
                </Link>
              </li>
            ))}
            {bookmarkedPoems.length > 5 && (
              <li className="text-xs text-gray-400">
                +{bookmarkedPoems.length - 5} more
              </li>
            )}
          </ul>
          <Link
            to="/bookmarks"
            className="block mt-3 text-sm text-[#1e73be] hover:underline"
            data-testid="sidebar-view-all-bookmarks"
          >
            View all bookmarks →
          </Link>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200">
          Categories
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        ) : (
          <>
            <ul className="space-y-1.5">
              {displayedCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={`/category/${encodeURIComponent(category.name)}`}
                    className="text-sm text-[#1e73be] hover:underline font-sans flex justify-between items-center"
                  >
                    <span className="truncate">{category.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({category.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
            {categories.length > 10 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e73be] transition-colors"
              >
                {showAllCategories ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Show all ({categories.length}) <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Tags Cloud */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-serif text-gray-800 mb-3 pb-2 border-b border-gray-200">
          Tags
        </h3>
        {loading ? (
          <div className="animate-pulse flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/tag/${encodeURIComponent(tag.name)}`}
                  className="text-xs bg-gray-100 hover:bg-[#1e73be] hover:text-white text-gray-700 px-2 py-1 rounded transition-colors"
                  title={`${tag.count} poems`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            {tags.length > 15 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e73be] transition-colors"
              >
                {showAllTags ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Show all ({tags.length}) <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Book Promo */}
      <div className="bg-gradient-to-br from-[#1e73be]/5 to-[#1e73be]/10 border border-[#1e73be]/20 rounded-lg p-4">
        <h3 className="text-lg font-serif text-gray-800 mb-2">
          Book Available!
        </h3>
        <p className="text-sm text-gray-600 mb-3 font-sans">
          Get the complete collection of RhymeMosaic in a single printed volume.
        </p>
        <a
          href="https://a.co/d/aKlvWgS"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-[#1e73be] hover:underline font-medium"
        >
          Purchase on Amazon →
        </a>
      </div>

      {/* Reading Journey */}
      {totalPoems > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1e73be]" />
            Your Reading Journey
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-[#1e73be]">
                  {readCount} / {totalPoems} poems
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#1e73be] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (readCount / totalPoems) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {readCount === 0 
                  ? "Start your journey - click on a poem to read it!"
                  : readCount === totalPoems 
                    ? "🎉 You've read all poems! Amazing!"
                    : `${totalPoems - readCount} poems left to explore`
                }
              </p>
            </div>
            {readCount > 0 && readCount < totalPoems && (
              <Link 
                to="/?sort=newest"
                className="block text-center text-sm text-[#1e73be] hover:underline"
              >
                Discover more poems →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Subscribe */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-serif text-gray-800 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#1e73be]" />
          Subscribe
        </h3>
        <p className="text-sm text-gray-600 mb-3 font-sans">
          Get notified when new poems are published.
        </p>
        
        {subscribed ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Check className="w-4 h-4" />
            <span>{subscribeMessage || "You're subscribed!"}</span>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim() || subscribing) return;
            
            setSubscribing(true);
            setSubscribeMessage(null);
            
            try {
              const result = await newsletterApi.subscribe(email);
              setSubscribed(true);
              setSubscribeMessage(result.message);
              setEmail('');
              localStorage.setItem('rhymemosaic_subscribed', 'true');
            } catch (err) {
              setSubscribeMessage(err.response?.data?.detail || 'Failed to subscribe');
            } finally {
              setSubscribing(false);
            }
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
              data-testid="newsletter-email"
              required
            />
            <button 
              type="submit"
              disabled={subscribing}
              className="w-full mt-2 px-4 py-2 bg-[#1e73be] text-white text-sm rounded hover:bg-[#1a5fa0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="newsletter-submit"
            >
              {subscribing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </button>
            {subscribeMessage && !subscribed && (
              <p className="mt-2 text-xs text-red-500">{subscribeMessage}</p>
            )}
          </form>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
