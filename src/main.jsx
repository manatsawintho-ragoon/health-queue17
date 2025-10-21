import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./i18n.js";

// page import here
import App from "./App.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Packages from "./pages/Packages.jsx";
import Doctor_team from "./pages/Doctor_team.jsx";
import News from "./pages/News.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import DevManager from "./pages/DevManager.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
// -----------

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="Whocare">
      <Routes>

        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/doctor_team" element={<Doctor_team />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* For DEV  */}
        <Route path="/devmanager" element={<DevManager />} />

        {/* For Admin  */}
        <Route path="/admindashboard" element={<AdminDashboard />} />



      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
