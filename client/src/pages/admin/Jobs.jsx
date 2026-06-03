import { useState, useEffect } from "react";
import {
  Briefcase, Search, Trash2, MapPin,
  Users, Clock, Sparkles, Building2
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-600",
    CLOSED: "bg-red-100 text-red-600",
    DRAFT:  "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
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
    if (!confirm("Delete this job posting?")) return;
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

  const filtered = jobs.filter((j) =>
    !search ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
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
              <span className="text-sm text-amber-600 font-medium">{jobs.length} total jobs</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">All Job Listings</h1>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((job, i) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{job.title?.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Building2 size={11} />{job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={11} />{job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={11} />{job._count?.applications || 0} applicants
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={11} />{new Date(job.postedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Posted by: {job.employer?.companyName || job.employer?.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={job.status} />
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminJobs;