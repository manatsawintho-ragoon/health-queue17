import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import qrWhocare from "../assets/QR-WHOCARE.png";
import { FaClock } from "react-icons/fa";
// EmailJS
import emailjs from "emailjs-com";
registerLocale("th", th);

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = location.state || {};
  const modalRef = useRef(null);

  const [service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    date: "",
    time: "",
    phone: "",
    email: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]); // [{time, datetime}]
  const [pendingTimes, setPendingTimes] = useState([]); // [{time, expiresAt}]
  const [pendingDocId, setPendingDocId] = useState(null);
  const [countdown, setCountdown] = useState(600);
  const [loading, setLoading] = useState(true);

  // --- helper: today's / week range for datepicker ---
  const today = new Date();
  const weekMaxDate = new Date();
  weekMaxDate.setDate(today.getDate() + 6); // allow booking up to 6 days ahead (week)

  // ฟังก์ชันช่วยแปลงวันที่แบบ Local (แก้ปัญหา timezone ไทย)
  const toLocalDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- click outside to close modal ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  // ฟังก์ชันแปลงวันที่เป็น พ.ศ. ไทย (ใช้กับ form.date ที่เป็น ISO string)
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

  // สร้างช่วงเวลา (ทุก 1 ชั่วโมง) ข้ามพักเที่ยง
  const generateTimeSlots = (day) => {
    let slots = [];
    let startHour, endHour;
    if (day === 0 || day === 6) {
      startHour = 11;
      endHour = 20;
    } else {
      startHour = 10;
      endHour = 20;
    }
    for (let h = startHour; h < endHour; h++) {
      if (h === 12) continue; // ข้ามพักเที่ยง
      slots.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  // โหลดข้อมูล service + user (จาก localStorage)
  useEffect(() => {
    const init = async () => {
      try {
        if (serviceId) {
          const sRef = doc(db, "services", serviceId);
          const sSnap = await getDoc(sRef);
          if (sSnap.exists()) setService({ id: sSnap.id, ...sSnap.data() });
        }
        const localUser = JSON.parse(localStorage.getItem("user"));
        if (localUser) {
          setUser(localUser);
          setForm((prev) => ({ ...prev, email: localUser.email || "" }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [serviceId]);

  // --- Real-time listeners for appointments + pendingBookings for selectedDate ---
  useEffect(() => {
    if (!selectedDate) return;

    setTimeSlots(generateTimeSlots(selectedDate.getDay()));
    setSelectedTime("");

    const dateStr = toLocalDateString(selectedDate);

    const qApp = query(
      collection(db, "appointments"),
      where("date", "==", dateStr)
    );
    const qPending = query(
      collection(db, "pendingBookings"),
      where("date", "==", dateStr)
    );

    let unsubApp = () => {};
    let unsubPending = () => {};

    // appointments listener
    unsubApp = onSnapshot(
      qApp,
      (snap) => {
        // console.log(" [onSnapshot] appointments triggered for date:", dateStr);
        // map to array of { time, datetime }
        const arr = snap.docs.map((d) => {
          const data = d.data();
          // console.log(" appointment doc:", data);
          const [hh, mm] = (data.time || "00:00").split(":").map(Number);
          const parts = (data.date || dateStr).split("-");
          const dt = new Date(
            parts[0],
            Number(parts[1]) - 1,
            parts[2],
            hh,
            mm,
            0
          );
          return {
            date: data.date || dateStr,
            time: data.time || "",
            datetime: dt,
          };
        });
        // console.log(" bookedTimes array now:", arr);
        setBookedTimes(arr);
      },
      (err) => console.error("appointments onSnapshot error:", err)
    );

    // pending listener
    unsubPending = onSnapshot(
      qPending,
      (snap) => {
        const now = new Date();
        const arr = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => {
            if (!p.expiresAt) return false;
            const ex = new Date(p.expiresAt);
            return ex.getTime() > now.getTime();
          })
          .map((p) => ({
            id: p.id,
            time: p.time,
            expiresAt: p.expiresAt,
            email: p.email,
          }));
        setPendingTimes(arr);

        // if there's a pending for current user (match by email + serviceId), set pendingDocId and countdown
        if (form.email) {
          const myPending = arr.find(
            (p) => p.email === form.email && p.serviceId === service?.id
          );
          if (myPending) {
            setPendingDocId(myPending.id);
            // compute remaining seconds
            const ex = new Date(myPending.expiresAt);
            const seconds = Math.max(
              0,
              Math.floor((ex.getTime() - Date.now()) / 1000)
            );
            setCountdown(seconds > 0 ? seconds : 0);
          } else {
            // If no pending for me, clear pendingDocId
            setPendingDocId((prev) => {
              if (!prev) return null;
              // if prev existed but no longer present, clear
              return null;
            });
          }
        }
      },
      (err) => console.error("pending onSnapshot error:", err)
    );

    return () => {
      try {
        unsubApp();
        unsubPending();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, form.email, service]);

  // countdown for pending (10 min) — start only when pendingDocId exists
  useEffect(() => {
    if (!pendingDocId) return;
    if (countdown <= 0) {
      (async () => {
        try {
          if (pendingDocId)
            await deleteDoc(doc(db, "pendingBookings", pendingDocId));
        } catch (e) {
          console.error("delete pending on timeout:", e);
        } finally {
          setPendingDocId(null);
          Swal.fire({
            icon: "warning",
            title: "หมดเวลาการชำระมัดจำ",
            text: "กรุณาทำรายการใหม่อีกครั้ง",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#006680",
          }).then(() => navigate("/"));
        }
      })();
      return;
    }
    const timer = setInterval(() => setCountdown((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, pendingDocId, navigate]);

  const resetCountdown = () => setCountdown(600);
  const formatTimeLeft = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  //  time slot เป็นอดีต (today) หรือผ่านแล้วมากกว่า 30 นาที (เพื่อเปลี่ยนเป็นเทา)
  const isPastTime = (slotTime) => {
    if (!selectedDate) return false;
    const now = new Date();
    const selected = new Date(selectedDate);
    // same day?
    if (
      now.getFullYear() === selected.getFullYear() &&
      now.getMonth() === selected.getMonth() &&
      now.getDate() === selected.getDate()
    ) {
      const [hour] = slotTime.split(":").map(Number);
      // if the slot's starting hour + 0 min is <= current hour → treat as past
      if (hour < now.getHours()) return true;

      // ให้เวลาปัจจุบันจองได้จนกว่าจะเลย 30 นาที
      if (hour === now.getHours() && now.getMinutes() >= 30) return true;
    }
    // if selectedDate is in the past day (shouldn't be selectable due to minDate) treat as past
    if (selected < new Date(today.toDateString())) return true;
    return false;
  };

  // helper: check if a booked slot should be shown as expired (>= 30 minutes past its start)
  const isBookedExpired = (bookedEntry) => {
    if (!bookedEntry) return false;

    try {
      // สร้างวันที่ปัจจุบัน (ไม่มี timezone offset)
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      // ถ้าไม่ใช่วันเดียวกันเลย ให้ถือว่ายังไม่หมดอายุ
      if (bookedEntry.date !== todayStr) return false;

      // แปลงเวลาที่จองเป็นชั่วโมง
      const [h, m] = (bookedEntry.time || "00:00").split(":").map(Number);

      // เวลาปัจจุบันในชั่วโมงและนาที
      const nowH = now.getHours();
      const nowM = now.getMinutes();

      // ถ้าผ่านเวลานัดไปเกิน 60 นาที → ถือว่าหมดอายุ
      const diffMinutes = nowH * 60 + nowM - (h * 60 + m);
      return diffMinutes >= 60;
    } catch (e) {
      console.error("isBookedExpired error:", e);
      return false;
    }
  };

  // Create pending booking (lock) — improved: delete user's previous pending first
  const createPendingBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire("กรุณาเลือกวันและเวลา", "", "warning");
      return;
    }
    if (!form.email || !form.phone) {
      Swal.fire("กรุณากรอกอีเมลและเบอร์โทรศัพท์ก่อน", "", "warning");
      return;
    }

    const dateStr = toLocalDateString(selectedDate);

    try {
      // 1. ลบ pending เดิมของ user (ถ้ามี) ก่อนสร้างใหม่ (ป้องกันล็อกซ้อน)
      const qUserPending = query(
        collection(db, "pendingBookings"),
        where("email", "==", form.email)
      );
      const userPendingSnap = await getDocs(qUserPending);
      for (const d of userPendingSnap.docs) {
        try {
          await deleteDoc(d.ref);
        } catch (e) {
          console.error("ลบ pending เดิมของ user ไม่สำเร็จ:", e);
        }
      }

      // 2. ตรวจสอบ appointments ว่ายังว่าง
      const qApp = query(
        collection(db, "appointments"),
        where("date", "==", dateStr),
        where("time", "==", selectedTime)
      );
      const appSnap = await getDocs(qApp);
      if (!appSnap.empty) {
        Swal.fire("ขออภัย", "เวลานี้ถูกจองไปแล้ว", "warning");
        await fetchRefresh(); // refresh local view
        return;
      }

      // 3. ตรวจ pending ที่ยังไม่หมดเวลา (คนอื่นล็อก)
      const qPending = query(
        collection(db, "pendingBookings"),
        where("date", "==", dateStr),
        where("time", "==", selectedTime)
      );
      const pSnap = await getDocs(qPending);
      const now = new Date();
      let someoneLocked = false;
      pSnap.docs.forEach((d) => {
        const p = d.data();
        if (!p.expiresAt) return;
        const ex = new Date(p.expiresAt);
        if (ex.getTime() > now.getTime()) someoneLocked = true;
      });
      if (someoneLocked) {
        Swal.fire("ขออภัย", "เวลานี้มีคนล็อกชั่วคราวอยู่", "warning");
        await fetchRefresh();
        return;
      }

      // 4. สร้าง pending ใหม่
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      const pendingRef = await addDoc(collection(db, "pendingBookings"), {
        userName: `${user?.prefix || ""} ${user?.fullName || ""}`,
        email: form.email,
        phone: form.phone,
        serviceId: service.id,
        serviceName: service.name,
        date: dateStr,
        time: selectedTime,
        expiresAt: expiresAt.toISOString(),
      });

      setPendingDocId(pendingRef.id);
      setForm((prev) => ({ ...prev, date: dateStr, time: selectedTime }));
      resetCountdown();
      setShowModal(false);
      // fetchRefresh will be triggered by onSnapshot listener automatically (real-time)
    } catch (err) {
      console.error("createPendingBooking:", err);
      Swal.fire("เกิดข้อผิดพลาด", String(err), "error");
    }
  };

  // helper: refresh by refetching selectedDate snapshots (we already have onSnapshot; this triggers no-op)
  const fetchRefresh = async () => {
    // no-op because onSnapshot updates automatically; kept for compatibility
    if (selectedDate) {
      // trigger a slight state change to cause effect? but onSnapshot already running.
      setTimeSlots((t) => [...t]);
    }
  };

  const deletePendingBooking = async () => {
    if (!pendingDocId) return;
    try {
      await deleteDoc(doc(db, "pendingBookings", pendingDocId));
      setPendingDocId(null);
      setPendingTimes((prev) => prev.filter((p) => p.time !== form.time));
    } catch (err) {
      console.error("deletePendingBooking:", err);
    }
  };

  // ส่งอีเมลยืนยันการจองผ่าน EmailJS
  const sendConfirmationEmail = async (bookingData) => {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.warn("EmailJS config missing - skipping email send");
        return;
      }

      // template variables ต้องตรงกับตัวแปรที่คุณใช้ใน EmailJS template
      const templateParams = {
        userName: bookingData.userName,
        serviceName: bookingData.serviceName,
        date: bookingData.date,
        time: bookingData.time,
        price: bookingData.price,
        email: bookingData.email,
      };
      // console.log(" DEBUG templateParams =", templateParams);
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log(" Confirmation email sent to", bookingData.email);
    } catch (err) {
      console.error(" Failed to send confirmation email:", err);
      // ไม่บล็อกการทำงานหลัก — ถ้าส่งไม่สำเร็จ ให้ระบบยังทำงานต่อ
    }
  };

  //  ฟังก์ชันยืนยันการจอง
  const handleConfirmBooking = async () => {
    if (!form.date || !form.time || !form.phone) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบก่อน", "", "warning");
      return;
    }

    try {
      //  บังคับให้ date เป็น string เสมอ เพื่อให้ Firestore query match ได้ถูกต้อง
      const dateStr =
        typeof form.date === "string"
          ? form.date
          : form.date.toLocalDateString(selectedDate);

      // ตรวจสอบว่ามีการจองเวลาเดียวกันในวันนั้นหรือยัง
      const qApp = query(
        collection(db, "appointments"),
        where("date", "==", dateStr),
        where("time", "==", form.time)
      );
      const appSnap = await getDocs(qApp);
      if (!appSnap.empty) {
        Swal.fire("ขออภัย", "เวลานี้ถูกจองไปแล้ว", "warning");
        await deletePendingBooking();
        return;
      }

      //  เพิ่มบันทึกการจองใหม่ใน appointments โดยใช้ dateStr แบบ string ชัดเจน
      await addDoc(collection(db, "appointments"), {
        userName: `${user?.prefix || ""} ${user?.fullName || ""}`,
        email: form.email,
        phone: form.phone,
        serviceId: service.id,
        serviceName: service.name,
        description: service.description || "",
        image: service.image || "",
        price: service.price || 0,
        date: dateStr, //  ใช้ string format YYYY-MM-DD
        time: form.time,
        deposit: service.price / 2,
        createdAt: new Date(),
      });

      // ส่งอีเมลยืนยัน (ไม่ block ถ้าส่งล้มเหลว)
      sendConfirmationEmail({
        userName: `${user?.prefix || ""} ${user?.fullName || ""}`,
        serviceName: service.name,
        date: dateStr,
        time: form.time,
        price: service.price || 0,
        email: form.email,
      });

      // ลบ pending หลังจองสำเร็จ
      await deletePendingBooking();

      // แสดง popup สำเร็จ
      Swal.fire({
        icon: "success",
        title: "จองคิวสำเร็จ!",
        html: `คุณได้จอง <b>${service.name}</b><br/>วันที่ ${formatThaiDate(
          dateStr
        )} เวลา ${form.time} น.`,
        confirmButtonColor: "#006680",
      }).then(() => navigate("/appointments"));
    } catch (err) {
      console.error("handleConfirmBooking:", err);
      Swal.fire("เกิดข้อผิดพลาด", String(err), "error");
    }
  };

  // cancel action — delete pending and go home
  const handleCancel = async () => {
    try {
      if (pendingDocId) await deletePendingBooking();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/");
    }
  };

  // simple input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  if (loading)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
          กำลังโหลดข้อมูล...
        </div>
      </MainLayout>
    );

  // --- render ---
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f4fbfc] flex justify-center py-20">
        {service ? (
          <div className="flex bg-white shadow-xl rounded-3xl overflow-hidden w-[1100px] h-[600px] border border-gray-300">
            {/* Left: service */}
            <div className="w-[30%] bg-[#eaf7fa] p-5 flex flex-col items-center justify-center border-r border-gray-200">
              <img
                src={service.image}
                alt={service.name}
                className="w-48 h-48 object-cover rounded-xl mb-3"
              />
              <h2 className="text-xl font-bold text-[#006680] mb-2">
                {service.name}
              </h2>
              <p className="text-gray-600 text-sm text-center mb-2 line-clamp-3">
                {service.description}
              </p>
              <p className="text-[#006680] font-semibold text-lg">
                ราคาเต็ม: {service.price} บาท
              </p>
            </div>

            {/* Middle: user + form */}
            <div className="w-[40%] p-6 border-r border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#006680] mb-3 text-center">
                  ข้อมูลผู้จอง
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-700">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      value={user?.prefix + " " + user?.fullName || ""}
                      readOnly
                      className="border border-gray-300 rounded-lg p-2 w-full bg-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full text-sm"
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-gray-700">
                      วันเวลาในการจอง
                    </label>
                    <button
                      onClick={() => setShowModal(true)}
                      className="cursor-pointer border border-[#006680] text-[#006680] w-full py-2 rounded-lg hover:bg-[#006680] hover:text-white transition text-sm font-semibold"
                    >
                      {form.date
                        ? `${formatThaiDate(form.date)} เวลา ${form.time} น.`
                        : "เลือกวันและเวลา"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <div className="flex justify-between">
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full text-sm font-semibold transition"
                  >
                    ยกเลิกการจอง
                  </button>

                  <div className="flex gap-3 items-center">
                    <button
                      onClick={handleConfirmBooking}
                      className={`cursor-pointer bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full text-sm font-semibold transition ${
                        !pendingDocId ? "opacity-60 pointer-events-none" : ""
                      }`}
                      title={
                        pendingDocId
                          ? "ยืนยันการจองและบันทึกในระบบ"
                          : "กรุณาล็อกเวลา (Pending) ก่อนยืนยัน"
                      }
                    >
                      ยืนยันการจอง
                    </button>
                  </div>
                </div>

                {/* คำอธิบายใต้ปุ่มยืนยัน */}
                <div className="text-xs text-gray-600">
                  <p>
                    ต้องกรอกข้อมูลให้ครบ และเลือกวัน-เวลาพร้อมชำระเงิน
                    จึงจะสามารถกดยืนยันการจองได้.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: deposit */}
            <div className="w-[30%] bg-[#f0fafb] flex flex-col justify-start items-center p-5 text-center">
              <h3 className="text-lg font-semibold text-[#006680] mb-2">
                มัดจำการจอง
              </h3>
              <p className="text-gray-600 text-sm mb-1">จำนวนที่ต้องชำระ</p>
              <p className="text-2xl font-bold text-[#0289a7] mb-2">
                {service.price / 2} บาท
              </p>
              <p className="text-gray-600 text-sm mb-1">
                เวลาที่เหลือในการชำระ
              </p>
              <p className="text-red-600 font-semibold mb-3">
                {formatTimeLeft(countdown)}
              </p>
              <p className="text-red-500 font-semibold mb-3 text-xs">
                หมายเหตุ: เมื่อเลือกวันเวลาแล้ว กรุณาชำระมัดจำผ่าน PromptPay
                ด้านล่าง ภายในเวลาที่กำหนด และกดปุ่ม{" "}
                <span className="text-amber-700 font-bold text-xs">
                  {" "}
                  <b>"ยืนยันการจอง" </b>
                </span>
              </p>
              <img
                src={qrWhocare}
                alt="PromptPay QR"
                className="w-32 h-32 object-contain mb-3 border border-gray-300 rounded-lg"
              />
              <p className="text-gray-600 text-xs mb-3">สแกนเพื่อชำระมัดจำ</p>

              <div className="bg-white border border-[#0289a7]/30 rounded-xl p-3 text-xs leading-relaxed text-gray-700 shadow-sm max-w-[96%]">
                <p>
                  หลังจากชำระเงินแล้ว โปรดกดปุ่ม <b>“ยืนยันการจอง”</b>{" "}
                  เพื่อบันทึกการจองคิวของคุณ
                </p>
                <p className="text-red-600 font-semibold mt-2">
                  กรุณามาก่อนเวลานัด 10–15 นาที
                  <br />
                  หากไม่มาตามวันเวลาที่จอง จะไม่คืนเงินมัดจำทุกกรณี
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-lg">ไม่พบข้อมูลบริการ</p>
        )}
      </div>

      {/* Modal: date & time */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl w-[820px] h-[520px] flex border border-[#006680]/20 animate-fadeIn overflow-hidden"
          >
            {/* Left: date */}
            <div className="w-[45%] bg-[#f7fbfc] border-r border-[#dce7ea] p-5 flex flex-col items-center">
              <h2 className="text-[#006680] font-bold text-lg mb-3">
                เลือกวันที่ต้องการจอง
              </h2>
              <div className="bg-white border border-[#d7e9ec] rounded-xl p-3 shadow-sm mb-4 flex flex-col items-center">
                <FaClock className="text-[#0289a7] w-5 h-5 mb-1" />
                <p className="text-sm text-[#0289a7] font-semibold">
                  เวลาทำการคลินิก
                </p>
                <p className="text-xs text-gray-600 mt-1 text-center leading-relaxed">
                  จันทร์–ศุกร์: 10:00 – 20:00 น.
                  <br />
                  เสาร์–อาทิตย์: 11:00 – 20:00 น.
                  <br />
                  พักกลางวัน: 12:00 – 12:30 น.
                </p>
              </div>

              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                locale="th"
                inline
                minDate={today}
                maxDate={weekMaxDate}
                renderCustomHeader={() => (
                  <div className="text-[#006680] font-semibold text-lg mb-2">
                    {new Date().toLocaleString("th-TH", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              />
            </div>

            {/* Right: times */}
            <div className="w-[55%] flex flex-col justify-between p-5">
              <div>
                <h2 className="text-[#006680] font-bold text-lg text-center mb-2">
                  เลือกเวลาที่ต้องการ
                </h2>

                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto p-2">
                    {timeSlots.map((t) => {
                      const isLunch = t === "12:00" || t === "12:30";
                      const dateStr = selectedDate
                        ? toLocalDateString(selectedDate)
                        : "";
                      const bookedEntry = bookedTimes.find(
                        (b) => b.time === t && b.date === dateStr
                      );
                      const isBooked =
                        !!bookedEntry && !isBookedExpired(bookedEntry);
                      const isBookedExpiredNow =
                        !!bookedEntry && isBookedExpired(bookedEntry);
                      const pendingEntry = pendingTimes.find(
                        (p) => p.time === t
                      );
                      const isPending = !!pendingEntry && !bookedEntry; // pending only if not booked
                      const past = isPastTime(t);

                      // disabled: ถ้าเป็นเวลาผ่านไปแล้ว, จองแล้ว, ล็อกชั่วคราว หรือพักเที่ยง
                      const disabled = past || isBooked || isPending || isLunch;

                      const baseClass = `relative py-2 rounded-lg text-sm font-medium border transition ${
                        disabled
                          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                          : selectedTime === t
                          ? "bg-[#0289a7] text-white border-[#0289a7]"
                          : "border-[#0289a7] text-[#0289a7] hover:bg-[#0289a7]/10 cursor-pointer"
                      }`;

                      return (
                        <button
                          key={t}
                          disabled={disabled}
                          onClick={() => {
                            if (!disabled) setSelectedTime(t);
                          }}
                          className={baseClass}
                        >
                          {t}
                          {/* แสดงป้ายเฉพาะกรณีจองแล้วแต่ยังไม่หมดเวลา 1 ชั่วโมง */}
                          {isBooked && !isBookedExpiredNow && (
                            <span className="absolute top-1 right-1 text-[10px] bg-red-500 text-white rounded px-1">
                              ถูกจองแล้ว
                            </span>
                          )}
                          {/* แสดงป้ายล็อกชั่วคราว (pending) */}
                          {isPending && !isBooked && (
                            <span className="absolute top-1 right-1 text-[10px] bg-yellow-500 text-white rounded px-1">
                              มีคนกำลังจอง
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 mt-4">
                    กรุณาเลือกวันที่ก่อน
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full font-semibold transition"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={createPendingBooking}
                  className={`cursor-pointer bg-[#006680] hover:bg-[#0289a7] text-white px-8 py-2 rounded-full font-semibold transition ${
                    !selectedDate || !selectedTime
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }`}
                >
                  ยืนยันการเลือกวันและเวลา
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
