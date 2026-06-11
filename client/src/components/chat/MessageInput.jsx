import { useState } from "react";
import { motion } from "framer-motion";
import chatService from "../../services/chat.service";

const NAVY = "#191970";

const MessageInput = ({ chatId, currentUser }) => {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await chatService.sendMessage({ chatId, senderId: currentUser.id, text });
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        className="
          flex-1 bg-gray-50 border-2 border-gray-100
          rounded-2xl px-4 py-2.5 text-sm font-medium
          outline-none transition-colors
          focus:border-[#191970] focus:bg-white
          placeholder:text-gray-300
        "
      />
      <motion.button
        onClick={handleSend}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!text.trim()}
        className="
          w-10 h-10 rounded-2xl flex items-center justify-center
          text-white flex-shrink-0 transition-opacity
          disabled:opacity-30
        "
        style={{ backgroundColor: NAVY }}
      >
        {/* Upward-pointing send arrow */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default MessageInput;