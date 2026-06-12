import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import chatService from "../../services/chat.service";
import publicUserService from "../../services/publicUser.service";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const NAVY = "#191970";

const formatDayLabel = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric", month: "long",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
};

const ChatWindow = ({ currentUser, selectedChat, onBack }) => {
  const [messages,  setMessages]  = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true); // ← track loading state
  const bottomRef = useRef();

  useEffect(() => {
    if (!selectedChat?.chatId) return;
    const unsubscribe = chatService.subscribeToMessages(selectedChat.chatId, setMessages);
    return () => unsubscribe();
  }, [selectedChat]);

  // Reset + reload other user whenever chat changes
  useEffect(() => {
    setOtherUser(null);
    setUserLoading(true);

    const loadOtherUser = async () => {
      try {
        const participantIds = Object.keys(selectedChat.participants || {});
        const otherUserId = participantIds.find((id) => id !== currentUser.id);
        if (!otherUserId) { setUserLoading(false); return; }

        const profile = await publicUserService.getPublicProfile(otherUserId);
        // Handle different response shapes
        const user = profile?.user || profile?.data?.user || profile?.data || profile;
        setOtherUser(user);
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };

    if (selectedChat) loadOtherUser();
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat?.chatId || !currentUser?.id) return;
    chatService.markChatAsRead(selectedChat.chatId, currentUser.id);
  }, [selectedChat, currentUser]);

  return (
    <div className="flex flex-col w-full h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">

        {/* Mobile back */}
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          style={{ color: NAVY }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Avatar — shows skeleton while loading */}
        <Link to={otherUser ? `/users/${otherUser?.id || otherUser?._id}` : "#"}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2"
            style={{ borderColor: NAVY + "25", backgroundColor: NAVY + "12" }}
          >
            {userLoading ? (
              /* Skeleton pulse */
              <div className="w-full h-full rounded-full animate-pulse" style={{ backgroundColor: NAVY + "20" }} />
            ) : otherUser?.profileImage?.url ? (
              <img
                src={otherUser.profileImage.url}
                alt={otherUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-black text-sm" style={{ color: NAVY }}>
                {otherUser?.username?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </motion.div>
        </Link>

        {/* Name — shows skeleton while loading */}
        <div className="flex flex-col min-w-0">
          {userLoading ? (
            <div className="h-4 w-24 rounded-lg animate-pulse" style={{ backgroundColor: NAVY + "15" }} />
          ) : (
            <Link
              to={`/users/${otherUser?.id || otherUser?._id}`}
              className="text-sm font-black uppercase tracking-tight transition-opacity hover:opacity-70"
              style={{ color: NAVY }}
            >
              {otherUser?.username || "Unknown User"}
            </Link>
          )}
        </div>

        {/* View profile — only show when loaded */}
        {!userLoading && otherUser && (
          <Link
            to={`/users/${otherUser?.id || otherUser?._id}`}
            className="ml-auto text-[10px] font-black uppercase tracking-widest border rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
            style={{ color: NAVY, borderColor: NAVY + "30" }}
          >
            View Profile
          </Link>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-1" style={{ backgroundColor: "#ECEFF1" }}>
        {messages.map((message, index) => {
          const currentLabel  = formatDayLabel(message.timestamp);
          const previousLabel = messages[index - 1] ? formatDayLabel(messages[index - 1].timestamp) : null;
          const showSeparator = currentLabel !== previousLabel;

          return (
            <div key={message.id}>
              {showSeparator && (
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-300/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap px-2">
                    {currentLabel}
                  </span>
                  <div className="flex-1 h-px bg-gray-300/60" />
                </div>
              )}
              <MessageBubble
                message={message}
                isOwnMessage={message.senderId === currentUser.id}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <MessageInput chatId={selectedChat.chatId} currentUser={currentUser} />
    </div>
  );
};

export default ChatWindow;