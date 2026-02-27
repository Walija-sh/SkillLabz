import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";


const App=() =>{
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        {/* other pages */}
        {/* <Route path="about" element={<About />} /> */}
        
      </Route>
    </Routes>
  );
}

export default App;
