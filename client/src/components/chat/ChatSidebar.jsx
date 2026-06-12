import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import chatService from "../../services/chat.service";
import publicUserService from "../../services/publicUser.service";

const NAVY = "#191970";

const fadeUp = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ChatSidebar = ({ currentUser, selectedChat, setSelectedChat }) => {
  const [chats, setChats]     = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = chatService.subscribeToUserChats(currentUser.id, setChats);
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const loadUsers = async () => {
      const updatedUsers = {};
      for (const chat of chats) {
        const participantIds = Object.keys(chat.participants || {});
        const otherUserId = participantIds.find((id) => id !== currentUser.id);
        if (!otherUserId) continue;
        if (usersMap[otherUserId]) { updatedUsers[otherUserId] = usersMap[otherUserId]; continue; }
        try {
          const response = await publicUserService.getPublicProfile(otherUserId);
          const user = response?.user || response?.data?.user || response?.data;
          if (user) updatedUsers[otherUserId] = user;
        } catch { /* silently skip */ }
      }
      setUsersMap((prev) => ({ ...prev, ...updatedUsers }));
    };
    if (chats.length > 0) loadUsers();
  }, [chats]);

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: NAVY }}>
          Messages
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: NAVY + "0d" }}>
              <svg className="w-6 h-6" style={{ color: NAVY + "40" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-300">No conversations yet</p>
          </div>
        ) : (
          chats.map((chat, i) => {
            const participantIds = Object.keys(chat.participants || {});
            const otherUserId = participantIds.find((id) => id !== currentUser.id);
            const otherUser = usersMap[otherUserId];
            const isActive = selectedChat?.chatId === chat.chatId;
            const unreadCount = chat.unreadCounts?.[currentUser.id] || 0;

            return (
              <motion.button
                key={chat.chatId}
                variants={fadeUp} initial="hidden" animate="visible" custom={i}
                onClick={() => setSelectedChat(chat)}
                className={`
                  w-full flex items-center gap-3 px-5 py-3.5
                  border-b border-gray-50 text-left
                  transition-colors duration-150
                  ${isActive ? "bg-[#191970]/5 border-l-2 border-l-[#191970]" : "hover:bg-gray-50"}
                `}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2"
                  style={{ borderColor: isActive ? NAVY + "30" : "transparent", backgroundColor: NAVY + "15" }}
                >
                  {otherUser?.profileImage?.url ? (
                    <img src={otherUser.profileImage.url} alt={otherUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black" style={{ color: NAVY }}>
                      {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${unreadCount > 0 ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
                    {otherUser?.username || "Loading…"}
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? "font-bold text-gray-600" : "text-gray-400 font-medium"}`}>
                    {chat.lastMessage?.text || "No messages yet"}
                  </div>
                </div>

                {/* Time + badge */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {chat.lastMessage?.timestamp && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {fmtTime(chat.lastMessage.timestamp)}
                    </span>
                  )}
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                        style={{ backgroundColor: "#f06424" }}
                      >
                        {unreadCount}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;