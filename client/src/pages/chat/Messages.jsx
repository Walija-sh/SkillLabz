import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";

const Messages = () => {

  const user = useSelector(
    (state) => state.auth.userData
  );

  const [searchParams] = useSearchParams();

  const [selectedChat, setSelectedChat] =
    useState(null);

  // Mobile sidebar toggle
  const [showMobileChat, setShowMobileChat] =
    useState(false);

  const chatIdFromURL =
    searchParams.get("chat");

  useEffect(() => {

    if (!chatIdFromURL) return;

    setSelectedChat({
      chatId: chatIdFromURL,
    });

    setShowMobileChat(true);

  }, [chatIdFromURL]);

  const handleSelectChat = (chat) => {

    setSelectedChat(chat);

    // On mobile open chat view
    setShowMobileChat(true);
  };

  const handleBack = () => {

    setShowMobileChat(false);
  };

  return (
    <div className="
      h-[calc(100vh-80px)]
      flex bg-white
    ">

      {/* SIDEBAR */}

      <div
        className={`
          ${
            showMobileChat
              ? "hidden md:flex"
              : "flex"
          }
          w-full md:w-[350px]
          border-r border-gray-200
          flex-col
        `}
      >

        <ChatSidebar
          currentUser={user}
          selectedChat={selectedChat}
          setSelectedChat={handleSelectChat}
        />

      </div>

      {/* CHAT WINDOW */}

      <div
        className={`
          ${
            showMobileChat
              ? "flex"
              : "hidden md:flex"
          }
          flex-1
        `}
      >

        {selectedChat ? (

          <ChatWindow
            currentUser={user}
            selectedChat={selectedChat}
            onBack={handleBack}
          />

        ) : (

          <div className="
            hidden md:flex
            items-center justify-center
            w-full text-gray-400
          ">
            Select a conversation
          </div>

        )}

      </div>

    </div>
  );
};

export default Messages;