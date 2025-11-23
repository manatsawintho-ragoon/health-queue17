// src/pages/DoctorPanel.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaCalendarDay, FaClock, FaUserMd } from "react-icons/fa";

const allowedAdminRoles = ["ผู้พัฒนา", "ผู้ดูแลระบบ", "admin", "แอดมิน"];

export default function DoctorPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // userDoc is the Firestore users document for the current logged-in user (if found)
  const [userDoc, setUserDoc] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // doctors for admin filter
  const [doctors, setDoctors] = useState([]);
  const [filterDoctorId, setFilterDoctorId] = useState("");

  const auth = getAuth();

  // Helpers
  const toLocalDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatThaiDate = (isoDate) => {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "-";
    const day = d.getDate();
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
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const timeUntil = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const parts = dateStr.split("-").map((n) => Number(n));
    if (parts.length < 3) return null;
    const [y, m, d] = parts;
    const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
    const target = new Date(y, m - 1, d, hh, mm, 0);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (isNaN(diffMs)) return null;
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 };
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    return { days, hours, minutes, totalMinutes };
  };

  const renderTimeUntilText = (a) => {
    const tu = timeUntil(a.date, a.time);
    if (!tu) return "-";
    if (tu.totalMinutes === 0) return "ถึงเวลาแล้ว";
    if (tu.days === 0) {
      if (tu.hours > 0) return `อีก ${tu.hours} ชั่วโมง ${tu.minutes} นาที`;
      return `อีก ${tu.minutes} นาที`;
    }
    return `อีก ${tu.days} วัน ${tu.hours} ชม.`;
  };

  const groupAppointments = (arr) => {
    const groups = { today: [], next5: [], later: [] };
    arr.forEach((a) => {
      if (!a.date) {
        groups.later.push(a);
        return;
      }
      const parts = a.date.split("-").map(Number);
      if (parts.length < 3) {
        groups.later.push(a);
        return;
      }
      const apptDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffMs =
        apptDate.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) groups.today.push(a);
      else if (diffDays > 0 && diffDays <= 5) groups.next5.push(a);
      else groups.later.push(a);
    });

    const sortByDateTime = (x, y) => {
      if (x.date === y.date) return (x.time || "").localeCompare(y.time || "");
      return (x.date || "").localeCompare(y.date || "");
    };
    groups.today.sort(sortByDateTime);
    groups.next5.sort(sortByDateTime);
    groups.later.sort(sortByDateTime);
    return groups;
  };

  // Resolve current logged-in user's Firestore user document (userDoc)
  useEffect(() => {
    let unsubAuth = () => {};
    unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUserDoc(null);
          setAuthReady(true);
          return;
        }

        // find matching users doc by uid field (preferred) or email fallback
        let foundDoc = null;
        try {
          const qUid = query(
            collection(db, "users"),
            where("uid", "==", fbUser.uid)
          );
          const snapUid = await getDocs(qUid);
          if (!snapUid.empty) {
            const d = snapUid.docs[0];
            foundDoc = { id: d.id, ...d.data() };
          } else if (fbUser.email) {
            const qEmail = query(
              collection(db, "users"),
              where("email", "==", fbUser.email)
            );
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
              const d2 = snapEmail.docs[0];
              foundDoc = { id: d2.id, ...d2.data() };
            }
          }
        } catch (e) {
          console.warn("DoctorPanel: userDoc lookup error", e);
        }

        setUserDoc(foundDoc);
      } finally {
        setAuthReady(true);
      }
    });

    return () => {
      try {
        unsubAuth();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load doctors list for admin filter (non-intrusive)
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const arr = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.role === "หมอ")
          .map((u) => {
            const name = `${u.prefix || ""} ${
              u.fullName || u.displayName || ""
            }`.trim();
            return { id: u.id, name: name || "ไม่ระบุ" };
          });
        setDoctors(arr);
      } catch (e) {
        console.error("loadDoctors:", e);
        setDoctors([]);
      }
    };

    // load only if auth resolved and userDoc suggests admin or doctor
    if (authReady) {
      if (!userDoc) {
        // if not logged in, no need to load
        return;
      }
      if (allowedAdminRoles.includes(userDoc.role) || userDoc.role === "หมอ") {
        loadDoctors();
      }
    }
  }, [authReady, userDoc]);

  // Listen appointments after we know userDoc (use doc.id for doctor matching)
  useEffect(() => {
    if (!authReady) return;
    // if no userDoc, we don't have a Firestore user record; show empty safely
    if (!userDoc) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const appointmentsRef = collection(db, "appointments");

    const viewerIsDoctor = userDoc.role === "หมอ";
    const viewerIsAdmin = allowedAdminRoles.includes(userDoc.role);

    let q;
    try {
      if (viewerIsDoctor) {
        // use Firestore users doc id (userDoc.id) to match appointments.doctorId
        q = query(appointmentsRef, where("doctorId", "==", userDoc.id));
      } else if (viewerIsAdmin && filterDoctorId) {
        q = query(appointmentsRef, where("doctorId", "==", filterDoctorId));
      } else {
        q = query(appointmentsRef);
      }
    } catch (e) {
      console.error("DoctorPanel: failed to build appointments query", e);
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const normalized = list.map((it) => ({
          id: it.id,
          userName: it.userName || it.fullName || it.displayName || "-",
          email: it.email || "-",
          phone: it.phone || "-",
          serviceName: it.serviceName || it.name || "-",
          date: it.date || "",
          time: it.time || "",
          doctorName: it.doctorName || "-",
          deposit: it.deposit ?? 0,
          price: it.price ?? null,
        }));
        setAppointments(normalized);
        setLoading(false);
      },
      (err) => {
        console.error("DoctorPanel onSnapshot error:", err);
        setAppointments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authReady, userDoc, filterDoctorId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">กำลังโหลดข้อมูลนัดหมาย...</div>
        </div>
      </MainLayout>
    );
  }

  const groups = groupAppointments(appointments);

  const renderTable = (list) => {
    if (!list || list.length === 0) {
      return (
        <div className="text-center text-gray-500 py-6">ไม่มีการนัดหมาย</div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-[950px] w-full text-left text-sm">
          <thead className="bg-[#e6f3f5] text-[#006680]">
            <tr>
              <th className="p-3 text-center w-12">#</th>
              <th className="p-3">บริการ</th>
              <th className="p-3">ผู้จอง</th>
              <th className="p-3">อีเมล / เบอร์</th>
              <th className="p-3">แพทย์</th>
              <th className="p-3">วันที่</th>
              <th className="p-3">เวลา</th>
              <th className="p-3">สถานะ (เวลาเหลือ)</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a, i) => {
              const tu = timeUntil(a.date, a.time);
              const statusText = renderTimeUntilText(a);
              let badgeClass =
                "inline-block px-3 py-1 rounded-full text-xs font-semibold";
              if (!tu) badgeClass += " bg-gray-100 text-gray-700";
              else if (tu.totalMinutes === 0)
                badgeClass += " bg-yellow-100 text-yellow-800";
              else if (tu.days === 0) badgeClass += " bg-blue-50 text-blue-700";
              else if (tu.days <= 5)
                badgeClass += " bg-indigo-50 text-indigo-700";
              else badgeClass += " bg-gray-50 text-gray-800";

              return (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="text-center p-3 align-top">{i + 1}</td>
                  <td className="p-3 align-top font-medium text-[#034d55]">
                    {a.serviceName}
                  </td>
                  <td className="p-3 align-top">{a.userName}</td>
                  <td className="p-3 align-top">
                    <div>{a.email}</div>
                    <div className="text-xs text-gray-500 mt-1">{a.phone}</div>
                  </td>
                  <td className="p-3 align-top">{a.doctorName}</td>
                  <td className="p-3 align-top">
                    <div className="text-sm">{formatThaiDate(a.date)}</div>
                    <div className="text-xs text-gray-500">{a.date}</div>
                  </td>
                  <td className="p-3 align-top">
                    <div className="text-sm font-semibold">{a.time}</div>
                  </td>
                  <td className="p-3 align-top">
                    <div className={badgeClass}>
                      <div className="flex flex-col items-start">
                        <span>{statusText}</span>
                        {tu && tu.totalMinutes > 0 && (
                          <small className="text-xs text-gray-500">
                            {tu.days > 0
                              ? `${tu.days} วัน ${tu.hours} ชม.`
                              : tu.hours > 0
                              ? `${tu.hours} ชม. ${tu.minutes} นาที`
                              : `${tu.minutes} นาที`}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f7fcfc] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaUserMd className="text-2xl text-[#006680]" />
              <div>
                <h1 className="text-2xl font-bold text-[#006680]">
                  แผงควบคุมแพทย์ (Doctor Panel)
                </h1>
                <p className="text-sm text-gray-600">แสดงการนัดหมาย</p>
              </div>
            </div>

            {userDoc && allowedAdminRoles.includes(userDoc.role) && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">กรองตามแพทย์:</label>
                <select
                  value={filterDoctorId}
                  onChange={(e) => setFilterDoctorId(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <section className="mb-8 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaCalendarDay className="text-xl text-[#0289a7]" />
                <div>
                  <h3 className="font-semibold text-[#006680] text-lg">
                    นัดหมายวันนี้
                  </h3>
                  <p className="text-xs text-gray-500">
                    จำนวน {groups.today.length} รายการ
                  </p>
                </div>
              </div>
            </div>
            {renderTable(groups.today)}
          </section>

          <section className="mb-8 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaClock className="text-xl text-[#5b21b6]" />
                <div>
                  <h3 className="font-semibold text-[#4f46e5] text-lg">
                    นัดหมายถัดไป (1–5 วัน)
                  </h3>
                  <p className="text-xs text-gray-500">
                    จำนวน {groups.next5.length} รายการ
                  </p>
                </div>
              </div>
            </div>
            {renderTable(groups.next5)}
          </section>

          <section className="mb-8 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaCalendarDay className="text-xl text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-700 text-lg">
                    นัดหมายมากกว่า 5 วัน
                  </h3>
                  <p className="text-xs text-gray-500">
                    จำนวน {groups.later.length} รายการ
                  </p>
                </div>
              </div>
            </div>
            {renderTable(groups.later)}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
