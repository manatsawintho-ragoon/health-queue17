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
      <div className="flex items-center justify-between px-6 py-2">
        {/* Search */}
        <div className="flex items-center bg-[#005a73] px-3 py-1 rounded-full w-64">
          <i className="fa-solid fa-magnifying-glass mr-2 text-white text-sm"></i>
          <input
            type="text"
            placeholder={t("search")}
            className="bg-transparent outline-none text-sm w-full placeholder-white"
          />
        </div>

        {/* Logo */}
        <a href="#">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-widest">WHOCARE</h1>
            <p className="text-sm tracking-[0.4em]">คุณจะไม่ตายเพียงลำพัง!</p>
          </div>
        </a>

        {/* ปุ่มขวา */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="bg-[#0289a7] hover:bg-[#03a9c5] transition px-5 py-2 rounded-full text-sm font-semibold cursor-pointer shadow">
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
      <div className="bg-white text-black text-1xl font-medium flex justify-center gap-10 py-4.5">
        <a href="#home" className="hover:text-[#006680]">
          {t("home")}
        </a>
        <a href="#about" className="hover:text-[#006680]">
          {t("about")}
        </a>
        <a href="#services" className="hover:text-[#006680]">
          {t("services")}
        </a>
        <a href="#packages" className="hover:text-[#006680]">
          {t("packages")}
        </a>
        <a href="#team" className="hover:text-[#006680]">
          {t("team")}
        </a>
        <a href="#news" className="hover:text-[#006680]">
          {t("news")}
        </a>
        <a href="#contact" className="hover:text-[#006680]">
          {t("contact")}
        </a>
      </div>
    </nav>
  );
}
