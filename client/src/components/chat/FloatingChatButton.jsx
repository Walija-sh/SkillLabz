import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const FloatingChatButton = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50"
    >
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "#191970" }}
      />

      <Link to="/messages">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="
            relative w-14 h-14 md:w-16 md:h-16
            rounded-full flex items-center justify-center
            shadow-xl transition-shadow hover:shadow-2xl
          "
          style={{ backgroundColor: "#191970" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#141660"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#191970"}
        >
          <FiMessageCircle className="text-white w-6 h-6 md:w-7 md:h-7" />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default FloatingChatButton;