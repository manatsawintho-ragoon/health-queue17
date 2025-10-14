import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import news1 from "../assets/news1.jpg";
import news2 from "../assets/news2.jpg";
import news3 from "../assets/news3.jpg";
import extra1 from "../assets/extra1.jpg";
import extra2 from "../assets/extra2.jpg";
import extra3 from "../assets/extra3.jpg";

export default function Information() {
  const [selectedNews, setSelectedNews] = useState(null);

  // ข่าวชุดบน
  const newsList = [
    {
      image: news1,
      title: "WHOCARE เปิดคลินิกวันหยุด",
      desc: "คลินิกพิเศษให้บริการตรวจทั่วไปและโรคเฉพาะทางในวันเสาร์-อาทิตย์ เริ่มเดือนหน้า",
      detail:
        "เพื่ออำนวยความสะดวกแก่ผู้ป่วย WHOCARE HOSPITAL เปิดคลินิกวันหยุดให้บริการตรวจทั่วไป ตรวจเฉพาะทาง และห้องแล็บ โดยทีมแพทย์เฉพาะทางตลอดเวลา",
      link: "#",
      tag: "ข่าวกิจกรรม",
    },
    {
      image: news2,
      title: "ขยายเวลาเปิดห้องฉุกเฉิน 24 ชม.",
      desc: "ห้องฉุกเฉินเปิดให้บริการตลอด 24 ชั่วโมง พร้อมทีมแพทย์เฉพาะทาง",
      detail:
        "WHOCARE HOSPITAL ขยายเวลาเปิดห้องฉุกเฉินเป็น 24 ชั่วโมงเต็ม รองรับทุกสถานการณ์ฉุกเฉิน โดยมีแพทย์ พยาบาล และอุปกรณ์ครบครัน พร้อมให้บริการทุกวัน",
      link: "#",
      tag: "ข่าวประชาสัมพันธ์",
    },
    {
      image: news3,
      title: "โปรโมชั่นตรวจสุขภาพประจำปี",
      desc: "ลดราคาพิเศษ สำหรับผู้ที่จองโปรแกรมตรวจสุขภาพภายในเดือนนี้",
      detail:
        "รับส่วนลดพิเศษสำหรับแพ็กเกจตรวจสุขภาพประจำปี ตรวจสุขภาพโดยทีมแพทย์เฉพาะทาง พร้อมรายงานผลละเอียด และคำแนะนำส่วนบุคคล",
      link: "#",
      tag: "โปรโมชั่น",
    },
  ];

  // ข่าวชุดล่าง
  const extraNews = [
    {
      image: extra1,
      title: "เปิดแผนกกายภาพบำบัดใหม่",
      desc: "ให้บริการโดยนักกายภาพบำบัดมืออาชีพ ครบวงจร",
      detail:
        "WHOCARE HOSPITAL เปิดแผนกกายภาพบำบัดใหม่ ครบครันด้วยเครื่องมือทันสมัย และทีมงานผู้เชี่ยวชาญ เพื่อฟื้นฟูร่างกายอย่างมีประสิทธิภาพ",
      link: "#",
      tag: "ข่าวโรงพยาบาล",
    },
    {
      image: extra2,
      title: "ตรวจสุขภาพฟรีสำหรับผู้สูงอายุ",
      desc: "โครงการเพื่อสังคม ตรวจสุขภาพเบื้องต้นฟรีสำหรับผู้สูงอายุ",
      detail:
        "โรงพยาบาลจัดโครงการตรวจสุขภาพฟรี เพื่อส่งเสริมสุขภาพผู้สูงอายุ และป้องกันโรคล่วงหน้า เปิดลงทะเบียนแล้ววันนี้",
      link: "#",
      tag: "กิจกรรมพิเศษ",
    },
    {
      image: extra3,
      title: "อบรมปฐมพยาบาลเบื้องต้น",
      desc: "เปิดรับสมัครอบรมสำหรับประชาชนทั่วไป ฟรี",
      detail:
        "WHOCARE จัดอบรมการปฐมพยาบาลเบื้องต้น สำหรับประชาชนทั่วไป เรียนรู้วิธีช่วยชีวิตขั้นพื้นฐานและการรับมือเหตุฉุกเฉิน",
      link: "#",
      tag: "อบรม/สัมมนา",
    },
  ];

  return (
    <MainLayout>
      {/* ส่วน header ด้านบน */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-20 text-center"
        style={{
          backgroundImage: `url(${news1})`,
        }}
      >
        <div className="absolute inset-0 bg-[#004f5e]/70 backdrop-brightness-75"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            ข่าวประชาสัมพันธ์
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            ติดตามข่าวสารและกิจกรรมล่าสุดจาก WHOCARE HOSPITAL
          </p>
        </div>
      </section>

      {/* ข่าวชุดบน */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsList.map((news, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300"
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-[#006680] mb-3">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {news.desc}
                </p>
                <div className="text-[#0289a7] font-bold text-sm mb-3">
                  {news.tag}
                </div>
                <button
                  onClick={() => setSelectedNews(news)}
                  className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                >
                  อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ข่าวชุดล่าง */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {extraNews.map((news, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300"
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-[#006680] mb-3">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {news.desc}
                </p>
                <div className="text-[#0289a7] font-bold text-sm mb-3">
                  {news.tag}
                </div>
                <button
                  onClick={() => setSelectedNews(news)}
                  className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                >
                  อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* modal popup */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-[#006680] text-4xl leading-none font-bold cursor-pointer transition"
            >
              &times;
            </button>

            <img
              src={selectedNews.image}
              alt={selectedNews.title}
              className="w-full h-52 object-cover rounded-xl mb-5"
            />
            <h2 className="text-2xl font-bold text-[#006680] mb-3">
              {selectedNews.title}
            </h2>
            <p className="text-gray-700 mb-5 leading-relaxed">
              {selectedNews.detail}
            </p>

            <div className="bg-[#b5e7f3c7] text-[#006680] text-center py-3 rounded-xl font-semibold text-base mb-6 shadow-inner">
              ประเภทข่าว: {selectedNews.tag}
            </div>

            <a
              href={selectedNews.link}
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold px-8 py-3 rounded-full cursor-pointer transition w-full block text-center shadow-md"
            >
              ไปยังแหล่งข่าว
            </a>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
