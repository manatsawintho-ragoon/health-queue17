// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";

import placeholderImage from "../assets/WHOCARE-logo.png";
import Footer from "../components/Footer";
import AnimateSection from "../components/AnimatedSection";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const servicesScrollRef = useRef(null);
  const doctorsScrollRef = useRef(null);
  const promosScrollRef = useRef(null);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [dbServices, setDbServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const normalizeCreatedAt = (val) => {
    if (!val) return new Date().toISOString();
    try {
      if (typeof val === "object" && typeof val.toDate === "function") {
        return val.toDate().toISOString();
      }
      if (typeof val === "string") return val;
      if (val instanceof Date) return val.toISOString();
      return new Date(val).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const getField = (data, keys, fallback = "") => {
    for (let k of keys) {
      if (data && typeof data[k] !== "undefined" && data[k] !== null) {
        return data[k];
      }
    }
    return fallback;
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingServices(true);
      setLoadingExtras(true);
      try {
        const snapServices = await getDocs(collection(db, "services"));
        const list = snapServices.docs
          .map((doc) => ({
            id: doc.id,
            title: getField(doc.data(), ["name", "title"], ""),
            description: getField(doc.data(), ["description", "desc"], ""),
            image: getField(
              doc.data(),
              ["image", "imageUrl"],
              placeholderImage
            ),
            price: getField(doc.data(), ["price"], 0),
            recommend: getField(doc.data(), ["recommend"], false),
            createdAt: getField(doc.data(), ["createdAt", "created_at"], null),
          }))
          .filter((item) => item.recommend === true)
          .sort(
            (a, b) =>
              new Date(normalizeCreatedAt(b.createdAt)).getTime() -
              new Date(normalizeCreatedAt(a.createdAt)).getTime()
          );
        setDbServices(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }

      try {
        const [snapDoctors, snapPromos] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "promotions")),
        ]);

        const docList = snapDoctors.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.role === "หมอ")
          .slice(0, 8);
        setDoctors(docList);

        const promoList = snapPromos.docs
          .map((d) => ({
            id: d.id,
            name: getField(d.data(), ["name", "title"], "โปรโมชั่น"),
            description: getField(d.data(), ["description", "desc"], ""),
            image: getField(d.data(), ["image", "imageUrl"], placeholderImage),
            price: getField(d.data(), ["price"], 0),
            discount: getField(d.data(), ["discount"], 0),
            recommend: getField(d.data(), ["recommend"], false),
            createdAt: getField(d.data(), ["createdAt", "created_at"], null),
          }))
          .slice(0, 12);
        setPromotions(promoList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingExtras(false);
      }
    };

    fetchAll();
  }, []);

  const scrollByDir = (ref, dir) => {
    if (!ref?.current) return;
    ref.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const roundByHalf = (value) => {
    const n = Number(value) || 0;
    const flo = Math.floor(n);
    const dec = n - flo;
    return dec >= 0.5 ? Math.ceil(n) : Math.floor(n);
  };

  const showDetail = (service) => {
    Swal.fire({
      title: `<h2 class="text-[#006680] font-bold">${service.title}</h2>`,
      html: `
        <img src="${service.image}" alt="${service.title}" 
          style="max-width: 450px; border-radius: 12px; margin-bottom: 12px;" />
        <p style="color: #444; font-size: 15px; text-align: left;">${service.description}</p>
        <p style="
          margin-top: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
          color: #00556b;
          font-weight: 900;
          font-size: 22px;
          border-radius: 14px;
          text-align: center;
          letter-spacing: -0.5px;
          box-shadow: 0 4px 10px rgba(0,150,180,0.15);
        ">
          ราคา: ${service.price} บาท
        </p>

      `,
      showCancelButton: true,
      confirmButtonText: "จองบริการนี้",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          Swal.fire({
            icon: "info",
            title: "กรุณาเข้าสู่ระบบก่อนจองบริการ",
            confirmButtonText: "เข้าสู่ระบบ",
            confirmButtonColor: "#006680",
          }).then(() => navigate("/login"));
          return false;
        } else {
          navigate("/booking", { state: { serviceId: service.id } });
        }
      },
    });
  };

  const showDoctor = (d) => {
    Swal.fire({
      title: `${d.prefix || ""} ${d.fullName || "ไม่ระบุ"}`,
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:6px;">
          <img src="${
            d.photoUrl || placeholderImage
          }" style="width:140px;height:140px;border-radius:9999px;object-fit:cover;border:4px solid #006680;" />
          <p style="color:#006680;font-weight:600;margin:0;">แผนก: ${
            d.department || "-"
          }</p>
          <p style="color:#444;margin-top:8px;text-align:left;max-width:420px;">${
            d.description || "ไม่มีรายละเอียดเพิ่มเติม"
          }</p>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "ดูหมอทั้งหมด",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        if (d.id) navigate(`/doctor_team`);
      },
    });
  };

  const showPromo = (p) => {
    const price = Number(p.price) || 0;
    const disc = Number(p.discount) || 0;
    const raw = price * (1 - disc / 100);
    const rounded = roundByHalf(raw);
    Swal.fire({
      title: `<h2 class="text-[#006680] font-bold">${p.name}</h2>`,
      html: `
        <img src="${p.image || placeholderImage}" alt="${
        p.name
      }" style="max-width:450px;border-radius:12px;margin-bottom:12px;" />
        <p style="color:#444;text-align:left;">${p.description || ""}</p>
        <p style="color:#666;margin-top:8px;">ส่วนลด: <span style="text-decoration:line-through;color:#d33">${disc}</span>%</p>
        <p style="color:#666;margin-top:8px;">ราคาเดิม: <span style="text-decoration:line-through;color:#d33">${price}</span> บาท</p>
       <p style="
        margin-top: 8px;
        padding: 10px 16px;
        background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
        color: #00556b;
        font-weight: 900;
        font-size: 22px;
        border-radius: 14px;
        text-align: center;
        letter-spacing: -0.5px;
        box-shadow: 0 4px 10px rgba(0,150,180,0.15);
      ">
        ราคาเต็ม: ${rounded} บาท
      </p>


      `,
      showCancelButton: true,
      confirmButtonText: "จองโปรโมชั่นนี้",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          Swal.fire({
            icon: "info",
            title: "กรุณาเข้าสู่ระบบก่อนจองบริการ",
            confirmButtonText: "เข้าสู่ระบบ",
            confirmButtonColor: "#006680",
          }).then(() => navigate("/login"));
          return false;
        } else {
          navigate("/booking", { state: { promoId: p.id, promoMode: true } });
        }
      },
    });
  };

  const directBookPromo = (p) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบก่อนจองบริการ",
        confirmButtonText: "เข้าสู่ระบบ",
        confirmButtonColor: "#006680",
      }).then(() => navigate("/login"));
      return;
    }
    navigate("/booking", { state: { promoId: p.id, promoMode: true } });
  };

  return (
    <>
      <div className="min-h-screen bg-[#f9feff] text-gray-800 flex flex-col items-center py-12 overflow-visible select-none">
        <section className="text-center mb-12 overflow-visible">
          <AnimateSection className="w-full">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#006680] mb-3">
              WHOCARE BEAUTY & SKIN CLINIC
            </h1>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              คลินิกความงามที่เข้าใจผิวของคุณ — ให้ WHOCARE
              ดูแลด้วยเทคโนโลยีระดับสากล
            </p>
          </AnimateSection>
        </section>

        {/* Services carousel */}
        <section className="relative w-full max-w-6xl mb-20 overflow-visible">
          <AnimateSection className="w-full">
            <h2 className="text-3xl font-bold text-center text-[#006680] mb-8">
              บริการแนะนำมาใหม่
            </h2>

            <button
              onClick={() => scrollByDir(servicesScrollRef, "left")}
              className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 bg-[#006680] text-white hover:bg-[#0289a7] rounded-full p-4 shadow-2xl transition z-30 cursor-pointer"
            >
              <FaChevronLeft size={24} />
            </button>

            <div
              ref={servicesScrollRef}
              className="flex gap-8 px-6 py-4 flex-nowrap cursor-grab active:cursor-grabbing overflow-visible"
              style={{
                overflowX: "auto",
                overflowY: "visible",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {loadingServices ? (
                <div className="flex justify-center items-center w-full py-10">
                  <div className="w-8 h-8 border-4 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : dbServices.length > 0 ? (
                dbServices.map((s, i) => (
                  <div
                    key={i}
                    className="max-w-[320px] bg-white rounded-3xl border border-[#dce7ea] shadow-md hover:shadow-2xl transition-all transform hover:scale-105 flex-shrink-0 z-20 relative"
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                  >
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <FaFire size={12} />
                      Hot
                    </div>

                    <img
                      src={s.image || placeholderImage}
                      onError={(e) => (e.target.src = placeholderImage)}
                      alt={s.title}
                      className="rounded-t-3xl h-56 w-full object-cover"
                    />

                    <div className="p-5 text-center">
                      <h3 className="text-xl font-semibold text-[#006680] mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {s.description?.slice(0, 70)}...
                      </p>
                      <p className="text-[#006680] font-semibold mb-4">
                        ราคา: {s.price} บาท
                      </p>
                      <button
                        onClick={() => showDetail(s)}
                        className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                      >
                        อ่านเพิ่มเติม
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center w-full">
                  ยังไม่มีบริการแนะนำในระบบ
                </p>
              )}
            </div>

            <button
              onClick={() => scrollByDir(servicesScrollRef, "right")}
              className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 bg-[#006680] text-white hover:bg-[#0289a7] rounded-full p-4 shadow-2xl transition z-30 cursor-pointer"
            >
              <FaChevronRight size={24} />
            </button>

            <div className="flex flex-col items-center mb-12">
              <button
                onClick={() => navigate("/services")}
                className="bg-[#006680] hover:bg-[#0289a7] text-white text-l mt-8 px-10 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-105 cursor-pointer"
              >
                ดูบริการทั้งหมด
              </button>

              <div className="w-2/3 mt-8 border-t-2 border-[#cfe6ea]"></div>
            </div>
          </AnimateSection>
        </section>

        <section className="w-full max-w-6xl mb-12">
          <AnimateSection>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#006680]">
                โปรโมชั่นแนะนำ
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollByDir(promosScrollRef, "left")}
                  className="bg-[#006680] text-white rounded-full hover:bg-[#0289a7] p-2 shadow cursor-pointer"
                  title="เลื่อนซ้าย"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => scrollByDir(promosScrollRef, "right")}
                  className="bg-[#006680] text-white rounded-full hover:bg-[#0289a7] p-2 shadow cursor-pointer"
                  title="เลื่อนขวา"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {loadingExtras ? (
              <div className="text-center py-8">กำลังโหลดโปรโมชั่น...</div>
            ) : promotions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ยังไม่มีโปรโมชั่น
              </div>
            ) : (
              <div
                ref={promosScrollRef}
                className="flex gap-6 px-2 py-2 overflow-x-auto overflow-y-visible scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {promotions.slice(0, 12).map((p) => {
                  const price = Number(p.price) || 0;
                  const disc = Number(p.discount) || 0;
                  const raw = price * (1 - disc / 100);
                  const rounded = roundByHalf(raw);
                  return (
                    <div
                      key={p.id}
                      className="min-w-[260px] max-w-[260px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition relative cursor-pointer"
                      onClick={() => showPromo(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") showPromo(p);
                      }}
                    >
                      <div className="absolute top-3 left-3 bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        -{disc}%
                      </div>
                      <div className="relative h-44 bg-gray-100">
                        <img
                          src={p.image || placeholderImage}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-[#006680] text-lg">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                          {p.description}
                        </p>
                        <p className="mt-3 text-sm text-gray-500">
                          <span className="line-through text-red-500 mr-2">
                            {price} บาท
                          </span>
                          <span className="font-bold text-[006680]">
                            {rounded} บาท
                          </span>
                        </p>
                        <div className="mt-3 flex justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showPromo(p);
                            }}
                            className="bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full text-sm cursor-pointer"
                          >
                            อ่านเพิ่มเติม
                          </button>
                        </div>
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <FaFire size={12} />- {disc}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-col items-center mb-12">
              <button
                onClick={() => navigate("/packages")}
                className="bg-[#006680] hover:bg-[#0289a7] text-white text-s mt-4 px-4 py-2 rounded-full font-semibold shadow-lg transition transform hover:scale-101 cursor-pointer"
              >
                ดูโปรโมชั่นทั้งหมด
              </button>

              <div className="w-2/3 mt-8 border-t-2 border-[#cfe6ea]"></div>
            </div>
          </AnimateSection>
        </section>
        <section className="w-full max-w-6xl mb-12">
          <AnimateSection>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#006680]">
                หมอที่ประจำคลินิก
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollByDir(doctorsScrollRef, "left")}
                  className="bg-[#006680] text-white rounded-full hover:bg-[#0289a7] p-2 shadow cursor-pointer"
                  title="เลื่อนซ้าย"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => scrollByDir(doctorsScrollRef, "right")}
                  className="bg-[#006680] text-white rounded-full hover:bg-[#0289a7] p-2 shadow cursor-pointer"
                  title="เลื่อนขวา"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {loadingExtras ? (
              <div className="text-center py-8">กำลังโหลดข้อมูลแพทย์...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ยังไม่มีข้อมูลแพทย์
              </div>
            ) : (
              <div
                ref={doctorsScrollRef}
                className="flex gap-6 px-2 py-2 overflow-x-auto overflow-y-visible scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {doctors.slice(0, 8).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => showDoctor(d)}
                    className="min-w-[220px] max-w-[220px] bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative mx-auto w-28 h-28 mb-3">
                      <img
                        src={d.photoUrl || placeholderImage}
                        onError={(e) => (e.target.src = placeholderImage)}
                        alt={d.fullName}
                        className="w-28 h-28 object-cover rounded-full border-4 border-[#006680] p-1 bg-white"
                      />
                    </div>
                    <h3 className="font-semibold text-[#006680]">
                      {(d.prefix || "") + " " + (d.fullName || "ไม่ระบุ")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {d.department || "ไม่ระบุแผนก"}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDoctor(d);
                        }}
                        className="bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full text-sm cursor-pointer"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col items-center mb-12">
              <button
                onClick={() => navigate("/doctor_team")}
                className="bg-[#006680] hover:bg-[#0289a7] text-white text-s mt-4 px-4 py-2 rounded-full font-semibold shadow-lg transition transform hover:scale-101 cursor-pointer"
              >
                ดูหมอที่ประจำทั้งหมด
              </button>

              <div className="w-2/3 mt-8 border-t-2 border-[#cfe6ea]"></div>
            </div>
          </AnimateSection>
        </section>
      </div>
      <Footer />
    </>
  );
}
