import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import MainLayout from "../layouts/MainLayout";
import {
  FaUserShield,
  FaUserMd,
  FaUserCog,
  FaUser,
  FaTrash,
  FaEdit,
  FaSyncAlt,
  FaSearch,
  FaUserCircle,
  FaWrench,
  FaPlus,
} from "react-icons/fa";

export default function DevManager() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRole, setActiveRole] = useState("ผู้พัฒนา");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 50;
  const roleOrder = ["ผู้พัฒนา", "แอดมิน", "หมอ", "คนไข้"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "ผู้พัฒนา") {
      Swal.fire({
        icon: "error",
        title: "ไม่มีสิทธิ์เข้าถึง",
        text: "หน้านี้สำหรับผู้พัฒนาเท่านั้น",
        confirmButtonColor: "#0288d1",
      }).then(() => navigate("/"));
      return;
    }
    setCurrentUser(userData);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 700);
      setLoading(false);
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

  // ------------- FILTER + PAGINATION LOGIC ----------------
  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() !== "") {
      return users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return users.filter((u) => u.role === activeRole);
    }
  }, [users, searchTerm, activeRole]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const roleIcons = {
    ผู้พัฒนา: <FaUserShield className="inline text-[#01579b]" />,
    แอดมิน: <FaUserCog className="inline text-[#00695c]" />,
    หมอ: <FaUserMd className="inline text-[#2e7d32]" />,
    คนไข้: <FaUser className="inline text-[#1565c0]" />,
  };

  const roleColors = {
    ผู้พัฒนา: "from-[#0288d1] to-[#00bcd4]",
    แอดมิน: "from-[#00796b] to-[#26a69a]",
    หมอ: "from-[#43a047] to-[#66bb6a]",
    คนไข้: "from-[#1976d2] to-[#42a5f5]",
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <p className="text-[#0288d1] font-semibold text-lg animate-pulse">
          กำลังโหลดข้อมูลผู้ใช้...
        </p>
      </div>
    );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] to-white py-14 px-8">
        {/* Current User Display (กลางบน) */}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-[#006680] mb-2">
            Dev Manager Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            จัดการผู้ใช้และบทบาทในระบบ WHOCARE
          </p>
        </div>

        {currentUser && (
          <div className="flex justify-center mb-8">
            <div className="bg-white shadow-md border border-gray-100 rounded-2xl py-3 px-6 flex items-center gap-3">
              <FaUserCog className="text-[#0288d1] text-3xl" />
              <div>
                <p className="font-semibold text-[#0288d1]">
                  {currentUser.fullName || "ผู้พัฒนา"}
                </p>
                <p className="text-sm text-gray-500">
                  ({currentUser.role}) • {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Role Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {roleOrder.map((role) => (
            <button
              key={role}
              onClick={() => {
                setActiveRole(role);
                setSearchTerm("");
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full font-medium flex items-center gap-2 transition shadow-sm border cursor-pointer ${
                activeRole === role && searchTerm === ""
                  ? "bg-[#0288d1] text-white border-transparent"
                  : "bg-white text-[#0288d1] border border-[#0288d1] hover:bg-sky-50"
              }`}
            >
              {roleIcons[role]}
              <span>{role}</span>
            </button>
          ))}
        </div>

        {/* Search + Refresh */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-10">
          <div className="flex items-center bg-white shadow-md rounded-full px-3 py-1 border border-gray-200 w-full md:w-1/3">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้ทั้งหมด..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full outline-none text-sm text-gray-700"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className={`flex items-center gap-2 bg-gradient-to-r from-[#0288d1] to-[#00acc1] text-white px-5 py-2 rounded-full font-medium text-sm transition shadow-md hover:shadow-lg cursor-pointer ${
              refreshing
                ? "opacity-80"
                : "hover:from-[#0277bd] hover:to-[#0097a7]"
            }`}
          >
            <FaSyncAlt
              className={`transition-transform duration-700 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}
          </button>
        </div>

        {/* User List */}
        <div
          className={`rounded-3xl shadow-xl border border-gray-100 bg-gradient-to-br ${roleColors[activeRole]} text-white max-w-5xl mx-auto`}
        >
          <div className="p-6 border-b border-white/30 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {searchTerm ? "ผลการค้นหา" : activeRole}
            </h2>
            <p className="text-4x1 text-black/100">{filteredUsers.length} คน</p>
          </div>

          <div className="bg-white text-gray-700 rounded-b-3xl p-5 max-h-[600px] overflow-y-auto">
            {currentUsers.length > 0 ? (
              currentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {u.prefix + " " + u.fullName || "ไม่ระบุชื่อ"}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-[#0288d1] outline-none"
                    >
                      {roleOrder.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleEdit(u)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                    >
                      <FaEdit size={15} /> แก้ไข
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm cursor-pointer"
                    >
                      <FaTrash size={15} /> ลบ
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-5">
                ไม่พบผู้ใช้ที่ตรงกับการค้นหาหรือในหมวดนี้
              </p>
            )}
          </div>
        </div>

        {/* Pagination */}
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

        {/* Modal */}
        {showModal && editUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl border-t-4 border-[#0288d1]">
              <h3 className="text-xl font-bold text-[#0288d1] mb-4 text-center">
                แก้ไขข้อมูลผู้ใช้
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">UID</p>
                  <p className="font-mono text-xs bg-gray-100 rounded px-2 py-1">
                    {editUser.id}
                  </p>
                </div>

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

                <div className="grid grid-cols-2 gap-3">
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
                      {roleOrder.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
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
