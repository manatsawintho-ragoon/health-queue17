import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";

import placeholderImage from "../assets/WHOCARE-logo.png";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [dbServices, setDbServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // ดึงข้อมูลบริการจาก Firestore เฉพาะที่ recommend === true
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const list = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            title: doc.data().name,
            description: doc.data().description,
            image: doc.data().image,
            price: doc.data().price,
            recommend: doc.data().recommend,
            createdAt: doc.data().createdAt,
          }))
          .filter((item) => item.recommend === true)
          .sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        setDbServices(list);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // ฟังก์ชันลากเลื่อน
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

  // ปุ่มเลื่อนซ้ายขวา
  const scrollByDir = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  // Popup รายละเอียดบริการ
  const showDetail = (service) => {
    Swal.fire({
      title: `<h2 class="text-[#006680] font-bold">${service.title}</h2>`,
      html: `
        <img src="${service.image}" alt="${service.title}" 
          style="width: 100%; border-radius: 12px; margin-bottom: 12px;" />
        <p style="color: #444; font-size: 15px; text-align: left;">${service.description}</p>
        <p style="margin-top: 12px; color: #006680; font-weight: bold; font-size: 16px;">ราคา: ${service.price} บาท</p>
      `,
      showCancelButton: true,
      confirmButtonText: "จองบริการนี้",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          Swal.fire({
            icon: "info",
            title: "กรุณาเข้าสู่ระบบก่อนจองบริการ",
            confirmButtonText: "เข้าสู่ระบบ",
            confirmButtonColor: "#006680",
          }).then(() => navigate("/login"));
          return false;
        } else {
          navigate("/booking", { state: { serviceId: service.id } });
        }
      },
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#f9feff] text-gray-800 flex flex-col items-center py-12 overflow-visible select-none">
        {/* HERO */}
        <section className="text-center mb-12 overflow-visible">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#006680] mb-3">
            WHOCARE BEAUTY & SKIN CLINIC
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            คลินิกความงามที่เข้าใจผิวของคุณ — ให้ WHOCARE
            ดูแลด้วยเทคโนโลยีระดับสากล
          </p>
        </section>

        {/* SCROLLER */}
        <section className="relative w-full max-w-6xl mb-20 overflow-visible">
          <h2 className="text-3xl font-bold text-center text-[#006680] mb-8">
            บริการแนะนำมาใหม่
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
            {loadingServices ? (
              <div className="flex justify-center items-center w-full py-10">
                <div className="w-8 h-8 border-4 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : dbServices.length > 0 ? (
              dbServices.map((s, i) => (
                <div
                  key={i}
                  className="min-w-[320px] bg-white rounded-3xl border border-[#dce7ea] shadow-md hover:shadow-2xl transition-all transform hover:scale-105 flex-shrink-0 z-20 relative"
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                >
                  {/* ป้าย Hot */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <FaFire size={12} />
                    Hot
                  </div>

                  {/* รูปภาพพร้อม fallback */}
                  <img
                    src={s.image || placeholderImage}
                    onError={(e) => (e.target.src = placeholderImage)}
                    alt={s.title}
                    className="rounded-t-3xl h-56 w-full object-cover"
                  />

                  <div className="p-5 text-center">
                    <h3 className="text-xl font-semibold text-[#006680] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {s.description?.slice(0, 70)}...
                    </p>
                    <p className="text-[#006680] font-semibold mb-4">
                      ราคา: {s.price} บาท
                    </p>
                    <button
                      onClick={() => showDetail(s)}
                      className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                    >
                      อ่านเพิ่มเติม
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">
                ยังไม่มีบริการแนะนำในระบบ
              </p>
            )}
          </div>

          {/* ปุ่มเลื่อนขวา */}
          <button
            onClick={() => scrollByDir("right")}
            className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 bg-[#006680] text-white hover:bg-[#0289a7] rounded-full p-4 shadow-2xl transition z-30 cursor-pointer"
          >
            <FaChevronRight size={24} />
          </button>
          <div className="flex flex-col items-center mb-12">
            <button
              onClick={() => navigate("/services")}
              className="bg-[#006680] hover:bg-[#0289a7] text-white text-l mt-8 px-10 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-105 cursor-pointer"
            >
              ดูบริการทั้งหมด
            </button>


            <div className="w-2/3 mt-8 border-t-2 border-[#cfe6ea]"></div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
