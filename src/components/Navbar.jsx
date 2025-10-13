import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
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
      <div className="flex items-center justify-between px-6 py-5 relative">
        {/* โลโก้อยู่ตรงกลาง */}
        <Link
          to="/"
          className="absolute left-1/2 transform -translate-x-1/2 text-center"
        >
          <h1 className="text-2xl font-semibold tracking-widest">WHOCARE</h1>
          <p className="text-sm tracking-[0.4em]">คุณจะไม่ตายเพียงลำพัง!</p>
        </Link>

        {/* ปุ่มขวา */}
        <div className="flex items-center gap-3 ml-auto relative">
          {user ? (
            // ถ้าล็อกอินแล้ว → แสดงชื่อผู้ใช้ + dropdown
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
                  className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 animate-fadeIn"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    to="/profile"
                    className="block px-5 py-3 text-sm font-medium hover:bg-[#006680] hover:text-white transition-all cursor-pointer"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fa-solid fa-id-badge mr-2"></i>
                    โปรไฟล์ของฉัน
                  </Link>

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
            // ถ้ายังไม่ล็อกอิน → ปุ่มนัดหมายเข้ารับบริการ
            <Link
              to="/login"
              className="bg-[#0289a7] hover:bg-[#03a9c5] transition px-5 py-2 rounded-full text-sm font-semibold cursor-pointer shadow"
            >
              {t("appointment")}
            </Link>
          )}

          {/* ปุ่มเปลี่ยนภาษา */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="bg-[#005a73] text-white rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
          >
            <option value="th">TH</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      {/* แถวเมนู */}
      <div className="bg-white text-black text-1xl font-medium flex justify-center gap-10 py-4">
        <Link to="/" className="hover:text-[#006680] cursor-pointer">
          {t("home")}
        </Link>
        <Link to="/about" className="hover:text-[#006680] cursor-pointer">
          {t("about")}
        </Link>
        <Link to="/services" className="hover:text-[#006680] cursor-pointer">
          {t("services")}
        </Link>
        <Link to="/packages" className="hover:text-[#006680] cursor-pointer">
          {t("packages")}
        </Link>
        <Link to="/doctor_team" className="hover:text-[#006680] cursor-pointer">
          {t("team")}
        </Link>
        <Link to="/news" className="hover:text-[#006680] cursor-pointer">
          {t("news")}
        </Link>
        <Link to="/contact" className="hover:text-[#006680] cursor-pointer">
          {t("contact")}
        </Link>
      </div>
    </nav>
  );
}
