import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer"; 

export default function MainLayout() {
  const location = useLocation();

  // Define the routes where the Navbar and Footer should be hidden
  const hiddenRoutes = ['/login', '/register', '/resend-verification'];
  const isHiddenRoute = hiddenRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Conditionally render the Navbar */}
      {!isHiddenRoute && <Navbar />}
      
      <main className="grow">
        <Outlet />
      </main>
      
      {/* Conditionally render the Footer */}
      {!isHiddenRoute && <Footer />}
    </div>
  );
}