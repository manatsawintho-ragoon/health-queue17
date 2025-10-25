import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/WHOCARE-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          localStorage.setItem("user", JSON.stringify(docSnap.data())); // ✅ เก็บ role ไว้ใน localStorage ด้วย
        }
      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem("user");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#006680] text-white shadow sticky top-0 z-50">
      {/* แถวบน */}
      <div className="flex items-center justify-between px-6 py-4 relative">
        {/* โลโก้ตรงกลาง */}
        <Link
          to="/"
          className="absolute left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center justify-center"
        >
          <h1 className="text-2xl font-semibold tracking-widest">WHOCARE</h1>{" "}
          <p className="text-sm tracking-[0.4em]">เค้าไม่แคร์ แต่เราแคร์</p>
        </Link>

        {/* ปุ่มขวา */}
        <div className="flex items-center gap-3 ml-auto relative">
          {user ? (
            // ถ้าล็อกอินแล้ว
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-[#0289a7] hover:bg-[#03a9c5] transition px-5 py-2 rounded-full text-sm font-semibold cursor-pointer shadow"
              >
                <i className="fa-solid fa-user"></i>
                {userData?.fullName || user.displayName || "ผู้ใช้"}
                <i
                  className={`fa-solid fa-chevron-${
                    menuOpen ? "up" : "down"
                  } text-xs ml-1`}
                ></i>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 animate-fadeIn"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {/* โปรไฟล์ */}
                  <Link
                    to="/profile"
                    className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fa-solid fa-id-badge mr-2"></i>
                    โปรไฟล์ของฉัน
                  </Link>

                  <Link
                    to="/appointments"
                    className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fa-solid fa-bookmark mr-2"></i>
                    การนัดหมายของฉัน
                  </Link>

                  {/*  ปุ่มเฉพาะ Role */}
                  {userData?.role === "ผู้พัฒนา" && (
                    <Link
                      to="/DevManager"
                      className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="fa-solid fa-code mr-2"></i>
                      Dev Manager
                    </Link>
                  )}

                  {(userData?.role === "ผู้พัฒนา" || userData?.role === "แอดมิน") && (
                    <Link
                      to="/AdminDashboard"
                      className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="fa-solid fa-gear mr-2"></i>
                      Admin Dashboard
                    </Link>
                  )}

                  {(userData?.role === "ผู้พัฒนา" || userData?.role === "หมอ") && (
                    <Link
                      to="/DoctorPanel"
                      className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="fa-solid fa-stethoscope mr-2"></i>
                      Doctor Panel
                    </Link>
                  )}

                  {/* ออกจากระบบ */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ยังไม่ล็อกอิน
            <Link
              to="/login"
              className="bg-[#0289a7] hover:bg-[#03a9c5] transition px-8 py-3 rounded-full text-sm font-semibold cursor-pointer shadow"
            >
              <i className="fa-solid fa-right-to-bracket"></i>{" "}
              นัดหมายเข้ารับบริการ
            </Link>
          )}
        </div>
      </div>

      {/* แถวเมนู */}
      <div className="bg-white text-black text-1xl font-medium flex justify-center gap-10 py-4">
        <Link to="/" className="hover:text-[#006680] cursor-pointer">
          หน้าแรก
        </Link>
        <Link to="/about" className="hover:text-[#006680] cursor-pointer">
          เกี่ยวกับเรา
        </Link>
        <Link to="/services" className="hover:text-[#006680] cursor-pointer">
          บริการของเรา
        </Link>
        <Link to="/packages" className="hover:text-[#006680] cursor-pointer">
          แพ็กเกจและโปรโมชั่น
        </Link>
        <Link to="/doctor_team" className="hover:text-[#006680] cursor-pointer">
          ทีมแพทย์
        </Link>
        <Link to="/news" className="hover:text-[#006680] cursor-pointer">
          ข่าวสารประชาสัมพันธ์
        </Link>
        <Link to="/contact" className="hover:text-[#006680] cursor-pointer">
          ติดต่อเรา
        </Link>
      </div>
    </nav>
  );
}
