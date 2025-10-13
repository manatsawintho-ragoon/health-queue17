import React from "react";
import MainLayout from "../layouts/MainLayout";
import hospitalImg from "../assets/spu-building.jpg";

export default function About() {
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
            WHOCARE HOSPITAL – เราดูแลคุณด้วยหัวใจ
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#006680] mb-6">
          โรงพยาบาล WHOCARE คือใคร?
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg mb-8">
          โรงพยาบาล WHOCARE ก่อตั้งขึ้นด้วยเป้าหมายที่จะมอบการดูแลสุขภาพที่ทันสมัย
          ครบวงจร และเข้าถึงได้สำหรับทุกคน เรามุ่งมั่นพัฒนาเทคโนโลยีทางการแพทย์
          พร้อมทีมแพทย์ผู้เชี่ยวชาญในทุกสาขา เพื่อให้ผู้ป่วยได้รับการดูแลที่ดีที่สุด
          ทั้งทางกายและใจ
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-10">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 max-w-sm">
            <h3 className="text-xl font-semibold text-[#006680] mb-2">
              วิสัยทัศน์ (Vision)
            </h3>
            <p className="text-gray-600 text-base">
              เป็นผู้นำด้านบริการสุขภาพคุณภาพสูง
              ที่เน้นความปลอดภัยและความพึงพอใจของผู้รับบริการเป็นหลัก
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 max-w-sm">
            <h3 className="text-xl font-semibold text-[#006680] mb-2">
              พันธกิจ (Mission)
            </h3>
            <p className="text-gray-600 text-base">
              ให้บริการด้านสุขภาพด้วยเทคโนโลยีทันสมัย
              ทีมแพทย์ผู้เชี่ยวชาญ และจิตบริการที่อบอุ่นเพื่อคุณภาพชีวิตที่ดีของทุกคน
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
                เราให้ความสำคัญกับมาตรฐานความปลอดภัยสูงสุดในทุกขั้นตอนของการดูแล
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold text-[#006680] mb-3">
                ความเอาใจใส่
              </h3>
              <p className="text-gray-700">
                เราดูแลผู้ป่วยด้วยความอบอุ่นและเข้าใจ เสมือนคนในครอบครัว
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold text-[#006680] mb-3">
                ความเชี่ยวชาญ
              </h3>
              <p className="text-gray-700">
                ทีมแพทย์และพยาบาลของเรามีประสบการณ์และความรู้ระดับสากล
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
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              <img
                src={`https://randomuser.me/api/portraits/men/${num + 10}.jpg`}
                alt="Doctor"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-[#006680]">
                นพ. สมชาย ตัวอย่าง {num}
              </h3>
              <p className="text-gray-600 text-sm">แพทย์ผู้เชี่ยวชาญด้านหัวใจ</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
