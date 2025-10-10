import React, { useState, useEffect, useRef } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
    title: "บริการทางการแพทย์ครบวงจร",
    desc: "เรามีทีมแพทย์เฉพาะทางพร้อมให้บริการตรวจ วินิจฉัย และรักษาอย่างมืออาชีพ",
    button: "ดูรายละเอียด",
  },
  {
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67",
    title: "เทคโนโลยีทางการแพทย์ทันสมัย",
    desc: "ศิริราชโซลูชันพร้อมเครื่องมือแพทย์มาตรฐานสากลเพื่อการดูแลที่แม่นยำ",
    button: "เรียนรู้เพิ่มเติม",
  },
  {
    image: "https://images.unsplash.com/photo-1504814532849-927661016c3a",
    title: "การดูแลด้วยหัวใจ",
    desc: "เพราะผู้ป่วยทุกคนคือคนสำคัญ เราพร้อมมอบบริการด้วยความอบอุ่นและใส่ใจ",
    button: "ติดต่อเรา",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const slideRef = useRef(null);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  //  Auto Slide ทุก 7 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [current]);

  //  Drag / Swipe ซ้ายขวา
  useEffect(() => {
    const slider = slideRef.current;
    let startX = 0;
    let endX = 0;

    const handleStart = (e) => {
      startX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const handleEnd = (e) => {
      endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      if (startX - endX > 50) nextSlide();
      if (endX - startX > 50) prevSlide();
    };

    slider.addEventListener("mousedown", handleStart);
    slider.addEventListener("mouseup", handleEnd);
    slider.addEventListener("touchstart", handleStart);
    slider.addEventListener("touchend", handleEnd);

    return () => {
      slider.removeEventListener("mousedown", handleStart);
      slider.removeEventListener("mouseup", handleEnd);
      slider.removeEventListener("touchstart", handleStart);
      slider.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <div
      ref={slideRef}
      className="relative w-full h-[480px] overflow-hidden select-none"
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-20" : "opacity-0 z-0"
          }`}
        >
          {/* รูปภาพ */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover absolute inset-0"
          />

          {/* overlay สีดำ */}
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

          {/* ข้อความลอย */}
          <div className="absolute top-1/2 left-40 transform -translate-y-1/2 text-white max-w-md text-left z-20">
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-lg mb-6 drop-shadow-md">{slide.desc}</p>
            <button
              className="bg-[#0289a7] hover:bg-[#03a9c5] cursor-pointer px-7 py-3 rounded-full text-base font-semibold shadow z-30 relative
                         transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* ปุ่มลูกศร */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl cursor-pointer hover:scale-125 transition-transform z-30"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl cursor-pointer hover:scale-125 transition-transform z-30"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* จุด Indicator */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-white" : "bg-gray-400"
            } cursor-pointer hover:scale-125 transition-transform`}
            onClick={() => setCurrent(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}
