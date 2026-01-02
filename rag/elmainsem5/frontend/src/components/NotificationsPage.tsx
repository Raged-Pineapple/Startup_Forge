import { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, UserPlus, Briefcase, TrendingUp } from 'lucide-react';

type NotificationsPageProps = {
  currentUser: any;
  onViewJob: (jobId: string) => void;
  onNavigateToChat: (userId: string) => void;
};

export function NotificationsPage({ currentUser, onViewJob, onNavigateToChat }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: '1',
      type: 'like',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      message: 'Michael Chen and 12 others liked your post',
      timestamp: '2h ago',
      unread: true
    },
    {
      id: '2',
      type: 'comment',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      message: 'Emily Rodriguez commented on your post',
      timestamp: '5h ago',
      unread: true
    },
    {
      id: '3',
      type: 'connection',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      message: 'David Park accepted your connection request',
      timestamp: '1d ago',
      unread: false
    },
    {
      id: '4',
      type: 'job',
      avatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      message: 'New job opening: Senior Product Designer at Tech Corp',
      timestamp: '2d ago',
      unread: false,
      isJob: true
    },
    {
      id: '5',
      type: 'job',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      message: 'You might be interested: UX Designer at StartupXYZ',
      timestamp: '3d ago',
      unread: false,
      isJob: true
    }
  ]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!currentUser?.id) return;
        const res = await fetch('/connections/notifications', {
          headers: { 'x-user-id': currentUser.id }
        });
        const data = await res.json();

        const realNotifs = data.map((n: any) => ({
          id: `conn-${n.id}`,
          type: 'connection',
          avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          message: `User ${n.receiver_id} accepted your connection request`,
          timestamp: new Date(n.responded_at).toLocaleDateString(),
          unread: true,
          metadata: { userId: String(n.receiver_id) }
        }));

        setNotifications(prev => [...realNotifs, ...prev]);

      } catch (e) { console.error(e); }
    };
    fetchNotifications();
  }, [currentUser]);

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'connection' && notification.metadata?.userId) {
      onNavigateToChat(notification.metadata.userId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="w-5 h-5 text-blue-600" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'connection':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'job':
        return <Briefcase className="w-5 h-5 text-orange-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl text-gray-900">Notifications</h1>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <img
                    src={notification.avatar}
                    alt="Notification"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    {getIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>

                  {notification.isJob && (
                    <button
                      onClick={() => onViewJob(notification.id)}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      View job
                    </button>
                  )}
                </div>

                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Job Recommendations Section */}
        <div className="p-6 border-t-4 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900">Recommended jobs for you</h2>
            <button
              onClick={() => onViewJob('all')}
              className="text-sm text-blue-600 hover:underline"
            >
              See all jobs
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop"
                  alt="Company"
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1">
                  <h3 className="text-gray-900">Senior Product Designer</h3>
                  <p className="text-sm text-gray-600">Tech Corp</p>
                  <p className="text-sm text-gray-500 mt-1">San Francisco, CA • $120k-$160k</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Remote</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Full-time</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Posted 2 days ago</p>
                </div>
              </div>
              <button
                onClick={() => onViewJob('job-1')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                View job
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop"
                  alt="Company"
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1">
                  <h3 className="text-gray-900">UX/UI Designer</h3>
                  <p className="text-sm text-gray-600">StartupXYZ</p>
                  <p className="text-sm text-gray-500 mt-1">New York, NY • $100k-$140k</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Full-time</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Hybrid</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Posted 5 days ago</p>
                </div>
              </div>
              <button
                onClick={() => onViewJob('job-2')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                View job
              </button>
            </div>

            <button
              onClick={() => onViewJob('all')}
              className="w-full py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50"
            >
              Explore all jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
