import { useState, useEffect } from "react";
import { FileText, Search, Building2, User, Clock, Sparkles } from "lucide-react";
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
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

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{applications.length} total applications</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicant, job, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === s ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">
                        <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                        No applications found
                      </td>
                    </tr>
                  ) : filtered.map((app, i) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-bold text-sm">
                              {app.applicant?.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{app.applicant?.fullName}</p>
                            <p className="text-gray-400 text-xs">{app.applicant?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5">
                          <Building2 size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{app.job?.title}</p>
                            <p className="text-xs text-gray-400">{app.job?.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} />
                          {new Date(app.appliedAt).toLocaleDateString()}
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

export default AdminApplications;