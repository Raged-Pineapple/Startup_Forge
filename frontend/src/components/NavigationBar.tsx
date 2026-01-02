import { Home, Users, FileText, Bell, Briefcase, ChevronLeft, ChevronRight, User, Search, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { User as UserType } from '../App';

type NavigationBarProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  currentPage: string;
  onNavigate: (page: 'home' | 'profile' | 'messages' | 'network' | 'notifications' | 'jobs') => void;
  onSearch: (query: string) => void;
  searchResults: UserType[];
  onSelectUser: (userId: string) => void;
};

export function NavigationBar({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  currentPage,
  onNavigate,
  onSearch,
  searchResults,
  onSelectUser
}: NavigationBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    setShowResults(value.length > 0);
  };

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Logo and Navigation Arrows */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerText = 'SecureChat';
                }}
              />
            </a>

            <div className="flex items-center gap-1">
              <button
                onClick={onBack}
                disabled={!canGoBack}
                className={`p-1.5 rounded ${canGoBack
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onForward}
                disabled={!canGoForward}
                className={`p-1.5 rounded ${canGoForward
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search people..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                    >
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="text-gray-900 text-sm">{user.name}</div>
                        <div className="text-gray-600 text-xs truncate">{user.headline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Navigation Icons */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${currentPage === 'home'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Home className="w-6 h-6" fill={currentPage === 'home' ? 'currentColor' : 'none'} />
              <span className="text-xs">Home</span>
            </button>

            <button
              onClick={() => onNavigate('network')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${currentPage === 'network'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Users className="w-6 h-6" fill={currentPage === 'network' ? 'currentColor' : 'none'} />
              <span className="text-xs">My Network</span>
            </button>

            <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded text-gray-600 hover:text-gray-900 transition-colors">
              <FileText className="w-6 h-6" />
              <span className="text-xs">Post</span>
            </button>

            <button
              onClick={() => onNavigate('notifications')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors relative ${currentPage === 'notifications'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Bell className="w-6 h-6" fill={currentPage === 'notifications' ? 'currentColor' : 'none'} />
              <span className="text-xs">Notifications</span>
              <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={() => onNavigate('jobs')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${currentPage === 'jobs'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Briefcase className="w-6 h-6" fill={currentPage === 'jobs' ? 'currentColor' : 'none'} />
              <span className="text-xs">Jobs</span>
            </button>

            <button
              onClick={() => onNavigate('messages')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${currentPage === 'messages'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <MessageSquare className="w-6 h-6" fill={currentPage === 'messages' ? 'currentColor' : 'none'} />
              <span className="text-xs">Messages</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${currentPage === 'profile'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <User className="w-6 h-6" fill={currentPage === 'profile' ? 'currentColor' : 'none'} />
              <span className="text-xs">Me</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}