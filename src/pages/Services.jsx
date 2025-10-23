import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import heroImg from "../assets/spu-building.jpg";
import placeholderImage from "../assets/WHOCARE-logo.png";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaFire } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Service() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ดึงข้อมูลบริการทั้งหมดจาก Firestore
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

        // เรียงให้บริการที่ recommend === true อยู่ก่อนเสมอ
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

  // ฟังก์ชันแสดง popup รายละเอียดบริการ
  const showDetail = (s) => {
    const user = JSON.parse(localStorage.getItem("user"));
    Swal.fire({
      title: `<h2 class='text-[#006680] font-bold text-2xl'>${s.title}</h2>`,
      html: `
        <img src="${s.image || placeholderImage}" alt="${
        s.title
      }" style="width:100%; border-radius:12px; margin-bottom:12px;"/>
        <p style="color:#333; text-align:left; font-size:15px;">${
          s.description || "ไม่มีรายละเอียด"
        }</p>
        <p style="margin-top:12px; color:#006680; font-weight:600;">ราคา: ${
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
          }).then(() => {
            navigate("/Whocare/login");
          });
          return false;
        } else {
          Swal.fire({
            icon: "success",
            title: "กำลังไปยังหน้าจองคิว...",
            confirmButtonColor: "#006680",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/Whocare/booking");
        }
      },
    });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
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

      {/* All Services */}
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
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
            {services.map((s) => (
              <div
                key={s.id}
                className="relative bg-white rounded-3xl border border-[#dce7ea] shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all transform flex flex-col overflow-hidden"
              >
                {/* ป้าย Hot */}
                {s.recommend && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
                    <FaFire size={12} />
                    Hot
                  </div>
                )}

                {/* รูปบริการ */}
                <img
                  src={s.image || placeholderImage}
                  onError={(e) => (e.target.src = placeholderImage)}
                  alt={s.title}
                  className="h-56 w-full object-cover"
                />

                {/* ข้อมูลบริการ */}
                <div className="p-6 flex flex-col justify-between text-center flex-1">
                  <h3 className="text-xl font-semibold text-[#006680] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {s.description?.slice(0, 80)}...
                  </p>
                  <p className="text-[#006680] font-semibold mb-4">
                    ราคา: {s.price} บาท
                  </p>

                  <button
                    onClick={() => showDetail(s)}
                    className="bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer"
                  >
                    จองคิวบริการนี้
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
