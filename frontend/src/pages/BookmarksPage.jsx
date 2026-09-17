import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowLeft } from 'lucide-react';
import { poemsApi } from '../services/api';
import PoemCard from '../components/PoemCard';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';

const BookmarksPage = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarked = async () => {
      try {
        const bookmarkIds = JSON.parse(localStorage.getItem('rhymemosaic_bookmarks') || '[]');
        if (bookmarkIds.length === 0) {
          setPoems([]);
          setLoading(false);
          return;
        }
        const allPoems = await poemsApi.getAll('newest');
        setPoems(allPoems.filter(p => bookmarkIds.includes(p.id)));
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchBookmarked();
  }, []);

  const handleClearAll = () => {
    localStorage.setItem('rhymemosaic_bookmarks', '[]');
    setPoems([]);
  };

  const handleRate = async (poemId, rating) => {
    try {
      const result = await poemsApi.ratePoem(poemId, rating);
      setPoems(prev => prev.map(poem =>
        poem.id === poemId
          ? { ...poem, rating: result.newRating, ratingCount: result.ratingCount }
          : poem
      ));
    } catch (err) {

    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="Your Bookmarks"
        description="Your bookmarked poems from RhymeMosaic."
      />
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#1e73be] hover:underline mb-6 text-sm"
            data-testid="bookmarks-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all poems
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif text-gray-800 flex items-center gap-3" data-testid="bookmarks-heading">
              <Bookmark className="w-7 h-7 text-[#1e73be] fill-current" />
              Your Bookmarks
            </h1>
            {poems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                data-testid="bookmarks-clear-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading bookmarks...</p>
            </div>
          ) : poems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No bookmarks yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Click the bookmark icon on any poem to save it here.
              </p>
              <Link
                to="/"
                className="text-[#1e73be] hover:underline text-sm"
              >
                Browse poems
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-4">{poems.length} bookmarked poem{poems.length !== 1 ? 's' : ''}</p>
              {poems.map((poem) => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  onRate={handleRate}
                />
              ))}
            </div>
          )}
        </main>
        <Sidebar />
      </div>
    </div>
  );
};

export default BookmarksPage;
