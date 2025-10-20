import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaChevronLeft, FaChevronRight, FaPlayCircle } from "react-icons/fa";

import acneImg from "../assets/HomePage/Acne-treatment.png";
import facialImg from "../assets/HomePage/Facial-treatment.png";
import laserImg from "../assets/HomePage/Laser-treatment.png";
import whiteningImg from "../assets/HomePage/Whitening-treatment.png";
import fillerImg from "../assets/HomePage/Filer-treatment.png";

export default function Home() {
  const scrollRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // ---------------------- Drag แบบต้องคลิกค้าง ----------------------
  let holdTimeout;
  const handleMouseDown = (e) => {
    holdTimeout = setTimeout(() => {
      setIsHolding(true);
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }, 120);
  };

  const handleMouseUp = () => {
    clearTimeout(holdTimeout);
    setIsHolding(false);
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    clearTimeout(holdTimeout);
    setIsHolding(false);
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isHolding) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // ---------------------- Scroll ปุ่มซ้ายขวา ----------------------
  const scrollByDir = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  // ---------------------- Popup รายละเอียด ----------------------
  const showDetail = (service) => {
    Swal.fire({
      title: `<h2 class="text-[#006680] font-bold">${service.title}</h2>`,
      html: `
        <img src="${service.img}" alt="${service.title}" 
          style="width: 100%; border-radius: 12px; margin-bottom: 12px;" />
        <p style="color: #444; font-size: 15px; text-align: left;">${service.detail}</p>
      `,
      showCancelButton: true,
      confirmButtonText: "จองบริการนี้",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        if (!isLoggedIn) {
          Swal.fire({
            icon: "info",
            title: "กรุณาเข้าสู่ระบบก่อนจองบริการ",
            confirmButtonText: "เข้าสู่ระบบ",
            confirmButtonColor: "#006680",
          }).then(() => (window.location.href = "/Whocare/login"));
        } else {
          Swal.fire({
            icon: "success",
            title: "จองบริการสำเร็จ!",
            text: `คุณได้จอง "${service.title}" แล้ว (จำลอง)`,
            confirmButtonColor: "#006680",
          });
        }
      },
    });
  };

  // ---------------------- ข้อมูลบริการ ----------------------
  const services = [
    {
      title: "รักษาสิวครบวงจร",
      img: acneImg,
      desc: "ลดสิวอักเสบ ลดรอยสิว ฟื้นฟูผิวให้เรียบเนียน สุขภาพดี",
      detail:
        "รักษาสิวโดยแพทย์ผู้เชี่ยวชาญ ด้วยเทคโนโลยีเลเซอร์และเวชสำอางเฉพาะทาง เห็นผลเร็วและปลอดภัย",
    },
    {
      title: "ทรีตเมนต์บำรุงผิวหน้า",
      img: facialImg,
      desc: "บำรุงลึก เพิ่มความชุ่มชื้นและความกระจ่างใส",
      detail:
        "ทรีตเมนต์สูตรเฉพาะ WHOCARE เติมความชุ่มชื้นและคอลลาเจนให้ผิวอิ่มฟูสุขภาพดี",
    },
    {
      title: "เลเซอร์หน้าใส",
      img: laserImg,
      desc: "กำจัดฝ้า กระ จุดด่างดำ ปรับผิวให้เรียบเนียนใส",
      detail:
        "เทคโนโลยี Pico Laser ลดฝ้า กระ จุดด่างดำ โดยไม่ต้องพักฟื้น เหมาะกับทุกสภาพผิว",
    },
    {
      title: "ทรีตเมนต์ผิวขาวใส",
      img: whiteningImg,
      desc: "ฟื้นฟูผิวหมองคล้ำให้กลับมามีออร่า",
      detail:
        "Whitening Booster Treatment ช่วยปรับผิวให้ขาว กระจ่างใส ดูสุขภาพดี",
    },
    {
      title: "ฟิลเลอร์ & โบท็อกซ์",
      img: fillerImg,
      desc: "ปรับรูปหน้าเรียว ลดริ้วรอย คืนความอ่อนเยาว์ทันใจ",
      detail:
        "ฟิลเลอร์แท้และโบท็อกซ์คุณภาพสูงจากแบรนด์ระดับโลก โดยแพทย์ผู้เชี่ยวชาญ",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9feff] text-gray-800 flex flex-col items-center py-12 overflow-visible select-none">
      {/* HERO */}
      <section className="text-center mb-12 overflow-visible">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#006680] mb-3">
          WHOCARE BEAUTY & SKIN CLINIC
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg">
          คลินิกความงามที่เข้าใจผิวของคุณ — ให้ WHOCARE ดูแลด้วยเทคโนโลยีระดับสากล
        </p>
      </section>

      {/* SCROLLER */}
      <section className="relative w-full max-w-6xl mb-20 overflow-visible">
        <h2 className="text-3xl font-bold text-center text-[#006680] mb-8">
          บริการยอดนิยมของเรา
        </h2>

        {/* ปุ่มเลื่อนซ้าย */}
        <button
          onClick={() => scrollByDir("left")}
          className="absolute left-[-70px] top-1/2 transform cursor-pointer -translate-y-1/2 bg-[#006680] text-white hover:bg-[#0289a7] rounded-full p-4 shadow-2xl transition z-30"
        >
          <FaChevronLeft size={24} />
        </button>

        {/* กล่องบริการ */}
        <div
          ref={scrollRef}
          className="flex gap-8 px-6 py-4 flex-nowrap cursor-grab active:cursor-grabbing overflow-visible"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {services.map((s, i) => (
            <div
              key={i}
              className="min-w-[320px] bg-white rounded-3xl border border-[#dce7ea] shadow-md hover:shadow-2xl transition-all transform hover:scale-105 flex-shrink-0 z-20"
              style={{ marginTop: "10px", marginBottom: "10px" }}
            >
              <img
                src={s.img}
                alt={s.title}
                className="rounded-t-3xl h-56 w-full object-cover"
              />
              <div className="p-5 text-center">
                <h3 className="text-xl font-semibold text-[#006680] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{s.desc}</p>
                <button
                  onClick={() => showDetail(s)}
                  className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                >
                  <i class="fa-brands fa-readme"></i> อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ปุ่มเลื่อนขวา */}
        <button
          onClick={() => scrollByDir("right")}
          className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 bg-[#006680] text-white hover:bg-[#0289a7] rounded-full p-4 shadow-2xl transition z-30 cursor-pointer"
        >
          <FaChevronRight size={24} />
        </button>
      </section>
    </div>
  );
}
