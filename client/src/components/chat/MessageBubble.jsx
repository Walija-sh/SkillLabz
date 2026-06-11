import { motion } from "framer-motion";

const NAVY = "#191970";

const MessageBubble = ({ message, isOwnMessage }) => {
  const fmtTime = (ts) =>
    new Date(ts)
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex mb-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[72%] px-4 py-2.5 text-sm leading-relaxed
          ${isOwnMessage
            ? "rounded-2xl rounded-br-md text-white"
            : "rounded-2xl rounded-bl-md bg-white border border-gray-200 text-gray-800"
          }
        `}
        style={isOwnMessage ? { backgroundColor: NAVY } : {}}
      >
        <p className="font-medium">{message.text}</p>
        <div
          className={`text-[10px] mt-1 font-bold text-right ${
            isOwnMessage ? "text-white/50" : "text-gray-400"
          }`}
        >
          {fmtTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;