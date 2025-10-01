//import { useState } from 'react'
import './App.css'
import { NextUIProvider } from "@nextui-org/react";
import { Route, Routes, useHref, useNavigate } from "react-router-dom";


import {GoMode} from "@pages/GoMode";
import {WanderMode} from "@pages/WanderMode";
import {Login} from "@pages/Login";
import {Signin} from "@pages/Signin";
import {Profile} from "@pages/Profile";

function App() {
  //const [count, setCount] = useState(0)
  const navigate = useNavigate();

  // ADD AUTH to home page
  return (
    <NextUIProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="login" element={<Login />} />
        <Route path="home" element={<WanderMode />} />
        <Route path="/go-mode/:questId" element={<GoMode />} />
        <Route path="/profile/:userName" element={<Profile />} />
      </Routes> 
    </NextUIProvider>
  );
};

export default App;
