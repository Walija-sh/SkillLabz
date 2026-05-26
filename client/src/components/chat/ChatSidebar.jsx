import { useEffect, useState } from "react";

import chatService from "../../services/chat.service";
import publicUserService from "../../services/publicUser.service";

const ChatSidebar = ({
  currentUser,
  selectedChat,
  setSelectedChat,
}) => {

  const [chats, setChats] = useState([]);

  // Cache loaded users
  const [usersMap, setUsersMap] = useState({});

  // ========================================
  // Load chats realtime
  // ========================================

  useEffect(() => {

    if (!currentUser?.id) return;

    const unsubscribe =
      chatService.subscribeToUserChats(
        currentUser.id,
        setChats
      );

    return () => unsubscribe();

  }, [currentUser]);

  // ========================================
  // Load participant profiles
  // ========================================

  useEffect(() => {

    const loadUsers = async () => {

      try {

        const updatedUsers = {};

        for (const chat of chats) {

          const participantIds =
            Object.keys(chat.participants || {});

          const otherUserId =
            participantIds.find(
              (id) => id !== currentUser.id
            );

          if (!otherUserId) continue;

          // Skip already cached users
          if (usersMap[otherUserId]) {
            updatedUsers[otherUserId] =
              usersMap[otherUserId];
            continue;
          }

          try {

            const response =
              await publicUserService.getPublicProfile(
                otherUserId
              );

            // Adjust according to your API response
            const user =
              response?.user ||
              response?.data?.user ||
              response?.data;

            if (user) {
              updatedUsers[otherUserId] = user;
            }

          } catch (error) {

            console.error(
              "Failed to load user:",
              otherUserId
            );
          }
        }

        setUsersMap((prev) => ({
          ...prev,
          ...updatedUsers,
        }));

      } catch (error) {

        console.error(error);
      }
    };

    if (chats.length > 0) {
      loadUsers();
    }

  }, [chats]);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}

      <div className="
        p-4 border-b border-gray-200
      ">

        <h2 className="
          text-2xl font-black text-gray-900
        ">
          Messages
        </h2>

      </div>

      {/* CHAT LIST */}

      <div className="
        flex-1 overflow-y-auto
      ">

        {chats.length === 0 ? (

          <div className="
            p-6 text-gray-500
          ">
            No conversations yet
          </div>

        ) : (

          chats.map((chat) => {

            const participantIds =
              Object.keys(chat.participants || {});

            const otherUserId =
              participantIds.find(
                (id) => id !== currentUser.id
              );

            const otherUser =
              usersMap[otherUserId];

            const isActive =
              selectedChat?.chatId ===
              chat.chatId;
              const unreadCount =
  chat.unreadCounts?.[currentUser.id] || 0;

            return (

              <button
                key={chat.chatId}
                onClick={() =>
                  setSelectedChat(chat)
                }
                className={`
                  w-full flex items-center gap-3
                  p-4 border-b border-gray-100
                  hover:bg-gray-50 transition
                  text-left
                  ${
                    isActive
                      ? "bg-gray-100"
                      : ""
                  }
                `}
              >

                {/* AVATAR */}

                <div className="
                  w-12 h-12 rounded-full
                  overflow-hidden bg-gray-200
                  flex items-center justify-center
                  flex-shrink-0
                ">

                  {otherUser?.profileImage?.url ? (

                    <img
                      src={
                        otherUser.profileImage.url
                      }
                      alt={otherUser.username}
                      className="
                        w-full h-full object-cover
                      "
                    />

                  ) : (

                    <span className="
                      text-lg font-bold text-gray-600
                    ">
                      {otherUser?.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </span>

                  )}

                </div>

                {/* CHAT INFO */}

                <div className="
                  flex-1 min-w-0
                ">

                  {/* USERNAME */}

                  <div className={`
  truncate
  ${
    unreadCount > 0
      ? "font-bold text-black"
      : "font-semibold text-gray-900"
  }
`}>
                    {otherUser?.username ||
                      "Loading..."}
                  </div>

                  {/* LAST MESSAGE */}

                  <div className={`
  text-sm truncate
  ${
    unreadCount > 0
      ? "font-semibold text-gray-900"
      : "text-gray-500"
  }
`}>
                    {chat.lastMessage?.text ||
                      "No messages yet"}
                  </div>

                </div>

                {/* TIME */}

                <div className="
  flex flex-col items-end gap-1
">

  {chat.lastMessage?.timestamp && (

    <div className="
      text-xs text-gray-400
      flex-shrink-0
    ">

      {new Date(
  chat.lastMessage.timestamp
)
  .toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  .toUpperCase()}

    </div>

  )}

  {unreadCount > 0 && (

    <div className="
      min-w-[20px]
      h-5 px-1
      rounded-full
      bg-blue-600 text-white
      text-xs font-bold
      flex items-center justify-center
    ">

      {unreadCount}

    </div>

  )}

</div>

              </button>
            );
          })

        )}

      </div>

    </div>
  );
};

export default ChatSidebar;