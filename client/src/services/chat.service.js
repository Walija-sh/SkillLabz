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

  const messagesRef = ref(db, `chats/${chatId}/messages`);

  const newMessageRef = push(messagesRef);

  const messageData = {
    senderId,
    text: text.trim(),
    timestamp: Date.now(),
  };

  await set(newMessageRef, messageData);

  // Update last message
  await update(ref(db, `chats/${chatId}`), {
    lastMessage: messageData,
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

const chatService = {
  generateChatId,
  createOrGetChat,
  sendMessage,
  subscribeToMessages,
  subscribeToUserChats,
};

export default chatService;