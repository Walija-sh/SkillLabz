import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";

const FloatingChatButton = () => {

  return (
    <Link
      to="/messages"
      className="
        fixed bottom-5 right-5 md:bottom-6 md:right-6
        z-50

        w-14 h-14 md:w-16 md:h-16
        rounded-full

        bg-blue-600 hover:bg-blue-700

        flex items-center justify-center

        shadow-xl hover:shadow-2xl

        transition-all duration-200

        
      "
    >

      <FiMessageCircle
        className="
          text-white
          w-6 h-6 md:w-7 md:h-7
        "
      />

    </Link>
  );
};

export default FloatingChatButton;