import React, { useEffect, useState, useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  getDocs,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import MainLayout from "../layouts/MainLayout";
import {
  FaUsers,
  FaUserMd,
  FaUserShield,
  FaWrench,
  FaBoxOpen,
  FaClipboardList,
  FaHome,
  FaUserCog,
  FaSearch,
  FaTrash,
  FaEdit,
  FaSyncAlt,
  FaPlusCircle,
  FaHotjar,
  FaSave,
  FaTimes,
  FaPercent,
} from "react-icons/fa";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import placeholderImg from "../assets/WHOCARE-logo.png";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

/**
 * AdminDashboard.jsx - Final (with requested updates)
 *
 * - คืนระบบ "จัดการบริการ" (services) ให้เหมือนเดิม
 * - แยกรายการบริการเป็น 2 ส่วน: บริการแนะนำมาใหม่ (recommend = true) และ บริการทั่วไป (recommend = false)
 * - เพิ่มแท็บ "จัดการบริการโปรโมชั่น" (promotions) แยก CRUD (collection "promotions")
 * - ในฟอร์มเพิ่ม/แก้ไขโปรโมชั่น แสดงราคาหลังหักส่วนลดแบบ realtime และปัดเศษตามเกณฑ์: เศษ >= 0.5 ปัดขึ้น, ต่ำกว่า ปัดลง
 * - แสดงรูปโปรไฟล์ผู้ใช้ในรายการผู้ใช้
 * - Modal แก้ไขผู้ใช้ (Normal / Doctor) แบบเดียวกับ Profile.jsx (ขนาด/layout ตามที่ร้องขอ)
 *
 * คัดลอกไฟล์นี้ทับ AdminDashboard.jsx เดิมได้เลย
 */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    admins: 0,
    services: 0,
    promotions: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Service states (original)
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    recommend: false,
  });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);

  // Promotions - separate CRUD (new)
  const [promotions, setPromotions] = useState([]);
  const [promoForm, setPromoForm] = useState({
    name: "",
    price: "",
    discount: "",
    description: "",
    image: "",
    recommend: false,
  });
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [editPromoId, setEditPromoId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (
      !userData ||
      (userData.role !== "แอดมิน" && userData.role !== "ผู้พัฒนา")
    ) {
      Swal.fire({
        icon: "error",
        title: "ไม่มีสิทธิ์เข้าถึง",
        text: "หน้านี้สำหรับแอดมินและผู้พัฒนาเท่านั้น",
        confirmButtonColor: "#0288d1",
      }).then(() => navigate("/"));
      return;
    }
    setCurrentUser(userData);
    fetchStats();
    fetchUsers();
    fetchServices();
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const patients = usersSnapshot.docs.filter(
        (d) => d.data().role === "คนไข้"
      ).length;
      const doctors = usersSnapshot.docs.filter(
        (d) => d.data().role === "หมอ"
      ).length;
      const admins = usersSnapshot.docs.filter(
        (d) => d.data().role === "แอดมิน"
      ).length;

      const servicesSnapshot = await getDocs(collection(db, "services"));
      const promotionsSnapshot = await getDocs(collection(db, "promotions"));
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments")
      );

      setStats({
        users: patients,
        doctors,
        admins,
        services: servicesSnapshot.size,
        promotions: promotionsSnapshot.size,
        appointments: appointmentsSnapshot.size,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 700);
    }
  };

  // fetch services (original)
  const fetchServices = async () => {
    try {
      const snapshot = await getDocs(collection(db, "services"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServices(list);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // fetch promotions (separate)
  const fetchPromotions = async () => {
    try {
      const snapshot = await getDocs(collection(db, "promotions"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPromotions(list);
    } catch (err) {
      console.error("Error fetching promotions:", err);
    }
  };

  /* ---------------- User actions ---------------- */
  const updateRole = async (id, newRole) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      Swal.fire({
        icon: "success",
        title: "อัปเดตสำเร็จ",
        text: `เปลี่ยนสิทธิ์เป็น "${newRole}" แล้ว`,
        confirmButtonColor: "#0288d1",
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const deleteUser = async (id) => {
    Swal.fire({
      title: "ลบผู้ใช้นี้?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0288d1",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "users", id));
          Swal.fire("ลบสำเร็จ!", "ผู้ใช้ถูกลบออกจากระบบแล้ว", "success");
          fetchUsers();
        } catch (err) {
          console.error("Error deleting user:", err);
        }
      }
    });
  };

  const handleEdit = (user) => {
    // ensure controlled fields + normalize birthDate to Date if possible
    const normalized = {
      prefix: user.prefix || "",
      citizenId: user.citizenId || "",
      photoUrl: user.photoUrl || "",
      department: user.department || "",
      description: user.description || "",
      birthDate: (() => {
        if (!user.birthDate) return null;
        try {
          if (user.birthDate?.toDate) return user.birthDate.toDate();
          if (typeof user.birthDate === "string")
            return new Date(user.birthDate);
          if (user.birthDate?.seconds)
            return new Date(user.birthDate.seconds * 1000);
          return new Date(user.birthDate);
        } catch {
          return null;
        }
      })(),
      ...user,
    };
    setEditUser(normalized);
    setShowModal(true);
  };

  const saveEdit = async () => {
    try {
      const docRef = doc(db, "users", editUser.id);
      await updateDoc(docRef, {
        fullName: editUser.fullName,
        email: editUser.email,
        gender: editUser.gender,
        role: editUser.role,
        // new fields
        prefix: editUser.prefix || "",
        citizenId: editUser.citizenId || "",
        photoUrl: editUser.photoUrl || "",
        department: editUser.department || "",
        description: editUser.description || "",
        birthDate:
          editUser.birthDate instanceof Date
            ? editUser.birthDate.toISOString()
            : typeof editUser.birthDate === "string"
            ? editUser.birthDate
            : editUser.birthDate?.seconds
            ? new Date(editUser.birthDate.seconds * 1000).toISOString()
            : "",
      });
      Swal.fire({
        icon: "success",
        title: "บันทึกการแก้ไขแล้ว",
        confirmButtonColor: "#0288d1",
      });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error saving edit:", err);
    }
  };

  /* ---------------- Services (original) CRUD ---------------- */
  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.image) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        name: serviceForm.name,
        price: Number(serviceForm.price),
        description: serviceForm.description,
        image: serviceForm.image,
        recommend: Boolean(serviceForm.recommend),
        createdAt: new Date(),
      });

      Swal.fire("เพิ่มบริการสำเร็จ!", "ข้อมูลถูกบันทึกแล้ว", "success");
      setServiceForm({
        name: "",
        price: "",
        description: "",
        image: "",
        recommend: false,
      });
      setShowServiceModal(false);
      fetchServices();
      fetchStats();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message || String(error), "error");
    }
  };

  const handleEditService = (service) => {
    setIsEditingService(true);
    setEditServiceId(service.id);
    setServiceForm({
      name: service.name,
      price: service.price,
      description: service.description,
      image: service.image,
      recommend: service.recommend,
    });
    setShowServiceModal(true);
  };

  const handleUpdateService = async () => {
    Swal.fire({
      title: "ยืนยันการแก้ไข?",
      text: "ตรวจสอบข้อมูลก่อนบันทึก",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0288d1",
      cancelButtonColor: "#aaa",
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateDoc(doc(db, "services", editServiceId), {
            ...serviceForm,
            price: Number(serviceForm.price),
          });
          Swal.fire("สำเร็จ!", "ข้อมูลถูกอัปเดตแล้ว", "success");
          setIsEditingService(false);
          setShowServiceModal(false);
          fetchServices();
          fetchStats();
        } catch (err) {
          Swal.fire("เกิดข้อผิดพลาด!", err.message || String(err), "error");
        }
      }
    });
  };

  const deleteService = async (id) => {
    Swal.fire({
      title: "ต้องการลบบริการนี้?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0288d1",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "services", id));
          Swal.fire("ลบสำเร็จ!", "บริการถูกลบออกแล้ว", "success");
          fetchServices();
          fetchStats();
        } catch (error) {
          Swal.fire("เกิดข้อผิดพลาด!", error.message || String(error), "error");
        }
      }
    });
  };

  /* ---------------- Promotions (separate) CRUD ---------------- */
  const handleAddPromotion = async () => {
    if (!promoForm.name || !promoForm.price || !promoForm.image) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    try {
      await addDoc(collection(db, "promotions"), {
        name: promoForm.name,
        price: Number(promoForm.price),
        description: promoForm.description,
        image: promoForm.image,
        discount: Number(promoForm.discount || 0),
        recommend: Boolean(promoForm.recommend),
        createdAt: new Date(),
      });

      Swal.fire("เพิ่มโปรโมชั่นสำเร็จ!", "ข้อมูลถูกบันทึกแล้ว", "success");
      setPromoForm({
        name: "",
        price: "",
        discount: "",
        description: "",
        image: "",
        recommend: false,
      });
      setShowPromoModal(false);
      fetchPromotions();
      fetchStats();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message || String(error), "error");
    }
  };

  const handleEditPromotion = (promo) => {
    setIsEditingPromo(true);
    setEditPromoId(promo.id);
    setPromoForm({
      name: promo.name,
      price: promo.price,
      discount: promo.discount || "",
      description: promo.description,
      image: promo.image,
      recommend: promo.recommend,
    });
    setShowPromoModal(true);
  };

  const handleUpdatePromotion = async () => {
    Swal.fire({
      title: "ยืนยันการแก้ไข?",
      text: "ตรวจสอบข้อมูลก่อนบันทึก",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0288d1",
      cancelButtonColor: "#aaa",
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateDoc(doc(db, "promotions", editPromoId), {
            ...promoForm,
            price: Number(promoForm.price),
            discount: Number(promoForm.discount || 0),
          });
          Swal.fire("สำเร็จ!", "ข้อมูลถูกอัปเดตแล้ว", "success");
          setIsEditingPromo(false);
          setShowPromoModal(false);
          fetchPromotions();
          fetchStats();
        } catch (err) {
          Swal.fire("เกิดข้อผิดพลาด!", err.message || String(err), "error");
        }
      }
    });
  };

  const deletePromotion = async (id) => {
    Swal.fire({
      title: "ต้องการลบโปรโมชั่นนี้?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0288d1",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "promotions", id));
          Swal.fire("ลบสำเร็จ!", "โปรโมชั่นถูกลบออกแล้ว", "success");
          fetchPromotions();
          fetchStats();
        } catch (error) {
          Swal.fire("เกิดข้อผิดพลาด!", error.message || String(error), "error");
        }
      }
    });
  };

  /* ---------------- Filter + pagination (users) ---------------- */
  const filteredUsers = useMemo(() => {
    let list = users;
    if (activeTab === "users") list = list.filter((u) => u.role === "คนไข้");
    if (activeTab === "doctors") list = list.filter((u) => u.role === "หมอ");
    if (activeTab === "admins") list = list.filter((u) => u.role === "แอดมิน");

    if (searchTerm.trim() !== "") {
      return list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [users, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* ---------------- Role icons/colors (unchanged) ---------------- */
  const roleIcons = {
    ผู้พัฒนา: <FaUserShield className="inline text-[#01579b]" />,
    แอดมิน: <FaUserShield className="inline text-[#00695c]" />,
    หมอ: <FaUserMd className="inline text-[#2e7d32]" />,
    คนไข้: <FaUsers className="inline text-[#1565c0]" />,
  };

  const roleColors = {
    ผู้พัฒนา: "from-[#0288d1] to-[#00bcd4]",
    แอดมิน: "from-[#00796b] to-[#26a69a]",
    หมอ: "from-[#43a047] to-[#66bb6a]",
    คนไข้: "from-[#1976d2] to-[#42a5f5]",
  };

  /* ---------------- Helpers ---------------- */
  const parseNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // rounding rule: decimal >= 0.5 => ceil, else floor
  const roundByHalf = (value) => {
    if (!isFinite(value)) return 0;
    const flo = Math.floor(value);
    const dec = value - flo;
    return dec >= 0.5 ? Math.ceil(value) : Math.floor(value);
  };

  /* ---------------- Render helpers ---------------- */
  const renderUserRow = (u) => (
    <div
      key={u.id}
      className="flex justify-between items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition"
    >
      <div className="flex items-center gap-3">
        <img
          src={u.photoUrl || placeholderImg}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover border border-gray-300 shadow-sm"
        />
        <div>
          <p className="font-semibold text-gray-800">
            {(u.prefix || "") + " " + (u.fullName || "ไม่ระบุชื่อ")}
          </p>
          <p className="text-xs text-gray-500">{u.email}</p>

          {/* แสดงข้อมูลเฉพาะหมอ */}
          {u.role === "หมอ" && (
            <>
              {u.department && (
                <p className="text-xs text-[#0288d1] font-medium mt-0.5">
                  แผนก: {u.department}
                </p>
              )}
              {u.description && (
                <p className="text-xs text-gray-600 mt-0.5">{u.description}</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={u.role}
          onChange={(e) => updateRole(u.id, e.target.value)}
          disabled={
            currentUser.role !== "แอดมิน" && currentUser.role !== "ผู้พัฒนา"
          }
          className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-[#0288d1] outline-none"
        >
          {["แอดมิน", "หมอ", "คนไข้"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleEdit(u)}
          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
        >
          <FaEdit size={15} /> แก้ไข
        </button>
        <button
          onClick={() => deleteUser(u.id)}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
        >
          <FaTrash size={15} /> ลบ
        </button>
      </div>
    </div>
  );

  /* ---------------- Render sections ---------------- */

  // Services: split recommended vs normal
  const recommendedServices = services.filter((s) => s.recommend === true);
  const normalServices = services.filter((s) => !s.recommend);

  const renderManageServices = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-[#0288d1]">จัดการบริการ</h2>
        <button
          onClick={() => {
            setIsEditingService(false);
            setShowServiceModal(true);
            setServiceForm({
              name: "",
              price: "",
              description: "",
              image: "",
              recommend: false,
            });
          }}
          className="flex items-center gap-2 bg-[#0288d1] text-white px-4 py-2 rounded-full font-medium shadow  hover:bg-[#0277bd] cursor-pointer"
        >
          <FaPlusCircle /> เพิ่มบริการใหม่
        </button>
      </div>

      {/* Recommended services */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-[#ff0000] px-4 pt-4">
          <FaHotjar /> บริการแนะนำมาใหม่!!
        </h3>
        {recommendedServices.length > 0 ? (
          recommendedServices.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="flex gap-4 items-center">
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.description}</p>
                  <p className="text-sm text-sky-700 font-semibold">
                    ราคา: {s.price} บาท
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditService(s)}
                  className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                >
                  <FaEdit size={15} /> แก้ไข
                </button>
                <button
                  onClick={() => deleteService(s.id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                >
                  <FaTrash size={15} /> ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-6">
            ไม่มีบริการแนะนำ
          </p>
        )}
      </div>

      {/* Normal services */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold text-[#0288d1] px-4 pt-4">
          บริการทั่วไป
        </h3>
        {normalServices.length > 0 ? (
          normalServices.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="flex gap-4 items-center">
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.description}</p>
                  <p className="text-sm text-sky-700 font-semibold">
                    ราคา: {s.price} บาท
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditService(s)}
                  className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                >
                  <FaEdit size={15} /> แก้ไข
                </button>
                <button
                  onClick={() => deleteService(s.id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                >
                  <FaTrash size={15} /> ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-6">
            ไม่มีบริการทั่วไป
          </p>
        )}
      </div>
    </div>
  );

  const renderManagePromotions = () => {
    // compute realtime discounted price based on promoForm inputs
    const price = parseNumber(promoForm.price);
    const discount = parseNumber(promoForm.discount);
    const raw = price * (1 - discount / 100);
    const discountedRounded = Number.isFinite(raw) ? roundByHalf(raw) : 0;

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#0288d1]">
            จัดการบริการโปรโมชั่น
          </h2>
          <button
            onClick={() => {
              setIsEditingPromo(false);
              setShowPromoModal(true);
              setPromoForm({
                name: "",
                price: "",
                discount: "",
                description: "",
                image: "",
                recommend: false,
              });
            }}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-4 py-2 rounded-full font-medium shadow hover:bg-[#0277bd] cursor-pointer"
          >
            <FaPlusCircle /> เพิ่มบริการโปรโมชั่น
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6">
          {promotions.length > 0 ? (
            promotions.map((p) => {
              const pr = parseNumber(p.price);
              const disc = parseNumber(p.discount || 0);
              const rawp = pr * (1 - disc / 100);
              const disp = roundByHalf(rawp);
              return (
                <div
                  key={p.id}
                  className="flex justify-between items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex gap-4 items-center">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.description}</p>
                      <p className="text-sm text-gray-600">
                        ราคาเดิม:{" "}
                        <span className="line-through text-red-500">
                          {pr} บาท
                        </span>{" "}
                        <span className="text-green-600 font-bold">
                          -{disc}%
                        </span>
                      </p>
                      <p className="text-sm text-sky-700 font-semibold">
                        ราคาหลังหักส่วนลด: {disp} บาท
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPromotion(p)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                    >
                      <FaEdit size={15} /> แก้ไข
                    </button>
                    <button
                      onClick={() => deletePromotion(p.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                    >
                      <FaTrash size={15} /> ลบ
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 text-sm py-6">
              ยังไม่มีบริการโปรโมชั่น
            </p>
          )}
        </div>

        {/* Live preview area when not editing? keep as above in list */}
        {/* The actual modal (showPromoModal) will show realtime calc while typing */}
      </div>
    );
  };

  const renderOverview = () => (
    <>
      <h2 className="text-2xl font-bold text-[#0288d1] mb-6 text-center">
        ภาพรวมระบบ WHOCARE
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: <FaUsers />,
            label: "คนไข้ทั้งหมด",
            value: stats.users,
          },
          {
            icon: <FaUserShield />,
            label: "แอดมินทั้งหมด",
            value: stats.admins,
          },
          {
            icon: <FaUserMd />,
            label: "หมอทั้งหมด",
            value: stats.doctors,
          },
          { icon: <FaWrench />, label: "บริการทั้งหมด", value: stats.services },
          {
            icon: <FaBoxOpen />,
            label: "โปรโมชั่นทั้งหมด",
            value: stats.promotions,
          },
          {
            icon: <FaClipboardList />,
            label: "คิวทั้งหมด",
            value: stats.appointments,
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ring-1 ring-[#0288d1]/10 flex flex-col items-center justify-center"
          >
            <div className="text-3xl text-[#0288d1] mb-2">{item.icon}</div>
            <p className="text-gray-700 font-semibold">{item.label}</p>
            <p className="text-2xl font-bold text-[#0288d1] mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  const renderManageSection = (title) => (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#0288d1]">{title}</h2>
        <button
          onClick={fetchUsers}
          disabled={refreshing}
          className={`flex items-center gap-2 bg-[#0288d1] text-white px-4 py-2 rounded-full font-medium shadow-sm cursor-pointer ${
            refreshing ? "opacity-70 cursor-wait" : "hover:bg-[#0277bd]"
          }`}
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}
        </button>
      </div>

      <div className="flex items-center bg-white shadow-md rounded-full px-3 py-2 border border-gray-200 w-full mb-6">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full outline-none text-sm text-gray-700"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        {currentUsers.length > 0 ? (
          currentUsers.map((u) => renderUserRow(u))
        ) : (
          <p className="text-center text-gray-500 text-sm py-6">
            ไม่พบข้อมูลในหมวดนี้
          </p>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );

    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return renderManageSection("จัดการคนไข้");
      case "doctors":
        return renderManageSection("จัดการหมอ");
      case "admins":
        return renderManageSection("จัดการแอดมิน");
      case "services":
        return renderManageServices();
      case "promotions":
        return renderManagePromotions();
      default:
        return (
          <div className="text-center text-gray-600 mt-10">
            <h2 className="text-2xl font-bold text-[#0288d1] mb-4">
              ฟีเจอร์อยู่ระหว่างการพัฒนา...
            </h2>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] to-white py-14 px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#0288d1] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            จัดการระบบ WHOCARE สำหรับแอดมินและผู้พัฒนา
          </p>
        </div>
        {currentUser && (
          <div className="flex justify-center mb-8">
            <div className="bg-white shadow-md border border-gray-100 rounded-2xl py-3 px-6 flex items-center gap-3">
              <FaUserCog className="text-[#0288d1] text-3xl" />
              <div>
                <p className="font-semibold text-[#0288d1]">
                  {currentUser.fullName || "Admin"}
                </p>
                <p className="text-sm text-gray-500">
                  ({currentUser.role}) • {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { key: "overview", label: "ภาพรวม", icon: <FaHome /> },
            { key: "admins", label: "จัดการแอดมิน", icon: <FaUserShield /> },
            { key: "doctors", label: "จัดการหมอ", icon: <FaUserMd /> },
            { key: "users", label: "จัดการคนไข้", icon: <FaUsers /> },
            { key: "services", label: "จัดการบริการ", icon: <FaWrench /> },
            {
              key: "promotions",
              label: "จัดการบริการโปรโมชั่น",
              icon: <FaPercent />,
            },
            {
              key: "appointments",
              label: "จัดการระบบคิว",
              icon: <FaClipboardList />,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchTerm("");
                setPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition border shadow-sm cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#0288d1] text-white border-transparent"
                  : "bg-white text-[#0288d1] border border-[#0288d1] hover:bg-sky-50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {renderContent()}

        {/* User Edit Modal (Profile-style): doctor vs normal */}
        {showModal && editUser && (
          <div>
            {editUser.role === "หมอ" ? (
              <DoctorModal
                modalRef={null}
                handleClose={() => setShowModal(false)}
                editUser={editUser}
                setEditUser={setEditUser}
                handleSave={saveEdit}
              />
            ) : (
              <NormalModal
                modalRef={null}
                handleClose={() => setShowModal(false)}
                editUser={editUser}
                setEditUser={setEditUser}
                handleSave={saveEdit}
              />
            )}
          </div>
        )}

        {/* Service modal (original) */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 w-[750px] shadow-2xl border border-[#0288d1]/30">
              <h3 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-[#0288d1] mb-6 border-b-2 border-[#0288d1]/30 pb-2">
                {isEditingService ? (
                  <>
                    <FaEdit /> แก้ไขบริการ
                  </>
                ) : (
                  <>
                    <FaPlusCircle /> เพิ่มบริการใหม่
                  </>
                )}
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    ชื่อบริการ:
                  </label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    รายละเอียด:
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg h-[70px] focus:ring-2 focus:ring-[#0288d1] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    ราคา (บาท):
                  </label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    URL รูปภาพ:
                  </label>
                  <input
                    type="text"
                    value={serviceForm.image}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, image: e.target.value })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {serviceForm.image && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={serviceForm.image}
                        alt="preview"
                        className="w-full max-h-[300px] object-contain rounded-2xl border-2 border-[#0288d1]/30 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700">
                    ประเภทบริการ:
                  </label>
                  <select
                    value={serviceForm.recommend ? "true" : "false"}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        recommend: e.target.value === "true",
                      })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                  >
                    <option value="false">บริการทั่วไป</option>
                    <option value="true">
                      บริการแนะนำมาใหม่!! (แสดงหน้าหลัก)
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-5">
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
                >
                  <FaTimes /> ยกเลิก
                </button>
                <button
                  onClick={
                    isEditingService ? handleUpdateService : handleAddService
                  }
                  className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
                >
                  <FaSave /> {isEditingService ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promo modal (separate) with realtime calculation */}
        {showPromoModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 w-[750px] shadow-2xl border border-[#0288d1]/30">
              <h3 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-[#0288d1] mb-6 border-b-2 border-[#0288d1]/30 pb-2">
                {isEditingPromo ? (
                  <>
                    <FaEdit /> แก้ไขโปรโมชั่น
                  </>
                ) : (
                  <>
                    <FaPlusCircle /> เพิ่มโปรโมชั่นใหม่
                  </>
                )}
              </h3>

              <PromotionForm
                promoForm={promoForm}
                setPromoForm={setPromoForm}
                discountedRoundedCalc={(price, discount) => {
                  const p = parseNumber(price);
                  const d = parseNumber(discount);
                  const rawVal = p * (1 - d / 100);
                  return roundByHalf(rawVal);
                }}
              />

              <div className="flex justify-end gap-3 mt-8 pt-5">
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
                >
                  <FaTimes /> ยกเลิก
                </button>
                <button
                  onClick={
                    isEditingPromo ? handleUpdatePromotion : handleAddPromotion
                  }
                  className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
                >
                  <FaSave /> {isEditingPromo ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

/* ========================= Modals from Profile.jsx (pixel-alike) ========================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-semibold text-[#006680]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* NormalModal - same as Profile.jsx (w-[500px]) */
function NormalModal({
  modalRef,
  handleClose,
  editUser,
  setEditUser,
  handleSave,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-[500px] shadow-2xl border border-[#0288d1]/30"
      >
        <h3 className="flex items-center justify-center gap-2 text-xl font-extrabold text-[#0288d1] mb-4">
          <FaEdit /> แก้ไขข้อมูลผู้ใช้
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              คำนำหน้า:
            </label>
            <select
              value={editUser.prefix || ""}
              onChange={(e) => {
                const value = e.target.value;
                let inferredGender = editUser.gender;
                if (value === "นาย") inferredGender = "ชาย";
                else if (["นาง", "นางสาว"].includes(value))
                  inferredGender = "หญิง";
                setEditUser({
                  ...editUser,
                  prefix: value,
                  gender: inferredGender,
                });
              }}
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            >
              <option value="">เลือกคำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              ชื่อเต็ม:
            </label>
            <input
              type="text"
              value={editUser.fullName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, fullName: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              วันเดือนปีเกิด:
            </label>
            <DatePickerInput
              label=""
              value={editUser.birthDate}
              onChange={(date) => setEditUser({ ...editUser, birthDate: date })}
              CustomInput={CustomInput}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              เลขบัตรประชาชน (13 หลัก):
            </label>
            <input
              type="text"
              value={editUser.citizenId || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, citizenId: e.target.value })
              }
              maxLength={13}
              pattern="\\d{13}"
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              อีเมล:
            </label>
            <input
              type="email"
              value={editUser.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              รูปภาพ (URL):
            </label>
            <input
              type="text"
              value={editUser.photoUrl || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, photoUrl: e.target.value })
              }
              placeholder="https://example.com/profile.jpg"
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          {editUser.photoUrl && (
            <div className="col-span-2">
              <div className="mt-3 flex justify-center">
                <img
                  src={editUser.photoUrl}
                  alt="preview"
                  className="w-full max-h-[300px] object-contain rounded-2xl border-2 border-[#0288d1]/30 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
          >
            <FaTimes /> ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
          >
            <FaSave /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* DoctorModal - same as Profile.jsx (w-[820px]) */
function DoctorModal({
  modalRef,
  handleClose,
  editUser,
  setEditUser,
  handleSave,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-[820px] shadow-2xl border border-[#0288d1]/30 grid grid-cols-2 gap-x-8"
      >
        {/* Left */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#0288d1] mb-2">
            <FaEdit /> ข้อมูลทั่วไป
          </h3>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              คำนำหน้า:
            </label>
            <select
              value={editUser.prefix || ""}
              onChange={(e) => {
                const value = e.target.value;
                let inferredGender = editUser.gender;
                if (value === "นพ.") inferredGender = "ชาย";
                else if (value === "พญ.") inferredGender = "หญิง";
                setEditUser({
                  ...editUser,
                  prefix: value,
                  gender: inferredGender,
                });
              }}
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            >
              <option value="">เลือกคำนำหน้า</option>
              <option value="นพ.">นพ.</option>
              <option value="พญ.">พญ.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              ชื่อเต็ม:
            </label>
            <input
              type="text"
              value={editUser.fullName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, fullName: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <DatePickerInput
            label="วันเดือนปีเกิด:"
            value={editUser.birthDate}
            onChange={(date) => setEditUser({ ...editUser, birthDate: date })}
            CustomInput={CustomInput}
          />

          <div>
            <label className="text-sm font-semibold text-gray-700">
              เลขบัตรประชาชน (13 หลัก):
            </label>
            <input
              type="text"
              value={editUser.citizenId || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, citizenId: e.target.value })
              }
              maxLength={13}
              pattern="\\d{13}"
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              อีเมล:
            </label>
            <input
              type="email"
              value={editUser.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              รูปภาพ (URL):
            </label>
            <input
              type="text"
              value={editUser.photoUrl || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, photoUrl: e.target.value })
              }
              placeholder="https://example.com/profile.jpg"
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>

          {editUser.photoUrl && (
            <div className="mt-2">
              <img
                src={editUser.photoUrl}
                alt="preview"
                className="w-full max-h-[150px] object-contain rounded-lg border border-[#0288d1]/40 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4 pl-2">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-[#0288d1] mb-2">
            <FaEdit /> ข้อมูลเฉพาะแพทย์
          </h3>
          <div>
            <label className="text-sm font-semibold text-gray-700">แผนก:</label>
            <select
              value={editUser.department || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, department: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            >
              <option value="">เลือกแผนก</option>
              <option value="รักษาสิวครบวงจร">รักษาสิวครบวงจร</option>
              <option value="ทรีตเมนต์บำรุงผิวหน้า">
                ทรีตเมนต์บำรุงผิวหน้า
              </option>
              <option value="เลเซอร์หน้าใส">เลเซอร์หน้าใส</option>
              <option value="ฟิลเลอร์ & โบท็อกซ์">ฟิลเลอร์ & โบท็อกซ์</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              รายละเอียดตนเอง:
            </label>
            <textarea
              value={editUser.description || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, description: e.target.value })
              }
              className="border border-gray-300 w-full p-2 rounded-lg h-[180px] resize-none focus:ring-2 focus:ring-[#0288d1] outline-none"
            />
          </div>
        </div>

        <div className="col-span-2 flex justify-center gap-4 mt-6 pt-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
          >
            <FaTimes /> ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
          >
            <FaSave /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Helper components: CustomInput + DatePickerInput (Thai Buddhist year) ================= */

const CustomInput = forwardRef(({ value, onClick }, ref) => {
  const formatDateToThai = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };
  return (
    <input
      readOnly
      ref={ref}
      onClick={onClick}
      value={formatDateToThai(value)}
      placeholder="เลือกวันเดือนปีเกิด"
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-[#0288d1] outline-none bg-white cursor-pointer"
    />
  );
});

function DatePickerInput({ label, value, onChange, CustomInput: CI }) {
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
  const years = Array.from(
    { length: 101 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={onChange}
        locale={th}
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
        customInput={<CI />}
        renderCustomHeader={({ date, changeYear, changeMonth }) => {
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
                value={date.getFullYear() + 543}
                onChange={({ target: { value } }) =>
                  changeYear(Number(value) - 543)
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y + 543}>
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

/* ================= Promotion form component with realtime calc ================= */
function PromotionForm({ promoForm, setPromoForm, discountedRoundedCalc }) {
  const price = Number(promoForm.price) || 0;
  const discount = Number(promoForm.discount) || 0;

  // compute raw and rounded according to rule
  const raw = price * (1 - discount / 100);
  const rounded = discountedRoundedCalc(price, discount);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            ชื่อโปรโมชั่น:
          </label>
          <input
            type="text"
            value={promoForm.name}
            onChange={(e) =>
              setPromoForm({ ...promoForm, name: e.target.value })
            }
            className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            รายละเอียด:
          </label>
          <textarea
            value={promoForm.description}
            onChange={(e) =>
              setPromoForm({ ...promoForm, description: e.target.value })
            }
            className="border border-gray-300 w-full p-2 rounded-lg h-[70px] focus:ring-2 focus:ring-[#0288d1] outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            ราคา (บาท):
          </label>
          <input
            type="number"
            value={promoForm.price}
            onChange={(e) =>
              setPromoForm({ ...promoForm, price: e.target.value })
            }
            className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            URL รูปภาพ:
          </label>
          <input
            type="text"
            value={promoForm.image}
            onChange={(e) =>
              setPromoForm({ ...promoForm, image: e.target.value })
            }
            className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            placeholder="https://example.com/image.jpg"
          />
          {promoForm.image && (
            <div className="mt-3 flex justify-center">
              <img
                src={promoForm.image}
                alt="preview"
                className="w-full max-h-[300px] object-contain rounded-2xl border-2 border-[#0288d1]/30 shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="text-sm font-semibold text-gray-700">
            ส่วนลด (%):
          </label>
          <input
            type="number"
            value={promoForm.discount}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 2) {
                setPromoForm({ ...promoForm, discount: val });
              }
            }}
            className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
            placeholder="เช่น 7"
          />
          <p className="text-xs text-gray-500 mt-1">
            เช่น กรอก 7 กับราคา 1000 → ราคาหลังหัก = 1000 × (1 - 7/100) = 930
          </p>

          <div className="mt-3">
            <p className="text-sm text-sky-700 font-semibold">
              ราคาหลังหักส่วนลด (raw):{" "}
              {Number.isFinite(raw) ? raw.toFixed(2) : "0.00"} บาท
            </p>
            <p className="text-sm text-green-600 font-bold">
              ราคาสุทธิ: {Number.isFinite(raw) ? rounded : 0} บาท
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
