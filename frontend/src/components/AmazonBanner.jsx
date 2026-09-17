import React, { useState } from 'react';
import { Book, X, ExternalLink } from 'lucide-react';

const AmazonBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Amazon book link
  const amazonLink = "https://a.co/d/aKlvWgS";
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm"
      data-testid="amazon-banner"
    >
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 transition-colors"
        aria-label="Dismiss banner"
        data-testid="amazon-banner-close"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Book icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <Book className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            📖 Get the Complete Collection!
          </h3>
          <p className="text-amber-800 text-sm mb-2">
            <strong>"RhymeMosaic: Progressions"</strong> — All 205 poems in a beautiful printed volume. 
            Available now on Amazon.
          </p>
          <p className="text-amber-600 text-xs italic">
            For signed copies, contact Brandon directly.
          </p>
        </div>
        
        {/* CTA Button */}
        <div className="flex-shrink-0">
          <a
            href={amazonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            data-testid="amazon-banner-link"
          >
            <span>Buy on Amazon</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AmazonBanner;
