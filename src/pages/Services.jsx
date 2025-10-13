import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import service1 from "../assets/medical-carousel-1.jpg";
import service2 from "../assets/medical-carousel-2.jpg";
import service3 from "../assets/medical-carousel-3.jpg";

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // ตรวจสอบสถานะล็อกอินจำลอง

  const services = [
    {
      image: service1,
      title: "ตรวจสุขภาพทั่วไป",
      desc: "บริการตรวจสุขภาพประจำปี ตรวจร่างกายเบื้องต้น พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ",
      detail:
        "บริการตรวจสุขภาพทั่วไปเหมาะสำหรับทุกเพศทุกวัย เพื่อประเมินภาวะสุขภาพเบื้องต้น ตรวจเลือด ความดัน ไขมัน เบาหวาน และอวัยวะภายใน รวมถึงให้คำแนะนำด้านสุขภาพโดยแพทย์ผู้เชี่ยวชาญ",
      price: "1,200 ฿",
      pricedesc: "เริ่มต้นที่",
    },
    {
      image: service2,
      title: "คลินิกโรคหัวใจ",
      desc: "ให้บริการตรวจวินิจฉัย ดูแลรักษา และติดตามผลผู้ป่วยโรคหัวใจ ด้วยเทคโนโลยีทันสมัย",
      detail:
        "คลินิกโรคหัวใจให้บริการตรวจคลื่นไฟฟ้าหัวใจ (EKG), อัลตราซาวด์หัวใจ (Echo) และการประเมินความเสี่ยงโรคหัวใจ โดยแพทย์ผู้เชี่ยวชาญเฉพาะทาง",
      price: "2,500 ฿",
      pricedesc: "เริ่มต้นที่",
    },
    {
      image: service3,
      title: "ศูนย์ตรวจวินิจฉัยทางภาพ",
      desc: "บริการเอกซเรย์ อัลตราซาวด์ และ MRI โดยทีมรังสีแพทย์มืออาชีพ",
      detail:
        "ให้บริการเอกซเรย์ดิจิทัล, CT Scan และ MRI สำหรับตรวจวินิจฉัยอวัยวะต่าง ๆ ภายในร่างกาย ด้วยเครื่องมือทันสมัยจากต่างประเทศ",
      price: "3,000 ฿",
      pricedesc: "เริ่มต้นที่",
    },
    {
      image: service2,
      title: "ศูนย์กายภาพบำบัด",
      desc: "ให้บริการฟื้นฟูร่างกายหลังการผ่าตัดหรืออาการบาดเจ็บ โดยนักกายภาพบำบัดผู้เชี่ยวชาญ",
      detail:
        "บริการฟื้นฟูร่างกายจากอาการบาดเจ็บ กล้ามเนื้ออักเสบ ปวดหลัง หรือหลังการผ่าตัด พร้อมโปรแกรมกายภาพเฉพาะบุคคล",
      price: "1,800 ฿",
      pricedesc: "เริ่มต้นที่",
    },
    {
      image: service3,
      title: "คลินิกเด็กและวัยรุ่น",
      desc: "ตรวจสุขภาพ ดูแลพัฒนาการ และให้คำปรึกษาด้านสุขภาพสำหรับเด็กและวัยรุ่นทุกช่วงวัย",
      detail:
        "บริการตรวจสุขภาพทั่วไป วัคซีน การเจริญเติบโต และการดูแลพฤติกรรมเด็ก โดยแพทย์ผู้เชี่ยวชาญด้านกุมารเวช",
      price: "1,000 ฿",
      pricedesc: "เริ่มต้นที่",
    },
  ];

  const handleBook = (serviceTitle) => {
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจองบริการ");
      navigate("/login");
    } else {
      alert(`ขอบคุณที่เลือกบริการ: ${serviceTitle}`);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="relative bg-[#006680] text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-wide">บริการของเรา</h1>
        <p className="text-lg text-gray-200">
          เราพร้อมดูแลสุขภาพของคุณด้วยบริการทางการแพทย์ครบวงจร
        </p>
      </section>

      {/* Service List */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-[#006680] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {service.desc}
                </p>
                <p className="text-[#0289a7] font-bold text-lg mb-3">
                  {service.pricedesc} {service.price}
                </p>
                <button
                  onClick={() => setSelectedService(service)}
                  className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                >
                  อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popup Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setSelectedService(null)} // คลิกพื้นที่นอก popup ปิดได้
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 relative"
            onClick={(e) => e.stopPropagation()} // ป้องกันคลิกภายใน popup แล้วปิด
          >
            {/* ปุ่มปิด */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-[#006680] text-4xl leading-none font-bold cursor-pointer transition"
            >
              &times;
            </button>

            {/* เนื้อหา */}
            <img
              src={selectedService.image}
              alt={selectedService.title}
              className="w-full h-52 object-cover rounded-xl mb-5"
            />
            <h2 className="text-2xl font-bold text-[#006680] mb-3">
              {selectedService.title}
            </h2>
            <p className="text-gray-700 mb-5 leading-relaxed">
              {selectedService.detail}
            </p>

            {/* ราคา */}
            <div className="bg-[#b5e7f3c7] text-[#006680] text-center py-3 rounded-xl font-semibold text-xl mb-6 shadow-inner">
               ค่าบริการเริ่มต้น: {selectedService.price}
            </div>

            {/* ปุ่มจอง */}
            <button
              onClick={() => handleBook(selectedService.title)}
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold px-8 py-3 rounded-full cursor-pointer transition w-full shadow-md"
            >
              จองบริการนี้
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
