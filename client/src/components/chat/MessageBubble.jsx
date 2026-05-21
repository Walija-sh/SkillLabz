const MessageBubble = ({
  message,
  isOwnMessage,
}) => {

  return (
    <div
      className={`
        flex
        ${isOwnMessage ? "justify-end" : "justify-start"}
      `}
    >

      <div
        className={`
          max-w-[75%]
          px-4 py-2 rounded-2xl text-sm
          ${
            isOwnMessage
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200"
          }
        `}
      >

        <p>{message.text}</p>

        <div
          className={`
            text-[10px] mt-1
            ${
              isOwnMessage
                ? "text-blue-100"
                : "text-gray-400"
            }
          `}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>

      </div>

    </div>
  );
};

export default MessageBubble;