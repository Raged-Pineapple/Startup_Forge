import Gun from 'gun';
import 'gun/sea';

const gun = Gun(['http://localhost:8765/gun']);
const user = gun.user();

export const chatUtils = {
  // Enforce auth check
  isAuth: () => !!user.is,

  // Secure Encryption with SEA
  // Note: Standard 1-to-1 chat would use SEA.secret(otherPub, userPair)
  // For this backend-gated room, we use the roomKey as a shared secret
  encrypt: async (text, secret) => {
    if (!user.is) throw new Error("Not authenticated");
    return await Gun.SEA.encrypt(text, secret);
  },

  decrypt: async (encrypted, secret) => {
    return await Gun.SEA.decrypt(encrypted, secret);
  },

  // Send message with public key identity
  send: (roomNode, data) => {
    if (!user.is) return;
    roomNode.set({
      ...data,
      sender: user.is.pub,
      ts: Date.now()
    });
  },

  // Cleanup listeners
  off: (node) => {
    if (node) node.off();
  }
};
