import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import heroImg from "../assets/spu-building.jpg";

//  ดึงข้อมูลหมอจากไฟล์กลาง
import { doctorCategories } from "../data/doctors";

export default function Doctor_team() {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  const displayedCategories =
    selectedCategory === "ทั้งหมด"
      ? doctorCategories
      : doctorCategories.filter((c) => c.title === selectedCategory);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-[#e6f3f5]">
        <img
          src={heroImg}
          alt="Doctor Team Hero"
          className="w-full h-[240px] object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#004f5e]/80">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            ทีมแพทย์ผู้เชี่ยวชาญของ WHOCARE
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            พร้อมดูแลคุณด้วยทีมแพทย์เฉพาะทางทุกสาขา
          </p>
        </div>
      </section>

      {/* Doctor Section */}
      <section className="min-h-screen bg-[#f8fcfd] py-16 px-6">
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          พบกับทีมแพทย์เฉพาะทางที่มีประสบการณ์จริงในแต่ละด้าน
          เพื่อให้คุณมั่นใจได้ในทุกขั้นตอนของการดูแลผิว
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["ทั้งหมด", ...doctorCategories.map((c) => c.title)].map(
            (cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                  selectedCategory === cat
                    ? "bg-[#006680] text-white border-[#006680]"
                    : "bg-white text-[#006680] border-[#006680] hover:bg-sky-50"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Doctor Cards */}
        <div className="space-y-20 max-w-7xl mx-auto">
          {displayedCategories.map((cat, i) => (
            <div
              key={i}
              className="relative bg-white rounded-3xl shadow-md border border-gray-200 hover:shadow-lg transition"
              style={{
                boxShadow:
                  "0 8px 18px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* หมวดการรักษา */}
              <div className="absolute inset-x-0 top-0 bg-white py-6 border-b border-gray-100 text-center">
                <h2 className="text-2xl font-extrabold text-[#006680] tracking-wide">
                  {cat.title}
                </h2>
                <p className="text-gray-600 text-sm mt-2 max-w-2xl mx-auto px-4">
                  {cat.desc}
                </p>
              </div>

              {/* การ์ดหมอ */}
              <div className="pt-32 pb-10 px-6">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {cat.doctors.map((doc, j) => (
                    <div
                      key={j}
                      className="bg-white rounded-xl border-2 border-[#006680] shadow-md p-5 text-center hover:shadow-lg hover:bg-[#f0fbff] transition"
                    >
                      <img
                        src={doc.img}
                        alt={doc.name}
                        className="w-32 h-32 object-contain rounded-full mx-auto mb-4 border-4 border-[#006680] bg-white p-2 shadow-inner"
                      />
                      <h3 className="font-semibold text-[#006680] text-lg">
                        {doc.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {doc.specialty}
                      </p>
                      <button className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer">
                        ดูรายละเอียด
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
