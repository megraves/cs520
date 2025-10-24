import { HeroUIProvider } from "@heroui/react";
import { Route, Routes, useHref, useNavigate, Navigate} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import GoMode from "./components/pages/GoMode";
import WanderMode from "./components/pages/WanderMode";
import Login from "./components/pages/Login";
import Signin from "./components/pages/Signin";
import Profile from "./components/pages/Profile";


function App() {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<Signin/>}/>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute/>}>
          <Route path="home" element={<WanderMode />} /> 
          <Route path="/go-mode/:questId" element={<GoMode />} />
          <Route path="/profile" element={<Profile />} /> 
        </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes> 
    </HeroUIProvider>
  );
};

export default App;
