import React from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="bg-[#006680] text-white shadow">
      {/* แถวบน */}
      <div className="flex items-center justify-between px-6 py-5 relative">
        {/* โลโก้อยู่ตรงกลาง */}
        <a
          href="#"
          className="absolute left-1/2 transform -translate-x-1/2 text-center"
        >
          <h1 className="text-2xl font-semibold tracking-widest">WHOCARE</h1>
          <p className="text-sm tracking-[0.4em]">คุณจะไม่ตายเพียงลำพัง!</p>
        </a>

        {/* ปุ่มขวา */}
        <div className="flex items-center gap-3 ml-auto">
          <a
            href="/login"
            className="bg-[#0289a7] hover:bg-[#03a9c5] transition px-5 py-2 rounded-full text-sm font-semibold cursor-pointer shadow"
          >
            {t("appointment")}
          </a>

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
        <a href="#home" className="hover:text-[#006680] cursor-pointer">
          {t("home")}
        </a>
        <a href="#about" className="hover:text-[#006680] cursor-pointer">
          {t("about")}
        </a>
        <a href="#services" className="hover:text-[#006680] cursor-pointer">
          {t("services")}
        </a>
        <a href="#packages" className="hover:text-[#006680] cursor-pointer">
          {t("packages")}
        </a>
        <a href="#team" className="hover:text-[#006680] cursor-pointer">
          {t("team")}
        </a>
        <a href="/news" className="hover:text-[#006680] cursor-pointer">
          {t("news")}
        </a>
        <a href="#contact" className="hover:text-[#006680] cursor-pointer">
          {t("contact")}
        </a>
      </div>
    </nav>
  );
}
