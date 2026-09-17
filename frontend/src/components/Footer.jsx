import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Feather } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          {/* Decorative element */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#1e73be]/30" />
            <Feather className="w-5 h-5 text-[#1e73be]/50 mx-4 animate-pulse" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#1e73be]/30" />
          </div>
          
          {/* Quote */}
          <blockquote className="text-lg font-serif text-gray-600 italic mb-8 relative">
            <span className="text-4xl text-[#1e73be]/20 absolute -left-4 -top-4">"</span>
            I don't fight for my survival - I write for it.
            <span className="text-4xl text-[#1e73be]/20 absolute -right-4 bottom-0">"</span>
          </blockquote>
          
          <Link 
            to="/" 
            className="inline-block group"
          >
            <span className="text-[#1e73be] font-serif text-2xl gradient-text transition-all duration-300">
              RhymeMosaic
            </span>
          </Link>
          
          <p className="text-gray-500 text-sm mt-2 italic">
            Meter, Metaphor, Memory + Meaning
          </p>
          
          {/* Social-style links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link 
              to="/about" 
              className="text-gray-400 hover:text-[#1e73be] text-sm transition-all duration-300 hover:scale-105"
            >
              About
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/contact" 
              className="text-gray-400 hover:text-[#1e73be] text-sm transition-all duration-300 hover:scale-105"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/categories" 
              className="text-gray-400 hover:text-[#1e73be] text-sm transition-all duration-300 hover:scale-105"
            >
              Categories
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/tags" 
              className="text-gray-400 hover:text-[#1e73be] text-sm transition-all duration-300 hover:scale-105"
            >
              Tags
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
              © {new Date().getFullYear()} RhymeMosaic. Made with 
              <Heart className="w-3 h-3 text-red-400 animate-pulse inline" /> 
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
