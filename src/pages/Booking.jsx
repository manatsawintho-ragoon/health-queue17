import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = location.state || {};

  const [service, setService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    date: "",
    time: "",
    doctorId: "",
  });
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลบริการที่เลือก + หมอทั้งหมด
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลบริการ
        if (serviceId) {
          const serviceRef = doc(db, "services", serviceId);
          const snap = await getDoc(serviceRef);
          if (snap.exists()) setService({ id: snap.id, ...snap.data() });
        }

        // ดึงรายชื่อหมอจาก users ที่ role = "หมอ"
        const userSnap = await getDocs(collection(db, "users"));
        const list = userSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.role === "หมอ");
        setDoctors(list);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.doctorId) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบก่อนจองคิว",
        confirmButtonText: "เข้าสู่ระบบ",
        confirmButtonColor: "#006680",
      }).then(() => navigate("/Whocare/login"));
      return;
    }

    try {
      // ตรวจสอบว่าหมอคนนี้ว่างหรือไม่ในวันเวลาเดียวกัน
      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", form.doctorId),
        where("date", "==", form.date),
        where("time", "==", form.time)
      );
      const checkSnap = await getDocs(q);

      if (!checkSnap.empty) {
        Swal.fire({
          icon: "warning",
          title: "หมอไม่ว่างในช่วงเวลานี้",
          text: "กรุณาเลือกวันหรือเวลาอื่น",
          confirmButtonColor: "#006680",
        });
        return;
      }

      // เพิ่มข้อมูลการจอง
      const doctor = doctors.find((d) => d.id === form.doctorId);

      await addDoc(collection(db, "appointments"), {
        userId: user.uid,
        userName: user.fullName || "ไม่ระบุชื่อ",
        serviceId: service.id,
        serviceName: service.name,
        doctorId: form.doctorId,
        doctorName: doctor?.fullName || "ไม่ระบุชื่อหมอ",
        date: form.date,
        time: form.time,
        createdAt: new Date(),
      });

      Swal.fire({
        icon: "success",
        title: "จองคิวสำเร็จ!",
        text: `คุณได้จอง "${service.name}" กับหมอ ${doctor?.fullName}`,
        confirmButtonColor: "#006680",
      }).then(() => navigate("/"));
    } catch (err) {
      console.error("Error booking:", err);
      Swal.fire("เกิดข้อผิดพลาด!", String(err), "error");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f9feff] flex flex-col justify-center items-center py-12 px-6">
        {loading ? (
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        ) : service ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl w-full border border-[#dce7ea]">
            <h1 className="text-3xl font-bold text-[#006680] mb-6 text-center">
              จองคิวบริการ
            </h1>

            {/* รายละเอียดบริการ */}
            <div className="text-center mb-6">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-2xl font-semibold text-[#006680] mb-2">
                {service.name}
              </h2>
              <p className="text-gray-600 mb-2">{service.description}</p>
              <p className="text-[#006680] font-semibold text-lg">
                ราคา: {service.price} บาท
              </p>
            </div>

            {/* ฟอร์มจอง */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  วันที่ต้องการจอง
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  เวลาที่ต้องการจอง
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  เลือกหมอ
                </label>
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">-- กรุณาเลือกหมอ --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ปุ่มยืนยัน */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                className="bg-[#006680] hover:bg-[#0289a7] text-white px-8 py-3 rounded-full font-medium transition"
              >
                ยืนยันการจอง
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-lg">ไม่พบข้อมูลบริการ</p>
        )}
      </div>
    </MainLayout>
  );
}
