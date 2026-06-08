import { useState, useEffect } from "react";
import {
  Users, Search, Trash2, ToggleLeft, ToggleRight,
  Shield, User, Building2, CheckCircle,
  X, Mail, Phone, MapPin, Globe, Hash,
  FileText, Eye, Calendar
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
  
  // Safe icon render wrap to completely block white-screen crashes
  const RenderIcon = () => {
    try {
      if (Icon) return <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />;
    } catch (e) {
      console.error(e);
    }
    return <div className="w-4 h-4 bg-gray-100 rounded mt-0.5 flex-shrink-0" />;
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <RenderIcon />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-700 font-semibold break-words mt-0.5">{value}</p>
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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users?limit=100");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch user profiles", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      setUsers(users.map(u => u.id === id ? { ...u, active: res.data.user.active } : u));
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, active: res.data.user.active });
      }
      showToast(res.data.message || "User account access status modified successfully.");
    } catch (err) {
      console.error(err);
      showToast("Failed to modify account access state", "error");
    }
  };

  const handleApproveEmployer = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      setUsers(users.map(u => u.id === id ? { ...u, approved: true } : u));
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, approved: true });
      }
      showToast("Employer profile credentials verified successfully! 🎉");
    } catch (err) {
      console.error(err);
      showToast("Failed to approve employer credentials", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account permanently?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      showToast("User account deleted successfully.");
    } catch (err) {
      console.error(err);
      showToast("Failed to purge account row data", "error");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      user.id?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    
    const matchesStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && user.active === true) ||
      (statusFilter === "DISABLED" && user.active === false) ||
      (statusFilter === "PENDING_APPROVAL" && user.role === "EMPLOYER" && !user.approved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 md:pl-64 pt-20 pb-10 transition-all duration-300">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slideIn bg-emerald-600 text-white`}>
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="text-blue-600" size={26} />
              Identity Profiles Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Oversee account status layers, extract programmatic identities, and manage platform membership authorization.
            </p>
          </div>

          {/* Filters Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, company or UID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none"
              >
                <option value="ALL">All Member Roles</option>
                <option value="SEEKER">Seekers Only</option>
                <option value="EMPLOYER">Employers Only</option>
                <option value="ADMIN">Administrators</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none"
              >
                <option value="ALL">All System Statuses</option>
                <option value="ACTIVE">Active Users</option>
                <option value="DISABLED">Disabled Users</option>
                <option value="PENDING_APPROVAL">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Table Element Layout */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center">User ID</th>
                    <th className="py-4 px-6">Account Profile</th>
                    <th className="py-4 px-6">Domain Authentication Role</th>
                    <th className="py-4 px-6">Network Access State</th>
                    <th className="py-4 px-6 text-right">Moderator Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Syncing profile rows...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No results found matching filter constraints.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition-colors duration-150">
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-gray-50 border border-gray-200/60 text-gray-500 px-2 py-1 rounded-md block max-w-[130px] truncate" title={user.id}>
                            {user.id}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 tracking-tight truncate">{user.fullName}</p>
                              {user.role === "EMPLOYER" && user.companyName && (
                                <p className="text-xs font-semibold text-indigo-600 truncate mt-0.5">{user.companyName}</p>
                              )}
                              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <RoleBadge role={user.role} />
                            {user.role === "EMPLOYER" && !user.approved && (
                              <span className="text-[10px] font-bold tracking-tight px-1.5 py-0.5 rounded w-max bg-amber-50 text-amber-600 border border-amber-100">
                                Pending Credentials
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {user.active ? "Active Access" : "Disabled"}
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {user.role === "EMPLOYER" && !user.approved && (
                              <button
                                onClick={() => handleApproveEmployer(user.id)}
                                className="p-1.5 hover:bg-amber-50 text-amber-500 hover:text-amber-600 rounded-lg border border-amber-100"
                                title="Approve Corporate Credentials"
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg"
                              title="Inspect Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className="p-1.5 rounded-lg text-gray-400"
                            >
                              {user.active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 size={16} />
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

      {/* Slideover Modal View with Clean confirmed Imports */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-gray-900/20 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-screen shadow-2xl p-6 flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="text-blue-600" size={18} />
                  <h3 className="font-bold text-gray-900 text-base">Metadata Inspection Card</h3>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {selectedUser.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight">{selectedUser.fullName}</h4>
                  <span className="text-[11px] font-semibold text-gray-400 block mt-1">Platform Identity Layer</span>
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow icon={Hash} label="Unique User ID (UID)" value={selectedUser.id} />
                <DetailRow icon={Mail} label="Account Email Address" value={selectedUser.email} />
                <DetailRow icon={Phone} label="Contact Line Number" value={selectedUser.phone || selectedUser.companyPhone} />
                <DetailRow icon={MapPin} label="Geographic Location Mapping" value={selectedUser.location || selectedUser.companyAddress} />
                
               {selectedUser.role === "EMPLOYER" && (
                  <>
                    <DetailRow icon={Building2} label="Company / Entity Name" value={selectedUser.companyName || "Not Provided"} />
                    <DetailRow icon={Globe} label="Corporate Domain / Website" value={selectedUser.companyWebsite || "Not Provided"} />
                    <DetailRow icon={Users} label="Company Size" value={selectedUser.companySize} />
                    <DetailRow icon={Shield} label="Registration Reference No." value={selectedUser.companyRegNumber} />
                    
                    {/* ── ADDED: Corporate Document Viewer Link ── */}
                    <DetailRow 
                      icon={FileText} 
                      label="Corporate Registration Document" 
                      value={
                        selectedUser.companyDocument ? (
                          <a 
                            href={`http://localhost:5000/uploads/${selectedUser.companyDocument}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300 underline-offset-2 flex items-center gap-1 w-max"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Uploaded Document <FileText size={12} />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No Document Uploaded</span>
                        )
                      } 
                    />

                    <DetailRow icon={FileText} label="Verification Status" value={selectedUser.approved ? "VERIFIED / APPROVED" : "PENDING REVIEW"} />
                  </>
                )}
                
                <DetailRow icon={Calendar} label="Account Initialized Timestamp" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : null} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-6 flex gap-2">
              {selectedUser.role === "EMPLOYER" && !selectedUser.approved && (
                <button
                  onClick={() => handleApproveEmployer(selectedUser.id)}
                  className="py-2 px-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all flex-1"
                >
                  Verify Partner Credentials
                </button>
              )}
              <button
                onClick={() => handleToggleStatus(selectedUser.id)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                {selectedUser.active ? "Disable Access" : "Enable Access"}
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="py-2 px-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white border border-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;