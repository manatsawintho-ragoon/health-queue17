// src/pages/Service.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import heroImg from "../assets/spu-building.jpg";
import placeholderImage from "../assets/WHOCARE-logo.png";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaFire } from "react-icons/fa";
import Swal from "sweetalert2";
import AnimateSection from "../components/AnimatedSection";

export default function Service() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const snap = await getDocs(collection(db, "promotions"));
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            name: d.data().name,
            description: d.data().description,
            image: d.data().image || placeholderImage,
            price: Number(d.data().price) || 0,
            discount: Number(d.data().discount) || 0,
            recommend: d.data().recommend || false,
          }))
          .filter((p) => p.discount > 0) // แสดงเฉพาะลดราคา
          .sort((a, b) => b.discount - a.discount); // เรียงจากลดมาก → น้อย
        setPromotions(list);
      } catch (err) {
        console.error("Error loading promotions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  const roundByHalf = (value) => {
    const n = Number(value) || 0;
    const flo = Math.floor(n);
    const dec = n - flo;
    return dec >= 0.5 ? Math.ceil(n) : Math.floor(n);
  };

  const showPromo = (p) => {
    const raw = p.price * (1 - p.discount / 100);
    const rounded = roundByHalf(raw);

    Swal.fire({
      title: `<h2 class='text-[#006680] font-bold text-2xl'>${p.name}</h2>`,
      html: `
        <img src="${
          p.image
        }" style="width:100%;border-radius:12px;margin-bottom:12px;object-fit:cover;max-height:360px;" />
        <p style="color:#444;text-align:left;font-size:15px;">${
          p.description || ""
        }</p>
        <p style="color:#666;margin-top:8px;">
          ส่วนลด: <strong style="color:#d33">${p.discount}%</strong>
        </p>
        <p style="color:#666;margin-top:8px;">
          ราคาเดิม: <span style="text-decoration:line-through;color:#d33">${
            p.price
          }</span> บาท
        </p>
        <p style="
          margin-top: 12px;
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
          ราคาโปรโมชั่น: ${rounded} บาท
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
        }
        navigate("/booking", { state: { promoId: p.id, promoMode: true } });
      },
    });
  };

  return (
    <MainLayout>
      {/* hero */}
      <section className="relative bg-[#e6f3f5]">
        <img
          src={heroImg}
          alt="Service Hero"
          className="w-full h-[240px] object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#004f5e]/80">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            โปรโมชั่นลดราคา
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            รวมโปรโมชั่นและแพ็กเกจสุขภาพสุดคุ้ม
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#f9feff] px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#006680] mb-8">
            โปรโมชั่นที่กำลังลดราคา
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#006680] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : promotions.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">
              ยังไม่มีโปรโมชั่นลดราคาในขณะนี้
            </p>
          ) : (
            /* Grid: 5 columns on xl, responsive down to 1 */
            <AnimateSection className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {promotions.map((p, idx) => {
                const raw = p.price * (1 - p.discount / 100);
                const rounded = roundByHalf(raw);

                return (
                  <article
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => showPromo(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") showPromo(p);
                    }}
                    className="bg-white rounded-3xl border border-[#dce7ea] shadow-md hover:shadow-2xl transform transition-all duration-200
                      flex flex-col overflow-hidden cursor-pointer relative min-h-[300px] focus:outline-none focus:ring-4 focus:ring-[#0289a7]/30"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* discount badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
                        <FaFire size={12} />-{p.discount}%
                      </div>
                    </div>

                    {/* image */}
                    <div className="w-full h-44 sm:h-40 md:h-44 overflow-hidden bg-gray-100">
                      <img
                        src={p.image || placeholderImage}
                        alt={p.name}
                        onError={(e) => (e.target.src = placeholderImage)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg md:text-xl font-semibold text-[#006680] mb-2 text-center">
                        {p.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[54px] text-center">
                        {p.description}
                      </p>

                      <div className="mb-4 w-full flex flex-col items-center">
                        <div className="text-xs text-gray-500 mt-1 text-center mb-4">
                          <span className="line-through text-red-500 mr-2">
                            {p.price} บาท
                          </span>
                          <span className="text-green-600 font-medium">
                            -{p.discount}%
                          </span>
                        </div>

                        <div
                          className="px-4 py-2 rounded-[14px]
                          bg-[linear-gradient(135deg,#e0f7fa,#b2ebf2)]
                          text-[#00556b] font-black text-base shadow-[0_6px_18px_rgba(0,150,180,0.12)]
                          inline-block text-center"
                        >
                          ราคา: {rounded} บาท
                        </div>
                      </div>

                      {/* push button to bottom so layout stable */}
                      <div className="mt-auto flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showPromo(p);
                          }}
                          className="bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full font-medium text-sm transition-shadow shadow-md cursor-pointer"
                        >
                          อ่านเพิ่มเติม
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </AnimateSection>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
