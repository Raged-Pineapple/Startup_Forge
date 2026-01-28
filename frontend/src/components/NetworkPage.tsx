import React, { useState, useEffect } from 'react';
import { Users, Bell, MessageSquare, BrainCircuit, Sparkles, UserPlus, UserCheck, X, Check, TrendingUp, Home } from 'lucide-react';

// --- Types ---
interface AppUser {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  connections: number;
}

interface ConnectionRequest {
  id: string;
  userId: string;
  userName: string;
  userHeadline: string;
  userAvatar: string;
  mutualConnections: number;
}

interface NetworkPageProps {
  currentUser: AppUser;
  suggestedUsers: AppUser[]; // Kept for backward compat or other sections
  founders: AppUser[];
  investors: AppUser[];
  followedUsers: Set<string>;
  connectedUsers: Set<string>;
  onRejectRequest: (id: string) => void;
  onFollowUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onAcceptRequest: (id: string) => void;
  onNavigate: (page: string) => void;
  onSearch?: (query: string) => void;
}

export function NetworkPage({
  currentUser,
  // founders - unused
  // investors - unused
  followedUsers,
  connectedUsers,
  onRejectRequest,
  onAcceptRequest,
  onFollowUser,
  onViewProfile,
  onNavigate,
  onSearch
}: NetworkPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Local state for Real Data
  const [realFounders, setRealFounders] = useState<AppUser[]>([]);
  const [realInvestors, setRealInvestors] = useState<AppUser[]>([]);

  // Fetch Connection Requests (Invitations)
  const fetchRequests = async () => {
    try {
      if (!currentUser.id) return;
      // Fetch Connection Requests
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/connections/requests/incoming`, {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          userId: String(r.sender_id),
          userName: r.sender_name || `User ${r.sender_id}`,
          userHeadline: r.sender_headline || r.sender_role || 'Founder',
          userAvatar: r.sender_avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          mutualConnections: 0
        }));
        setRequests(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  // Fetch All Users for Network (Founders & Investors)
  const fetchNetwork = async () => {
    if (!currentUser.id) return;
    try {
      console.log("Fetching network for user:", currentUser.id);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [fRes, iRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/founders`, { headers: { 'x-user-id': currentUser.id } }),
        fetch(`${apiUrl}/api/users/investors`, { headers: { 'x-user-id': currentUser.id } })
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        console.log("Founders fetched:", fData.length);
        setRealFounders(fData);
      } else {
        console.error("Founders fetch failed:", fRes.status);
      }

      if (iRes.ok) {
        const iData = await iRes.json();
        console.log("Investors fetched:", iData.length);
        setRealInvestors(iData);
      } else {
        console.error("Investors fetch failed:", iRes.status);
      }
    } catch (e) {
      console.error("Failed to fetch network data", e);
    }
  };

  useEffect(() => {
    if (currentUser.id) {
      fetchRequests();
      fetchNetwork();
    }
  }, [currentUser.id]);

  const handleAcceptInternal = async (reqId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/connections/accept/${reqId}`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      onAcceptRequest(reqId);
      fetchRequests();
      fetchNetwork(); // Refresh network status
    } catch (e) { console.error(e); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  // --- Render Helpers ---

  const renderTopProfiles = (users: AppUser[]) => (
    <div className="flex flex-row gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar px-1">
      {users.slice(0, 5).map((user) => (
        <div key={user.id} className="flex flex-col items-center min-w-[100px] p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group border border-transparent hover:border-slate-100 relative" onClick={() => onViewProfile(user.id)}>
          <div className="relative mb-3 transform group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-[3px] border-white shadow-md object-cover relative z-10"
            />
            {connectedUsers.has(user.id) && (
              <div className="absolute bottom-1 right-0 bg-emerald-500 border-[3px] border-white rounded-full p-0.5 z-20 shadow-sm">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <span className="text-sm font-bold text-slate-800 text-center leading-tight line-clamp-1 w-full group-hover:text-indigo-600 transition-colors">{user.name}</span>
          <span className="text-[10px] font-semibold text-slate-400 text-center truncate w-full mt-1 bg-slate-50 px-2 py-0.5 rounded-full">{user.headline}</span>
        </div>
      ))}
    </div>
  );

  const renderUserCard = (user: AppUser) => (
    <div key={user.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:border-indigo-100 group hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0" onClick={() => onViewProfile(user.id)}>
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm group-hover:shadow-md transition-all cursor-pointer" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${connectedUsers.has(user.id) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <h4 className="font-bold text-slate-800 text-[15px] truncate group-hover:text-indigo-600 transition-colors cursor-pointer tracking-tight">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-medium text-slate-500 line-clamp-1 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{user.headline}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Users className="w-3 h-3 text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{user.connections} connections</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (user.id === currentUser.id) return;
            if (!connectedUsers.has(user.id) && !(user as any).isConnected) {
              onFollowUser(user.id);
              // Optimistic update
              (user as any).isConnected = true;
            }
          }}
          disabled={connectedUsers.has(user.id) || (user as any).isConnected}
          className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-sm flex-shrink-0 ${connectedUsers.has(user.id) || (user as any).isConnected
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : followedUsers.has(user.id)
              ? 'bg-slate-50 text-slate-400 border border-slate-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md'
            }`}
        >
          {connectedUsers.has(user.id) || (user as any).isConnected ? <UserCheck className="w-5 h-5" /> : followedUsers.has(user.id) ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* --- Fixed Header (Exact Match to HomePage) --- */}
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
          <div className="flex-1 flex justify-center max-w-3xl px-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <div className="bg-slate-800 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
              </div>
              <input
                type="text"
                className="w-full pl-20 pr-20 py-4 bg-slate-900 border border-slate-700 focus:border-slate-500 focus:ring-4 focus:ring-slate-800 rounded-2xl text-base transition-all placeholder-white font-medium outline-none shadow-sm text-white hover:shadow-md hover:border-slate-600"
                placeholder="Ask anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs">|</span>
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 border border-slate-600 border-b-2 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider">
                    ⌘ K
                  </kbd>
                </div>
              </div>
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ActionItem icon={<Home />} label="Home" onClick={() => onNavigate('home')} />
            <ActionItem icon={<Users />} label="Network" onClick={() => onNavigate('network')} active={true} />
            <ActionItem icon={<Bell />} label="Alerts" badge={true} onClick={() => onNavigate('notifications')} />
            <ActionItem icon={<MessageSquare />} label="Inbox" onClick={() => onNavigate('messages')} />
            <ActionItem icon={<BrainCircuit />} label="Deep Analysis" onClick={() => onNavigate('conflict-report')} />
          </div>
        </div>
      </div>

      {/* --- Main Network Content --- */}
      <div className="flex-1 overflow-y-auto w-full max-w-[1700px] mx-auto p-8" style={{ height: 'calc(100vh - 6rem)' }}>

        {/* Invitations Section (If any) */}
        {requests.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl text-white"><UserPlus className="w-5 h-5" /></div>
                <h2 className="text-xl font-bold text-slate-900">Connections Pending</h2>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-200">{requests.length} New</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-100 rounded-2xl hover:shadow-md transition-all hover:bg-white group">
                  <div className="flex items-center gap-4">
                    <img src={request.userAvatar} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{request.userName}</h4>
                      <p className="text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md inline-block shadow-sm mt-1">{request.userHeadline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onRejectRequest(request.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-colors shadow-sm"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleAcceptInternal(request.id)} className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-md hover:scale-105"><Check className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2 Halves Layout */}
        <div className="flex flex-row gap-8 h-full">

          {/* LEFT: Founder Connections */}
          <div className="flex-1 flex flex-col gap-6 h-full min-w-0 animate-in slide-in-from-left-4 duration-500 fade-in">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><Users className="w-5 h-5 text-indigo-600" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight"><b>Founder Network</b></h3>
                  <p className="text-xs text-slate-500 font-medium"><b>Connect with fellow visionaries</b></p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
                {/* Top 5 Small Profile Container */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"><b>Recently Active</b></h4>
                    <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                  </div>
                  {renderTopProfiles(realFounders)}
                </div>

                {/* All Founders Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"><b>Discover Founders</b></h4>
                    <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {realFounders.map(renderUserCard)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Investor Connections */}
          <div className="flex-1 flex flex-col gap-6 h-full min-w-0 animate-in slide-in-from-right-4 duration-500 fade-in">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight"><b>Investor Network</b></h3>
                  <p className="text-xs text-slate-500 font-medium"><b>Find your next round</b></p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
                {/* Top 5 Small Profile Container */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"><b>Top VCs & Angels</b></h4>
                    <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                  </div>
                  {renderTopProfiles(realInvestors)}
                </div>

                {/* All Investors Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"><b>Explore Investors</b></h4>
                    <span className="h-px flex-1 bg-slate-200 ml-4"></span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {realInvestors.map(renderUserCard)}
                  </div>
                </div>
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
    </div>
  );
}

// --- Sub-components (Copied for consistency) ---

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

function ProfileModal({ currentUser, onClose, onNavigate }: { currentUser: AppUser, onClose: () => void, onNavigate: (p: string) => void }) {
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
          <p className="text-sm text-gray-500 mb-4">{currentUser.headline}</p>
          <button onClick={() => { onClose(); onNavigate('profile'); }} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-lg">
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
}
