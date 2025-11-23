// src/pages/Appointments.jsx
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
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import { FaClock, FaUndoAlt, FaInfoCircle } from "react-icons/fa";
import emailjs from "emailjs-com";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import placeholderImage from "../assets/WHOCARE-logo.png";

registerLocale("th", th);

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  const modalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [pendingTimes, setPendingTimes] = useState([]);
  const today = new Date();
  const weekMaxDate = new Date();
  weekMaxDate.setDate(today.getDate() + 6);

  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    if (!user?.email) {
      setRefunds([]);
      return;
    }
    const q = query(
      collection(db, "refundRequests"),
      where("email", "==", user.email)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRefunds(list);
      },
      (err) => {
        console.error("onSnapshot refunds error:", err);
      }
    );
    return () => unsub();
  }, [user?.email]);

  const formatThaiDate = (isoDate) => {
    if (!isoDate) return "-";
    let date;
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

  const parseDateFromString = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

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
      if (h === 12) continue;
      slots.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  useEffect(() => {
    if (!user?.email) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "appointments"),
      where("email", "==", user.email)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const normalized = list.map((item) => ({
          ...item,
          userId: item.userId || user?.uid || "",
          status: item.status || "active",
        }));
        setAppointments(normalized);
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot appointments error:", err);
        setLoading(false);
        Swal.fire(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถโหลดการจองแบบ realtime ได้",
          "error"
        );
      }
    );
    return () => unsub();
  }, [user?.email]);

  const timeUntil = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    const appt = new Date(y, m - 1, d, hh, mm, 0);
    const now = new Date();
    const diffMs = appt.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    const diffMin = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMin / (60 * 24));
    const hours = Math.floor((diffMin % (60 * 24)) / 60);
    const minutes = diffMin % 60;
    return { days, hours, minutes };
  };

  const renderTimeStatus = (a) => {
    const tu = timeUntil(a.date, a.time);
    if (tu === null) return "-";
    if (a.status === "refund_pending")
      return "กำลังขอยกเลิกการจองเพื่อขอคืนเงินมัดจำ";
    if (tu === 0) {
      const [y, m, d] = a.date.split("-").map(Number);
      const [hh, mm] = a.time.split(":").map(Number);
      const appt = new Date(y, m - 1, d, hh, mm);
      const now = new Date();
      const diff = now.getTime() - appt.getTime();
      if (diff > 60 * 60 * 1000) return "หมดเวลาแล้ว";
      return "ถึงเวลานัดแล้ว";
    }
    const parts = [];
    if (tu.days > 0) parts.push(`${tu.days} วัน`);
    if (tu.hours > 0) parts.push(`${tu.hours} ชั่วโมง`);
    if (tu.minutes >= 0) parts.push(`${tu.minutes} นาที`);
    return `อีก ${parts.join(" ")}`;
  };

  useEffect(() => {
    const loadSlotsForDate = async () => {
      if (!selectedDate) return;
      setTimeSlots(generateTimeSlots(selectedDate.getDay()));
      setSelectedTime("");
      setBookedTimes([]);
      setPendingTimes([]);
      const dateStr = toLocalDateString(selectedDate);

      try {
        const qApp = query(
          collection(db, "appointments"),
          where("date", "==", dateStr)
        );
        const snapA = await getDocs(qApp);
        const appArr = snapA.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBookedTimes(appArr);

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
  }, [selectedDate]);

  const toLocalDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  const openEditModal = (appt) => {
    if (appt?.editedOnce) return;
    setEditingAppt(appt);
    const d = parseDateFromString(appt.date);
    setSelectedDate(d || null);
    setSelectedTime(appt.time || "");
    setShowModal(true);
  };

  const sendEditConfirmationEmail = async (apptData) => {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_EDIT ||
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
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
      console.log("อีเมลยืนยันการแก้ไขถูกส่งไปยัง:", apptData.email);
    } catch (err) {
      console.error("ส่งอีเมลยืนยันการแก้ไขล้มเหลว:", err);
    }
  };

  async function handleConfirmEdit() {
    if (!editingAppt) return;
    if (!selectedDate || !selectedTime) {
      Swal.fire("กรุณาเลือกวันและเวลา", "", "warning");
      return;
    }
    const dateStr = toLocalDateString(selectedDate);

    try {
      const qApp = query(
        collection(db, "appointments"),
        where("date", "==", dateStr),
        where("time", "==", selectedTime)
      );
      const appSnap = await getDocs(qApp);
      const conflict = appSnap.docs.some((d) => d.id !== editingAppt.id);
      if (conflict) {
        Swal.fire("ขออภัย", "เวลานี้ถูกจองไปแล้ว", "warning");
        return;
      }

      const apptRef = doc(db, "appointments", editingAppt.id);
      const updatePayload = { date: dateStr, time: selectedTime };
      if (!editingAppt.editedOnce) updatePayload.editedOnce = true;
      await updateDoc(apptRef, updatePayload);

      await sendEditConfirmationEmail({
        userName: editingAppt.userName,
        serviceName: editingAppt.serviceName,
        date: dateStr,
        time: selectedTime,
        email: editingAppt.email,
      });

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

      setShowModal(false);
      setEditingAppt(null);
      setSelectedDate(null);
      setSelectedTime("");
    } catch (err) {
      console.error("handleConfirmEdit:", err);
      Swal.fire("เกิดข้อผิดพลาด", String(err), "error");
    }
  }

  async function handleDeleteAppointment(appointmentId) {
    if (!appointmentId) return;
    const confirm = await Swal.fire({
      title: "ยืนยันการลบการจอง",
      text: "การลบนี้จะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ว่าจะลบการจองนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "appointments", appointmentId));

      try {
        const q = query(
          collection(db, "refundRequests"),
          where("appointmentId", "==", appointmentId)
        );
        const snap = await getDocs(q);
        const deletes = snap.docs.map((d) =>
          deleteDoc(doc(db, "refundRequests", d.id))
        );
        if (deletes.length > 0) await Promise.all(deletes);
      } catch (e) {
        console.error("ลบ refundRequests ล้มเหลว:", e);
      }

      setAppointments((prev) => prev.filter((p) => p.id !== appointmentId));
      Swal.fire("ลบเรียบร้อย", "การจองถูกลบแล้ว", "success");
    } catch (err) {
      console.error("handleDeleteAppointment error:", err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบการจองได้", "error");
    }
  }

  const handleRefundRequest = async (appointment) => {
    const { value: reason } = await Swal.fire({
      title: "กรุณากรอกเหตุผลการขอยกเลิก",
      input: "textarea",
      inputPlaceholder: "อธิบายเหตุผลที่ต้องการขอยกเลิกการจอง...",
      inputAttributes: { "aria-label": "เหตุผลขอยกเลิก" },
      showCancelButton: true,
      confirmButtonText: "ส่งคำขอ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (!reason) return;

    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        status: "refund_pending",
      });

      await addDoc(collection(db, "refundRequests"), {
        appointmentId: appointment.id,
        userName: appointment.userName || user?.fullName || "ไม่ระบุชื่อ",
        email: appointment.email || user?.email || "",
        serviceName: appointment.serviceName,
        date: appointment.date,
        time: appointment.time,
        deposit: appointment.deposit || 0,
        userReason: reason,
        adminNote: "",
        status: null,
        createdAt: new Date().toISOString(),
      });

      setAppointments((prev) =>
        prev.map((p) =>
          p.id === appointment.id ? { ...p, status: "refund_pending" } : p
        )
      );

      Swal.fire("ส่งคำขอแล้ว", "กรุณารอการอนุมัติจากแอดมิน", "success");
    } catch (err) {
      console.error("handleRefundRequest error:", err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถส่งคำขอได้", "error");
    }
  };

  const findRefundForAppointment = (appointment) => {
    if (!appointment) return null;
    return (
      refunds.find(
        (r) =>
          r.appointmentId === appointment.id ||
          (r.date === appointment.date &&
            r.time === appointment.time &&
            r.serviceName === appointment.serviceName)
      ) || null
    );
  };
  // Replace existing exportAppointmentPDF with this implementation
  const exportAppointmentPDF = async (a) => {
    // console.log("[pdf] start export for", a.id || "(no id)");

    // paths: ใช้ placeholder import ก่อน ถ้าไม่สำเร็จ fallback ไปที่ไฟล์อัปโหลดใน history
    const uploadedLogoPath = placeholderImage;

    // helper: load image -> base64 (try uploaded path first, then module placeholderImage)
    const loadImageAsBase64 = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width || 200;
            canvas.height = img.naturalHeight || img.height || 60;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });

    let logoDataUrl = null;
    // 1) try uploaded file path first (tool/environment will transform /mnt/data/... into URL)
    try {
      logoDataUrl = await loadImageAsBase64(uploadedLogoPath);
      // console.log("[pdf] loaded uploadedLogoPath", uploadedLogoPath);
    } catch (err) {
      console.warn("[pdf] failed loading uploadedLogoPath:", err);
      // 2) fallback to module asset placeholderImage (imported)
      try {
        if (typeof placeholderImage !== "undefined") {
          logoDataUrl = await loadImageAsBase64(placeholderImage);
          // console.log("[pdf] loaded placeholderImage (module asset)");
        }
      } catch (err2) {
        // console.warn("[pdf] fallback placeholderImage failed:", err2);
        logoDataUrl = null;
      }
    }

    const logoHtml = logoDataUrl
      ? `
    <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        margin-bottom:20px;
      ">
      <img src="${logoDataUrl}"
        style="height:90px; object-fit:contain;" />
    </div>`
      : `
    <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        margin-bottom:20px;
        font-size:24px;
        color:#888;
      ">
      WHOCARE
    </div>`;

    const contentHtml = `
    <div style="max-width:760px;margin:0 auto;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Kanit','Noto Sans Thai',Arial; color:#063642;">
      ${logoHtml}
      <h1 style="text-align:center;color:#006680;margin:6px 0 12px 0;font-size:20px;">เอกสารการนัดหมาย - WHOCARE</h1>
      <p style="text-align:center;color:#444;margin:4px 0 12px;font-size:13px;">ใช้แสดงรายละเอียดการนัดและเป็นหลักฐานการชำระมัดจำ</p>
      <div style="margin-top:8px;font-size:14px;color:#333;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px dashed #e6f7f8;">
          <div style="color:#666;">ชื่อผู้ใช้</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            a.userName || a.email || "-"
          )}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;">
          <div style="color:#666;">บริการ</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            a.serviceName || "-"
          )}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;">
          <div style="color:#666;">แพทย์</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            a.doctorName || "-"
          )}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;">
          <div style="color:#666;">วันที่นัด</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            formatThaiDate(a.date)
          )}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;">
          <div style="color:#666;">เวลา</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            a.time || "-"
          )} น.</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e6f7f8;">
          <div style="color:#666;">มัดจำที่ชำระ</div>
          <div style="font-weight:700;text-align:right;">${escapeHtml(
            String(a.deposit ?? 0)
          )} บาท</div>
        </div>

        <div style="padding:12px 10px;background:#f8feff;border-radius:8px;margin-top:12px;font-size:13px;color:#555;">
          โปรดนำเอกสารนี้ (หรือรูปภาพ/สกรีนช็อต) มาแสดงต่อเจ้าหน้าที่เมื่อมาถึงคลินิก กรุณามาถึงก่อนเวลานัด 10–15 นาที
        </div>

        <div style="text-align:center;margin-top:14px;color:#777;font-size:12px;">
          WHOCARE — ทีมแพทย์ผู้เชี่ยวชาญ<br/>
          วันที่พิมพ์: ${new Date().toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  `;

    // สร้าง wrapper ที่มองเห็นได้ (opacity 1) แต่ย้ายตำแหน่งชั่วคราวกลางหน้าจอ
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px"; // ย้ายออกนอกจอ
    wrapper.style.top = "-9999px"; // ย้ายออกนอกจอ
    wrapper.style.opacity = "1"; // ให้ render ปกติ (ต้องไม่เป็น 0)
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "-1"; // ไม่ให้ขวาง UI
    wrapper.style.width = "800px";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "20px";
    wrapper.style.borderRadius = "10px";
    wrapper.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
    wrapper.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kanit", "Noto Sans Thai", Arial';
    wrapper.style.color = "#063642";
    wrapper.innerHTML = contentHtml;

    document.body.appendChild(wrapper);
    // console.log("[pdf] wrapper appended (visible) — waiting for render");

    // รอ fonts + render settle
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
        // console.log("[pdf] fonts ready");
      }
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 300));

    // ใช้ html2canvas เพื่อจับภาพ wrapper
    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
      });
      // console.log(
      //   "[pdf] html2canvas rendered - canvas size:",
      //   canvas.width,
      //   canvas.height
      // );

      const imgData = canvas.toDataURL("image/png");

      // สร้าง jsPDF และใส่ภาพ (fit to A4)
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // convert px -> mm (assuming 96dpi)
      const pxPerMm = 96 / 25.4;
      const imgWidthMm = canvas.width / pxPerMm;
      const imgHeightMm = canvas.height / pxPerMm;

      // scale to fit width
      const scale = Math.min(pageWidth / imgWidthMm, pageHeight / imgHeightMm);
      const renderWidth = imgWidthMm * scale;
      const renderHeight = imgHeightMm * scale;

      pdf.addImage(
        imgData,
        "PNG",
        (pageWidth - renderWidth) / 2,
        10,
        renderWidth,
        renderHeight
      );
      const filename = `WHOCARE_appointment_${a.id || Date.now()}.pdf`;
      pdf.save(filename);
      // console.log("[pdf] jsPDF saved:", filename);
    } catch (err) {
      console.error("[pdf] html2canvas/jsPDF error:", err);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถสร้าง PDF ได้ (ดู console)",
        "error"
      );
    } finally {
      // clean up
      if (wrapper && wrapper.parentNode)
        wrapper.parentNode.removeChild(wrapper);
    }
  };

  // ฟังก์ชันช่วย escape (ต้องมี)
  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (loading)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
          กำลังโหลดข้อมูลการจอง...
        </div>
      </MainLayout>
    );

  const activeAppointments = appointments.filter(
    (a) => renderTimeStatus(a) !== "หมดเวลาแล้ว"
  );
  const expiredAppointments = appointments.filter(
    (a) => renderTimeStatus(a) === "หมดเวลาแล้ว"
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f4fbfc] py-10 px-5">
        <h1 className="text-2xl font-bold text-[#006680] text-center mb-8">
          การจองของฉัน
        </h1>

        <div className="max-w-5xl mx-auto bg-[#e0f7fa] border-l-4 border-[#0289a7] rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex items-start">
            <FaInfoCircle className="text-[#0289a7] w-6 h-6 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#006680] mb-2">
                กฎและเงื่อนไขการจอง
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed space-y-1">
                <li>
                  การแก้ไขวันและเวลาการจอง{" "}
                  <span className="font-semibold text-[#006680]">
                    สามารถทำได้เพียง 1 ครั้ง
                  </span>{" "}
                  เท่านั้น
                </li>
                <li>
                  เมื่อกด{" "}
                  <span className="font-semibold text-[#d93025]">
                    แก้ไขวันและเวลา
                  </span>{" "}
                  แล้ว จะไม่สามารถ{" "}
                  <span className="font-semibold text-[#d93025]">
                    ขอยกเลิกเพื่อคืนเงินมัดจำ
                  </span>{" "}
                  ได้อีก
                </li>
                <li>
                  บริการที่{" "}
                  <span className="font-semibold text-gray-800">
                    หมดเวลาแล้ว
                  </span>{" "}
                  จะไม่สามารถ{" "}
                  <span className="font-semibold text-[#d93025]">แก้ไข</span>{" "}
                  หรือ{" "}
                  <span className="font-semibold text-[#d93025]">ยกเลิก</span>{" "}
                  ได้
                </li>
                <li>
                  เมื่อกดยกเลิก ระบบจะส่งคำขอคืนเงินไปยังผู้ดูแลระบบ (Admin)
                  เพื่อรอการอนุมัติ
                </li>
                <li>
                  เมื่อได้รับการยืนยันแล้ว การ{" "}
                  <span className="font-semibold text-gray-800">
                    แก้ไขหรือยกเลิก
                  </span>{" "}
                  จะไม่สามารถย้อนกลับได้
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section className="max-w-6xl mx-auto mb-10">
          <h2 className="text-xl font-semibold text-[#006680] mb-3">
            บริการที่ยังไม่หมดเวลา
          </h2>

          {activeAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow">
              ยังไม่มีบริการที่อยู่ในช่วงเวลานัดหมาย
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeAppointments.map((a) => {
                const remainingPayment = a.price
                  ? a.price - (a.deposit || 0)
                  : 0;
                const status = renderTimeStatus(a);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col justify-between transition hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center text-center">
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
                        <p className="text-sm text-gray-600 mb-2">
                          {a.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <b>วันที่:</b> {formatThaiDate(a.date)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <b>เวลา:</b> {a.time} น.
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <b>แพทย์:</b> {a.doctorName || "-"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <b>เบอร์โทร:</b> {a.phone}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <b>มัดจำแล้ว:</b>{" "}
                        <span className="font-semibold text-[#0289a7]">
                          {a.deposit ?? 0} บาท
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <b>ชำระที่คลินิกเพิ่มเติม:</b>{" "}
                        <span className="text-[#d97706] font-bold">
                          {remainingPayment > 0 ? remainingPayment : 0} บาท
                        </span>
                      </p>
                      <div className="mt-3">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            status === "ถึงเวลานัดแล้ว"
                              ? "bg-[#fff3cd] text-[#856404]"
                              : status.includes("ขอยกเลิก")
                              ? "bg-[#fdecea] text-[#d93025]"
                              : "bg-[#e0f7fa] text-[#006680]"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch mt-4 gap-3">
                      <button
                        onClick={() => exportAppointmentPDF(a)}
                        className="
                          w-full text-center text-sm px-3 py-2 rounded-full font-semibold cursor-pointer
                          border border-indigo-600 text-indigo-600 bg-white
                          transition-all duration-200
                          hover:bg-indigo-600 hover:text-white
  "
                      >
                        ดาวน์โหลดเอกสารนัด (PDF)
                      </button>

                      {(() => {
                        const refund = findRefundForAppointment(a);
                        if (refund) {
                          if (refund.status === "approved") {
                            return (
                              <div className="text-center mt-3">
                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-semibold">
                                  ได้รับการคืนเงินแล้ว
                                </span>
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  การจองนี้ถูกยกเลิกแล้ว
                                  ไม่สามารถแก้ไขหรือใช้งานต่อได้
                                </p>
                              </div>
                            );
                          }
                          if (refund.status === "rejected") {
                            return (
                              <div className="flex flex-col items-stretch mt-2">
                                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 text-xs rounded-full font-semibold">
                                  ถูกปฏิเสธการคืนเงิน
                                </span>
                                {refund.adminNote && (
                                  <p className="text-xs text-gray-600 mt-1 italic">
                                    เหตุผล: {refund.adminNote}
                                  </p>
                                )}
                                {!a.editedOnce ? (
                                  <button
                                    onClick={() => openEditModal(a)}
                                    className="w-full mt-3 bg-[#006680] hover:bg-[#0289a7] text-white text-sm px-3 py-2 rounded-full transition font-semibold cursor-pointer"
                                  >
                                    แก้ไขวันและเวลา
                                  </button>
                                ) : (
                                  <p className="text-xs text-gray-500 mt-2 italic">
                                    คุณได้แก้ไขวัน–เวลาแล้ว ไม่สามารถแก้ซ้ำได้
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return (
                            <span className="text-sm text-gray-600 italic flex items-center">
                              <FaUndoAlt className="mr-2 text-[#d93025]" />
                              รอการอนุมัติคืนเงินมัดจำ
                            </span>
                          );
                        }
                        return (
                          <>
                            <button
                              onClick={() => openEditModal(a)}
                              disabled={a.editedOnce}
                              className={`w-full text-sm px-3 py-2 rounded-full transition font-semibold cursor-pointer ${
                                a.editedOnce
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-[#006680] hover:bg-[#0289a7] text-white"
                              }`}
                              title={
                                a.editedOnce
                                  ? "คุณได้แก้ไขวัน-เวลาแล้ว ไม่สามารถแก้ไขซ้ำได้"
                                  : "แก้ไขวันและเวลา (สามารถแก้ได้ 1 ครั้ง)"
                              }
                            >
                              {a.editedOnce ? "แก้ไขแล้ว" : "แก้ไขวันและเวลา"}
                            </button>

                            {!a.editedOnce && (
                              <button
                                onClick={() => handleRefundRequest(a)}
                                className="w-full text-sm px-3 py-2 rounded-full transition font-semibold bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                              >
                                ขอยกเลิกการจอง (refund)
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-3">
            บริการที่หมดเวลาแล้ว
          </h2>

          {expiredAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow">
              ยังไม่มีบริการที่หมดเวลา
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {expiredAppointments.map((a) => {
                const remainingPayment = a.price
                  ? a.price - (a.deposit || 0)
                  : 0;

                return (
                  <div
                    key={a.id}
                    className="bg-gray-100 rounded-2xl shadow border border-gray-300 p-5 flex flex-col justify-between"
                  >
                    <div className="flex flex-col items-center text-center">
                      {a.image && (
                        <img
                          src={a.image}
                          alt={a.serviceName}
                          className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-200 opacity-80"
                        />
                      )}
                      <h3 className="text-lg font-bold text-gray-700 mb-2">
                        {a.serviceName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <b>วันที่:</b> {formatThaiDate(a.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <b>เวลา:</b> {a.time} น.
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <b>แพทย์:</b> {a.doctorName || "-"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <b>มัดจำแล้ว:</b> <s>{a.deposit ?? 0} บาท</s>
                      </p>
                      <p className="text-sm text-gray-600">
                        <b>ชำระที่คลินิกเพิ่มเติม:</b> {remainingPayment} บาท
                      </p>
                      <span className="inline-block mt-3 bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                        หมดเวลาแล้ว
                      </span>
                    </div>

                    <div className="flex flex-col items-stretch mt-4 gap-3">
                      <button
                        onClick={() => exportAppointmentPDF(a)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-full transition font-semibold"
                      >
                        ดาวน์โหลดเอกสารนัด (PDF)
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(a.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-full transition font-semibold"
                      >
                        ลบออก
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
