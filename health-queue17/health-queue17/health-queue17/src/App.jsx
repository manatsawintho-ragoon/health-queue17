import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>

        {/* แถบเมนู */}
        <Navbar />

        {/* ส่วนสไลด์ */}
        <Carousel />

        

      </div>
    </>
  );
}

export default App;
