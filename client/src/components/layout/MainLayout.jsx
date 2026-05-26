import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer"; 
import { useSelector } from "react-redux";
import FloatingChatButton from "../chat/FloatingChatButton";

export default function MainLayout() {
  const location = useLocation();
  const isLoggedIn = useSelector(
  (state) => state.auth.status
);

  // Define the routes where the Navbar and Footer should be hidden
  const hiddenRoutes = ['/login', '/register', '/resend-verification'];
  const isHiddenRoute = hiddenRoutes.includes(location.pathname);
  const isMessagesRoute = location.pathname === "/messages";

  return (
    <div className="flex min-h-screen flex-col bg-[#ECEFF1]">
      {/* Conditionally render the Navbar */}
      {!isHiddenRoute && <Navbar />}
      
      <main className="grow">
        <Outlet />
      </main>
  {!isHiddenRoute && isLoggedIn && !isMessagesRoute && (
  <FloatingChatButton />
)}
      {/* Conditionally render the Footer */}
      {!isHiddenRoute && <Footer />}
    </div>
  );
}