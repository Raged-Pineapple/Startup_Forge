import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Bookmark, Share2, X, UserX, Flag } from 'lucide-react';
import { Post as PostType, User } from '../App';
import { useState, useRef, useEffect } from 'react';
import { SendPostModal } from './SendPostModal';

type PostProps = {
  post: PostType;
  currentUser: User;
  onLike: () => void;
  onViewProfile: () => void;
  onAddComment: (postId: string, content: string) => void;
  onSave: () => void;
  onRepost: () => void;
  onUnfollow: () => void;
};

export function Post({ post, currentUser, onLike, onViewProfile, onAddComment, onSave, onRepost, onUnfollow }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleSaveVia = () => {
    onSave();
    alert('Post will be saved with a note (feature coming soon)');
    setShowMenu(false);
  };

  const handleNotInterested = () => {
    alert('You will see fewer posts like this');
    setShowMenu(false);
  };

  const handleReport = () => {
    alert('Post reported. Thank you for helping keep our community safe.');
    setShowMenu(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex gap-3">
            <button onClick={onViewProfile}>
              <img 
                src={post.userAvatar} 
                alt={post.userName}
                className="w-12 h-12 rounded-full hover:brightness-95"
              />
            </button>
            <div>
              <button 
                onClick={onViewProfile}
                className="hover:underline text-gray-900"
              >
                {post.userName}
              </button>
              <p className="text-sm text-gray-600">{post.userHeadline}</p>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onSave();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                >
                  <Bookmark className="w-5 h-5" fill={post.saved ? 'currentColor' : 'none'} />
                  <div>
                    <div className="text-gray-900">{post.saved ? 'Unsave' : 'Save'}</div>
                    <div className="text-xs text-gray-500">Save for later</div>
                  </div>
                </button>
                
                <button
                  onClick={handleSaveVia}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                >
                  <Bookmark className="w-5 h-5" />
                  <div>
                    <div className="text-gray-900">Save via</div>
                    <div className="text-xs text-gray-500">Save with a note</div>
                  </div>
                </button>

                <div className="border-t border-gray-200"></div>

                <button
                  onClick={handleNotInterested}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                >
                  <X className="w-5 h-5" />
                  <div>
                    <div className="text-gray-900">Not interested</div>
                    <div className="text-xs text-gray-500">See fewer posts like this</div>
                  </div>
                </button>

                {post.userId !== currentUser.id && (
                  <button
                    onClick={() => {
                      onUnfollow();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                  >
                    <UserX className="w-5 h-5" />
                    <div>
                      <div className="text-gray-900">Unfollow {post.userName}</div>
                      <div className="text-xs text-gray-500">Stop seeing posts from this person</div>
                    </div>
                  </button>
                )}

                <div className="border-t border-gray-200"></div>

                <button
                  onClick={() => {
                    onRepost();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                >
                  <Repeat2 className="w-5 h-5" />
                  <div>
                    <div className="text-gray-900">Repost</div>
                    <div className="text-xs text-gray-500">Share to your network</div>
                  </div>
                </button>

                <button
                  onClick={handleReport}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm"
                >
                  <Flag className="w-5 h-5" />
                  <div>
                    <div className="text-gray-900">Report post</div>
                    <div className="text-xs text-gray-500">Flag inappropriate content</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="w-full">
            <img 
              src={post.image} 
              alt="Post content"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border border-white">
                <ThumbsUp className="w-3 h-3 text-white" fill="white" />
              </div>
            </div>
            <span>{post.likes}</span>
          </div>
          <div className="flex gap-3 text-sm text-gray-600">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:text-blue-600"
            >
              {post.comments.length} comments
            </button>
            <span>{post.reposts} reposts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex justify-between">
          <button
            onClick={onLike}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded hover:bg-gray-100 transition-colors ${
              post.liked ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} />
            <span>Like</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>
          
          <button 
            onClick={onRepost}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Repeat2 className="w-5 h-5" />
            <span>Repost</span>
          </button>
          
          <button 
            onClick={() => setShowSendModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-200">
            {/* Add Comment */}
            <div className="p-4 flex gap-2">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:border-blue-500"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                {commentText && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setCommentText('')}
                      className="px-4 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="px-4 pb-4 space-y-4">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <img 
                      src={comment.userAvatar} 
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <p className="text-sm text-gray-900">{comment.userName}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <div className="flex gap-4 mt-1 px-4 text-xs text-gray-600">
                        <button className="hover:text-blue-600">Like</button>
                        <button className="hover:text-blue-600">Reply</button>
                        <span>{comment.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSendModal && (
        <SendPostModal
          post={post}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}
