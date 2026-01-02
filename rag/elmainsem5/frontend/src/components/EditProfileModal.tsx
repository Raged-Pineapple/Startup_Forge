import { useState } from 'react';
import { User } from '../App';
import { X } from 'lucide-react';

type EditProfileModalProps = {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
};

export function EditProfileModal({ user, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [headline, setHeadline] = useState(user.headline);
  const [about, setAbout] = useState(user.about);
  const [experience, setExperience] = useState(user.experience);
  const [education, setEducation] = useState(user.education);

  const handleSave = () => {
    onSave({
      ...user,
      name,
      headline,
      about,
      experience,
      education
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Name*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Headline*
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Your professional headline"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              About
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Current Experience
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Your current position"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Your education background"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
