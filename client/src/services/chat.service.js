import {
  ref,
  set,
  push,
  onValue,
  get,
  update
} from "firebase/database";

import { db } from "../config/firebase";

// ========================================
// Generate deterministic chat ID
// ========================================

const generateChatId = (user1, user2) => {
  return user1 < user2
    ? `${user1}_${user2}`
    : `${user2}_${user1}`;
};

// ========================================
// Create or get chat
// ========================================

const createOrGetChat = async (currentUserId, otherUserId) => {

  const chatId = generateChatId(currentUserId, otherUserId);

  const chatRef = ref(db, `chats/${chatId}`);

  const snapshot = await get(chatRef);

  // Create chat if doesn't exist
  if (!snapshot.exists()) {

 await set(chatRef, {
  participants: {
    [currentUserId]: true,
    [otherUserId]: true,
  },

  createdAt: Date.now(),

  lastMessage: null,

  unreadCounts: {
    [currentUserId]: 0,
    [otherUserId]: 0,
  },
});
  }

  return chatId;
};

// ========================================
// Send message
// ========================================

const sendMessage = async ({
  chatId,
  senderId,
  text,
}) => {

  if (!text.trim()) return;

  const chatRef = ref(db, `chats/${chatId}`);

  const chatSnapshot = await get(chatRef);

  if (!chatSnapshot.exists()) return;

  const chatData = chatSnapshot.val();

  const participantIds = Object.keys(
    chatData.participants || {}
  );

  const receiverId = participantIds.find(
    (id) => id !== senderId
  );

  const messagesRef = ref(
    db,
    `chats/${chatId}/messages`
  );

  const newMessageRef = push(messagesRef);

  const messageData = {
    senderId,
    text: text.trim(),
    timestamp: Date.now(),
  };

  // Save message
  await set(newMessageRef, messageData);

  // Current unread count
  const currentUnread =
    chatData.unreadCounts?.[receiverId] || 0;

  // Update chat metadata
  await update(chatRef, {

    lastMessage: messageData,

    unreadCounts: {

      ...chatData.unreadCounts,

      [receiverId]: currentUnread + 1,

      [senderId]: 0,
    },
  });
};
// ========================================
// Subscribe to messages
// ========================================

const subscribeToMessages = (chatId, callback) => {

  const messagesRef = ref(db, `chats/${chatId}/messages`);

  return onValue(messagesRef, (snapshot) => {

    const data = snapshot.val();

    if (!data) {
      callback([]);
      return;
    }

    const messages = Object.entries(data).map(([id, value]) => ({
      id,
      ...value,
    }));

    messages.sort((a, b) => a.timestamp - b.timestamp);

    callback(messages);
  });
};

// ========================================
// Subscribe to user chats
// ========================================

const subscribeToUserChats = (userId, callback) => {

  const chatsRef = ref(db, "chats");

  return onValue(chatsRef, (snapshot) => {

    const data = snapshot.val();

    if (!data) {
      callback([]);
      return;
    }

    const chats = [];

    Object.entries(data).forEach(([chatId, chat]) => {

      if (chat.participants?.[userId]) {

        chats.push({
          chatId,
          ...chat,
        });
      }
    });

    chats.sort((a, b) => {
      return (
        (b.lastMessage?.timestamp || 0)
        -
        (a.lastMessage?.timestamp || 0)
      );
    });

    callback(chats);
  });
};

const markChatAsRead = async (
  chatId,
  userId
) => {

  const chatRef = ref(db, `chats/${chatId}`);

  const snapshot = await get(chatRef);

  if (!snapshot.exists()) return;

  const chatData = snapshot.val();

  await update(chatRef, {
    unreadCounts: {
      ...chatData.unreadCounts,
      [userId]: 0,
    },
  });
};

const getChat = async (chatId) => {
  const chatRef = ref(db, `chats/${chatId}`);

  const snapshot = await get(chatRef);

  if (!snapshot.exists()) return null;

  return {
    chatId,
    ...snapshot.val(),
  };
};
const chatService = {
  generateChatId,
  createOrGetChat,
  sendMessage,
  subscribeToMessages,
  subscribeToUserChats,
  markChatAsRead,
  getChat,
};

export default chatService;