import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  // ฟังก์ชันแปลงวันที่เป็น พ.ศ. ไทย
  const formatThaiDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    const day = date.getDate();
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  // โหลดข้อมูลการจองของผู้ใช้
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) return;
        const q = query(
          collection(db, "appointments"),
          where("email", "==", user.email)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAppointments(list);
      } catch (e) {
        console.error("fetchAppointments error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user?.email]);

  // ยกเลิกการจอง
  const handleCancel = async (id, serviceName) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: `คุณต้องการยกเลิกการจองบริการ ${serviceName} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#006680",
      cancelButtonColor: "#aaa",
      confirmButtonText: "ใช่, ยกเลิกเลย",
      cancelButtonText: "ไม่",
    });
    if (!confirm.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      Swal.fire({
        icon: "success",
        title: "ยกเลิกการจองแล้ว",
        confirmButtonColor: "#006680",
      });
    } catch (err) {
      console.error("cancel error:", err);
      Swal.fire("เกิดข้อผิดพลาด", String(err), "error");
    }
  };

  // ตรวจสอบสถานะเวลา (แก้ใหม่ให้ตรงจริง)
  const getStatus = (a) => {
    const now = new Date();
    const [year, month, day] = a.date.split("-").map(Number);
    const [hour, minute] = a.time.split(":").map(Number);
    const appointmentTime = new Date(year, month - 1, day, hour, minute);
    const diff = now.getTime() - appointmentTime.getTime();

    if (diff < 0) return "รอคิว"; // เวลานัดยังไม่ถึง
    if (diff <= 60 * 60 * 1000) return "อยู่ในช่วงเวลานัด"; // ภายใน 1 ชม.หลังถึงเวลา
    return "หมดเวลาแล้ว"; // เกิน 1 ชม.แล้ว
  };

  if (loading)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
          กำลังโหลดข้อมูลการจอง...
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f4fbfc] py-10 px-5">
        <h1 className="text-2xl font-bold text-[#006680] text-center mb-6">
          การจองของฉัน
        </h1>

        {appointments.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>ยังไม่มีการจองในระบบ</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {appointments.map((a) => {
              const remainingPayment = a.price
                ? a.price - a.deposit
                : a.deposit || 0; // ถ้าไม่ได้เก็บ price ไว้
              const status = getStatus(a);

              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col justify-between transition hover:shadow-lg"
                >
                  <div>
                    {/* รูปภาพบริการ */}
                    {a.image && (
                      <img
                        src={a.image}
                        alt={a.serviceName}
                        className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-100"
                      />
                    )}

                    <h3 className="text-lg font-bold text-[#006680] mb-2">
                      {a.serviceName}
                    </h3>
                    {a.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                        {a.description}
                      </p>
                    )}

                    <p className="text-sm text-gray-700">
                      วันที่: {formatThaiDate(a.date)}
                    </p>
                    <p className="text-sm text-gray-700">เวลา: {a.time} น.</p>
                    <p className="text-sm text-gray-700 mt-1">
                      เบอร์โทร: {a.phone}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      มัดจำแล้ว:{" "}
                      <span className="font-semibold text-[#0289a7]">
                        {a.deposit} บาท
                      </span>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      ชำระที่คลินิกเพิ่มเติม:{" "}
                      <span className="font-semibold text-[#d97706]">
                        {remainingPayment > 0 ? remainingPayment : 0} บาท
                      </span>
                    </p>

                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                          status === "รอคิว"
                            ? "bg-[#e0f7fa] text-[#006680]"
                            : status === "อยู่ในช่วงเวลานัด"
                            ? "bg-[#fff3cd] text-[#856404]"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleCancel(a.id, a.serviceName)}
                      className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full transition"
                    >
                      ยกเลิกการจอง
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
