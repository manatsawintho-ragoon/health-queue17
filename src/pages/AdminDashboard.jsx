import React, { useEffect, useState, useMemo } from "react";
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
} from "react-icons/fa";

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
    packages: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Service states
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
      const packagesSnapshot = await getDocs(collection(db, "packages"));
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments")
      );

      setStats({
        users: patients,
        doctors,
        admins,
        services: servicesSnapshot.size,
        packages: packagesSnapshot.size,
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

  const fetchServices = async () => {
    try {
      const snapshot = await getDocs(collection(db, "services"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServices(list);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // User actions
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
    // Ensure we have the new fields present (so modal inputs are controlled)
    const normalized = {
      prefix: user.prefix || "",
      citizenId: user.citizenId || "",
      photoUrl: user.photoUrl || "",
      department: user.department || "",
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
        // New fields added:
        prefix: editUser.prefix || "",
        citizenId: editUser.citizenId || "",
        photoUrl: editUser.photoUrl || "",
        department: editUser.department || "",
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

  // Service actions
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
        } catch (error) {
          Swal.fire("เกิดข้อผิดพลาด!", error.message || String(error), "error");
        }
      }
    });
  };

  // Tabs: users / doctors / admins
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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-sm text-gray-700"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        {currentUsers.length > 0 ? (
          currentUsers.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {(u.prefix || "") + " " + (u.fullName || "ไม่ระบุชื่อ")}
                </p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  disabled={
                    currentUser.role !== "แอดมิน" &&
                    currentUser.role !== "ผู้พัฒนา"
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
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-6">
            ไม่พบข้อมูลในหมวดนี้
          </p>
        )}
      </div>
    </div>
  );

  const recommendedServices = services.filter((s) => s.recommend === true);
  const normalServices = services.filter((s) => !s.recommend);

  const renderManageServices = () => (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
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

      {/* บริการแนะนำ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-8">
        <h3 className="flex text-xl font-semibold text-[#ff0000] px-4 pt-4 gap-2">
          <FaHotjar />
          บริการแนะนำ{" "}
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

      {/* บริการทั่วไป */}
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

  const renderServiceModal = () => (
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

        {/* Grid Layout แบบ 2 คอลัมน์ */}
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
                setServiceForm({ ...serviceForm, description: e.target.value })
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
              <option value="true">บริการแนะนำมาใหม่!! (แสดงหน้าหลัก)</option>
            </select>
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-3 mt-8 pt-5">
          <button
            onClick={() => setShowServiceModal(false)}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
          >
            <FaTimes /> ยกเลิก
          </button>
          <button
            onClick={isEditingService ? handleUpdateService : handleAddService}
            className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
          >
            <FaSave /> {isEditingService ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
        </div>
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
        return (
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
                  label: "โค้ดส่วนลดทั้งหมด",
                  value: stats.packages,
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
                  <div className="text-3xl text-[#0288d1] mb-2">
                    {item.icon}
                  </div>
                  <p className="text-gray-700 font-semibold">{item.label}</p>
                  <p className="text-2xl font-bold text-[#0288d1] mt-2">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        );
      case "users":
        return renderManageSection("จัดการคนไข้");
      case "doctors":
        return renderManageSection("จัดการหมอ");
      case "admins":
        return renderManageSection("จัดการแอดมิน");
      case "services":
        return renderManageServices();
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
            { key: "packages", label: "สร้างโค้ดส่วนลด", icon: <FaBoxOpen /> },
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
        {showModal && editUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 w-[750px] shadow-2xl border border-[#0288d1]/30">
              <h3 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-[#0288d1] mb-6 border-b-2 border-[#0288d1]/30 pb-2">
                <FaUserCog /> แก้ไขข้อมูลผู้ใช้
              </h3>

              {/* Layout 2 คอลัมน์ */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    คำนำหน้า:
                  </label>
                  <select
                    value={editUser.prefix || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, prefix: e.target.value })
                    }
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
                    เพศ:
                  </label>
                  <select
                    value={editUser.gender || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, gender: e.target.value })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
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
                  {editUser.photoUrl && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={editUser.photoUrl}
                        alt="preview"
                        className="w-full max-h-[300px] object-contain rounded-2xl border-2 border-[#0288d1]/30 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {editUser.role === "หมอ" && (
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-700">
                      แผนก:
                    </label>
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
                      <option value="ฟิลเลอร์ & โบท็อกซ์">
                        ฟิลเลอร์ & โบท็อกซ์
                      </option>
                    </select>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700">
                    บทบาท:
                  </label>
                  <select
                    value={editUser.role || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                    className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-[#0288d1] outline-none"
                  >
                    {["แอดมิน", "หมอ", "คนไข้"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ปุ่ม */}
              <div className="flex justify-end gap-3 mt-8 pt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition font-medium"
                >
                  <FaTimes /> ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-2 bg-[#0288d1] text-white px-6 py-2 rounded-lg hover:bg-[#0277bd] cursor-pointer transition font-semibold shadow-md"
                >
                  <FaSave /> บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
        ;{showServiceModal && renderServiceModal()}
      </div>
    </MainLayout>
  );
}
