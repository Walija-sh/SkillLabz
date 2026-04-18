import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";
import userService from "./services/user.service";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail'; 
import ListTool from './pages/tools/ListTool'; 
import CompleteProfile from './pages/profile/CompleteProfile';
import Profile from './pages/profile/Profile'; 
import BrowseTools from './pages/tools/BrowseTools';
import SingleTool from './pages/tools/SingleTool'; 
import Dashboard from './pages/profile/Dashboard'; // <-- Newly added Dashboard import
import EditTool from './pages/tools/EditTool';
import RequestRental from './pages/rentals/RequestRental';
import MyRentals from './pages/rentals/MyRentals';
import ProtectedRoute from './components/common/ProtectedRoute'; 
import PublicProfile from "./pages/profile/PublicProfile";

const App = () => {
  const dispatch = useDispatch();
  
  // We need a loading state so the ProtectedRoute doesn't prematurely kick 
  // the user to the login screen while we are verifying their token.
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // If a token exists, fetch their latest data from the database
          const response = await userService.getProfile();
          
          // Restore the user's session in Redux
          if (response.data) {
            dispatch(login(response.data));
          }
        } catch (error) {
          // If the token is expired or invalid, clear everything out
          console.error("Session expired or invalid token.");
          localStorage.removeItem('token');
          dispatch(logout());
        }
      }
      
      // Stop the loading spinner once the check is complete
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  // Show a full-screen loading spinner while checking auth status
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* ==========================================
            PUBLIC ROUTES
        ========================================== */}
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="browse-tools" element={<BrowseTools />} />
        <Route path="tools/:id" element={<SingleTool />} />
        <Route path="users/:id" element={<PublicProfile />} />
        <Route path="/tools/:id/rent" element={<RequestRental />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        
        {/* ==========================================
            PROTECTED ROUTES
        ========================================== */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="list-tool" 
          element={
            <ProtectedRoute>
              <ListTool />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

         <Route 
            path="edit-tool/:id" 
            element={
              <ProtectedRoute>
                <EditTool />
              </ProtectedRoute>
            } 
          /> 

      </Route>
    </Routes>
  );
};

export default App;