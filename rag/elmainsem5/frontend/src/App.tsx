import { useState, useEffect } from 'react';
import Gun from 'gun/gun';
import 'gun/sea';
import 'gun/axe';

// Components
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { NavigationBar } from './components/NavigationBar';
import { MessagesPage } from './components/MessagesPage';
import { NetworkPage } from './components/NetworkPage';
import { NotificationsPage } from './components/NotificationsPage';
import { JobsPage } from './components/JobsPage';
import { CreatePostModal } from './components/CreatePostModal';

// --- Types ---
export type User = {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  coverImage: string;
  connections: number;
  about: string;
  experience: string;
  education: string;
  role?: string; // Added role
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
};

export type Post = {
  id: string;
  userId: string;
  userName: string;
  userHeadline: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  reposts: number;
  timestamp: string;
  liked: boolean;
  saved: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'image' | 'file';
  fileName?: string;
};

export type Conversation = {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
};

export type ConnectionRequest = {
  id: string;
  userId: string;
  userName: string;
  userHeadline: string;
  userAvatar: string;
  mutualConnections: number;
  // Backend fields
  sender_id?: string;
  sender_role?: string;
  message?: string;
};

// --- Login Component ---
const LoginScreen = ({ onLogin }: { onLogin: (id: string, role: string) => void }) => {
  const [id, setId] = useState('');
  const [role, setRole] = useState('founder');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!id) return alert("Enter ID");
    setLoading(true);

    // Gun Auth Logic (Simulated for this specific React port matching previous logic)
    const alias = `forge_secure_${id}`;
    const pass = `pass_${id}_for_startup_forge_2025`;

    // In a real app we'd pass the gun instance down, but for now we rely on the parent or global gun
    // Note: Since we are inside the component, we'll callback to parent to handle actual gun auth or do it global
    onLogin(id, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: '#0f172a' }}>
      <div className="p-8 rounded-xl w-96 shadow-2xl border border-slate-600" style={{ backgroundColor: '#1e293b' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Startup Forge</h1>
          <p className="text-gray-400 text-sm">Secure Decentralized Chat</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">User ID</label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full rounded p-2 text-white outline-none focus:border-[#00a884] border border-slate-600"
              style={{ backgroundColor: '#0f172a' }}
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded p-2 text-white outline-none focus:border-[#00a884] border border-slate-600"
              style={{ backgroundColor: '#0f172a' }}
            >
              <option value="founder">Founder</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#0f172a] font-bold py-2 rounded mt-4 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  // Gun State
  const [gun, setGun] = useState<any>(null);
  const [gunUser, setGunUser] = useState<any>(null);
  const [userPair, setUserPair] = useState<any>(null); // SEA Keypair

  // UI State
  const [targetChatUserId, setTargetChatUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'messages' | 'network' | 'notifications' | 'jobs'>('home');
  const [viewingUserId, setViewingUserId] = useState<string>('current-user');
  const [history, setHistory] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain State
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  const [currentUser, setCurrentUser] = useState<User>({
    id: '',
    name: '',
    headline: 'Startup Founder',
    avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
    connections: 0,
    about: 'Waiting for bio...',
    experience: '-',
    education: '-'
  });

  // Hardcoded placeholders for now, will replace with API data
  const [users, setUsers] = useState<User[]>([
    {
      id: '2',
      name: 'Bill Gates',
      headline: 'Co-chair, Bill & Melinda Gates Foundation',
      avatar: 'https://cdn-icons-png.flaticon.com/512/147/147144.png',
      role: 'investor',
      connections: 500,
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      about: 'Philanthropist',
      experience: 'Microsoft',
      education: 'Harvard (Dropped out)'
    },
    {
      id: '3',
      name: 'Elon Musk',
      headline: 'CEO of Tesla, SpaceX',
      avatar: 'https://cdn-icons-png.flaticon.com/512/147/147142.png',
      role: 'founder',
      connections: 1000,
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      about: 'Mars Colonizer',
      experience: 'Zip2, PayPal, Tesla, SpaceX',
      education: 'UPenn'
    },
    {
      id: '4',
      name: 'Sam Altman',
      headline: 'CEO of OpenAI',
      avatar: 'https://cdn-icons-png.flaticon.com/512/147/147140.png',
      role: 'founder',
      connections: 800,
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      about: 'Building AGI',
      experience: 'Y Combinator',
      education: 'Stanford (Dropped out)'
    }
  ]);


  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      userId: 'user-1',
      userName: 'Michael Chen',
      userHeadline: 'Software Engineer at Google | Full Stack Developer',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      content: '🚀 Excited to share that our team just launched a new feature that improves page load times by 40%! Big thanks to everyone involved. #webdev #performance',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop',
      likes: 234,
      comments: [],
      reposts: 18,
      timestamp: '2h ago',
      liked: false,
      saved: false
    },
    {
      id: 'post-2',
      userId: 'user-2',
      userName: 'Emily Rodriguez',
      userHeadline: 'Marketing Director | Brand Strategy | Digital Marketing Expert',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      content: 'Just wrapped up an amazing brand strategy workshop with the team. The key to successful branding? Consistency, authenticity, and knowing your audience inside out. What are your top branding tips?',
      likes: 189,
      comments: [],
      reposts: 12,
      timestamp: '5h ago',
      liked: true,
      saved: false
    },
    {
      id: 'post-3',
      userId: 'user-3',
      userName: 'David Park',
      userHeadline: 'Data Scientist | AI & Machine Learning | Python Expert',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      content: 'Working on a fascinating ML project that predicts customer behavior with 92% accuracy. The power of data never ceases to amaze me! 📊 #datascience #machinelearning',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      likes: 312,
      comments: [],
      reposts: 24,
      timestamp: '1d ago',
      liked: false,
      saved: false
    }
  ]);




  const [conversations, setConversations] = useState<Conversation[]>([
    {
      userId: 'user-1',
      userName: 'Michael Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      lastMessage: 'Thanks for the connection!',
      timestamp: '2h ago',
      unread: true
    },
    {
      userId: 'user-2',
      userName: 'Emily Rodriguez',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      lastMessage: 'Would love to discuss the project',
      timestamp: '1d ago',
      unread: false
    }
  ]);

  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    'user-1': [
      {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'current-user',
        content: 'Thanks for the connection!',
        timestamp: '2h ago',
        type: 'text'
      }
    ],
    'user-2': [
      {
        id: 'msg-2',
        senderId: 'user-2',
        receiverId: 'current-user',
        content: 'Would love to discuss the project',
        timestamp: '1d ago',
        type: 'text'
      }
    ]
  });



  const navigateTo = (page: 'home' | 'profile' | 'messages' | 'network' | 'notifications' | 'jobs', userId?: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(page === 'profile' && userId ? `profile-${userId}` : page);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPage(page);
    if (userId) {
      setViewingUserId(userId);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const target = history[newIndex];
      if (target === 'home') {
        setCurrentPage('home');
      } else if (target === 'messages') {
        setCurrentPage('messages');
      } else if (target === 'network') {
        setCurrentPage('network');
      } else if (target === 'notifications') {
        setCurrentPage('notifications');
      } else if (target === 'jobs') {
        setCurrentPage('jobs');
      } else if (target.startsWith('profile-')) {
        setCurrentPage('profile');
        setViewingUserId(target.replace('profile-', ''));
      }
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const target = history[newIndex];
      if (target === 'home') {
        setCurrentPage('home');
      } else if (target === 'messages') {
        setCurrentPage('messages');
      } else if (target === 'network') {
        setCurrentPage('network');
      } else if (target === 'notifications') {
        setCurrentPage('notifications');
      } else if (target === 'jobs') {
        setCurrentPage('jobs');
      } else if (target.startsWith('profile-')) {
        setCurrentPage('profile');
        setViewingUserId(target.replace('profile-', ''));
      }
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  // --- Connection Request Logic ---
  const handleSendConnectionRequest = async (targetUserId: string) => {
    try {
      const res = await fetch('/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          sender_id: currentUser.id,
          sender_role: currentUser.role,
          receiver_id: parseInt(targetUserId),
          receiver_role: 'founder', // simplified for MVP, ideally target user has role
          message: `Hi, I'd like to connect!`
        })
      });

      if (res.ok) {
        // Optimistically update UI or show success
        const newFollowed = new Set(followedUsers);
        newFollowed.add(targetUserId);
        setFollowedUsers(newFollowed);
        alert("Connection request sent!");
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (e) { console.error(e); alert("Network error"); }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleAddComment = (postId: string, content: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          content,
          timestamp: 'Just now'
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleSavePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, saved: !post.saved };
      }
      return post;
    }));
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, reposts: post.reposts + 1 };
      }
      return post;
    }));
  };

  const handleUnfollow = (userId: string) => {
    const newFollowed = new Set(followedUsers);
    newFollowed.delete(userId);
    setFollowedUsers(newFollowed);
  };

  const handleCreatePost = (content: string, image?: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userHeadline: currentUser.headline,
      userAvatar: currentUser.avatar,
      content,
      image,
      likes: 0,
      comments: [],
      reposts: 0,
      timestamp: 'Just now',
      liked: false,
      saved: false
    };
    setPosts([newPost, ...posts]);
  };

  const handleAcceptRequest = (requestId: string) => {
    setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
  };

  const handleRejectRequest = (requestId: string) => {
    setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
  };

  const handleSendMessage = (userId: string, content: string, type: 'text' | 'voice' | 'image' | 'file' = 'text', fileName?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      receiverId: userId,
      content,
      timestamp: 'Just now',
      type,
      fileName
    };

    setMessages({
      ...messages,
      [userId]: [...(messages[userId] || []), newMessage]
    });

    // Update conversation
    setConversations(conversations.map(conv => {
      if (conv.userId === userId) {
        return { ...conv, lastMessage: content, timestamp: 'Just now' };
      }
      return conv;
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = searchQuery
    ? users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.headline.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const viewingUser = viewingUserId === 'current-user'
    ? currentUser
    : users.find(u => u.id === viewingUserId) || currentUser;

  const isOwnProfile = viewingUserId === 'current-user';

  // --- Init Gun on Mount ---
  useEffect(() => {
    // We could init gun here or in the login handler. 
    // For this flow, let's init in login handler to keep it simple.
  }, []);

  const handleAppLogin = (id: string, role: string) => {
    // 1. Init Gun
    const gunInstance = Gun(['http://localhost:8765/gun']);
    setGun(gunInstance);

    const user = gunInstance.user();
    const alias = `forge_secure_${id}`;
    const pass = `pass_${id}_for_startup_forge_2025`;

    user.auth(alias, pass, (ack: any) => {
      if (ack.err) {
        // Try create
        user.create(alias, pass, (reg: any) => {
          if (reg.err) {
            // Handle existing user overlap or error
            if (reg.err.includes("already exists")) {
              // Retry auth just in case
              user.auth(alias, pass, () => finishLogin(id, role, user));
            } else {
              alert(reg.err);
            }
          } else {
            user.auth(alias, pass, () => finishLogin(id, role, user));
          }
        });
      } else {
        finishLogin(id, role, user);
      }
    });

    function finishLogin(id: string, role: string, user: any) {
      setGunUser(user);
      setIsLoggedIn(true);
      setCurrentUser(prev => ({ ...prev, id, name: `User ${id}`, headline: `${role.toUpperCase()} at Startup Forge`, role }));

      // Load Inbox logic here potentially
      // loadInbox(id, role);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleAppLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onBack={goBack}
        onForward={goForward}
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'home') {
            navigateTo('home');
          } else if (page === 'profile') {
            navigateTo('profile', 'current-user');
          } else if (page === 'messages') {
            navigateTo('messages');
          } else if (page === 'network') {
            navigateTo('network');
          } else if (page === 'notifications') {
            navigateTo('notifications');
          } else if (page === 'jobs') {
            navigateTo('jobs');
          }
        }}
        onSearch={handleSearch}
        searchResults={filteredUsers}
        onSelectUser={(userId) => navigateTo('profile', userId)}
      />

      {currentPage === 'home' && (
        <HomePage
          posts={posts}
          currentUser={currentUser}
          onLikePost={handleLikePost}
          onViewProfile={(userId) => navigateTo('profile', userId)}
          onAddComment={handleAddComment}
          onSavePost={handleSavePost}
          onRepost={handleRepost}
          onUnfollow={handleUnfollow}
          onCreatePost={() => setShowCreatePost(true)}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          user={viewingUser}
          isOwnProfile={isOwnProfile}
          isFollowing={followedUsers.has(viewingUserId)}
          onUpdateProfile={handleUpdateProfile}
          onFollowUser={() => handleSendConnectionRequest(viewingUserId)}
          userPosts={posts.filter(p => p.userId === viewingUserId)}
        />
      )}

      {currentPage === 'messages' && (
        <MessagesPage
          // Pass Gun instance and user for real-time logic
          gun={gun}
          gunUser={gunUser}
          currentUser={currentUser}
          onViewProfile={(userId) => navigateTo('profile', userId)}
          targetUserId={targetChatUserId}
        />
      )}

      {currentPage === 'network' && (
        <NetworkPage
          currentUser={currentUser}
          suggestedUsers={users}
          followedUsers={followedUsers}
          connectedUsers={connectedUsers}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onFollowUser={handleSendConnectionRequest}
          onViewProfile={(userId) => navigateTo('profile', userId)}
        />
      )}

      {currentPage === 'notifications' && (
        <NotificationsPage
          currentUser={currentUser}
          onViewJob={(jobId) => navigateTo('jobs')}
          onNavigateToChat={(userId) => {
            setTargetChatUserId(userId);
            navigateTo('messages');
          }}
        />
      )}

      {currentPage === 'jobs' && (
        <JobsPage />
      )}

      {showCreatePost && (
        <CreatePostModal
          currentUser={currentUser}
          users={users}
          onClose={() => setShowCreatePost(false)}
          onPost={handleCreatePost}
        />
      )}
    </div>
  );
}

export default App;
