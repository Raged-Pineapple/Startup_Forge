import { X, Search } from 'lucide-react';
import { Post } from '../App';
import { useState } from 'react';

type SendPostModalProps = {
  post: Post;
  onClose: () => void;
};

export function SendPostModal({ post, onClose }: SendPostModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock connections for sending
  const connections = [
    { id: '1', name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
    { id: '2', name: 'Maria Garcia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: '3', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
  ];

  const filteredConnections = searchQuery
    ? connections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : connections;

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSend = () => {
    if (selectedUsers.length > 0) {
      alert(`Post sent to ${selectedUsers.length} connection(s)`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Send post</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto px-6">
          {filteredConnections.map(connection => (
            <button
              key={connection.id}
              onClick={() => handleToggleUser(connection.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(connection.id)}
                onChange={() => {}}
                className="w-5 h-5"
              />
              <img src={connection.avatar} alt={connection.name} className="w-10 h-10 rounded-full" />
              <span className="text-gray-900">{connection.name}</span>
            </button>
          ))}
        </div>

        {/* Message */}
        <div className="px-6 py-4 border-t border-gray-200">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={selectedUsers.length === 0}
            className={`px-6 py-2 rounded-full ${
              selectedUsers.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
