import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from './pages/auth/Login';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* The index route loads when the URL is exactly "/" */}
        <Route index element={<Home />} />
        
        {/* This loads when the URL is "/register" */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        
        {/* Future routes will go here */}
        {/* <Route path="about" element={<About />} /> */}
      </Route>
    </Routes>
  );
};

export default App;