import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  getDocs,
  collection,
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
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
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
        users: usersSnapshot.size,
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
    setEditUser(user);
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
          className={`flex items-center gap-2 bg-[#0288d1] text-white px-4 py-2 rounded-full font-medium shadow-sm ${
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
                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm"
                >
                  <FaEdit size={15} /> แก้ไข
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm"
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-3 text-sm font-medium">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-3 py-1 rounded-md border ${
              page === 1
                ? "text-gray-400 border-gray-200"
                : "text-[#0288d1] border-[#0288d1] hover:bg-sky-50"
            }`}
          >
            ก่อนหน้า
          </button>
          <span className="text-gray-600">
            หน้า {page} จาก {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-3 py-1 rounded-md border ${
              page === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-[#0288d1] border-[#0288d1] hover:bg-sky-50"
            }`}
          >
            ถัดไป
          </button>
        </div>
      )}
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
                  label: "แอดมิน",
                  value: stats.admins,
                },
                {
                  icon: <FaUserMd />,
                  label: "หมอทั้งหมด",
                  value: stats.doctors,
                },
                { icon: <FaWrench />, label: "บริการ", value: stats.services },
                {
                  icon: <FaBoxOpen />,
                  label: "แพ็กเกจ",
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

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { key: "overview", label: "ภาพรวม", icon: <FaHome /> },
            { key: "admins", label: "จัดการแอดมิน", icon: <FaUserShield /> },
            { key: "doctors", label: "จัดการหมอ", icon: <FaUserMd /> },
            { key: "users", label: "จัดการคนไข้", icon: <FaUsers /> },
            { key: "services", label: "บริการ", icon: <FaWrench /> },
            { key: "packages", label: "แพ็กเกจ", icon: <FaBoxOpen /> },
            { key: "appointments", label: "คิว", icon: <FaClipboardList /> },
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

        {/* Content */}
        {renderContent()}

        {/* Modal */}
        {showModal && editUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl border-t-4 border-[#0288d1]">
              <h3 className="text-xl font-bold text-[#0288d1] mb-4 text-center">
                แก้ไขข้อมูลคนไข้
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">ชื่อเต็ม:</label>
                  <input
                    type="text"
                    value={editUser.fullName || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, fullName: e.target.value })
                    }
                    className="border w-full p-2 rounded mb-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">อีเมล:</label>
                  <input
                    type="email"
                    value={editUser.email || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    className="border w-full p-2 rounded mb-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">เพศ:</label>
                  <select
                    value={editUser.gender || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, gender: e.target.value })
                    }
                    className="border w-full p-2 rounded"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">บทบาท:</label>
                  <select
                    value={editUser.role || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                    className="border w-full p-2 rounded"
                  >
                    {["แอดมิน", "หมอ", "คนไข้"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-[#0288d1] text-white px-4 py-2 rounded hover:bg-[#0277bd] cursor-pointer"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
