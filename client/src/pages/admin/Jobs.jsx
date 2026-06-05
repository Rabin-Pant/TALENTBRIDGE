import { useState, useEffect } from "react";
import {
  Briefcase, Search, Trash2, MapPin,
  Users, Clock, Sparkles, Building2, Eye
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-600",
    CLOSED: "bg-gray-100 text-gray-600",
    DRAFT:  "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/jobs");
        setJobs(res.data.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will permanently delete this job posting.")) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
      showToast("Job deleted successfully");
    } catch {
      showToast("Failed to delete job", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = jobs
    .filter((j) => statusFilter === "ALL" || j.status === statusFilter)
    .filter((j) =>
      !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.employer?.companyName?.toLowerCase().includes(search.toLowerCase())
    );

  const statusCounts = {
    ALL: jobs.length,
    ACTIVE: jobs.filter(j => j.status === "ACTIVE").length,
    CLOSED: jobs.filter(j => j.status === "CLOSED").length,
    DRAFT: jobs.filter(j => j.status === "DRAFT").length,
  };

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

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-slideIn ${
          toast.type === "success" ? "bg-blue-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Job Directory</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">All Job Listings</h1>
                <p className="text-gray-500 mt-2">
                  Monitor and manage job postings across the platform
                </p>
              </div>
              
              {/* Stats Badge */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            {["ALL", "ACTIVE", "CLOSED", "DRAFT"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                {status === "ALL" ? "All Jobs" : status}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  statusFilter === status
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, company, or employer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((job, i) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-5 group"
                  style={{ animationDelay: `${i * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <span className="text-white font-bold text-lg">
                            {job.title?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                            <StatusBadge status={job.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Building2 size={12} />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{job._count?.applications || 0} applicants</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>Posted {new Date(job.postedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Employer: {job.employer?.companyName || job.employer?.fullName || "—"}
                          </p>
                          {job.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {job.description.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/admin/jobs/${job.id}`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Job Details"
                      >
                        <Eye size={18} className="text-gray-500 hover:text-blue-600" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Delete Job"
                      >
                        <Trash2 size={18} className="text-gray-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats Summary */}
          {jobs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs text-green-600 uppercase tracking-wider">Active Jobs</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{statusCounts.ACTIVE}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Closed Jobs</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">{statusCounts.CLOSED}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Draft Jobs</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">{statusCounts.DRAFT}</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs text-blue-600 uppercase tracking-wider">Total Applications</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0)}
                </p>
              </div>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminJobs;