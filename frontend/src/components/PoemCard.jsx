import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Share2, Bookmark, Copy, Check, Eye, BookOpen } from 'lucide-react';
import StarRating from './StarRating';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const PoemCard = ({ poem, onRate, searchQuery = '' }) => {
  const [localRating, setLocalRating] = useState(poem.rating);
  const [localRatingCount, setLocalRatingCount] = useState(poem.ratingCount);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => {
    const bookmarks = JSON.parse(localStorage.getItem('rhymemosaic_bookmarks') || '[]');
    return bookmarks.includes(poem.id);
  });
  
  // Check if poem has been read
  const isRead = (() => {
    const readPoems = JSON.parse(localStorage.getItem('rhymemosaic_read') || '[]');
    return readPoems.includes(poem.id);
  })();

  const handleRate = (value) => {
    const newCount = localRatingCount + 1;
    const newRating = ((localRating * localRatingCount) + value) / newCount;
    setLocalRating(newRating);
    setLocalRatingCount(newCount);
    if (onRate) {
      onRate(poem.id, value);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/poem/${poem.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: poem.title,
          text: poem.content.substring(0, 100) + '...',
          url: url
        });
        return;
      }
    } catch (err) {
      // User cancelled or share API failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / restricted contexts
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('rhymemosaic_bookmarks') || '[]');
    let newBookmarks;
    if (bookmarked) {
      newBookmarks = bookmarks.filter(id => id !== poem.id);
    } else {
      newBookmarks = [...bookmarks, poem.id];
    }
    localStorage.setItem('rhymemosaic_bookmarks', JSON.stringify(newBookmarks));
    setBookmarked(!bookmarked);
  };

  // Highlight search matches in text
  const highlightText = (text, query) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={`hl-${i}-${part}`} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  // Format content for preview (first few lines)
  const contentPreview = poem.content.split('\n').slice(0, 8).join('\n');
  const hasMore = poem.content.split('\n').length > 8;

  return (
    <article 
      className="mb-10 pb-10 border-b border-gray-200 last:border-b-0 group poem-card"
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      {/* Title with Read indicator */}
      <h2 className="text-2xl font-serif mb-3 flex items-center gap-2">
        <Link 
          to={`/poem/${poem.slug}`}
          className="text-[#1e73be] hover:text-[#1a5fa0] transition-all duration-300 link-underline"
        >
          {highlightText(poem.title, searchQuery)}
        </Link>
        {isRead && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Read
                </span>
              </TooltipTrigger>
              <TooltipContent className="tooltip-fade">You've read this poem</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h2>

      {/* Meta info */}
      <div className="text-sm text-gray-500 mb-4 font-sans">
        <span>Posted in </span>
        {poem.categories.map((cat, index) => (
          <span key={cat}>
            <Link 
              to={`/category/${encodeURIComponent(cat)}`}
              className="text-[#1e73be] hover:underline transition-colors duration-200"
            >
              {highlightText(cat, searchQuery)}
            </Link>
            {index < poem.categories.length - 1 && ', '}
          </span>
        ))}
        {poem.tags.length > 0 && (
          <>
            <span> with tags </span>
            {poem.tags.slice(0, 4).map((tag, index) => (
              <span key={tag}>
                <Link 
                  to={`/tag/${encodeURIComponent(tag)}`}
                  className="text-[#1e73be] hover:underline"
                >
                  {highlightText(tag, searchQuery)}
                </Link>
                {index < Math.min(poem.tags.length, 4) - 1 && ', '}
              </span>
            ))}
            {poem.tags.length > 4 && <span className="text-gray-400"> +{poem.tags.length - 4} more</span>}
          </>
        )}
        <span> on {poem.date} by </span>
        <Link to="/about" className="text-[#1e73be] hover:underline">{poem.author}</Link>
      </div>

      {/* Rating & Views */}
      <div className="mb-4 flex items-center gap-4">
        <StarRating 
          poemId={poem.id}
          rating={localRating} 
          ratingCount={localRatingCount}
          onRate={handleRate}
          size="md"
        />
        {poem.views > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{poem.views.toLocaleString()} view{poem.views !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="font-serif text-gray-800 leading-relaxed whitespace-pre-line text-base mb-4">
        {highlightText(contentPreview, searchQuery)}
        {hasMore && (
          <span className="text-gray-400">...</span>
        )}
      </div>

      {/* Amazon link for book announcement */}
      {poem.isAnnouncement && poem.amazonLink && (
        <a 
          href={poem.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-4 px-4 py-2 bg-[#1e73be] text-white text-sm rounded hover:bg-[#1a5fa0] transition-colors"
        >
          Purchase on Amazon →
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to={`/poem/${poem.slug}`}
          className="text-[#1e73be] hover:underline text-sm font-sans"
        >
          Continue reading →
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Comments */}
          <Link 
            to={`/poem/${poem.slug}#comments`}
            className="flex items-center gap-1 text-gray-400 hover:text-[#1e73be] text-sm font-sans transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {poem.comments === 0 ? 'Comment' : poem.comments}
            </span>
          </Link>

          {/* Share */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-[#1e73be] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Link copied!' : 'Share poem'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bookmark */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleBookmark}
                  className={`p-2 transition-colors ${
                    bookmarked ? 'text-[#1e73be]' : 'text-gray-400 hover:text-[#1e73be]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {bookmarked ? 'Remove bookmark' : 'Bookmark poem'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </article>
  );
};

export default PoemCard;
