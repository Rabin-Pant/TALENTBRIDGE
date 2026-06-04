import { useState, useEffect } from "react";
import {
  Users, Search, Trash2, ToggleLeft, ToggleRight,
  Sparkles, Shield, User, Building2, CheckCircle,
  Clock, X, Mail, Phone, MapPin, Globe, Hash,
  FileText, Eye, Calendar, TrendingUp
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const RoleBadge = ({ role }) => {
  const styles = {
    SEEKER:   "bg-blue-100 text-blue-600",
    EMPLOYER: "bg-green-100 text-green-600",
    ADMIN:    "bg-purple-100 text-purple-600",
  };
  const icons = { SEEKER: User, EMPLOYER: Building2, ADMIN: Shield };
  const Icon = icons[role] || User;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${styles[role]}`}>
      <Icon size={11} />{role}
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-blue-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const UserDetailModal = ({ user, onClose, onApprove, onToggle, onDelete, approvingId }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              user.role === "ADMIN" ? "bg-purple-100 text-purple-600" :
              user.role === "EMPLOYER" ? "bg-green-100 text-green-600" :
              "bg-blue-100 text-blue-600"
            }`}>
              {user.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{user.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} />
                {user.role === "EMPLOYER" && (
                  user.approved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">
                      <CheckCircle size={10} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                      <Clock size={10} /> Pending
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Account Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account Information
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <DetailRow icon={Mail}     label="Email"      value={user.email} />
              <DetailRow icon={Phone}    label="Phone"      value={user.phone} />
              <DetailRow icon={MapPin}   label="Location"   value={user.location} />
              <DetailRow icon={Calendar} label="Joined"     value={new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              <DetailRow icon={Calendar} label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"} />
            </div>
          </div>

          {/* Seeker Info */}
          {user.role === "SEEKER" && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Professional Profile
              </h3>
              <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                <DetailRow icon={User}     label="Current Title"     value={user.currentTitle} />
                <DetailRow icon={TrendingUp} label="Experience Level" value={user.experienceLevel} />
                <DetailRow icon={FileText} label="Bio"               value={user.bio} />
                {user.resumeFileName && (
                  <div className="flex items-start gap-3 py-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText size={13} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Resume</p>
                      <a 
                        href={`http://localhost:5000/uploads/${user.resumeFileName}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm text-blue-600 hover:text-blue-700 mt-0.5 flex items-center gap-1"
                      >
                        <Eye size={13} /> View Resume
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {user.skills?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employer Info */}
          {user.role === "EMPLOYER" && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Company Details
                </h3>
                <div className="bg-green-50 rounded-xl p-4 space-y-1">
                  <DetailRow icon={Building2} label="Company Name"    value={user.companyName} />
                  <DetailRow icon={Globe}     label="Website"         value={user.companyWebsite} />
                  <DetailRow icon={Users}     label="Company Size"    value={user.companySize} />
                  <DetailRow icon={Building2} label="Industry"        value={user.industry} />
                  <DetailRow icon={MapPin}    label="Company Address" value={user.companyAddress} />
                  <DetailRow icon={Phone}     label="Company Phone"   value={user.companyPhone} />
                  <DetailRow icon={FileText}  label="Description"     value={user.companyDescription} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Verification
                </h3>
                <div className="bg-amber-50 rounded-xl p-4 space-y-1">
                  <DetailRow icon={Hash} label="Registration Number" value={user.companyRegNumber} />
                  {user.companyDocument ? (
                    <div className="flex items-start gap-3 py-2">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText size={13} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Supporting Document</p>
                        <a href={`http://localhost:5000/uploads/${user.companyDocument}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-700 mt-0.5 flex items-center gap-1">
                          <Eye size={13} /> View Document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <span className="text-xs text-gray-400">No document uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approve Action */}
              {!user.approved && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">Ready to verify?</p>
                  <p className="text-xs text-blue-600 mb-3">
                    Review the company details and document before approving.
                  </p>
                  <button
                    onClick={() => onApprove(user.id)}
                    disabled={approvingId === user.id}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {approvingId === user.id ? "Verifying..." : "Verify Employer Account"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Danger Zone */}
          <div className="border border-red-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
              Account Actions
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => { onToggle(user.id); onClose(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center justify-center gap-2 ${
                  user.active
                    ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                    : "border-green-200 text-green-600 hover:bg-green-50"
                }`}
              >
                {user.active
                  ? <><ToggleLeft size={16} /> Disable Account</>
                  : <><ToggleRight size={16} /> Enable Account</>
                }
              </button>
              <button
                onClick={() => { onDelete(user.id); onClose(); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
      if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, active: res.data.user.active });
      showToast(res.data.message);
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
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

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      await api.put(`/admin/users/${id}/approve`);
      setUsers(users.map((u) => u.id === id ? { ...u, approved: true } : u));
      if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, approved: true });
      showToast("Employer verified successfully!");
    } catch {
      showToast("Failed to verify", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const filtered = users
    .filter((u) => roleFilter === "ALL" || u.role === roleFilter)
    .filter((u) =>
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const pendingCount = users.filter((u) => u.role === "EMPLOYER" && !u.approved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-slideIn ${
          toast.type === "success" ? "bg-blue-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApprove}
          onToggle={handleToggle}
          onDelete={handleDelete}
          approvingId={approvingId}
        />
      )}

      <main className="md:ml-64 pt-16 p-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">User Directory</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-gray-500 mt-2">
                  Manage and monitor all user accounts across the platform
                </p>
              </div>
              
              {/* Stats Badge */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
          </div>

          {/* Pending Alert */}
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fadeIn">
              <Clock size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                {pendingCount} employer{pendingCount > 1 ? "s" : ""} waiting for verification —{" "}
                <button onClick={() => setRoleFilter("EMPLOYER")} className="text-amber-900 font-semibold hover:underline">
                  Review now
                </button>
              </p>
            </div>
          )}

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "SEEKER", "EMPLOYER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    roleFilter === r 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {r === "ALL" ? "All" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No users found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filter</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => (
                      <tr
                        key={u.id}
                        className="hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer group"
                        style={{ animationDelay: `${i * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 ${
                              u.role === "ADMIN" ? "bg-purple-100" :
                              u.role === "EMPLOYER" ? "bg-green-100" : "bg-blue-100"
                            }`}>
                              <span className={`font-semibold text-sm ${
                                u.role === "ADMIN" ? "text-purple-600" :
                                u.role === "EMPLOYER" ? "text-green-600" : "text-blue-600"
                              }`}>
                                {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{u.fullName || "—"}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                              {u.companyName && (
                                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                  <Building2 size={10} />{u.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            u.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-green-500" : "bg-gray-400"}`} />
                            {u.active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {u.role === "EMPLOYER" ? (
                            u.approved ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700">
                                <CheckCircle size={11} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                                <Clock size={11} /> Pending
                              </span>
                            )
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all duration-200 flex items-center gap-1"
                            >
                              <Eye size={13} /> View
                            </button>
                            {u.role === "EMPLOYER" && !u.approved && (
                              <button
                                onClick={() => handleApprove(u.id)}
                                disabled={approvingId === u.id}
                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                              >
                                <CheckCircle size={13} />
                                {approvingId === u.id ? "..." : "Verify"}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggle(u.id)}
                              disabled={togglingId === u.id}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {u.active
                                ? <ToggleRight size={20} className="text-green-500" />
                                : <ToggleLeft size={20} className="text-gray-400" />
                              }
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={deletingId === u.id}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                              <Trash2 size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;