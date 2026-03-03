import { Outlet } from "react-router-dom";
// import Header from "./Header"; // Adjust path if needed
import Navbar from "./Navbar";
import Footer from "./Footer"; // Adjust path if needed


export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}