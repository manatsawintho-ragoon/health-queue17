import React, { useEffect, useState, useRef, forwardRef } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ปิด modal เมื่อคลิกนอกกรอบ
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

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

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return "-";
    const birthDate = new Date(birthDateStr);
    const diffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const openEditModal = () => {
    setEditData({
      prefix: userData.prefix || "",
      fullName: userData.fullName || "",
      email: userData.email || "",
      gender: userData.gender || "",
      citizenId: userData.citizenId || "",
      department: userData.department || "",
      photoUrl: userData.photoUrl || "",
      description: userData.description || "",
      birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
    });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, {
        prefix: editData.prefix,
        fullName: editData.fullName,
        email: editData.email,
        gender: editData.gender,
        citizenId: editData.citizenId,
        department: editData.department || "",
        photoUrl: editData.photoUrl || "",
        description: editData.description || "",
        birthDate: editData.birthDate ? editData.birthDate.toISOString() : "",
      });
      Swal.fire({
        icon: "success",
        title: "บันทึกการแก้ไขแล้ว",
        confirmButtonColor: "#0288d1",
      });
      setUserData((prev) => ({ ...prev, ...editData }));
      setShowModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire("เกิดข้อผิดพลาด!", err.message || String(err), "error");
    }
  };

  const formatDateToThai = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      readOnly
      ref={ref}
      onClick={onClick}
      value={formatDateToThai(value ? new Date(value) : null)}
      placeholder="เลือกวันเดือนปีเกิด"
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-[#0288d1] outline-none bg-white cursor-pointer"
    />
  ));

  if (!userData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[70vh] text-[#006680] text-lg font-semibold">
          กำลังโหลดข้อมูลผู้ใช้...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)] bg-gradient-to-br from-[#e0f7fa] to-[#006680] px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-t-[6px] border-[#006680] relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#006680] text-white px-6 py-1 rounded-full text-sm font-semibold shadow-md">
            WHOCARE HOSPITAL
          </div>

          <div className="flex flex-col items-center text-center mt-6">
            <img
              src={
                userData.photoUrl ||
                userData.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-[#0289a7] shadow-md mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold text-[#006680]">
              {userData.prefix} {userData.fullName}
            </h2>
            <p className="text-gray-600 text-sm">ผู้ใช้ระบบคลินิก WHOCARE</p>
            <p className="text-gray-600 text-sm">
              สถานะผู้ใช้: {userData.role}
            </p>
          </div>

          <hr className="my-6 border-t-2 border-[#b7dfe6]" />
          <div className="space-y-3 text-gray-800">
            <InfoRow
              label="ชื่อ - นามสกุล"
              value={`${userData.prefix} ${userData.fullName}`}
            />
            <InfoRow
              label="เพศ"
              value={
                userData.prefix === "นาย"
                  ? "ชาย"
                  : userData.prefix === "นาง" || userData.prefix === "นางสาว"
                  ? "หญิง"
                  : userData.prefix === "นพ."
                  ? "ชาย"
                  : userData.prefix === "พญ."
                  ? "หญิง"
                  : userData.gender || "-"
              }
            />
            <InfoRow
              label="อายุ"
              value={`${calculateAge(userData.birthDate)} ปี`}
            />
            <InfoRow label="เลขบัตรประชาชน" value={userData.citizenId || "-"} />
            {userData.role === "หมอ" && (
              <>
                <InfoRow label="แผนก" value={userData.department || "-"} />
                <div>
                  <span className="font-semibold text-[#006680]">
                    รายละเอียดตนเอง
                  </span>
                  <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                    {userData.description || "ยังไม่มีข้อมูล"}
                  </p>
                </div>
              </>
            )}
            <InfoRow
              label="วันเดือนปีเกิด"
              value={formatThaiDate(userData.birthDate)}
            />
            <InfoRow label="อีเมล" value={userData.email} />
            <InfoRow
              label="วันที่สมัคร"
              value={formatThaiDate(
                userData.createdAt?.toDate?.() || userData.createdAt
              )}
            />
          </div>

          <hr className="my-6 border-[#b7dfe6]" />
          <div className="text-center flex flex-col gap-3">
            <button
              onClick={openEditModal}
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold px-8 py-2 rounded-full shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <FaEdit /> แก้ไขโปรไฟล์
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-[#006680] hover:bg-[#0289a7] text-white font-semibold px-8 py-2 rounded-full shadow-md transition cursor-pointer"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </div>

      {/* Modal สำหรับหมอ */}
      {showModal && userData.role === "หมอ" && (
        <DoctorModal
          modalRef={modalRef}
          handleBackdropClick={handleBackdropClick}
          editData={editData}
          setEditData={setEditData}
          handleSaveEdit={handleSaveEdit}
          CustomInput={CustomInput}
          setShowModal={setShowModal}
        />
      )}

      {/* Modal ปกติ */}
      {showModal && userData.role !== "หมอ" && (
        <NormalModal
          modalRef={modalRef}
          handleBackdropClick={handleBackdropClick}
          editData={editData}
          setEditData={setEditData}
          handleSaveEdit={handleSaveEdit}
          CustomInput={CustomInput}
          setShowModal={setShowModal}
        />
      )}
    </MainLayout>
  );
}

/* ---------- Components ---------- */

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-semibold text-[#006680]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function DoctorModal({
  modalRef,
  handleBackdropClick,
  editData,
  setEditData,
  handleSaveEdit,
  CustomInput,
  setShowModal,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-[820px] shadow-2xl border border-[#0288d1]/30 grid grid-cols-2 gap-x-8"
      >
        {/* ซ้าย */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#0288d1] mb-2">
            <FaEdit /> ข้อมูลทั่วไป
          </h3>
          <SelectInput
            label="คำนำหน้า:"
            value={editData.prefix}
            setValue={(v) => {
              let inferredGender = editData.gender;
              if (v === "นพ.") inferredGender = "ชาย";
              else if (v === "พญ.") inferredGender = "หญิง";
              else if (v === "Dr.") inferredGender = "ระบุไม่ได้";
              setEditData({ ...editData, prefix: v, gender: inferredGender });
            }}
            options={["นพ.", "พญ.", "Dr."]}
          />
          <TextInput
            label="ชื่อเต็ม:"
            value={editData.fullName}
            setValue={(v) => setEditData({ ...editData, fullName: v })}
          />
          <DatePickerInput
            label="วันเดือนปีเกิด:"
            value={editData.birthDate}
            setValue={(v) => setEditData({ ...editData, birthDate: v })}
            CustomInput={CustomInput}
          />
          <TextInput
            label="เลขบัตรประชาชน (13 หลัก):"
            value={editData.citizenId}
            setValue={(v) => setEditData({ ...editData, citizenId: v })}
            maxLength={13}
          />
          <TextInput
            label="อีเมล:"
            value={editData.email}
            setValue={(v) => setEditData({ ...editData, email: v })}
          />
          <TextInput
            label="รูปภาพ (URL):"
            value={editData.photoUrl}
            setValue={(v) => setEditData({ ...editData, photoUrl: v })}
          />
          {editData.photoUrl && (
            <img
              src={editData.photoUrl}
              alt="preview"
              className="w-full max-h-[150px] object-contain mt-2 rounded-lg border border-[#0288d1]/40 shadow-sm"
            />
          )}
        </div>

        {/* ขวา */}
        <div className="flex flex-col gap-4 pl-2">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#0288d1] mb-2">
            <FaEdit /> ข้อมูลเฉพาะแพทย์
          </h3>
          <SelectInput
            label="แผนก:"
            value={editData.department}
            setValue={(v) => setEditData({ ...editData, department: v })}
            options={[
              "รักษาสิวครบวงจร",
              "ทรีตเมนต์บำรุงผิวหน้า",
              "เลเซอร์หน้าใส",
              "ฟิลเลอร์ & โบท็อกซ์",
            ]}
          />
          <TextAreaInput
            label="รายละเอียดตนเอง:"
            value={editData.description}
            setValue={(v) => setEditData({ ...editData, description: v })}
          />
        </div>

        {/* ปุ่ม */}
        <div className="col-span-2 flex justify-center gap-4 mt-6 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
          >
            <FaTimes /> ยกเลิก
          </button>
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
          >
            <FaSave /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* Modal ปกติ */
function NormalModal({
  modalRef,
  handleBackdropClick,
  editData,
  setEditData,
  handleSaveEdit,
  CustomInput,
  setShowModal,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-[500px] shadow-2xl border border-[#0288d1]/30"
      >
        <h3 className="flex items-center justify-center gap-2 text-xl font-extrabold text-[#0288d1] mb-4">
          <FaEdit /> แก้ไขข้อมูลโปรไฟล์
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          <SelectInput
            label="คำนำหน้า:"
            value={editData.prefix}
            setValue={(v) => {
              let inferredGender = editData.gender;
              if (v === "นาย") inferredGender = "ชาย";
              else if (v === "นาง" || v === "นางสาว") inferredGender = "หญิง";
              setEditData({ ...editData, prefix: v, gender: inferredGender });
            }}
            options={["นาย", "นาง", "นางสาว"]}
          />

          <TextInput
            label="ชื่อเต็ม:"
            value={editData.fullName}
            setValue={(v) => setEditData({ ...editData, fullName: v })}
          />
          <DatePickerInput
            label="วันเดือนปีเกิด:"
            value={editData.birthDate}
            setValue={(v) => setEditData({ ...editData, birthDate: v })}
            CustomInput={CustomInput}
          />
          <TextInput
            label="เลขบัตรประชาชน (13 หลัก):"
            value={editData.citizenId}
            setValue={(v) => setEditData({ ...editData, citizenId: v })}
            maxLength={13}
          />
          <TextInput
            label="อีเมล:"
            value={editData.email}
            setValue={(v) => setEditData({ ...editData, email: v })}
          />
          <TextInput
            label="รูปภาพ (URL):"
            value={editData.photoUrl}
            setValue={(v) => setEditData({ ...editData, photoUrl: v })}
          />
          {editData.photoUrl && (
            <img
              src={editData.photoUrl}
              alt="preview"
              className="w-full max-h-[150px] object-contain mt-2 rounded-lg border border-[#0288d1]/40 shadow-sm col-span-2"
            />
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
          >
            <FaTimes /> ยกเลิก
          </button>
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
          >
            <FaSave /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ส่วนประกอบย่อย */
function TextInput({ label, value, setValue, ...props }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
        {...props}
      />
    </div>
  );
}

function SelectInput({ label, value, setValue, options }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
      >
        <option value="">เลือก</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaInput({ label, value, setValue }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 w-full p-2 rounded-lg h-[180px] resize-none focus:ring-2 focus:ring-[#0288d1] outline-none"
      />
    </div>
  );
}

function DatePickerInput({ label, value, setValue, CustomInput }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <DatePicker
        selected={value}
        onChange={setValue}
        locale="th"
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
        customInput={<CustomInput />}
        renderCustomHeader={({ date, changeYear, changeMonth }) => {
          const months = [
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
          const years = Array.from({ length: 101 }, (_, i) => 1925 + i);
          return (
            <div className="flex justify-center gap-3 items-center p-2">
              <select
                value={months[date.getMonth()]}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={date.getFullYear()}
                onChange={({ target: { value } }) => changeYear(Number(value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y + 543}
                  </option>
                ))}
              </select>
            </div>
          );
        }}
      />
    </div>
  );
}
