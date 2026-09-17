import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Calendar, User, Tag, Folder, Share2, Bookmark, Copy, Check, ChevronLeft, ChevronRight, Printer, Edit, Eye } from 'lucide-react';
import { poemsApi } from '../services/api';
import StarRating from '../components/StarRating';
import Sidebar from '../components/Sidebar';
import SocialShareButtons from '../components/SocialShareButtons';
import SEO from '../components/SEO';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';

const PoemDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [poem, setPoem] = useState(null);
  const [allPoems, setAllPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotif, setShowNotif] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState('lg');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    setIsAdmin(adminAuth === 'true');
  }, []);

  useEffect(() => {
    const fetchPoem = async () => {
      try {
        setLoading(true);
        const [poemData, poemsData] = await Promise.all([
          poemsApi.getBySlug(slug),
          poemsApi.getAll('newest')
        ]);
        setPoem(poemData);
        setAllPoems(poemsData);
        
        poemsApi.recordView(poemData.id);
        
        const readPoems = JSON.parse(localStorage.getItem('rhymemosaic_read') || '[]');
        if (!readPoems.includes(poemData.id)) {
          readPoems.push(poemData.id);
          localStorage.setItem('rhymemosaic_read', JSON.stringify(readPoems));
        }
        
        const commentsData = await poemsApi.getComments(poemData.id);
        setComments(commentsData);
        
        const bookmarks = JSON.parse(localStorage.getItem('rhymemosaic_bookmarks') || '[]');
        setBookmarked(bookmarks.includes(poemData.id));
        
        setError(null);
      } catch {
        setError('Poem not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPoem();
    window.scrollTo(0, 0);
  }, [slug]);

  // Find prev/next poems
  const currentIndex = allPoems.findIndex(p => p.slug === slug);
  const prevPoem = currentIndex > 0 ? allPoems[currentIndex - 1] : null;
  const nextPoem = currentIndex < allPoems.length - 1 ? allPoems[currentIndex + 1] : null;

  const handleRate = async (value) => {
    if (!poem) return;
    
    try {
      const result = await poemsApi.ratePoem(poem.id, value);
      setPoem(prev => ({
        ...prev,
        rating: result.newRating,
        ratingCount: result.ratingCount
      }));
    } catch {
      // rating failed — UI already has optimistic state
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !poem) return;
    
    setSubmittingComment(true);
    try {
      const newComment = await poemsApi.addComment(
        poem.id, 
        authorName.trim() || 'Guest', 
        comment.trim()
      );
      setComments(prev => [...prev, newComment]);
      setComment('');
      setAuthorName('');
    } catch (err) {

    } finally {
      setSubmittingComment(false);
    }
  };

  const showToast = (msg) => {
    setShowNotif(msg);
    setTimeout(() => setShowNotif(null), 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;
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
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
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
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBookmark = () => {
    if (!poem) return;
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

  const handlePrint = () => {
    window.print();
  };

  const fontSizes = {
    sm: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </main>
          <Sidebar />
        </div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-serif text-gray-800 mb-4">Poem not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-[#1e73be] hover:underline"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return poem.date;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return poem.date;
    }
  };

  // Generate SEO description from poem content
  const getSeoDescription = () => {
    if (!poem) return '';
    const contentPreview = poem.content.substring(0, 150).replace(/\n/g, ' ').trim();
    return `${contentPreview}... A poem by ${poem.author}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO 
        title={poem.title}
        description={getSeoDescription()}
        type="article"
        author={poem.author}
        publishedTime={poem.createdAt}
        tags={poem.tags}
        url={`${window.location.origin}/poem/${poem.slug}`}
      />
      {/* Toast notification */}
      {showNotif && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300" data-testid="toast-notification">
          {showNotif}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          {/* Back link */}
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#1e73be] hover:underline mb-6 text-sm"
            data-testid="back-to-poems-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all poems
          </button>

          <article className="bg-white rounded-lg border border-gray-200 p-8 print:border-0 print:shadow-none">
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-serif text-[#1e73be] flex-1">
                {poem.title}
              </h1>
              <div className="flex items-center gap-1 print:hidden">
                {/* Admin Edit Button */}
                {isAdmin && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/admin/poems/edit/${poem.id}`}
                          className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          data-testid="admin-edit-button"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Edit Poem (Admin)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleShare} data-testid="share-button" className="p-2 text-gray-400 hover:text-[#1e73be] transition-colors">
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? 'Copied!' : 'Share'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleBookmark} className={`p-2 transition-colors ${bookmarked ? 'text-[#1e73be]' : 'text-gray-400 hover:text-[#1e73be]'}`}>
                        <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{bookmarked ? 'Remove bookmark' : 'Bookmark'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handlePrint} data-testid="print-button" className="p-2 text-gray-400 hover:text-[#1e73be] transition-colors">
                        <Printer className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Print</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{poem.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <Link to="/about" className="text-[#1e73be] hover:underline">{poem.author}</Link>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{poem.views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                {poem.categories.map((cat, index) => (
                  <span key={cat}>
                    <Link 
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="text-[#1e73be] hover:underline"
                    >
                      {cat}
                    </Link>
                    {index < poem.categories.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg print:hidden">
              <p className="text-sm text-gray-600 mb-2">Rate this poem:</p>
              <StarRating 
                poemId={poem.id}
                rating={poem.rating} 
                ratingCount={poem.ratingCount}
                onRate={handleRate}
                size="lg"
              />
            </div>

            {/* Font size controls */}
            <div className="mb-4 flex items-center gap-2 print:hidden">
              <span className="text-sm text-gray-500">Text size:</span>
              {['sm', 'lg', 'xl'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    fontSize === size
                      ? 'bg-[#1e73be] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Amazon link for book announcement */}
            {poem.isAnnouncement && poem.amazonLink && (
              <div className="mb-6 p-4 bg-[#1e73be]/5 rounded-lg border border-[#1e73be]/20 print:hidden">
                <p className="text-gray-700 mb-3">Get your copy of the complete RhymeMosaic collection:</p>
                <a 
                  href={poem.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-[#1e73be] text-white rounded hover:bg-[#1a5fa0] transition-colors"
                >
                  Purchase on Amazon →
                </a>
              </div>
            )}

            {/* Poem content */}
            <div className={`font-serif text-gray-800 leading-loose whitespace-pre-line ${fontSizes[fontSize]} mb-8`}>
              {poem.content}
            </div>

            {/* Tags */}
            {poem.tags && poem.tags.length > 0 && (
              <div className="flex items-start gap-2 pt-6 border-t border-gray-200 print:hidden">
                <Tag className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm text-gray-500">Tags: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {poem.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/tag/${encodeURIComponent(tag)}`}
                        className="text-xs bg-gray-100 hover:bg-[#1e73be] hover:text-white text-[#1e73be] px-2 py-1 rounded transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="print:hidden">
              <SocialShareButtons poem={poem} />
            </div>
          </article>

          {/* Poem Navigation */}
          <div className="mt-6 flex justify-between items-center print:hidden">
            {prevPoem ? (
              <Link
                to={`/poem/${prevPoem.slug}`}
                className="flex items-center gap-2 text-[#1e73be] hover:underline text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{prevPoem.title}</span>
                <span className="sm:hidden">Previous</span>
              </Link>
            ) : <div />}
            {nextPoem ? (
              <Link
                to={`/poem/${nextPoem.slug}`}
                className="flex items-center gap-2 text-[#1e73be] hover:underline text-sm"
              >
                <span className="hidden sm:inline">{nextPoem.title}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : <div />}
          </div>

          {/* Comments Section */}
          <section id="comments" className="mt-8 bg-white rounded-lg border border-gray-200 p-8 print:hidden">
            <h3 className="text-xl font-serif text-gray-800 mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </h3>

            {/* Existing comments */}
            {comments.length > 0 ? (
              <div className="space-y-6 mb-8">
                {comments.map((c) => (
                  <div key={c.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">{c.author}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-6">No comments yet. Be the first to share your thoughts!</p>
            )}

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit}>
              <h4 className="text-lg font-serif text-gray-800 mb-4">Leave a Comment</h4>
              <div className="mb-4">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1e73be]/20 focus:border-[#1e73be]"
                />
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this poem..."
                rows={4}
                className="mb-4"
              />
              <Button 
                type="submit" 
                className="bg-[#1e73be] hover:bg-[#1a5fa0]"
                disabled={submittingComment || !comment.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </section>
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default PoemDetailPage;
