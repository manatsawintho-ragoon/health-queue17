import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Home from "./pages/Home";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>

        {/* แถบเมนู */}
        <Navbar />

        {/* ส่วนสไลด์ */}
        <Carousel />

        {/* หน้าโฮม */}
        <Home />


        

      </div>
    </>
  );
}

export default App;
