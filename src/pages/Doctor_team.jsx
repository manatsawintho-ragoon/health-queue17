import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import heroImg from "../assets/spu-building.jpg";
import placeholder from "../assets/WHOCARE-logo.png";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Doctor_team() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [departments, setDepartments] = useState(["ทั้งหมด"]);
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลหมอจาก Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const doctorList = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "หมอ");

        setDoctors(doctorList);
        setFilteredDoctors(doctorList);

        // สร้างรายการแผนกจากข้อมูลจริง
        const deptSet = new Set(
          doctorList.map((d) => d.department).filter(Boolean)
        );
        setDepartments(["ทั้งหมด", ...Array.from(deptSet)]);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // ฟังก์ชันกรองแผนก
  const handleFilter = (dept) => {
    setSelectedDept(dept);
    if (dept === "ทั้งหมด") {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter((d) => d.department === dept));
    }
  };

  // ฟังก์ชันเปิด Popup แสดงรายละเอียดหมอ
  const handleViewDetails = (doc) => {
    Swal.fire({
      title: `${doc.prefix || ""}${doc.fullName || "ไม่ระบุ"}`,
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8px;">
          <img 
            src="${doc.photoURL || placeholder}" 
            alt="${doc.fullName}" 
            style="width:120px;height:120px;object-fit:cover;border-radius:50%;border:4px solid #0289a7;margin-bottom:10px;"
          />
          <p style="font-size:16px;color:#006680;font-weight:600;margin:0;">
            แผนก: ${doc.department || "ไม่ระบุ"}
          </p>
          <p style="font-size:15px;color:#444;margin-top:10px;text-align:left;max-width:320px;">
            ${doc.description || "ไม่มีรายละเอียดเพิ่มเติม"}
          </p>
        </div>
      `,
      confirmButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      color: "#003f4f",
      width: "420px",
    });
  };

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
          {departments.map((dept, i) => (
            <button
              key={i}
              onClick={() => handleFilter(dept)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
                selectedDept === dept
                  ? "bg-[#006680] text-white border-[#006680]"
                  : "bg-white text-[#006680] border-[#006680] hover:bg-sky-50"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : filteredDoctors.length === 0 ? (
          <p className="text-center text-gray-500">ไม่พบข้อมูลหมอในแผนกนี้</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border-2 border-[#006680] shadow-md p-5 text-center hover:shadow-lg hover:bg-[#f0fbff] transition cursor-pointer"
                style={{
                  boxShadow:
                    "0 8px 18px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.03)",
                }}
              >
                <img
                  src={doc.photoURL || placeholder}
                  alt={doc.fullName}
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-[#006680] bg-white p-1 shadow-inner"
                />
                <h3 className="font-semibold text-[#006680] text-lg">
                  {doc.prefix || ""}
                  {doc.fullName || "ไม่ระบุ"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {doc.department || "ไม่ระบุแผนก"}
                </p>
                <button
                  onClick={() => handleViewDetails(doc)}
                  className="mt-3 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                >
                  ดูรายละเอียดเพิ่มเติม
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
