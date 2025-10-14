import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const formatThaiDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    const day = date.getDate();
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return "-";
    const birthDate = new Date(birthDateStr);
    const diffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (!userData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[70vh] text-[#006680] text-lg font-semibold">
          กำลังโหลดข้อมูลผู้ใช้...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] bg-gradient-to-br from-[#e0f7fa] to-[#006680] px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-t-[6px] border-[#006680] relative">
          {/* โลโก้ WHOCARE มุมบน */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#006680] text-white px-6 py-1 rounded-full text-sm font-semibold shadow-md">
            WHOCARE HOSPITAL
          </div>

          {/* ส่วนบน: รูปภาพและชื่อ */}
          <div className="flex flex-col items-center text-center mt-6">
            <img
              src={
                userData.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-[#0289a7] shadow-md mb-4"
            />
            <h2 className="text-2xl font-bold text-[#006680]">
              {userData.fullName}
            </h2>
            <p className="text-gray-600 text-sm">ผู้ใช้ระบบโรงพยาบาล WHOCARE</p>
          </div>

          {/* เส้นแบ่ง */}
          <hr className="my-6 border-t-2 border-[#b7dfe6]" />

          {/* ข้อมูลส่วนตัว */}
          <div className="space-y-3 text-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">
                ชื่อ - นามสกุล
              </span>
              <span>
                {userData.prefix} {userData.fullName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">เพศ</span>
              <span>{userData.gender || "-"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">อายุ</span>
              <span>{calculateAge(userData.birthDate)} ปี</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">
                เลขบัตรประชาชน
              </span>
              <span>{userData.citizenId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">
                วันเดือนปีเกิด
              </span>
              <span>{formatThaiDate(userData.birthDate)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">อีเมล</span>
              <span>{userData.email}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#006680]">วันที่สมัคร</span>
              <span>
                {formatThaiDate(
                  userData.createdAt?.toDate?.() || userData.createdAt
                )}
              </span>
            </div>
          </div>

          {/* เส้นคั่นล่าง */}
          <hr className="my-6 border-t border-[#b7dfe6]" />

          {/* ปุ่มย้อนกลับ */}
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold px-8 py-2 rounded-full shadow-md transition cursor-pointer"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
