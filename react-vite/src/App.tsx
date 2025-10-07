
import { HeroUIProvider } from "@heroui/react";
import { Route, Routes, useHref, useNavigate } from "react-router-dom";


import GoMode from "./components/pages/GoMode";
import WanderMode from "./components/pages/WanderMode";
import Login from "./components/pages/Login";
import Signin from "./components/pages/Signin";
import Profile from "./components/pages/Profile";

function App() {
  const navigate = useNavigate();

  // ADD AUTH to home page
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="login" element={<Login />} />
        <Route path="home" element={<WanderMode />} />
        <Route path="/go-mode/:questId" element={<GoMode />} />
        <Route path="/profile/:userName" element={<Profile />} />
      </Routes> 
    </HeroUIProvider>
  );
};

export default App;
