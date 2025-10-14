import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";

export default function Packages() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  const packages = [
    {
      title: "ตรวจสุขภาพทั่วไป",
      category: "ตรวจสุขภาพ",
      desc: "บริการตรวจสุขภาพประจำปี ตรวจร่างกายเบื้องต้น พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ",
      price: "เริ่มต้นที่ 1,200 ฿",
      img: "https://images.unsplash.com/photo-1588776814546-ec7c6fefb0ec?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "คลินิกโรคหัวใจ",
      category: "โรคเฉพาะทาง",
      desc: "ให้บริการตรวจวินิจฉัย ดูแลรักษา และติดตามผลผู้ป่วยโรคหัวใจ ด้วยเทคโนโลยีทันสมัย",
      price: "เริ่มต้นที่ 2,500 ฿",
      img: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "ศูนย์ตรวจวินิจฉัยทางภาพ",
      category: "โรคเฉพาะทาง",
      desc: "บริการเอกซเรย์ อัลตราซาวด์ และ MRI โดยทีมรังสีแพทย์มืออาชีพ",
      price: "เริ่มต้นที่ 3,000 ฿",
      img: "https://images.unsplash.com/photo-1580281657521-8b79eaf0d66b?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "แพ็กเกจวัคซีนผู้ใหญ่",
      category: "วัคซีน",
      desc: "รวมวัคซีนสำคัญสำหรับผู้ใหญ่ เช่น ไข้หวัดใหญ่ HPV และบาดทะยัก",
      price: "เริ่มต้นที่ 1,800 ฿",
      img: "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&w=800&q=60",
    },
  ];

  const categories = ["ทั้งหมด", "ตรวจสุขภาพ", "วัคซีน", "โรคเฉพาะทาง"];
  const filteredPackages =
    activeTab === "ทั้งหมด"
      ? packages
      : packages.filter((pkg) => pkg.category === activeTab);

  return (
    <MainLayout>
      <section className="relative bg-gradient-to-r from-[#005b75] to-[#0288a7] text-white text-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580281657521-8b79eaf0d66b?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            แพ็กเกจและโปรโมชั่น
          </h1>
          <p className="text-lg opacity-90 mb-6">
            รวมโปรโมชั่นและแพ็กเกจสุขภาพสุดคุ้ม ดูแลคุณครบทุกมิติทั้งกายและใจ
          </p>
          <button className="mt-2 bg-white text-[#0288a7] font-semibold px-6 py-2 rounded-full hover:bg-[#eaf9fb] transition shadow-md hover:shadow-lg">
            จองแพ็กเกจตอนนี้
          </button>
        </div>
      </section>

      <div className="flex justify-center gap-4 mt-10 flex-wrap px-4">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full border font-medium transition-all duration-300 transform cursor-pointer ${
              activeTab === tab
                ? "bg-[#0288a7] text-white border-[#0288a7] scale-105 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:scale-105"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredPackages.map((pkg, i) => (
          <div
            key={i}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="relative overflow-hidden">
              <img
                src={pkg.img}
                alt={pkg.title}
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#0288a7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-[#006680] mb-3 transition-colors group-hover:text-[#0288a7]">
                {pkg.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                {pkg.desc}
              </p>
              <p className="text-[#0289a7] font-bold text-lg mb-3">
                {pkg.price}
              </p>
              <button className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
                อ่านเพิ่มเติม
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="bg-[#ffe082] text-center py-10 rounded-2xl my-10 shadow-md mx-6 max-w-6xl mx-auto animate-pulse-slow">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎉 โปรโมชั่นพิเศษ ลดสูงสุด 30% ถึง 31 ตุลาคมนี้!
        </h2>
        <p className="text-gray-700 mb-4">
          เฉพาะแพ็กเกจตรวจสุขภาพและวัคซีนเท่านั้น
        </p>
        <button className="bg-[#0288a7] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#026f86] transition shadow hover:shadow-lg">
          จองเลย
        </button>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">👨‍⚕️ แพทย์แนะนำ</h2>
          <div className="bg-white p-8 rounded-2xl shadow-md inline-block hover:shadow-xl transition-transform transform hover:scale-105 duration-300">
            <img
              src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=60"
              alt="Doctor"
              className="w-28 h-28 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="font-bold text-lg text-gray-800">
              พญ. ศิริกาญจน์ ใจดี
            </h3>
            <p className="text-gray-600 mb-3">แพทย์เฉพาะทางอายุรกรรม</p>
            <p className="text-gray-500 italic">
              “แพ็กเกจตรวจสุขภาพนี้เหมาะกับผู้ที่ต้องการดูแลสุขภาพเชิงป้องกัน
              และตรวจร่างกายประจำปีอย่างสม่ำเสมอ”
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          ❓ คำถามที่พบบ่อย
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "ต้องงดอาหารก่อนตรวจไหม?",
              a: "ขึ้นอยู่กับประเภทการตรวจ เช่น ตรวจเลือดควรงดอาหารอย่างน้อย 8 ชั่วโมงก่อนตรวจ",
            },
            {
              q: "ใช้สิทธิ์ประกันสังคมได้หรือไม่?",
              a: "สามารถใช้สิทธิ์บางส่วนได้ โดยขึ้นอยู่กับเงื่อนไขของแต่ละโปรแกรม",
            },
            {
              q: "จองออนไลน์แล้วชำระเงินอย่างไร?",
              a: "สามารถชำระผ่านบัตรเครดิต, QR Code หรือโอนผ่านบัญชีธนาคารได้",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
