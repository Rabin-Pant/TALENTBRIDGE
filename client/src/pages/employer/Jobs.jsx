import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, PlusCircle, Edit2, Trash2,
  Users, MapPin, Clock, Sparkles, ToggleLeft, ToggleRight
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

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/employer/jobs");
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/employer/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
      await api.put(`/employer/jobs/${job.id}`, { ...job, status: newStatus });
      setJobs(jobs.map((j) => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">{jobs.length} jobs posted</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
            </div>
            <Link
              to="/employer/jobs/post"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
            >
              <PlusCircle size={16} /> Post Job
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs posted yet</p>
              <Link to="/employer/jobs/post" className="mt-4 inline-flex items-center gap-2 text-sm text-green-600 hover:underline">
                <PlusCircle size={14} /> Post your first job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{job.title?.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />{job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase size={12} />{job.jobType?.replace("_", " ")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={12} />{job._count?.applications || 0} applicants
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />{new Date(job.postedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.skills.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={job.status} />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={job.status === "ACTIVE" ? "Close job" : "Activate job"}
                        >
                          {job.status === "ACTIVE"
                            ? <ToggleRight size={18} className="text-green-500" />
                            : <ToggleLeft size={18} className="text-gray-400" />
                          }
                        </button>
                        <Link
                          to={`/employer/jobs/edit/${job.id}`}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-blue-500" />
                        </Link>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerJobs;