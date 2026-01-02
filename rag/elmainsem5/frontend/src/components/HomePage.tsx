import { Post as PostType, User } from '../App';
import { Post } from './Post';
import { Image, Video, Calendar, FileText, Plus } from 'lucide-react';

type HomePageProps = {
  posts: PostType[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onViewProfile: (userId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onSavePost: (postId: string) => void;
  onRepost: (postId: string) => void;
  onUnfollow: (userId: string) => void;
  onCreatePost: () => void;
};

export function HomePage({ posts, currentUser, onLikePost, onViewProfile, onAddComment, onSavePost, onRepost, onUnfollow, onCreatePost }: HomePageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-20">
            <div className="relative h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            </div>
            <div className="px-4 pb-4 -mt-8">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-16 h-16 rounded-full border-4 border-white mb-2"
              />
              <button
                onClick={() => onViewProfile('current-user')}
                className="hover:underline text-left w-full"
              >
                <h3 className="text-gray-900">{currentUser.name}</h3>
              </button>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{currentUser.headline}</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Connections</span>
                <span className="text-blue-600">{currentUser.connections}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-gray-700">Access exclusive tools & insights</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3 h-3 bg-yellow-600 rounded-sm"></div>
                <span className="text-xs">Try Premium for free</span>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                <span>My items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-6">
          {/* Create Post Box */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex gap-2 items-center mb-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-12 h-12 rounded-full"
              />
              <button 
                onClick={onCreatePost}
                className="flex-1 text-left px-4 py-3 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600"
              >
                Start a post
              </button>
            </div>
            <div className="flex justify-between pt-2">
              <button 
                onClick={onCreatePost}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-600"
              >
                <Image className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Photo</span>
              </button>
              <button 
                onClick={onCreatePost}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-600"
              >
                <Video className="w-5 h-5 text-green-500" />
                <span className="text-sm">Video</span>
              </button>
              <button 
                onClick={onCreatePost}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-600"
              >
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Event</span>
              </button>
              <button 
                onClick={onCreatePost}
                className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-600"
              >
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm">Article</span>
              </button>
            </div>
          </div>

          <div className="border-b border-gray-300 mb-4"></div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map(post => (
              <Post 
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={() => onLikePost(post.id)}
                onViewProfile={() => onViewProfile(post.userId)}
                onAddComment={onAddComment}
                onSave={() => onSavePost(post.id)}
                onRepost={() => onRepost(post.id)}
                onUnfollow={() => onUnfollow(post.userId)}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">LinkedIn News</h3>
            </div>
            <div className="space-y-3">
              <div className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <h4 className="text-sm text-gray-900 hover:text-blue-600">Tech layoffs continue</h4>
                    <p className="text-xs text-gray-600">2d ago • 12,450 readers</p>
                  </div>
                </div>
              </div>
              <div className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <h4 className="text-sm text-gray-900 hover:text-blue-600">AI reshaping industries</h4>
                    <p className="text-xs text-gray-600">5h ago • 8,234 readers</p>
                  </div>
                </div>
              </div>
              <div className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <h4 className="text-sm text-gray-900 hover:text-blue-600">Remote work trends 2025</h4>
                    <p className="text-xs text-gray-600">1d ago • 15,890 readers</p>
                  </div>
                </div>
              </div>
              <div className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <h4 className="text-sm text-gray-900 hover:text-blue-600">Startup funding surge</h4>
                    <p className="text-xs text-gray-600">3d ago • 6,721 readers</p>
                  </div>
                </div>
              </div>
              <div className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <h4 className="text-sm text-gray-900 hover:text-blue-600">Future of work insights</h4>
                    <p className="text-xs text-gray-600">4d ago • 9,123 readers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}