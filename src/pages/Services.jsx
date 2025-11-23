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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().name,
          description: doc.data().description,
          image: doc.data().image,
          price: doc.data().price,
          recommend: doc.data().recommend,
          createdAt: doc.data().createdAt,
        }));

        const sorted = list.sort((a, b) => {
          if (a.recommend === b.recommend) {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
          }
          return b.recommend - a.recommend;
        });

        setServices(sorted);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const showDetail = (s) => {
    const user = JSON.parse(localStorage.getItem("user"));
    Swal.fire({
      title: `<h2 class='text-[#006680] font-bold text-2xl'>${s.title}</h2>`,
      html: `
        <img src="${s.image || placeholderImage}" alt="${
        s.title
      }" style="width:100%; border-radius:12px; margin-bottom:12px; object-fit:cover; max-height:360px;"/>
        <p style="color:#333; text-align:left; font-size:15px;">${
          s.description || "ไม่มีรายละเอียด"
        }</p>
        <p style="margin-top: 8px;
        padding: 10px 16px;
        background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
        color: #00556b;
        font-weight: 900;
        font-size: 22px;
        border-radius: 14px;
        text-align: center;
        letter-spacing: -0.5px;
        box-shadow: 0 4px 10px rgba(0,150,180,0.15);">ราคา: ${
          s.price || "-"
        } บาท</p>
      `,
      showCancelButton: true,
      confirmButtonText: "จองบริการนี้",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#006680",
      background: "#f9feff",
      preConfirm: () => {
        if (!user) {
          Swal.fire({
            icon: "info",
            title: "กรุณาเข้าสู่ระบบก่อนทำการจอง",
            confirmButtonText: "เข้าสู่ระบบ",
            confirmButtonColor: "#006680",
          }).then(() => navigate("/login"));
          return false;
        } else {
          navigate("/booking", { state: { serviceId: s.id } });
        }
      },
    });
  };

  const directBook = (s) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบก่อนทำการจอง",
        confirmButtonText: "เข้าสู่ระบบ",
        confirmButtonColor: "#006680",
      }).then(() => navigate("/login"));
      return;
    }
    navigate("/booking", { state: { serviceId: s.id } });
  };

  return (
    <MainLayout>
      <section className="relative bg-[#e6f3f5]">
        <img
          src={heroImg}
          alt="Service Hero"
          className="w-full h-[240px] object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#004f5e]/80">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            บริการของเรา
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            ดูแลผิวพรรณและความงามครบวงจร ด้วยทีมแพทย์เฉพาะทาง
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#f9feff] px-6">
        <h2 className="text-3xl font-bold text-center text-[#006680] mb-10">
          บริการของเรา
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#006680] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            ยังไม่มีบริการในระบบ
          </p>
        ) : (
          <AnimateSection className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
            {services.map((s, idx) => (
              <article
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => showDetail(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") showDetail(s);
                }}
                className="relative bg-white rounded-3xl border border-[#dce7ea]
                  shadow-md hover:shadow-2xl transition-all transform
                  flex flex-col overflow-hidden animate-fadeIn cursor-pointer
                  focus:outline-none focus:ring-4 focus:ring-[#0289a7]/20"
                style={{ animationDelay: `${idx * 80}ms`, minHeight: 380 }}
              >
                {s.recommend && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
                    <FaFire size={12} />
                    Hot
                  </div>
                )}

                <div className="w-full h-56 overflow-hidden bg-gray-100">
                  <img
                    src={s.image || placeholderImage}
                    onError={(e) => (e.target.src = placeholderImage)}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* content */}
                <div className="p-6 flex flex-col flex-1 text-center">
                  <h3 className="text-xl font-semibold text-[#006680] mb-2">
                    {s.title}
                  </h3>

                  {/* description: fixed min height so height predictable */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 break-words min-h-[60px]">
                    {s.description?.slice(0, 120) || "ไม่มีรายละเอียด"}
                  </p>

                  {/* price: centered and stable */}
                  <div className="mt-1 mb-3 flex justify-center items-center">
                    <div
                      className="inline-block px-6 py-2 rounded-[14px] tracking-[-0.5px]
                        text-[#00556b] font-black text-[15px]
                        bg-[linear-gradient(135deg,#e0f7fa,#b2ebf2)]
                        shadow-[0_4px_10px_rgba(0,150,180,0.15)]
                        text-center min-w-[140px]"
                    >
                      ราคา: {s.price ?? "-"} บาท
                    </div>
                  </div>

                  {/* push button to bottom so price never overlaps */}
                  <div className="mt-auto flex justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDetail(s);
                      }}
                      className="bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                    >
                      อ่านเพิ่มเติมบริการนี้
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </AnimateSection>
        )}
      </section>
    </MainLayout>
  );
}
