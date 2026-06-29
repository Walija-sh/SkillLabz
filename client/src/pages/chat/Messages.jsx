import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import chatService from "../../services/chat.service";

const Messages = () => {
  const user = useSelector((state) => state.auth.userData);
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const chatIdFromURL = searchParams.get("chat");

  useEffect(() => {
  if (!chatIdFromURL) return;

  const loadChat = async () => {
    try {
      const chat = await chatService.getChat(chatIdFromURL);

      if (chat) {
        setSelectedChat(chat);
      }
    } catch (err) {
      console.error(err);
    }

    setShowMobileChat(true);
  };

  loadChat();
}, [chatIdFromURL]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleBack = () => setShowMobileChat(false);

  return (
    <div
      className="h-[calc(100vh-80px)] flex overflow-hidden"
      style={{ backgroundColor: "#ECEFF1" }}
    >
      {/* ── Sidebar ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`
          ${showMobileChat ? "hidden md:flex" : "flex"}
          w-full md:w-[320px] flex-col
          bg-white border-r border-gray-200
          rounded-none md:rounded-2xl md:m-4 md:mr-0
          shadow-sm overflow-hidden flex-shrink-0
        `}
      >
        <ChatSidebar
          currentUser={user}
          selectedChat={selectedChat}
          setSelectedChat={handleSelectChat}
        />
      </motion.div>

      {/* ── Chat Window ── */}
      <div
        className={`
          ${showMobileChat ? "flex" : "hidden md:flex"}
          flex-1 md:m-4 overflow-hidden
        `}
      >
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat.chatId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <ChatWindow
                currentUser={user}
                selectedChat={selectedChat}
                onBack={handleBack}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex flex-1 flex-col items-center justify-center bg-white rounded-2xl shadow-sm"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "#191970" + "10" }}
              >
                <svg className="w-8 h-8" style={{ color: "#191970" + "40" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-300">
                Select a conversation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;