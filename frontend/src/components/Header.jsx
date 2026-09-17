import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Menu, X, Home, Folder, Tag, Info, Search, Command, Mail } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchTip, setShowSearchTip] = useState(false);

  // Show search tip on first visit
  useEffect(() => {
    const hasSeenTip = localStorage.getItem('rhymemosaic_search_tip');
    if (!hasSeenTip) {
      setShowSearchTip(true);
      setTimeout(() => {
        setShowSearchTip(false);
        localStorage.setItem('rhymemosaic_search_tip', 'true');
      }, 5000);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // H = Home
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
        navigate('/');
      }
      // A = Admin
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home, exact: true },
    { path: '/categories', label: 'Categories', icon: Folder },
    { path: '/tags', label: 'Tags', icon: Tag },
    { path: '/about', label: 'Author', icon: Info },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-[#1e73be] transition-all duration-300 hover:scale-110">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Link to="/" onClick={() => setIsOpen(false)} className="font-serif text-[#1e73be] gradient-text">
                      RhymeMosaic
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-1 stagger-children">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive(item.path, item.exact)
                          ? 'bg-[#1e73be]/10 text-[#1e73be]'
                          : 'text-gray-600 hover:bg-gray-100 hover:translate-x-1'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 my-4" />
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin')
                        ? 'bg-[#1e73be]/10 text-[#1e73be]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    Admin Panel
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="text-center flex-1 lg:flex-none">
            <Link to="/" className="inline-block group">
              <h1 className="text-3xl lg:text-4xl font-serif text-[#1e73be] group-hover:text-[#1a5fa0] transition-all duration-300 cursor-pointer">
                <span className="gradient-text">RhymeMosaic</span>
              </h1>
            </Link>
            <p className="text-gray-500 text-xs lg:text-sm mt-1 font-sans italic opacity-80 hover:opacity-100 transition-opacity">
              Meter, Metaphor, Memory + Meaning
            </p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-sans transition-all duration-300 relative group ${
                  isActive(item.path, item.exact)
                    ? 'text-[#1e73be] font-medium'
                    : 'text-gray-600 hover:text-[#1e73be]'
                }`}
              >
                <span className="relative">
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#1e73be] transition-all duration-300 ${
                    isActive(item.path, item.exact) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </span>
              </Link>
            ))}
            <Link
              to="/admin"
              className={`flex items-center gap-1 text-sm font-sans transition-colors ${
                isActive('/admin')
                  ? 'text-[#1e73be] font-medium'
                  : 'text-gray-400 hover:text-[#1e73be]'
              }`}
              title="Admin Panel (Press A)"
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Mobile placeholder for alignment */}
          <div className="lg:hidden w-10" />
        </div>

        {/* Search tip notification */}
        {showSearchTip && location.pathname === '/' && (
          <div className="mt-4 p-3 bg-[#1e73be]/10 border border-[#1e73be]/20 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-[#1e73be]">
              <Search className="w-4 h-4" />
              <span>Tip: Press</span>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#1e73be]/30 font-mono text-xs">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#1e73be]/30 font-mono text-xs">K</kbd>
              <span>to search poems</span>
            </div>
            <button 
              onClick={() => setShowSearchTip(false)}
              className="text-[#1e73be] hover:text-[#1a5fa0] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
