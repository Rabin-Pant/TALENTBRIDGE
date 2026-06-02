import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, MapPin, Briefcase, Clock,
  ChevronRight, Sparkles, Search
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:     "bg-gray-100 text-gray-600",
    REVIEWING:   "bg-blue-100 text-blue-600",
    SHORTLISTED: "bg-amber-100 text-amber-600",
    ACCEPTED:    "bg-green-100 text-green-600",
    REJECTED:    "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
};

const EmployerApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const STATUS_FILTERS = ["ALL", "PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED"];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/employer/applications");
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
      a.job?.title?.toLowerCase().includes(search.toLowerCase())
    );

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

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{applications.length} total applicants</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === s ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No applicants found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app, i) => (
                <Link
                  key={app.id}
                  to={`/employer/applicants/${app.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{app.applicant?.fullName?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{app.applicant?.fullName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Briefcase size={11} />{app.job?.title}
                          </div>
                          {app.applicant?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={11} />{app.applicant.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock size={11} />{new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {app.applicant?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {app.applicant.skills.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployerApplicants;