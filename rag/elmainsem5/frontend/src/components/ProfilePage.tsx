import { useState, useRef } from 'react';
import { User, Post } from '../App';
import { Camera, Edit2, MapPin, Link as LinkIcon } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

type ProfilePageProps = {
  user: User;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onUpdateProfile: (user: User) => void;
  onFollowUser: () => void;
  userPosts: Post[];
};

export function ProfilePage({ user, isOwnProfile, isFollowing, onUpdateProfile, onFollowUser, userPosts }: ProfilePageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(user.avatar);
  const [coverImage, setCoverImage] = useState(user.coverImage);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'experience' | 'education' | 'skills'>('about');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        onUpdateProfile({ ...user, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverImage(result);
        onUpdateProfile({ ...user, coverImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600">
          <img 
            src={coverImage} 
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isOwnProfile && (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
            >
              <Camera className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
          />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="relative">
              <img 
                src={profileImage} 
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              {isOwnProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 border border-gray-200"
                >
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            
            <div className="flex gap-2 mt-16">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={onFollowUser}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    isFollowing
                      ? 'border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-gray-900 text-2xl">{user.name}</h1>
            <p className="text-gray-600 mt-1">{user.headline}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </span>
              <span className="text-blue-600">{user.connections} connections</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'experience'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'education'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Education
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'skills'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Skills
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {activeTab === 'about' && (
            <div>
              <h2 className="text-gray-900 text-xl mb-3">About</h2>
              <p className="text-gray-700">{user.about}</p>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h2 className="text-gray-900 text-xl mb-4">Posts</h2>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="Post" className="mt-3 rounded-lg w-full" />
                      )}
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>{post.likes} likes</span>
                        <span>{post.comments.length} comments</span>
                        <span className="text-gray-500">{post.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No posts yet</p>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <h2 className="text-gray-900 text-xl mb-4">Experience</h2>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">{user.experience}</h3>
                  <p className="text-sm text-gray-600">2020 - Present</p>
                  <p className="text-sm text-gray-600 mt-2">Leading product design initiatives and managing a team of designers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <h2 className="text-gray-900 text-xl mb-4">Education</h2>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">{user.education}</h3>
                  <p className="text-sm text-gray-600">2012 - 2016</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h2 className="text-gray-900 text-xl mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">User Experience Design</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Product Strategy</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Figma</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Design Systems</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Prototyping</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">User Research</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSave={(updatedUser) => {
            onUpdateProfile(updatedUser);
            setIsEditingProfile(false);
          }}
        />
      )}
    </div>
  );
}