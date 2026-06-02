import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText, MapPin, Building2, Clock,
  Briefcase, ChevronRight, Sparkles, MessageSquare
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const SeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const STATUS_FILTERS = ["ALL", "PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED"];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/seeker/applications");
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

  const filtered = filter === "ALL"
    ? applications
    : applications.filter((a) => a.status === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{applications.length} total applications</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-500 text-sm mt-1">Track your job application status</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {s}
                {s !== "ALL" && (
                  <span className={`ml-1.5 text-xs ${filter === s ? "text-blue-200" : "text-gray-400"}`}>
                    {applications.filter((a) => a.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No applications found</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === "ALL" ? "Start applying to jobs" : `No ${filter.toLowerCase()} applications`}
              </p>
              {filter === "ALL" && (
                <Link to="/seeker/jobs" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                  Browse jobs →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app, i) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {app.job?.company?.charAt(0)}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Building2 size={12} />
                            {app.job?.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            {app.job?.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase size={12} />
                            {app.job?.jobType?.replace("_", " ")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Employer Note */}
                        {app.employerNote && (
                          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            <MessageSquare size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">{app.employerNote}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <ChevronRight size={16} className="text-gray-300" />
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

export default SeekerApplications;