import React from "react";
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaLine, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#007b8f] text-white mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* โลโก้ / คำอธิบาย */}
        <div>
          <h2 className="text-2xl font-bold mb-2">WHOCARE HOSPITAL</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            โรงพยาบาลที่ใส่ใจในทุกการดูแล สุขภาพของคุณคือหัวใจของเรา  
            ให้บริการตรวจ รักษา และให้คำปรึกษาครบวงจร โดยทีมแพทย์ผู้เชี่ยวชาญ
          </p>
        </div>
        
        {/* ติดต่อเรา */}
        <div>
          <h3 className="text-lg font-semibold mb-3">ติดต่อเรา</h3>
          <ul className="space-y-2 text-white/90">
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> 02-123-4567
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> info@whocarehospital.com
            </li>
            <li className="flex items-center gap-3 mt-3">
              <a
                href="https://github.com/manatsawintho-ragoon/health-queue17"
                target="_blank"
                className="p-2 bg-black/100 rounded-full hover:bg-black/40 transition"
              >
                <FaGithub />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* เส้นคั่น */}
      <div className="border-t border-white/30"></div>

      {/* ลิขสิทธิ์ */}
      <div className="text-center py-4 text-sm text-white/70">
        © {new Date().getFullYear()} WHOCARE Hospital | All Rights Reserved
      </div>
    </footer>
  );
}
