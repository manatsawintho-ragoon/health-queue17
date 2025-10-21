import React from "react";
import MainLayout from "../layouts/MainLayout";
import hospitalImg from "../assets/spu-building.jpg";
import { doctorCategories } from "../data/doctors";

export default function About() {
  // รวมหมอทั้งหมดจากทุก category เพื่อโชว์แบบย่อ
  const allDoctors = doctorCategories.flatMap((cat) => cat.doctors).slice(0, 6);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-[#e6f3f5]">
        <img
          src={hospitalImg}
          alt="Hospital Building"
          className="w-full h-[400px] object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-wide">
            เกี่ยวกับเรา
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            WHOCARE CLINIC – ผู้เชี่ยวชาญด้านการดูแลผิวและความงามครบวงจร
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#006680] mb-6">
          WHOCARE CLINIC คือใคร?
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg mb-8">
          WHOCARE CLINIC ก่อตั้งขึ้นเพื่อมอบการดูแลผิวพรรณและความงามอย่างครบวงจร
          ตั้งแต่การรักษาสิว การบำรุงผิวหน้า การทำเลเซอร์ ไปจนถึงการปรับรูปหน้าด้วยฟิลเลอร์และโบท็อกซ์
          ด้วยทีมแพทย์ผู้เชี่ยวชาญเฉพาะทางที่พร้อมให้คำแนะนำและดูแลด้วยความใส่ใจ
          เพื่อให้ทุกคนได้สัมผัสความมั่นใจและความสวยในแบบของตัวเอง
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-10">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 max-w-sm">
            <h3 className="text-xl font-semibold text-[#006680] mb-2">
              วิสัยทัศน์ (Vision)
            </h3>
            <p className="text-gray-600 text-base">
              เป็นคลินิกความงามที่ลูกค้ามั่นใจและไว้วางใจที่สุด
              ด้วยมาตรฐานการรักษาที่ปลอดภัย เทคโนโลยีทันสมัย และผลลัพธ์ที่พิสูจน์ได้จริง
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 max-w-sm">
            <h3 className="text-xl font-semibold text-[#006680] mb-2">
              พันธกิจ (Mission)
            </h3>
            <p className="text-gray-600 text-base">
              ให้บริการด้านผิวพรรณและความงามอย่างมืออาชีพ
              โดยทีมแพทย์ผู้เชี่ยวชาญเฉพาะทาง พร้อมเทคโนโลยีมาตรฐานสากล
              เพื่อเสริมสร้างความมั่นใจและความสุขในทุกช่วงวัยของคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#006680]/10 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#006680] mb-10">
            คุณค่าหลักของเรา (Our Core Values)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold text-[#006680] mb-3">
                ความปลอดภัย
              </h3>
              <p className="text-gray-700">
                ทุกขั้นตอนของการรักษาอยู่ภายใต้มาตรฐานความปลอดภัยระดับคลินิกมืออาชีพ
                พร้อมการดูแลอย่างละเอียดอ่อนจากทีมแพทย์ผู้เชี่ยวชาญ
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold text-[#006680] mb-3">
                ความเอาใจใส่
              </h3>
              <p className="text-gray-700">
                เราเชื่อว่าทุกคนมีความงามในแบบของตัวเอง
                และเราพร้อมดูแลด้วยความอบอุ่นและใส่ใจในทุกรายละเอียด
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold text-[#006680] mb-3">
                ความเชี่ยวชาญ
              </h3>
              <p className="text-gray-700">
                ทีมแพทย์ของเราเชี่ยวชาญเฉพาะทางในด้านผิวพรรณ เลเซอร์ และความงาม
                พร้อมอัปเดตเทคโนโลยีใหม่อยู่เสมอเพื่อผลลัพธ์ที่ดีที่สุด
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#006680] mb-8">
          ทีมแพทย์และผู้เชี่ยวชาญของเรา
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allDoctors.map((doc, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              <img
                src={doc.img}
                alt={doc.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-[#006680]/30"
              />
              <h3 className="text-xl font-semibold text-[#006680]">
                {doc.name}
              </h3>
              <p className="text-gray-600 text-sm">{doc.specialty}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
