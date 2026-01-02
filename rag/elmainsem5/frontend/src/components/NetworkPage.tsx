import { useState, useEffect } from 'react';
// Local interface to avoid collision with Gun or other types
interface AppUser {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  connections: number;
}
import { UserPlus, UserCheck, X, Check } from 'lucide-react';

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
  suggestedUsers: AppUser[];
  followedUsers: Set<string>;
  connectedUsers: Set<string>;
  onRejectRequest: (id: string) => void;
  onFollowUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onAcceptRequest: (id: string) => void;
}

export function NetworkPage({
  currentUser,
  suggestedUsers,
  followedUsers,
  connectedUsers,
  onRejectRequest,
  onAcceptRequest,
  onFollowUser,
  onViewProfile
}: NetworkPageProps) {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);

  const fetchRequests = async () => {
    try {
      if (!currentUser.id) return;
      const res = await fetch('/connections/requests/incoming', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          userId: String(r.sender_id),
          userName: `User ${r.sender_id}`,
          userHeadline: r.sender_role || 'Founder',
          userAvatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          mutualConnections: 0
        }));
        setRequests(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  useEffect(() => {
    if (currentUser.id) {
      fetchRequests();
    }
  }, [currentUser.id]);

  const handleAcceptInternal = async (reqId: string) => {
    try {
      await fetch(`/connections/accept/${reqId}`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      onAcceptRequest(reqId);
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">

      {/* Connection Requests */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
          <span className="text-gray-500">{requests.length} pending</span>
        </div>

        <div className="divide-y divide-gray-100">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending invitations</div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => onViewProfile(request.userId)}>
                  <img
                    src={request.userAvatar}
                    alt={request.userName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.userName}</h3>
                    <p className="text-gray-600 text-sm">{request.userHeadline}</p>
                    <p className="text-gray-500 text-xs mt-1">{request.mutualConnections} mutual connections</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRejectRequest(request.id)}
                    className="px-6 py-1.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleAcceptInternal(request.id)}
                    className="px-6 py-1.5 text-blue-600 border border-blue-600 font-medium rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl text-gray-900 mb-4">People you may know</h2>

        <div className="grid grid-cols-2 gap-4">
          {suggestedUsers.map(user => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <button onClick={() => onViewProfile(user.id)} className="w-full">
                <div className="relative mb-3">
                  <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-lg"></div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-4 border-white absolute -bottom-8 left-1/2 -translate-x-1/2"
                  />
                </div>
                <div className="mt-10 text-center">
                  <h3 className="text-gray-900 hover:underline">{user.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.headline}</p>
                  <p className="text-xs text-gray-500 mt-2">{user.connections} connections</p>
                </div>
              </button>

              <button
                onClick={() => !connectedUsers.has(user.id) && onFollowUser(user.id)}
                disabled={connectedUsers.has(user.id)}
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 transition-colors ${connectedUsers.has(user.id)
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : followedUsers.has(user.id)
                    ? 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {connectedUsers.has(user.id) ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Connected
                  </>
                ) : followedUsers.has(user.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    Pending
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
