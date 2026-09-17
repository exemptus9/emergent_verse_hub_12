import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { poemsApi } from '../services/api';
import PoemCard from '../components/PoemCard';
import Sidebar from '../components/Sidebar';
import SortControls from '../components/SortControls';
import SearchBar from '../components/SearchBar';
import AmazonBanner from '../components/AmazonBanner';
import Pagination from '../components/Pagination';
import SEO from '../components/SEO';

const POEMS_PER_PAGE = 10;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [poems, setPoems] = useState([]);
  const [filteredPoems, setFilteredPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const topRef = useRef(null);

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await poemsApi.getAll(sortBy);
      setPoems(data);
      setError(null);
    } catch (err) {

      setError('Failed to load poems. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  // Filter poems based on search query
  const prevSearchRef = useRef(searchQuery);
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPoems(poems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = poems.filter(poem => 
        poem.title.toLowerCase().includes(query) ||
        poem.content.toLowerCase().includes(query) ||
        poem.tags.some(tag => tag.toLowerCase().includes(query)) ||
        poem.categories.some(cat => cat.toLowerCase().includes(query))
      );
      setFilteredPoems(filtered);
    }
    // Only reset page when search query actually changes, not on initial poem load
    if (prevSearchRef.current !== searchQuery) {
      setCurrentPage(1);
      prevSearchRef.current = searchQuery;
    }
  }, [poems, searchQuery]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (searchQuery) params.set('q', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [sortBy, searchQuery, currentPage, setSearchParams]);

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

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPoems.length / POEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * POEMS_PER_PAGE;
  const paginatedPoems = filteredPoems.slice(startIndex, startIndex + POEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" ref={topRef}>
      <SEO 
        title={searchQuery ? `Search: ${searchQuery}` : null}
        description="Explore the complete collection of poetry by Brandon WordSmith. Poems about love, loss, faith, hope, and the human experience."
        tags={['poetry', 'poems', 'Brandon WordSmith', 'RhymeMosaic']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <SearchBar 
            value={searchQuery} 
            onChange={handleSearch}
            resultCount={searchQuery ? filteredPoems.length : null}
          />
          
          {/* Amazon Book Banner */}
          <AmazonBanner />
          
          <SortControls sortBy={sortBy} onSortChange={handleSortChange} />

          {/* Top Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={filteredPoems.length}
              itemsPerPage={POEMS_PER_PAGE}
            />
          )}
          
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading poems...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-red-200 p-12 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchPoems}
                className="mt-4 px-4 py-2 bg-[#1e73be] text-white rounded hover:bg-[#1a5fa0] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : paginatedPoems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                {searchQuery ? `No poems found for "${searchQuery}"` : 'No poems found'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-[#1e73be] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {paginatedPoems.map((poem) => (
                <PoemCard 
                  key={poem.id} 
                  poem={poem} 
                  onRate={handleRate}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={filteredPoems.length}
              itemsPerPage={POEMS_PER_PAGE}
            />
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;
