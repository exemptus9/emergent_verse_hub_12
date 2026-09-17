import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, BookOpen, Sparkles } from 'lucide-react';
import { taxonomyApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';

// Category icons and colors
const categoryMeta = {
  "Mental Health & Struggle": { emoji: "🧠", gradient: "from-purple-500 to-indigo-600" },
  "Heartbreak & Loss": { emoji: "💔", gradient: "from-rose-500 to-pink-600" },
  "Love & Relationships": { emoji: "❤️", gradient: "from-red-400 to-rose-500" },
  "Hope & Resilience": { emoji: "🌟", gradient: "from-amber-400 to-orange-500" },
  "Life & Philosophy": { emoji: "💭", gradient: "from-slate-500 to-gray-600" },
  "Faith & Spirituality": { emoji: "✨", gradient: "from-sky-400 to-blue-500" },
  "Self-Discovery & Identity": { emoji: "🔍", gradient: "from-teal-400 to-cyan-500" },
  "Social Commentary": { emoji: "🌍", gradient: "from-emerald-500 to-green-600" },
  "Family & Memories": { emoji: "👨‍👩‍👧", gradient: "from-orange-400 to-amber-500" },
  "Nature & Seasons": { emoji: "🌿", gradient: "from-green-400 to-emerald-500" },
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await taxonomyApi.getCategories();
        setCategories(data);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const totalPoems = categories.reduce((acc, c) => acc + c.count, 0);
  const maxCount = Math.max(...categories.map(c => c.count), 1);

  // Get size class based on count
  const getSizeClass = (count) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-3xl';
    if (ratio > 0.4) return 'text-2xl';
    if (ratio > 0.2) return 'text-xl';
    return 'text-lg';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-transition">
      <SEO 
        title="Categories"
        description="Browse poems by category. Explore themes like Mental Health, Love, Faith, and more."
        tags={['categories', 'poetry themes', 'RhymeMosaic']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-8 card-hover">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <div className="p-2 bg-gradient-to-br from-[#1e73be] to-[#2d8cd9] rounded-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-gray-800">Category Cloud</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {categories.length} categories • {totalPoems} total poems
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1e73be] mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-500">Loading categories...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Category Cloud */}
                <div className="flex flex-wrap items-center justify-center gap-4 py-8 min-h-[200px]">
                  {categories.map((category, index) => {
                    const meta = categoryMeta[category.name] || { emoji: "📝", gradient: "from-gray-400 to-gray-500" };
                    const ratio = category.count / maxCount;
                    
                    return (
                      <Link
                        key={category.name}
                        to={`/category/${encodeURIComponent(category.name)}`}
                        className={`tag-cloud-item relative group ${getSizeClass(category.count)}`}
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          opacity: hoveredCategory && hoveredCategory !== category.name ? 0.4 : 1,
                        }}
                        onMouseEnter={() => setHoveredCategory(category.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <span 
                          className={`font-serif font-medium bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent hover:opacity-80 transition-all duration-300`}
                        >
                          <span className="mr-1">{meta.emoji}</span>
                          {category.name}
                        </span>
                        
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                          {category.count} poem{category.count !== 1 ? 's' : ''}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Category Cards Grid */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-6 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#1e73be]" />
                    Browse by Category
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((category, index) => {
                      const meta = categoryMeta[category.name] || { emoji: "📝", gradient: "from-gray-400 to-gray-500" };
                      const percentage = Math.round((category.count / totalPoems) * 100);
                      
                      return (
                        <Link
                          key={category.name}
                          to={`/category/${encodeURIComponent(category.name)}`}
                          className="category-card p-5 rounded-xl border border-gray-200 group overflow-hidden"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{meta.emoji}</span>
                              <div>
                                <h4 className="font-medium text-gray-800 group-hover:text-[#1e73be] transition-colors">
                                  {category.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {category.count} poem{category.count !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                              {percentage}%
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${meta.gradient} transition-all duration-700 ease-out`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
};

export default CategoriesPage;
