import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import MainLayout from "../layouts/MainLayout";
registerLocale("th", th);

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    citizenId: "",
    birthDate: null,
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (
        !formData.citizenId ||
        !formData.birthDate ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        Swal.fire({
          icon: "warning",
          title: "ข้อมูลไม่ครบ!",
          text: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
          confirmButtonColor: "#006680",
        });
        return;
      }

      if (!/^\d{13}$/.test(formData.citizenId)) {
        Swal.fire({
          icon: "error",
          title: "หมายเลขบัตรไม่ถูกต้อง!",
          text: "กรุณากรอกหมายเลขบัตรประชาชนให้ครบ 13 หลัก",
          confirmButtonColor: "#006680",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "รหัสผ่านไม่ตรงกัน!",
          text: "กรุณายืนยันรหัสผ่านให้ตรงกัน",
          confirmButtonColor: "#006680",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        text: "คุณสามารถเข้าสู่ระบบได้แล้ว",
        confirmButtonColor: "#006680",
      }).then(() => setIsRegister(false));
    } else {
      if (!formData.email || !formData.password) {
        Swal.fire({
          icon: "warning",
          title: "ข้อมูลไม่ครบ!",
          text: "กรุณากรอกอีเมลและรหัสผ่าน",
          confirmButtonColor: "#006680",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ!",
        text: `ยินดีต้อนรับ, ${formData.email}`,
        confirmButtonColor: "#006680",
      }).then(() => navigate("/"));
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#026777]">
        <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-[#b7dfe6] backdrop-blur-md">
          <h1 className="text-3xl font-extrabold text-[#006680] text-center mb-2 tracking-wide">
            WHOCARE HOSPITAL
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {isRegister
              ? "สมัครสมาชิกเพื่อเริ่มต้นใช้งาน"
              : "เข้าสู่ระบบเพื่อใช้งาน"}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 text-left"
          >
            {isRegister && (
              <>
                {/* หมายเลขบัตร */}
                <div>
                  <label className="text-gray-800 font-semibold mb-1 block text-sm">
                    หมายเลขบัตรประชาชน
                  </label>
                  <input
                    type="text"
                    name="citizenId"
                    value={formData.citizenId}
                    onChange={handleChange}
                    placeholder="เช่น 1234567890123"
                    maxLength={13}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none w-full"
                  />
                </div>

                {/* วันเดือนปีเกิด */}
                <div>
                  <label className="text-gray-800 font-semibold mb-1 block text-sm">
                    วันเดือนปีเกิด
                  </label>
                  <DatePicker
                    selected={formData.birthDate}
                    onChange={(date) =>
                      setFormData({ ...formData, birthDate: date })
                    }
                    locale="th"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="เลือกวันเดือนปีเกิด"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="border border-gray-300 rounded-lg px-4 py-3 text-base w-full focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none bg-[#f9fdff] cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* อีเมล */}
            <div>
              <label className="text-gray-800 font-semibold mb-1 block text-sm">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none w-full"
              />
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="text-gray-800 font-semibold mb-1 block text-sm">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none w-full"
              />
            </div>

            {/* ยืนยันรหัสผ่าน */}
            {isRegister && (
              <div>
                <label className="text-gray-800 font-semibold mb-1 block text-sm">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-[#006680] focus:border-[#006680] outline-none w-full"
                />
              </div>
            )}

            {/* ปุ่ม */}
            <button
              type="submit"
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold py-2.5 rounded-lg text-base transition-transform duration-300 transform hover:scale-105 shadow-md w-full cursor-pointer"
            >
              {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* ลิงก์สลับ */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-700">
              {isRegister ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
              <span
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#006680] cursor-pointer font-semibold hover:underline"
              >
                {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </span>
            </p>
          </div>

          {/* ปุ่มกลับ */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-[#006680] underline transition cursor-pointer"
            >
              ← กลับหน้าแรก
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
