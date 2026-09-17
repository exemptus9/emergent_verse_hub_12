import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles } from 'lucide-react';
import { taxonomyApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTag, setHoveredTag] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await taxonomyApi.getTags();
        setTags(data);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Calculate font size based on count
  const getTagStyle = (count, maxCount) => {
    const minSize = 0.75;
    const maxSize = 2.5;
    const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
    const size = minSize + (maxSize - minSize) * ratio;
    
    // Color intensity based on count
    const opacity = 0.6 + (ratio * 0.4);
    
    return {
      fontSize: `${size}rem`,
      opacity: hoveredTag && hoveredTag !== count ? 0.5 : 1,
      color: `rgba(30, 115, 190, ${opacity})`,
    };
  };

  const maxCount = Math.max(...tags.map(t => t.count), 1);

  // Shuffle tags once for visual interest, stable across re-renders
  const shuffledTags = useMemo(
    () => [...tags].sort(() => Math.random() - 0.5),
    [tags]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-transition">
      <SEO 
        title="Tags"
        description="Browse all poem tags. Explore themes like love, hope, faith, heartbreak, and more."
        tags={['tags', 'poetry themes', 'RhymeMosaic']}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-8 card-hover">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <div className="p-2 bg-gradient-to-br from-[#1e73be] to-[#2d8cd9] rounded-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-gray-800">Tag Cloud</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {tags.length} themes
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1e73be] mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-500">Loading tags...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Tag Cloud */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 py-8 min-h-[300px]">
                  {shuffledTags.map((tag, index) => (
                    <Link
                      key={tag.name}
                      to={`/tag/${encodeURIComponent(tag.name)}`}
                      className="tag-cloud-item relative group"
                      style={{
                        ...getTagStyle(tag.count, maxCount),
                        animationDelay: `${index * 0.02}s`,
                      }}
                      onMouseEnter={() => setHoveredTag(tag.count)}
                      onMouseLeave={() => setHoveredTag(null)}
                    >
                      <span className="font-medium hover:text-[#1a5fa0] transition-colors duration-300">
                        {tag.name}
                      </span>
                      
                      {/* Tooltip on hover */}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {tag.count} poem{tag.count !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.75rem' }} className="text-[#1e73be]/60">smaller</span>
                      <span className="text-gray-400">= fewer poems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.25rem' }} className="text-[#1e73be] font-medium">larger</span>
                      <span className="text-gray-400">= more poems</span>
                    </div>
                  </div>
                </div>

                {/* Popular Tags Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Most Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag, index) => (
                      <Link
                        key={tag.name}
                        to={`/tag/${encodeURIComponent(tag.name)}`}
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e73be]/10 to-[#2d8cd9]/10 hover:from-[#1e73be] hover:to-[#2d8cd9] text-[#1e73be] hover:text-white rounded-full transition-all duration-300 transform hover:scale-105"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="font-medium">{tag.name}</span>
                        <span className="text-xs bg-white/50 group-hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors">
                          {tag.count}
                        </span>
                      </Link>
                    ))}
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

export default TagsPage;
