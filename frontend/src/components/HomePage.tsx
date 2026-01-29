import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { SearchResultsDropdown } from './SearchResultsDropdown';
import { Users, Bell, MessageSquare, X, BrainCircuit, Sparkles, Send, TrendingUp, PieChart, Newspaper, ArrowUpRight, ShieldCheck, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type HomePageProps = {
  currentUser: User;
  onNavigate: (page: string, userId?: string) => void;
  onSearch: (query: string) => void;
  onQueryChange?: (query: string) => void;
  ragResults?: {
    founders: { text: string; id: string }[];
    investors: { text: string; id: string }[];
  };
  isSearching?: boolean;
  onCheckConflict?: (investor: string, company: string) => void;
};

export function HomePage({ currentUser, onNavigate, onSearch, onQueryChange, ragResults, isSearching, onCheckConflict }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [topFounders, setTopFounders] = useState<any[]>([]);
  const [investedCompanies, setInvestedCompanies] = useState<any[]>([]);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);

  // COI State
  const [coiCompanyName, setCoiCompanyName] = useState('');
  const [coiDomain, setCoiDomain] = useState('');
  const [coiSuggestions, setCoiSuggestions] = useState<any[]>([]);
  const [showCoiSuggestions, setShowCoiSuggestions] = useState(false);

  // Find Investors State
  const [investorMatches, setInvestorMatches] = useState<any[]>([]);
  const [showFindInvestorsModal, setShowFindInvestorsModal] = useState(false);
  const [isFindingInvestors, setIsFindingInvestors] = useState(false);
  const [userGrowthRate, setUserGrowthRate] = useState<number>(0.24);

  // Fetch match data prerequisites
  useEffect(() => {
    if (currentUser.id && currentUser.role === 'founder') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${apiUrl}/api/founders/growth/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.growth_rate) {
            setUserGrowthRate(data.growth_rate);
          }
        })
        .catch(err => console.error("Growth fetch error:", err));
    }
  }, [currentUser.id]);

  const handleFindInvestors = async () => {
    setIsFindingInvestors(true);
    setInvestorMatches([]);
    try {
      // Use User data if available, or sensible defaults
      const payload = {
        sector: currentUser.primaryDomain ? [currentUser.primaryDomain] : ["AI", "Healthcare"],
        stage: currentUser.investmentStage || "Seed",
        growth_rate: userGrowthRate
      };

      const predictionUrl = import.meta.env.VITE_PREDICTION_URL || 'http://localhost:8002';
      const res = await fetch(`${predictionUrl}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.matches) {
        setInvestorMatches(data.matches);
        setShowFindInvestorsModal(true);
      }
    } catch (err) {
      console.error("Failed to find investors:", err);
    } finally {
      setIsFindingInvestors(false);
    }
  };

  // Auto-search for COI companies
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (coiCompanyName.length < 2) {
        setCoiSuggestions([]);
        return;
      }
      try {
        const ragUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';
        const res = await fetch(`${ragUrl}/search/founders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: coiCompanyName, top_k: 3 })
        });
        const data = await res.json();
        if (data.results) setCoiSuggestions(data.results.map((r: any) => ({ name: r.text.substring(0, 30) + "...", domain: "tech.com" }))); // Mock domain for now or extract
      } catch (err) {
        console.error("COI Search Error", err);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [coiCompanyName]);

  useEffect(() => {
    // Fetch Dynamic Founder Data based on User Domain
    const fetchFounders = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/founders/rising`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, role: currentUser.role })
        });
        const data = await res.json();
        if (data.success) {
          setTopFounders(data.founders);
        }
      } catch (err) {
        console.error("Error loading top founders:", err);
      }
    };

    // Fetch Investments
    const fetchInvestments = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/investments/updates`, {
          headers: { 'x-user-id': currentUser.id }
        });
        const data = await res.json();
        if (Array.isArray(data)) setInvestedCompanies(data);
      } catch (e) { console.error(e); }
    };

    if (currentUser.id) {
      fetchFounders();
      fetchInvestments();
    }
  }, [currentUser]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ragUrl = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';
      const res = await fetch(`${ragUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, top_k: 5 })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || "Sorry, I couldn't understand that." }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI Assistant." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* --- Fixed Header --- */}
      <div className="bg-white px-8 py-6 shadow-sm border-b border-slate-100 z-50 flex-shrink-0">
        <div className="flex items-center justify-between gap-6 w-full h-24">

          {/* Profile */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-4 hover:bg-slate-50 p-2 rounded-xl transition-all group flex-shrink-0 min-w-52"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full border-2 border-gray-100 group-hover:border-slate-300 transition-colors object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-gray-900 leading-tight group-hover:text-slate-800"><b>{currentUser.name}</b></span>
              <span className="text-xs text-gray-500 font-medium"><b>View Profile</b></span>
            </div>
          </button>

          {/* Search */}
          <div className="flex-1 flex justify-center max-w-3xl px-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full group !z-50">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <div className="bg-slate-800 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
              </div>
              <input
                type="text"
                className="w-full pl-20 pr-20 py-4 bg-slate-900 border border-slate-700 focus:border-slate-500 focus:ring-4 focus:ring-slate-800 rounded-2xl text-base transition-all placeholder-white font-medium outline-none shadow-sm text-white hover:shadow-md hover:border-slate-600 relative z-50"
                placeholder="Ask anything..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onQueryChange) onQueryChange(e.target.value);
                }}
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-50">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs">|</span>
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 border border-slate-600 border-b-2 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider">
                    ⌘ K
                  </kbd>
                </div>
              </div>
            </form>

            {/* RAG Search Results Dropdown */}
            {searchQuery.length >= 2 && ragResults && (
              <div className="absolute top-full left-8 right-8 z-[100] shadow-2xl rounded-xl">
                <SearchResultsDropdown
                  results={ragResults}
                  isVisible={true}
                  isLoading={isSearching || false}
                  onSelectResult={(id) => onNavigate('profile', id)}
                />
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ActionItem icon={<Home />} label="Home" onClick={() => onNavigate('home')} active={true} />
            <ActionItem icon={<Users />} label="Network" onClick={() => onNavigate('network')} />
            <ActionItem icon={<Bell />} label="Alerts" badge={true} onClick={() => onNavigate('notifications')} />
            <ActionItem icon={<MessageSquare />} label="Inbox" onClick={() => onNavigate('messages')} />
            <ActionItem icon={<BrainCircuit />} label="Deep Analysis" onClick={() => onNavigate('conflict-report')} />
          </div>
        </div>
      </div>

      {/* --- Main Dashboard Content --- */}
      <div className="w-full px-6 pt-6 pb-2 overflow-hidden" style={{ height: 'calc(90vh - 3rem)' }}>
        <div className="flex flex-row w-full h-full gap-6">

          {/* COLUMN 1: RAG Chatbot (Ratio: 22) */}
          <div style={{ flex: 22 }} className="flex flex-col bg-white rounded-2xl shadow-soft border border-slate-300 overflow-hidden flex-shrink-0 min-w-0 h-full">
            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                <Sparkles className="w-4 h-4 fill-slate-800 text-slate-800" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                <b>AI Assistant</b> |
                <span className="text-[10px] font-medium text-indigo-500 ml-2 bg-indigo-50 px-2 py-0.5 rounded-full"><b>RAG Powered</b> </span>
              </h3>
            </div>

            <div className="flex-1 bg-gray-50/30 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                  <div className="w-16 h-16 bg-white border border-dashed border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">AI Assistant Ready</p>
                  <p className="text-xs mt-1 text-slate-400 max-w-[200px]">Ask questions about your portfolio, market trends, or founder details.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

                    {/* Assistant Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-sm'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm icon-message'
                      }`}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          components={{
                            strong: ({ node, ...props }) => <span className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden">
                        <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Loading Indicator */}
              {isChatLoading && (
                <div className="flex items-end gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex-shrink-0">
              <form onSubmit={handleChatSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="       Ask about your personal portfolio...."
                    className="w-full pl-14 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:bg-white group-hover:shadow-md"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-full hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center w-8 h-8 hover:scale-105 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMN 2: Feed (Ratio: 54) */}
          <div style={{ flex: 54 }} className="flex flex-col gap-6 flex-shrink-0 min-w-0 h-full">
            {/* Top: Founders */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xl font-black tracking-tight text-slate-800">
                    <b>  Top Rising Founders</b>
                  </h3>
                </div>
                <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:underline">View | </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 h-full bg-gray-50/20 grid grid-cols-2 gap-3 content-start">
                {topFounders.map((founder, i) => (
                  <div key={i} onClick={() => onNavigate('profile', founder.id)} className="flex flex-col sm:flex-row gap-4 p-4 bg-white hover:bg-slate-50 rounded-2xl border border-gray-100 hover:border-slate-200 shadow-sm hover:shadow-soft transition-all cursor-pointer group">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img src={`https://i.pravatar.cc/150?u=${i + 50}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 text-base truncate pr-2">{founder.name}</h4>
                          <span className="shrink-0 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full shadow-sm">
                            ${(founder.valuation / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-teal-700">{founder.company}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                            <TrendingUp className="w-3 h-3 text-gray-400" />
                            {founder.round} • {founder.year}
                          </span>
                          {founder.umbrella && (
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                              <ShieldCheck className="w-3 h-3 text-gray-400" />
                              {founder.umbrella}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: News */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-lg"><b> Market Intelligence</b></h3>
                </div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-600 animate-pulse border border-teal-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  LIVE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      source: "TechCrunch",
                      title: "Meta acquires AI agent platform Manus for $2B",
                      time: "2h",
                      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "VentureBeat",
                      title: "Liquid AI receives $250M Series A boost",
                      time: "4h",
                      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "The Verge",
                      title: "Global AI startup funding hits record $150B",
                      time: "8h",
                      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "Reuters",
                      title: "Nvidia hits $4T market cap amid chip demand",
                      time: "10h",
                      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "Sifted",
                      title: "Mistral releases new large open model 'Large 2'",
                      time: "11h",
                      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "Wired",
                      title: "Humane's AI Pin: The full hardware review",
                      time: "12h",
                      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "The Information",
                      title: "Perplexity to raise new round at $3B val",
                      time: "14h",
                      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "Forbes",
                      title: "Stability AI CEO steps down amid restructuring",
                      time: "1d",
                      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    },
                    {
                      source: "Bloomberg",
                      title: "Apple said to integrating Gemini into iPhone 16",
                      time: "1d",
                      image: "https://images.unsplash.com/photo-1592609931095-54a2168ae893?auto=format&fit=crop&q=80&w=200&h=200",
                      link: "#"
                    }
                  ].map((news, i) => (
                    <div key={i}>
                      <a href={news.link} className="group flex flex-col gap-2 p-2 bg-white hover:bg-slate-50 border border-gray-100 hover:border-indigo-100 rounded-lg transition-all hover:shadow-sm cursor-pointer h-full">
                        <div className="flex items-start gap-2">
                          <div className="w-10 h-10 relative overflow-hidden flex-shrink-0 rounded-md">
                            <img
                              src={news.image}
                              alt="thumb"
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-[10px] font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {news.title}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wide leading-none">{news.source}</span>
                              <span className="text-[8px] text-gray-400">• {news.time}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Stats (Ratio: 20) */}
          <div style={{ flex: 20 }} className="flex flex-col gap-6 flex-shrink-0 min-w-0 h-full">
            {/* Conflict (Flex 3 -> ~30%) to fit inputs */}
            <div style={{ flex: 3.5 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-shrink-0 flex flex-col min-h-0 relative z-40">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-gray-800 text-base"><b>Conflict of Interest</b></h3>
              </div>

              <div className="flex flex-col gap-3 flex-1 justify-center pt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={coiCompanyName}
                    onChange={(e) => {
                      setCoiCompanyName(e.target.value);
                      setShowCoiSuggestions(true);
                    }}
                    onFocus={() => setShowCoiSuggestions(true)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-400 outline-none transition-all placeholder:text-gray-400"
                  />
                  {showCoiSuggestions && coiSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-[60] overflow-hidden">
                      {coiSuggestions.map((s, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 truncate"
                          onClick={() => {
                            setCoiCompanyName(s.name.replace('...', '')); // Remove truncation dots if any
                            setCoiDomain(s.domain || "tech.com");
                            setShowCoiSuggestions(false);
                          }}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Domain (e.g. tech.com)"
                  value={coiDomain}
                  onChange={(e) => setCoiDomain(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-400 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={() => onCheckConflict?.(currentUser.name, coiCompanyName)}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Check Conflict <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Find Investors (Flex 3.5 -> ~35%) */}
            <div style={{ flex: 3.5 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-0 relative overflow-hidden group z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-slate-200 transition-colors"></div>

              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-slate-800" />
                  <h3 className="font-bold text-gray-900 text-lg"><b>Find Investors Like Me</b></h3>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Match with the perfect investors for your startup's stage and industry.
                  </p>

                  <button
                    onClick={handleFindInvestors}
                    disabled={isFindingInvestors}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isFindingInvestors ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Finding...
                      </>
                    ) : (
                      <>
                        Find Investors <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Invested Companies (Flex 3.5 -> ~35%) */}
            {/* Invested Companies (Flex 3.5 -> ~35%) */}
            <div style={{ flex: 3.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col min-h-0 relative z-50">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-gray-800 text-base"><b>My Invested Company Stats</b></h3>
              </div>

              <div className="flex flex-col h-full justify-center gap-4 px-1">
                {(() => {
                  const defaultInvestments = [
                    { id: 'd1', company: "Nebula AI", round: "Series A", amount: "$5M", year: "2024", img: 88, stock: '45.0M', growth: 120 },
                    { id: 'd2', company: "Zephyr", round: "Seed", amount: "$2M", year: "2023", img: 52, stock: '12.0M', growth: 85 },
                    { id: 'd3', company: "Flux Sys", round: "Seed", amount: "$1.2M", year: "2023", img: 33, stock: '15.5M', growth: 90 },
                    { id: 'd4', company: "Apex Bio", round: "Series B", amount: "$15M", year: "2022", img: 11, stock: '60.0M', growth: 45 },
                    { id: 'd5', company: "Vortex", round: "Series A", amount: "$8M", year: "2022", img: 95, stock: '32.0M', growth: 60 },
                    { id: 'd6', company: "Horizon", round: "Seed", amount: "$500K", year: "2021", img: 61, stock: '8.0M', growth: 30 },
                    { id: 'd7', company: "Pulse", round: "Pre-Seed", amount: "$200K", year: "2021", img: 72, stock: '2.5M', growth: 40 },
                    { id: 'd8', company: "Echo Lab", round: "Series A", amount: "$10M", year: "2020", img: 48, stock: '50.0M', growth: 55 }
                  ];

                  // Combine API data with defaults to ensure we have a full grid if needed, or just show API data
                  // Strategy: Show API data first. If less than 8, fill with defaults? 
                  // User "want founder icons of those companies the user is invested". 
                  // Use API data preferentially.

                  // Map API data to UI format
                  const uiInvestments = investedCompanies.map(c => ({
                    id: c.founder_id,
                    company: c.company,
                    round: c.round,
                    amount: typeof c.amount === 'number' ? `$${(c.amount / 1000000).toFixed(1)}M` : c.amount,
                    year: c.year,
                    img: c.founder_id,
                    stock: c.valuation ? (c.valuation / 1000000).toFixed(1) + 'M' : 'N/A',
                    growth: Math.floor(Math.random() * 40) + 10 // Mock growth if not in API
                  }));

                  let displayList = [...uiInvestments];

                  // Fill the rest with defaults if we have space, just to keep the UI looking good for the demo
                  if (displayList.length < 8) {
                    const remaining = defaultInvestments.slice(0, 8 - displayList.length);
                    displayList = [...displayList, ...remaining];
                  } else {
                    displayList = displayList.slice(0, 8);
                  }

                  const renderItem = (company: any, i: number) => {
                    // Tooltip positioning logic
                    // Row is 4 items. Index in row: i % 4
                    const posInRow = i % 4;
                    let tooltipClass = "left-1/2 -translate-x-1/2"; // Default Center
                    let arrowClass = "left-1/2 -translate-x-1/2";

                    if (posInRow === 0) {
                      tooltipClass = "left-[-10px]"; // Align Left
                      arrowClass = "left-4";
                    } else if (posInRow === 3) {
                      tooltipClass = "right-[-10px]"; // Align Right
                      arrowClass = "right-4";
                    }

                    const uniqueId = company.id || `default-${i}`;

                    return (
                      <div
                        key={i}
                        className="relative group"
                        onMouseEnter={() => setHoveredCompanyId(uniqueId)}
                        onMouseLeave={() => setHoveredCompanyId(null)}
                      >
                        {hoveredCompanyId === uniqueId && (
                          <div
                            className={`absolute bottom-full mb-3 w-64 text-sm rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-none z-[100] shadow-2xl border border-white/20 flex flex-col gap-3 ${tooltipClass}`}
                            style={{ backgroundColor: '#0f172a', color: 'white' }}
                          >
                            <div className="font-bold text-base border-b border-white/20 pb-2 mb-1 tracking-wide text-white">
                              {company.company || company.name}
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Round</span>
                                <span className="font-semibold text-white">{company.round}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Amount</span>
                                <span className="font-semibold text-white">{company.amount}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Year</span>
                                <span className="font-semibold text-white">{company.year}</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-1">
                                <span className="text-slate-400">Growth Prediction</span>
                                <span className="font-semibold text-green-400">+{company.growth || Math.floor(Math.random() * 150) + 20}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Stock Value</span>
                                <span className="font-semibold text-white">${company.stock || (Math.random() * 200 + 10).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div
                              className={`absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white/20 ${arrowClass}`}
                              style={{ backgroundColor: '#0f172a' }}
                            ></div>
                          </div>
                        )}

                        {/* Founder Icon */}
                        <div className="relative">
                          <img
                            src={`https://i.pravatar.cc/150?u=${company.id || company.img || i}`}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer bg-white"
                            alt={company.company}
                          />
                          {/* Small company logo indicator could go here if needed */}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        {displayList.slice(0, 4).map((c, i) => renderItem(c, i))}
                      </div>
                      <div className="flex items-center justify-between">
                        {displayList.slice(4, 8).map((c, i) => renderItem(c, i + 4))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Profile Modal --- */}
      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onNavigate={onNavigate}
        />
      )}

      {/* --- Find Investors Modal --- */}
      {showFindInvestorsModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowFindInvestorsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-[280px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Your Matches
              </h3>
              <button
                onClick={() => setShowFindInvestorsModal(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto custom-scrollbar bg-slate-50/50">
              <div className="grid grid-cols-1 gap-2">
                {investorMatches.map((match, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-1.5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {match.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 leading-none text-xs truncate">{match.name}</h4>
                          <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${match.safety_label === 'Low Risk' ? 'bg-emerald-100 text-emerald-700' : match.safety_label === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {match.safety_label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-indigo-600">{(match.match_score * 100).toFixed(0)}%</span>
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Mask</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-[8px] text-slate-400 font-medium uppercase leading-none mb-0.5">Conf.</span>
                        <span className="block text-[10px] font-bold text-slate-700 leading-none">{(match.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="block text-[8px] text-slate-400 font-medium uppercase leading-none mb-0.5">Vol.</span>
                        <span className="block text-[10px] font-bold text-slate-700 leading-none">{match.activity_volatility.toFixed(2)}</span>
                      </div>
                    </div>

                    <button className="w-full mt-0.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-200">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function ActionItem({ icon, label, onClick, badge, active }: { icon: any, label: string, onClick: () => void, badge?: boolean, active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 group min-w-20 relative ${active ? 'bg-indigo-50/80' : 'hover:bg-slate-50'}`}
    >
      <div className={`relative transform transition-transform duration-300 ${active ? 'scale-105' : 'group-hover:scale-110'}`}>
        <div className={`p-1.5 rounded-xl transition-colors duration-300 ${active ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 group-hover:text-slate-700 bg-transparent'}`}>
          {React.cloneElement(icon, {
            strokeWidth: active ? 2.5 : 2,
            className: "w-6 h-6"
          })}
        </div>
        {badge && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
      </div>
      <span className={`text-[11px] font-bold tracking-tight transition-colors duration-300 ${active ? 'text-indigo-700' : 'text-slate-400 group-hover:text-slate-600'}`}>{label}</span>
    </button>
  );
}

function ProfileModal({ currentUser, onClose, onNavigate }: { currentUser: User, onClose: () => void, onNavigate: (p: string) => void }) {
  const [growthData, setGrowthData] = useState<{ rate: number } | null>(null);

  useEffect(() => {
    // Fetch Growth Prediction
    const fetchGrowth = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/founders/growth/${currentUser.id}`);
        const data = await res.json();
        if (data.success) {
          setGrowthData({ rate: data.growth_rate });
        }
      } catch (e) {
        console.error("Failed to fetch growth", e);
      }
    };
    if (currentUser.role === 'founder') {
      fetchGrowth();
    }
  }, [currentUser.id]);

  const baseline = 0.10;
  const isPositive = growthData ? growthData.rate > baseline : false;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
          <X className="w-4 h-4" />
        </button>
        <div className="h-28 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        <div className="px-6 pb-6 -mt-12 text-center">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover bg-white" />
          <h2 className="mt-3 text-xl font-bold text-gray-900">{currentUser.name}</h2>

          {/* Growth Indicator */}
          {growthData && (
            <div className="flex items-center justify-center gap-2 mt-1 mb-2">
              <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-slate-500'}`}>
                {(growthData.rate * 100).toFixed(0)}%
              </span>
              {isPositive && (
                <ArrowUpRight className="w-6 h-6 text-green-500 stroke-[3px]" />
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">{currentUser.headline}</p>
          <button onClick={() => { onClose(); onNavigate('profile'); }} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-lg">
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
}
