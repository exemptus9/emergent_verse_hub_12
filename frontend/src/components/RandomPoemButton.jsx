import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Loader2 } from 'lucide-react';
import { poemsApi } from '../services/api';

const RandomPoemButton = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    setLoading(true);
    try {
      const data = await poemsApi.getRandomPoem();
      if (data.poem) {
        navigate(`/poem/${data.poem.slug}`);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`group relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 ${className}`}
      data-testid="random-poem-button"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Shuffle className="w-5 h-5 group-hover:animate-pulse" />
          <span>Surprise Me!</span>
        </>
      )}
      
      {/* Sparkle effect on hover */}
      <span className="absolute inset-0 rounded-lg overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </span>
    </button>
  );
};

export default RandomPoemButton;
