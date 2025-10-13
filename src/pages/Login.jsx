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

registerLocale("th", th);

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
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
          Swal.fire("รหัสผ่านไม่ตรงกัน", "กรุณายืนยันรหัสผ่านอีกครั้ง", "error");
          return;
        }

        // ✅ สมัครสมาชิก
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // ✅ อัปเดตชื่อให้ Firebase Auth (เพื่อใช้ใน Navbar)
        await updateProfile(userCredential.user, {
          displayName: formData.fullName,
        });

        // ✅ บันทึกข้อมูลลง Firestore พร้อม fullName และ avatar จำลอง
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: formData.fullName,
          citizenId: formData.citizenId,
          birthDate: formData.birthDate
            ? formData.birthDate.toISOString()
            : null,
          email: formData.email,
          createdAt: new Date(),
          photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });

        Swal.fire("สมัครสมาชิกสำเร็จ", "เข้าสู่ระบบได้เลย", "success").then(() =>
          setIsRegister(false)
        );
      } else {
        // ✅ เข้าสู่ระบบ
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
        Swal.fire("อีเมลนี้ถูกใช้แล้ว", "กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบแทน", "error");
      } else if (error.code === "auth/invalid-credential") {
        Swal.fire("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
      } else {
        Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-start min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#005a73] to-[#0099b3] px-4 pt-10">
        <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-[#b7dfe6]">
          <h1 className="text-3xl font-extrabold text-[#006680] text-center mb-2 tracking-wide">
            WHOCARE HOSPITAL
          </h1>
          <p className="text-gray-600 text-center mb-5">
            {isRegister ? "สมัครสมาชิกเพื่อเริ่มต้นใช้งาน" : "เข้าสู่ระบบเพื่อใช้งาน"}
          </p>

          <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-3 text-left ${
              isRegister ? "max-h-[65vh] overflow-y-auto px-3" : ""
            }`}
          >
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-800 font-semibold mb-1 block text-sm">
                      ชื่อ - นามสกุล
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="นาย ไอที ซัพพอร์ต"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#006680] outline-none w-full"
                    />
                  </div>

                  <div>
                    <label className="text-gray-800 font-semibold mb-1 block text-sm">
                      หมายเลขบัตรประชาชน
                    </label>
                    <input
                      type="text"
                      name="citizenId"
                      value={formData.citizenId}
                      onChange={handleChange}
                      maxLength={13}
                      placeholder="13 หลัก"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#006680] outline-none w-full"
                    />
                  </div>
                </div>

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
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={<CustomInput />}
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
                placeholder="example@email.com"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#006680] outline-none w-full"
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
                placeholder="Password"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#006680] outline-none w-full"
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
                  placeholder="Confirm Password"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#006680] outline-none w-full"
                />
              </div>
            )}

            <button
              type="submit"
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold py-2.5 rounded-lg text-base shadow-md w-full cursor-pointer mt-2"
            >
              {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* ลิงก์สลับ */}
          <div className="text-center mt-4">
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

          {/* กลับหน้าแรก */}
          <div className="mt-3 text-center">
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
