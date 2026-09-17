import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { poemsApi } from '../services/api';

const PoemOfTheDay = () => {
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoemOfTheDay = async () => {
      try {
        const data = await poemsApi.getPoemOfTheDay();
        setPoem(data.poem);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchPoemOfTheDay();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-indigo-200 rounded w-2/3 mb-3"></div>
        <div className="h-3 bg-indigo-100 rounded w-full mb-2"></div>
        <div className="h-3 bg-indigo-100 rounded w-3/4"></div>
      </div>
    );
  }

  if (!poem) return null;

  // Get first 4 lines as preview
  const lines = poem.content.split('\n').filter(line => line.trim());
  const previewLines = lines.slice(0, 4);

  return (
    <div 
      className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-lg p-4 shadow-sm"
      data-testid="poem-of-the-day"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">
            Poem of the Day
          </h3>
        </div>
      </div>

      {/* Poem Title */}
      <Link 
        to={`/poem/${poem.slug}`}
        className="block group"
      >
        <h4 className="text-base font-serif font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
          {poem.title}
        </h4>
      </Link>

      {/* Poem Preview */}
      <div className="font-serif text-sm text-gray-600 leading-relaxed mb-3 pl-3 border-l-2 border-indigo-200">
        {previewLines.map((line, idx) => (
          <p key={idx} className="line-clamp-1">
            {line}
          </p>
        ))}
        {lines.length > 4 && (
          <p className="text-indigo-400 italic text-xs mt-1">...</p>
        )}
      </div>

      {/* Read More */}
      <Link
        to={`/poem/${poem.slug}`}
        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs transition-colors"
        data-testid="poem-of-the-day-link"
      >
        Read full poem
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default PoemOfTheDay;
