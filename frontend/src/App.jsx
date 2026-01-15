import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { BackgroundChatProvider } from "./contexts/BackgroundChatContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
      />
      <BackgroundChatProvider>
        <AppRouter />
      </BackgroundChatProvider>
    </>
  );
}

export default App;
