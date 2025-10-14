import React, { useState, forwardRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import MainLayout from "../layouts/MainLayout";
import "react-datepicker/dist/react-datepicker.css";
import bgImage from "../assets/news1.jpg";

registerLocale("th", th);

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    prefix: "",
    gender: "",
    fullName: "",
    citizenId: "",
    birthDate: null,
    email: "",
    password: "",
    confirmPassword: "",
  });

  const formatDateToThai = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      readOnly
      ref={ref}
      onClick={onClick}
      value={formatDateToThai(value ? new Date(value) : null)}
      placeholder="เลือกวันเดือนปีเกิด"
      className="border border-gray-300 rounded-lg px-4 py-3 text-base w-full focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none bg-[#f9fdff] cursor-pointer"
    />
  ));

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        if (
          !formData.fullName ||
          !formData.citizenId ||
          !formData.birthDate ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง", "warning");
          return;
        }

        if (!/^\d{13}$/.test(formData.citizenId)) {
          Swal.fire("หมายเลขบัตรไม่ถูกต้อง", "ต้องมี 13 หลัก", "error");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          Swal.fire(
            "รหัสผ่านไม่ตรงกัน",
            "กรุณายืนยันรหัสผ่านอีกครั้ง",
            "error"
          );
          return;
        }

        // สมัครสมาชิก
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await updateProfile(userCredential.user, {
          displayName: formData.fullName,
        });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          prefix: formData.prefix,
          gender: formData.gender,
          fullName: formData.fullName,
          citizenId: formData.citizenId,
          birthDate: formData.birthDate.toISOString(),
          email: formData.email,
          createdAt: new Date(),
          photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });

        Swal.fire("สมัครสมาชิกสำเร็จ", "เข้าสู่ระบบได้เลย", "success").then(
          () => setIsRegister(false)
        );
      } else {
        // เข้าสู่ระบบ
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับเข้าสู่ WHOCARE",
          confirmButtonColor: "#006680",
        }).then(() => navigate("/"));
      }
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        Swal.fire(
          "อีเมลนี้ถูกใช้แล้ว",
          "กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบแทน",
          "error"
        );
      } else if (error.code === "auth/invalid-credential") {
        Swal.fire(
          "เข้าสู่ระบบไม่สำเร็จ",
          "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
          "error"
        );
      } else {
        Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
      }
    }
  };

  return (
    <MainLayout>
      {/* พื้นหลังแบบรูปภาพ */}
      <div
        className="relative flex justify-center items-start min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden pt-8"
        style={{
          backgroundImage:
            `url(${bgImage})`,
        }}
      >
        {/* ชั้นโปร่งแสง */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>

        {/* กล่องฟอร์ม */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-[#d5eef2]">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-extrabold text-[#007b8f] tracking-wide">
              WHOCARE HOSPITAL
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {isRegister
                ? "สมัครสมาชิกเพื่อเริ่มต้นใช้งาน"
                : "เข้าสู่ระบบเพื่อใช้งาน"}
            </p>
          </div>

          {/* ฟอร์มหลัก */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-x-6 gap-y-4 text-left"
          >
            {isRegister && (
              <>
                {/* คำนำหน้า */}
                <div>
                  <label className="text-gray-700 font-medium mb-1 block text-sm">
                    คำนำหน้า
                  </label>
                  <select
                    name="prefix"
                    value={formData.prefix || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
                  >
                    <option value="">-- เลือก --</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                {/* เพศ */}
                <div>
                  <label className="text-gray-700 font-medium mb-1 block text-sm">
                    เพศ
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
                  >
                    <option value="">-- เลือก --</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>

                {/* ชื่อ - นามสกุล */}
                <div className="col-span-2">
                  <label className="text-gray-700 font-medium mb-1 block text-sm">
                    ชื่อ - นามสกุล
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="เช่น หนุ่ม กรรชัย"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
                  />
                </div>

                {/* หมายเลขบัตรประชาชน */}
                <div className="col-span-2">
                  <label className="text-gray-700 font-medium mb-1 block text-sm">
                    หมายเลขบัตรประชาชน
                  </label>
                  <input
                    type="text"
                    name="citizenId"
                    value={formData.citizenId}
                    onChange={handleChange}
                    maxLength={13}
                    placeholder="หมายเลขบัตรประชาชน 13 หลัก"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
                  />
                </div>

                {/* วันเดือนปีเกิด */}
                <div className="col-span-2">
                  <label className="text-gray-700 font-medium mb-1 block text-sm">
                    วันเดือนปีเกิด
                  </label>
                  <DatePicker
                    selected={formData.birthDate}
                    onChange={(date) =>
                      setFormData({ ...formData, birthDate: date })
                    }
                    locale="th"
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={<CustomInput />}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* อีเมล */}
            <div className="col-span-2">
              <label className="text-gray-700 font-medium mb-1 block text-sm">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
              />
            </div>

            {/* รหัสผ่าน */}
            <div className={`${isRegister ? "col-span-1" : "col-span-2"}`}>
              <label className="text-gray-700 font-medium mb-1 block text-sm">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
              />
            </div>

            {/* ยืนยันรหัสผ่าน */}
            {isRegister && (
              <div>
                <label className="text-gray-700 font-medium mb-1 block text-sm">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#007b8f] outline-none w-full bg-white"
                />
              </div>
            )}

            {/* ปุ่ม */}
            <div className="col-span-2 mt-2">
              <button
                type="submit"
                className="bg-[#006680] hover:bg-[#0099b3] text-white font-semibold py-2.5 rounded-md text-base shadow-sm w-full transition cursor-pointer"
              >
                {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-5 text-sm text-gray-600">
            {isRegister ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
            <span
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#007b8f] cursor-pointer font-semibold hover:underline"
            >
              {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </span>
            <div className="mt-2">
              <button
                onClick={() => navigate("/")}
                className="text-xs text-gray-500 hover:text-[#007b8f] underline transition cursor-pointer"
              >
                ← กลับหน้าแรก
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
