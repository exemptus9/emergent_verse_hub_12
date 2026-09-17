import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Folder } from 'lucide-react';
import { poemsApi } from '../services/api';
import PoemCard from '../components/PoemCard';
import Sidebar from '../components/Sidebar';
import SortControls from '../components/SortControls';
import SEO from '../components/SEO';

const CategoryPage = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState('newest');
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const decodedCategory = decodeURIComponent(category || '');

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await poemsApi.getAll(sortBy, decodedCategory, null);
      setPoems(data);
      setError(null);
    } catch (err) {

      setError('Failed to load poems.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, decodedCategory]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

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
        title={`${decodedCategory} Poems`}
        description={`Browse poems in the ${decodedCategory} category. A collection of poetry by Brandon WordSmith.`}
        tags={[decodedCategory, 'poetry', 'poems', 'Brandon WordSmith']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#1e73be] hover:underline mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all poems
          </Link>

          {/* Category header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6 text-[#1e73be]" />
              <div>
                <h1 className="text-2xl font-serif text-gray-800">Category: {decodedCategory}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? 'Loading...' : `${poems.length} poem${poems.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>
          </div>

          <SortControls sortBy={sortBy} onSortChange={setSortBy} />
          
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Loading poems...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-red-200 p-12 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : poems.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} onRate={handleRate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No poems found in this category.</p>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default CategoryPage;
