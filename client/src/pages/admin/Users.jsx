import { useState, useEffect } from "react";
import {
  Users, Search, Trash2, ToggleLeft,
  ToggleRight, Sparkles, Shield, User, Building2
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const RoleBadge = ({ role }) => {
  const styles = {
    SEEKER:   "bg-blue-100 text-blue-600",
    EMPLOYER: "bg-green-100 text-green-600",
    ADMIN:    "bg-red-100 text-red-600",
  };
  const icons = { SEEKER: User, EMPLOYER: Building2, ADMIN: Shield };
  const Icon = icons[role] || User;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[role]}`}>
      <Icon size={11} />{role}
    </span>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  const handleToggle = async (id) => {
    try {
      setTogglingId(id);
      const res = await api.put(`/admin/users/${id}/toggle`);
      setUsers(users.map((u) => u.id === id ? { ...u, active: res.data.user.active } : u));
      showToast(res.data.message);
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      showToast("User deleted successfully");
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users
    .filter((u) => roleFilter === "ALL" || u.role === roleFilter)
    .filter((u) =>
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-red-100" />
        <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{users.length} total users</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "SEEKER", "EMPLOYER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    roleFilter === r ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        <Users size={32} className="mx-auto mb-2 text-gray-300" />
                        No users found
                      </td>
                    </tr>
                  ) : filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            u.role === "ADMIN" ? "bg-red-100" : u.role === "EMPLOYER" ? "bg-green-100" : "bg-blue-100"
                          }`}>
                            <span className={`font-bold text-sm ${
                              u.role === "ADMIN" ? "text-red-600" : u.role === "EMPLOYER" ? "text-green-600" : "text-blue-600"
                            }`}>
                              {u.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{u.fullName}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-green-500" : "bg-red-500"}`} />
                          {u.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(u.id)}
                            disabled={togglingId === u.id}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title={u.active ? "Disable user" : "Enable user"}
                          >
                            {u.active
                              ? <ToggleRight size={20} className="text-green-500" />
                              : <ToggleLeft size={20} className="text-gray-400" />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;