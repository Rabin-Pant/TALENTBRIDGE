import { useState, useEffect } from "react";
import { FileText, Search, Building2, User, Clock, Sparkles, Eye } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:     { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
    REVIEWING:   { bg: "bg-blue-100",   text: "text-blue-600",   dot: "bg-blue-500"   },
    SHORTLISTED: { bg: "bg-amber-100",  text: "text-amber-600",  dot: "bg-amber-500"  },
    ACCEPTED:    { bg: "bg-green-100",  text: "text-green-600",  dot: "bg-green-500"  },
    REJECTED:    { bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-500"    },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const STATUS_FILTERS = ["ALL","PENDING","REVIEWING","SHORTLISTED","ACCEPTED","REJECTED"];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/applications");
        setApplications(res.data.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  const filtered = applications
    .filter((a) => filter === "ALL" || a.status === filter)
    .filter((a) =>
      !search ||
      a.applicant?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.company?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 p-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Applications Overview</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">All Applications</h1>
                <p className="text-gray-500 mt-2">
                  Track and monitor job applications across the platform
                </p>
              </div>
              
              {/* Stats Badge */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by applicant, job title, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    filter === s 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {s === "ALL" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Position</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Date</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400">
                        <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No applications found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filter</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((app, i) => (
                      <tr
                        key={app.id}
                        className="hover:bg-blue-50/30 transition-colors duration-200 group"
                        style={{ animationDelay: `${i * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                              <span className="text-blue-600 font-semibold text-sm">
                                {app.applicant?.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{app.applicant?.fullName || "—"}</p>
                              <p className="text-gray-400 text-xs">{app.applicant?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{app.job?.title || "—"}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Building2 size={10} /> {app.job?.company || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={12} />
                            {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <Link
                              to={`/employer/applications/${app.id}`}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all duration-200 flex items-center gap-1"
                            >
                              <Eye size={13} /> View Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Section */}
          {applications.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {STATUS_FILTERS.filter(s => s !== "ALL").map(status => {
                const count = applications.filter(a => a.status === status).length;
                if (count === 0) return null;
                const statusColors = {
                  PENDING: "border-gray-200 bg-gray-50",
                  REVIEWING: "border-blue-200 bg-blue-50",
                  SHORTLISTED: "border-amber-200 bg-amber-50",
                  ACCEPTED: "border-green-200 bg-green-50",
                  REJECTED: "border-red-200 bg-red-50",
                };
                return (
                  <div 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`${statusColors[status]} rounded-xl border p-4 text-center cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1`}
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{status}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default AdminApplications;