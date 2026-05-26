import { useState } from "react";

import chatService from "../../services/chat.service";

const MessageInput = ({
  chatId,
  currentUser,
}) => {

  const [text, setText] = useState("");

  const handleSend = async () => {

    if (!text.trim()) return;

    try {

      await chatService.sendMessage({
        chatId,
        senderId: currentUser.id,
        text,
      });

      setText("");

    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 flex gap-2">

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="
          flex-1 border border-gray-300
          rounded-xl px-4 py-2
          outline-none focus:ring-2 focus:ring-blue-500
        "
      />

      <button
        onClick={handleSend}
        className="
          bg-blue-600 text-white
          px-5 rounded-xl
          hover:bg-blue-700
        "
      >
        Send
      </button>

    </div>
  );
};

export default MessageInput;