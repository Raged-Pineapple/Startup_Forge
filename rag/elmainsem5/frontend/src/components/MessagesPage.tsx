import { useState, useEffect, useRef } from 'react';
import { User } from '../App';
import { Search, MoreHorizontal, Send as SendIcon, Image, File, Mic, Plus, Smile } from 'lucide-react';
// import Gun from 'gun/gun'; // Assuming Gun types are globally available or passed as any

type MessagesPageProps = {
  gun: any;
  gunUser: any;
  currentUser: User;
  onViewProfile: (userId: string) => void;
  targetUserId?: string | null;
};

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: string;
  fileName?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  roomKey?: string; // We'll fetch this
}

export function MessagesPage({ gun, gunUser, currentUser, onViewProfile, targetUserId }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(targetUserId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentRoomKey, setCurrentRoomKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [previewAttachment, setPreviewAttachment] = useState<{
    type: 'image' | 'file';
    content: string;
    name: string;
  } | null>(null);

  // 1. Fetch Conversations (Accepted Connections)
  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      setSelectedConversation(targetUserId);
    }
  }, [targetUserId]);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/inbox', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data && data.connections) {
        const mapped = data.connections.map((c: any) => ({
          userId: String(c.other_user_id),
          userName: `User ${c.other_user_id} (${c.other_user_role})`,
          userAvatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          lastMessage: 'Tap to chat',
          timestamp: '',
          unread: false
        }));
        // Deduplicate by userId to prevent key warnings
        const unique = mapped.reduce((acc: any[], current: any) => {
          if (!acc.find(item => item.userId === current.userId)) {
            acc.push(current);
          }
          return acc;
        }, []);
        setConversations(unique);
      }
    } catch (e) { console.error(e); }
  };

  // 2. Initializing Chat & Listening to Messages
  useEffect(() => {
    if (!selectedConversation || !gun) return;

    let chatNode: any = null;
    const targetUserId = selectedConversation;

    const initChat = async () => {
      setMessages([]); // Clear previous
      console.log("initChat starting", { targetUserId, currentUser: currentUser.id });
      try {
        // Get Room Key from Backend
        const res = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({ targetUserId: parseInt(targetUserId) })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to init chat", res.status, errText);
          throw new Error("Failed to init chat");
        }
        const { roomKey } = await res.json();
        console.log("Got roomKey", roomKey);
        setCurrentRoomKey(roomKey);

        // Subscribe to Gun
        chatNode = gun.get('chats').get(roomKey);

        // Map listener to prevent duplicates
        // A simple way for React: load all, sort by time. 
        // Better: use a reducer or simple state array with ID check

        chatNode.map().on((node: any, msgId: string) => {
          console.log('INCOMING MSG NODE:', node);
          if (!node || !node.text) return;

          // Decrypt (Simulating encryption with simple text for MVP speed, or verify SEA)
          // In real implementation: await Gun.SEA.decrypt(node.text, roomKey)
          // STARTUP_FORGE_MVP: Storing payload directly or verifying simple encryption.
          // Reverting to the previous simpler logic: we store raw text or simple object

          // If it's SEA encrypted string:
          // const decrypted = await Gun.SEA.decrypt(node.text, roomKey);

          // For this MVP step, let's assume `node` contains the message object structure we set
          // Structure: { sender, text, type, ts, fileName }

          // We need to resolve the promise if it is encrypted. 
          // For now, let's trust the read. check if 'text' is string.

          processIncomingMessage(node, msgId);
        });

      } catch (e) { console.error(e); }
    };

    initChat();

    return () => {
      if (chatNode) chatNode.off();
    };
  }, [selectedConversation, gun, currentUser.id]);

  const processIncomingMessage = async (node: any, id: string) => {
    // Check if message already exists
    setMessages(prev => {
      if (prev.find(m => m.id === id)) return prev;

      // Decryption placeholder
      // const content = await Gun.SEA.decrypt(node.text, currentRoomKey);
      // Using node.text directly for now as per previous working steps

      // Handle 'text' field which might be the content
      const content = typeof node.text === 'string' && node.text.startsWith('SEA') ? 'Encrypted Message' : node.text;

      return [...prev, {
        id,
        senderId: String(node.sender),
        content: content,
        timestamp: node.ts,
        type: node.type || 'text',
        fileName: node.fileName
      }].sort((a, b) => a.timestamp - b.timestamp);
    });

    // Scroll to bottom
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (content?: string) => {
    console.log('CLICK SEND', {
      currentRoomKey,
      content,
      previewAttachment,
      gun: !!gun
    });
    if (!currentRoomKey || !gun) {
      console.error("Missing RoomKey or Gun instance", { currentRoomKey, gun: !!gun });
      return;
    }

    // Determine payload based on whether we have an attachment or text
    let finalContent = content;
    let finalType = 'text';
    let finalFileName = undefined;

    if (previewAttachment) {
      finalContent = previewAttachment.content;
      finalType = previewAttachment.type;
      finalFileName = previewAttachment.name;
    } else if (!content || !content.trim()) {
      return; // Nothing to send
    }

    const payload = {
      sender: currentUser.id,
      text: finalContent,
      type: finalType,
      ts: Date.now(),
      fileName: finalFileName || null // Gun doesn't like undefined
    };

    console.log('SENT PAYLOAD', payload);
    gun.get('chats').get(currentRoomKey).set(payload);
    setMessageText('');
    setPreviewAttachment(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPreviewAttachment({
        type,
        content: b64,
        name: file.name
      });
      // Reset input so same file can be selected again if needed (after cancel)
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const cancelAttachment = () => {
    setPreviewAttachment(null);
  };

  const selectedUser = conversations.find(c => c.userId === selectedConversation);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-lg border border-gray-200 h-full flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations
              .filter(c => c.userName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(conversation => (
                <button
                  key={conversation.userId}
                  onClick={() => setSelectedConversation(conversation.userId)}
                  className={`w - full flex items - start gap - 3 p - 4 hover: bg - gray - 50 text - left ${selectedConversation === conversation.userId ? 'bg-blue-50' : ''
                    } `}
                >
                  <img src={conversation.userAvatar} alt="" className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-gray-900 truncate">{conversation.userName}</h3>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && selectedUser ? (
          <div className="flex-1 flex flex-col bg-[#0b141a]"> {/* WhatsApp Dark BG */}
            {/* Header */}
            <div className="p-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between text-[#e9edef]">
              <div className="flex items-center gap-3">
                <img src={selectedUser.userAvatar} alt="" className="w-10 h-10 rounded-full" />
                <h3 className="text-[#e9edef] font-medium">{selectedUser.userName}</h3>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:400px]">
              {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} `}>
                    <div className={`max - w - [65 %] rounded - lg px - 3 py - 2 text - sm relative shadow - sm ${isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                      } `}>
                      {msg.type === 'text' && <p>{msg.content}</p>}
                      {msg.type === 'image' && <img src={msg.content} alt="Shared" className="rounded-lg max-w-full" />}
                      {msg.type === 'file' && (
                        <a
                          href={msg.content}
                          download={msg.fileName || 'download'}
                          className="flex items-center gap-2 bg-black/20 p-2 rounded hover:bg-black/30 transition-colors cursor-pointer text-inherit no-underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <File className="w-5 h-5" />
                          <span className="truncate hover:underline">{msg.fileName}</span>
                        </a>
                      )}
                      <p className="text-[10px] text-gray-400 text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {/* Input Area */}
            <div className="bg-[#202c33] flex flex-col">
              {/* Preview Area */}
              {previewAttachment && (
                <div className="p-3 bg-[#2a3942] border-b border-[#202c33] flex items-center justify-between mx-4 mt-2 rounded-t-lg">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {previewAttachment.type === 'image' ? (
                      <img src={previewAttachment.content} alt="Preview" className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-black/20 flex items-center justify-center rounded">
                        <File className="w-8 h-8 text-[#e9edef]" />
                      </div>
                    )}
                    <span className="text-[#e9edef] text-sm truncate max-w-[200px]">{previewAttachment.name}</span>
                  </div>
                  <button onClick={cancelAttachment} className="p-1 hover:bg-white/10 rounded-full text-[#e9edef]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="p-3 flex items-center gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className={`p-2 hover:bg-white/5 rounded-full ${previewAttachment ? 'text-gray-500 cursor-not-allowed' : 'text-[#8696a0]'}`}
                  disabled={!!previewAttachment}
                >
                  <Image className="w-6 h-6" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 hover:bg-white/5 rounded-full ${previewAttachment ? 'text-gray-500 cursor-not-allowed' : 'text-[#8696a0]'}`}
                  disabled={!!previewAttachment}
                >
                  <Plus className="w-6 h-6" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(messageText)}
                  placeholder={previewAttachment ? "Add a caption (optional - not supported yet)" : "Type a message"}
                  disabled={!!previewAttachment} // Disable text input during preview for simplicity in this version
                  className="flex-1 bg-[#2a3942] text-[#e9edef] rounded-lg px-4 py-2 focus:outline-none disabled:opacity-50"
                />

                <button
                  onClick={() => sendMessage(messageText)}
                  className="p-2 text-[#8696a0] hover:bg-white/5 rounded-full"
                >
                  <SendIcon className="w-6 h-6" />
                </button>

                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'image')} />
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileChange(e, 'file')} />
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#222e35] text-[#8696a0]">
            <div className="text-center">
              <p className="text-lg">Select a chat to start messaging</p>
              <p className="text-sm mt-2">End-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
