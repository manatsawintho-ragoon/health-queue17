import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import "./index.css";
import "./i18n.js";
import News from "./pages/News.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<News />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
