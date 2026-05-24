import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import chatService from "../../services/chat.service";
import publicUserService from "../../services/publicUser.service";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({
  currentUser,
  selectedChat,
  onBack,
}) => {

  const [messages, setMessages] =
    useState([]);

  const [otherUser, setOtherUser] =
    useState(null);

  const bottomRef = useRef();

  // ========================================
  // Load messages
  // ========================================

  useEffect(() => {

    if (!selectedChat?.chatId) return;

    const unsubscribe =
      chatService.subscribeToMessages(
        selectedChat.chatId,
        setMessages
      );

    return () => unsubscribe();

  }, [selectedChat]);

  // ========================================
  // Load participant
  // ========================================

  useEffect(() => {

    const loadOtherUser = async () => {

      try {

        const participantIds =
          Object.keys(
            selectedChat.participants || {}
          );

        const otherUserId =
          participantIds.find(
            (id) => id !== currentUser.id
          );

        if (!otherUserId) return;

        const profile =
          await publicUserService.getPublicProfile(
            otherUserId
          );

        setOtherUser(profile.user);

      } catch (error) {

        console.error(error);
      }
    };

    if (selectedChat) {
      loadOtherUser();
    }

  }, [selectedChat]);

  // ========================================
  // Auto scroll
  // ========================================

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  useEffect(() => {

  if (
    !selectedChat?.chatId ||
    !currentUser?.id
  ) return;

  chatService.markChatAsRead(
    selectedChat.chatId,
    currentUser.id
  );

}, [selectedChat, currentUser]);
const formatDayLabel = (timestamp) => {

  const date = new Date(timestamp);

  const now = new Date();

  const yesterday = new Date();

  yesterday.setDate(now.getDate() - 1);

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return "Today";
  }

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  const isSameYear =
    date.getFullYear() ===
    now.getFullYear();

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    ...(isSameYear
      ? {}
      : { year: "numeric" }),
  });
};
  return (
    <div className="
      flex flex-col
      w-full h-full
    ">

      {/* HEADER */}

      <div className="
        p-4 border-b border-gray-200
        flex items-center gap-3
      ">

        {/* MOBILE BACK */}

        <button
          onClick={onBack}
          className="
            md:hidden
            text-gray-700
            hover:text-black
          "
        >
          ←
        </button>

        {/* AVATAR */}

        <Link to={`/users/${otherUser?.id}`}>

          <div className="
            w-10 h-10 rounded-full
            overflow-hidden bg-gray-200
            flex items-center justify-center
          ">

            {otherUser?.profileImage?.url ? (

              <img
                src={otherUser.profileImage.url}
                alt={otherUser.username}
                className="
                  w-full h-full object-cover
                "
              />

            ) : (

              <span className="
                font-bold text-gray-600
              ">
                {otherUser?.username?.charAt(0)}
              </span>

            )}

          </div>

        </Link>

        {/* USERNAME */}

        <div className="flex flex-col">

          <Link
            to={`/users/${otherUser?.id}`}
            className="
              font-semibold text-gray-900
              hover:text-blue-600
            "
          >
            {otherUser?.username || "Loading..."}
          </Link>

        </div>

      </div>

      {/* MESSAGES */}

      <div className="
        flex-1 overflow-y-auto
        p-4 space-y-3 bg-gray-50
      ">

      {messages.map((message, index) => {

  const currentLabel =
    formatDayLabel(message.timestamp);

  const previousMessage =
    messages[index - 1];

  const previousLabel =
    previousMessage
      ? formatDayLabel(
          previousMessage.timestamp
        )
      : null;

  const showDateSeparator =
    currentLabel !== previousLabel;

  return (

    <div key={message.id}>

      {showDateSeparator && (

        <div className="
          flex items-center gap-3
          my-4
        ">

          <div className="
            flex-1 h-px bg-gray-300
          " />

          <span className="
            text-xs font-semibold
            text-gray-500
            whitespace-nowrap
          ">
            {currentLabel}
          </span>

          <div className="
            flex-1 h-px bg-gray-300
          " />

        </div>

      )}

      <MessageBubble
        message={message}
        isOwnMessage={
          message.senderId === currentUser.id
        }
      />

    </div>
  );
})}

        <div ref={bottomRef} />

      </div>

      {/* INPUT */}

      <MessageInput
        chatId={selectedChat.chatId}
        currentUser={currentUser}
      />

    </div>
  );
};

export default ChatWindow;