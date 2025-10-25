import React, { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import { FaClock } from "react-icons/fa";
// EMAILJS
import emailjs from "emailjs-com";

registerLocale("th", th);

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  // Modal / edit state (reuse Booking modal UI)
  const modalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null); // appointment object being edited
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]); // for the selectedDate
  const [pendingTimes, setPendingTimes] = useState([]);
  const today = new Date();
  const weekMaxDate = new Date();
  weekMaxDate.setDate(today.getDate() + 6);

  // ฟังก์ชันแปลงวันที่เป็น พ.ศ. ไทย (รองรับทั้ง ISO string และ YYYY-MM-DD)
  const formatThaiDate = (isoDate) => {
    if (!isoDate) return "-";
    let date;
    // ถ้าเป็นรูปแบบ YYYY-MM-DD ให้ parse
    if (typeof isoDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      const [y, m, d] = isoDate.split("-").map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(isoDate);
    }
    if (isNaN(date.getTime())) return "-";
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

  // แปลง YYYY-MM-DD -> Date
  const parseDateFromString = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // สร้างช่วงเวลา (เหมือน Booking.jsx)
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

  // โหลด appointments ของ user (ไม่ real-time ตามที่คุณระบุไว้ก่อนหน้า)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        if (!user?.email) {
          setAppointments([]);
          return;
        }
        const q = query(
          collection(db, "appointments"),
          where("email", "==", user.email)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAppointments(list);
      } catch (e) {
        console.error("fetchAppointments error:", e);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดการจองได้", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user?.email]);

  // ฟังก์ชันคำนวณว่าเหลืออีกเท่าไหร่จนถึงเวลานัด
  const timeUntil = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    // dateStr expected "YYYY-MM-DD", timeStr "HH:MM"
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    const appt = new Date(y, m - 1, d, hh, mm, 0);
    const now = new Date();
    const diffMs = appt.getTime() - now.getTime();
    if (diffMs <= 0) return 0; // ถึงเวลาแล้วหรือเลย
    const diffMin = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMin / (60 * 24));
    const hours = Math.floor((diffMin % (60 * 24)) / 60);
    const minutes = diffMin % 60;
    return { days, hours, minutes };
  };

  // แสดงสถานะเป็นข้อความตามที่ขอ
  const renderTimeStatus = (a) => {
    const tu = timeUntil(a.date, a.time);
    if (tu === null) return "-";
    if (tu === 0) {
      // ถึงเวลานัดแล้ว (เวลาเท่าหรือเลย)
      // ถ้ามากกว่า 60 นาทีผ่านมาแล้ว อาจจะถือเป็น "เลยเวลาแล้ว" — แต่ผู้ขอระบุแค่ว่า "ถึงเวลานัดแล้ว"
      // เราจะแสดง "ถึงเวลานัดแล้ว" ถ้าเวลามากกว่าหรือเท่าคืนนี้
      const [y, m, d] = a.date.split("-").map(Number);
      const [hh, mm] = a.time.split(":").map(Number);
      const appt = new Date(y, m - 1, d, hh, mm);
      const now = new Date();
      const diff = now.getTime() - appt.getTime();
      // ถ้าเลยมากกว่า 60 นาที -> "หมดเวลาแล้ว"
      if (diff > 60 * 60 * 1000) return "หมดเวลาแล้ว";
      return "ถึงเวลานัดแล้ว";
    }
    const parts = [];
    if (tu.days > 0) parts.push(`${tu.days} วัน`);
    if (tu.hours > 0) parts.push(`${tu.hours} ชั่วโมง`);
    if (tu.minutes >= 0) parts.push(`${tu.minutes} นาที`);
    return `อีก ${parts.join(" ")}`;
  };

  // --- Modal: เมื่อเปิด modal ให้โหลด bookedTimes + pendingTimes สำหรับ selectedDate ---
  useEffect(() => {
    const loadSlotsForDate = async () => {
      if (!selectedDate) return;
      setTimeSlots(generateTimeSlots(selectedDate.getDay()));
      setSelectedTime("");
      setBookedTimes([]);
      setPendingTimes([]);
      const dateStr = toLocalDateString(selectedDate);

      try {
        // appointments on date
        const qApp = query(
          collection(db, "appointments"),
          where("date", "==", dateStr)
        );
        const snapA = await getDocs(qApp);
        const appArr = snapA.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBookedTimes(appArr);

        // pendingBookings on date
        const qP = query(
          collection(db, "pendingBookings"),
          where("date", "==", dateStr)
        );
        const snapP = await getDocs(qP);
        const now = new Date();
        const pend = snapP.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => {
            if (!p.expiresAt) return false;
            const ex = new Date(p.expiresAt);
            return ex.getTime() > now.getTime();
          });
        setPendingTimes(pend);
      } catch (e) {
        console.error("loadSlotsForDate error:", e);
      }
    };
    loadSlotsForDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // helper convert Date -> YYYY-MM-DD
  const toLocalDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // helper: ตรวจว่า slot เป็นอดีต (เหมือน Booking.jsx)
  const isPastTime = (slotTime) => {
    if (!selectedDate) return false;
    const now = new Date();
    const selected = new Date(selectedDate);
    if (
      now.getFullYear() === selected.getFullYear() &&
      now.getMonth() === selected.getMonth() &&
      now.getDate() === selected.getDate()
    ) {
      const [hour] = slotTime.split(":").map(Number);
      if (hour < now.getHours()) return true;
      if (hour === now.getHours() && now.getMinutes() >= 30) return true;
    }
    if (selected < new Date(today.toDateString())) return true;
    return false;
  };

  // เมื่อกดปุ่ม 'แก้ไขวันและเวลา' บนการ์ด
  const openEditModal = (appt) => {
    // ถ้าผู้ใช้แก้แล้ว ให้ไม่ให้เปิด (ความปลอดภัย)
    if (appt?.editedOnce) {
      return;
    }
    setEditingAppt(appt);
    // prefill selectedDate/time จาก appt
    const d = parseDateFromString(appt.date);
    setSelectedDate(d || null);
    setSelectedTime(appt.time || "");
    setShowModal(true);
  };

    //  ฟังก์ชันส่งอีเมลยืนยันการแก้ไขนัดหมายผ่าน EmailJS
  const sendEditConfirmationEmail = async (apptData) => {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_EDIT ||
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // fallback ถ้าไม่ได้ตั้ง template สำหรับแก้ไข
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.warn("EmailJS config missing - skip sending email");
        return;
      }

      const templateParams = {
        userName: apptData.userName || "ผู้ใช้งาน",
        serviceName: apptData.serviceName,
        date: formatThaiDate(apptData.date),
        time: apptData.time,
        email: apptData.email,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log("📧 Edit confirmation email sent to:", apptData.email);
    } catch (err) {
      console.error("❌ Failed to send edit confirmation email:", err);
    }
  };

  // ฟังก์ชันยืนยันการแก้ไข: ตรวจสอบความว่างและอัปเดต appointments doc
  const handleConfirmEdit = async () => {
    if (!editingAppt) return;
    if (!selectedDate || !selectedTime) {
      Swal.fire("กรุณาเลือกวันและเวลา", "", "warning");
      return;
    }
    const dateStr = toLocalDateString(selectedDate);

    try {
      // 1) ตรวจสอบ appointments ว่าเวลานี้มีคนจองหรือไม่ (ยกเว้น doc ตัวเอง)
      const qApp = query(
        collection(db, "appointments"),
        where("date", "==", dateStr),
        where("time", "==", selectedTime)
      );
      const appSnap = await getDocs(qApp);
      const conflict = appSnap.docs.some((d) => d.id !== editingAppt.id);
      if (conflict) {
        Swal.fire("ขออภัย", "เวลานี้ถูกจองไปแล้ว", "warning");
        // รีโหลด appointments
        await reloadAppointments();
        return;
      }

      // 2) ตรวจสอบ pendingBookings ว่าเวลานี้มีคนล็อกอยู่ (ไม่รวมถ้าเป็น pending ของคนเดียวกันและ service เดียวกัน)
      const qPending = query(
        collection(db, "pendingBookings"),
        where("date", "==", dateStr),
        where("time", "==", selectedTime)
      );
      const pSnap = await getDocs(qPending);
      const now = new Date();
      let someoneLocked = false;
      for (const d of pSnap.docs) {
        const p = d.data();
        if (!p.expiresAt) continue;
        const ex = new Date(p.expiresAt);
        if (ex.getTime() > now.getTime()) {
          // ถ้า pending มาจากผู้ใช้เดิมของ booking นี้ ให้ไม่ถือว่า conflict
          if (
            p.email === editingAppt.email &&
            p.serviceId === editingAppt.serviceId
          ) {
            continue;
          }
          someoneLocked = true;
          break;
        }
      }
      if (someoneLocked) {
        Swal.fire("ขออภัย", "เวลานี้มีคนล็อกชั่วคราวอยู่", "warning");
        await reloadAppointments();
        return;
      }

      // 3) อัปเดต document: date, time, set editedOnce true (ถ้ายังไม่เคยแก้)
      const apptRef = doc(db, "appointments", editingAppt.id);
      const updatePayload = {
        date: dateStr,
        time: selectedTime,
      };
      if (!editingAppt.editedOnce) updatePayload.editedOnce = true;
      await updateDoc(apptRef, updatePayload);

      // ส่งอีเมลยืนยันการแก้ไข
      // หลังจากอัปเดต Firestore เรียบร้อยแล้ว ให้ส่งอีเมลยืนยัน
      await sendEditConfirmationEmail({
        userName: editingAppt.userName,
        serviceName: editingAppt.serviceName,
        date: dateStr,
        time: selectedTime,
        email: editingAppt.email,
      });

      // 4) อัปเดต local state
      setAppointments((prev) =>
        prev.map((p) =>
          p.id === editingAppt.id
            ? { ...p, ...updatePayload, editedOnce: true }
            : p
        )
      );

      Swal.fire({
        icon: "success",
        title: "แก้ไขเรียบร้อย",
        text: `นัดใหม่: ${formatThaiDate(dateStr)} เวลา ${selectedTime} น.`,
        confirmButtonColor: "#006680",
      });

      // ปิด modal
      setShowModal(false);
      setEditingAppt(null);
      setSelectedDate(null);
      setSelectedTime("");
    } catch (err) {
      console.error("handleConfirmEdit:", err);
      Swal.fire("เกิดข้อผิดพลาด", String(err), "error");
    }
  };

  const reloadAppointments = async () => {
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
      console.error("reloadAppointments:", e);
    }
  };

  // click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setEditingAppt(null);
      }
    };
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

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
              const remainingPayment = a.price ? a.price - (a.deposit || 0) : 0;
              const status = renderTimeStatus(a);
              const edited = !!a.editedOnce;

              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col justify-between transition hover:shadow-lg"
                >
                  <div>
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
                      <b>วันที่:</b> {formatThaiDate(a.date)}
                    </p>
                    <p className="text-sm text-gray-700"><b>เวลา:</b> {a.time} น.</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <b>เบอร์โทร:</b> {a.phone}
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      <b>มัดจำแล้ว:</b>{" "}
                      <span className="font-semibold text-[#0289a7]">
                        <s>{a.deposit ?? 0} บาท</s>
                      </span>
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      <b>ชำระที่คลินิกเพิ่มเติม:</b>{" "}
                      <span className="font-bold text-[#d97706]">
                        {remainingPayment > 0 ? remainingPayment : 0} บาท
                      </span>
                    </p>

                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                          status === "ถึงเวลานัดแล้ว"
                            ? "bg-[#fff3cd] text-[#856404]"
                            : status === "หมดเวลาแล้ว"
                            ? "bg-gray-200 text-gray-500"
                            : "bg-[#e0f7fa] text-[#006680]"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 gap-3">
                    {/* Edit button (แก้ไขวันและเวลา) */}
                    <button
                      onClick={() => openEditModal(a)}
                      disabled={edited}
                      className={`text-sm px-4 py-1 rounded-full transition font-semibold ${
                        edited
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-[#006680] hover:bg-[#0289a7] text-white"
                      }`}
                      title={
                        edited
                          ? "คุณได้แก้ไขวัน-เวลาแล้ว ไม่สามารถแก้ไขซ้ำได้"
                          : "แก้ไขวันและเวลา (สามารถแก้ได้ 1 ครั้ง)"
                      }
                    >
                      {edited ? "แก้ไขแล้ว" : "แก้ไขวันและเวลา"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal (ใช้ UI/โครงแบบเดียวกับ Booking.jsx) */}
      {showModal && editingAppt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl w-[820px] h-[520px] flex border border-[#006680]/20 animate-fadeIn overflow-hidden"
          >
            <div className="w-[45%] bg-[#f7fbfc] border-r border-[#dce7ea] p-5 flex flex-col items-center">
              <h2 className="text-[#006680] font-bold text-lg mb-3">
                เลือกวันที่ต้องการจองใหม่
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
                    {selectedDate
                      ? new Date(selectedDate).toLocaleString("th-TH", {
                          month: "long",
                          year: "numeric",
                        })
                      : new Date().toLocaleString("th-TH", {
                          month: "long",
                          year: "numeric",
                        })}
                  </div>
                )}
              />
            </div>

            <div className="w-[55%] flex flex-col justify-between p-5">
              <div>
                <h2 className="text-[#006680] font-bold text-lg text-center mb-2">
                  เลือกเวลาที่ต้องการ
                </h2>

                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto p-2">
                    {timeSlots.map((t) => {
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
                      const isPending = !!pendingEntry && !bookedEntry;
                      const past = isPastTime(t);
                      const isLunch = t === "12:00" || t === "12:30";

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
                          {isBooked && !isBookedExpiredNow && (
                            <span className="absolute top-1 right-1 text-[10px] bg-red-500 text-white rounded px-1">
                              ถูกจองแล้ว
                            </span>
                          )}
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingAppt(null);
                  }}
                  className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full font-semibold transition"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={handleConfirmEdit}
                  className={`cursor-pointer bg-[#006680] hover:bg-[#0289a7] text-white px-8 py-2 rounded-full font-semibold transition ${
                    !selectedDate || !selectedTime
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }`}
                >
                  ยืนยันการแก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );

  // --- helper functions below ---

  // helper: check if a booked slot should be shown as expired (>= 60 minutes past its start)
  function isBookedExpired(bookedEntry) {
    if (!bookedEntry) return false;
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      if (bookedEntry.date !== todayStr) return false;
      const [h, m] = (bookedEntry.time || "00:00").split(":").map(Number);
      const diffMinutes = now.getHours() * 60 + now.getMinutes() - (h * 60 + m);
      return diffMinutes >= 60;
    } catch (e) {
      console.error("isBookedExpired error:", e);
      return false;
    }
  }
}
