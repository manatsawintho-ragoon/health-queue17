import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/Home";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer className="mt-auto" />
    </div>
  );
}
