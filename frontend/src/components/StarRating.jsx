import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { poemsApi } from '../services/api';

// Helper functions for localStorage vote tracking (as backup/cache)
const getVotedPoems = () => {
  try {
    const stored = localStorage.getItem('rhymemosaic_votes');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const markPoemAsVoted = (poemId, rating) => {
  try {
    const votes = getVotedPoems();
    votes[poemId] = { rating, votedAt: new Date().toISOString() };
    localStorage.setItem('rhymemosaic_votes', JSON.stringify(votes));
  } catch (e) {

  }
};

const hasPoemBeenVoted = (poemId) => {
  const votes = getVotedPoems();
  return !!votes[poemId];
};

const getPoemUserRating = (poemId) => {
  const votes = getVotedPoems();
  return votes[poemId]?.rating || 0;
};

const StarRating = ({ 
  poemId,
  rating = 0, 
  ratingCount = 0, 
  onRate, 
  readonly = false,
  size = 'md',
  showCount = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkRatingStatus = async () => {
      if (!poemId) return;
      
      // First check localStorage for quick response
      if (hasPoemBeenVoted(poemId)) {
        setHasVoted(true);
        setUserRating(getPoemUserRating(poemId));
        return;
      }
      
      // Then verify with backend
      try {
        const status = await poemsApi.getRatingStatus(poemId);
        if (status.hasRated) {
          setHasVoted(true);
          setUserRating(status.userRating || 0);
          // Sync to localStorage
          markPoemAsVoted(poemId, status.userRating);
        }
      } catch (err) {
        // Backend check failed, rely on localStorage

      }
    };

    checkRatingStatus();
  }, [poemId]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleRate = async (value) => {
    if (readonly || hasVoted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Optimistically update UI
      setHasVoted(true);
      setUserRating(value);
      markPoemAsVoted(poemId, value);
      
      // Call the onRate callback (which will update the poem's rating in parent)
      if (onRate) {
        await onRate(value);
      }
    } catch (err) {
      // If it fails, we still keep the local vote marked
      // The backend will reject duplicate votes anyway

    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;
  const isDisabled = readonly || hasVoted || isSubmitting;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => !isDisabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isDisabled}
            className={`transition-all duration-200 ${
              isDisabled
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-125 star-hover'
            }`}
            aria-label={`Rate ${star} stars`}
            title={hasVoted ? `You rated this ${userRating} stars` : `Rate ${star} stars`}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-200 ${
                star <= displayRating
                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                  : star <= Math.ceil(displayRating) && displayRating % 1 !== 0
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-gray-200 text-gray-300 hover:fill-amber-100'
              }`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-gray-500">
          {rating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
      )}
      {hasVoted && !readonly && (
        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-pulse">
          You rated: {userRating} star{userRating !== 1 ? 's' : ''}
        </span>
      )}
      {isSubmitting && (
        <span className="text-xs text-gray-400 animate-pulse">Submitting...</span>
      )}
    </div>
  );
};

export default StarRating;
export { getVotedPoems, hasPoemBeenVoted, getPoemUserRating };
