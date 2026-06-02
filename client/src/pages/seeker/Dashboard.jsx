import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, FileText, CheckCircle, Clock,
  TrendingUp, ArrowRight, MapPin, Building2, Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const colors = {
    blue:   { border: "border-blue-500",  bg: "bg-blue-50",   icon: "text-blue-500",  text: "text-blue-600"  },
    green:  { border: "border-green-500", bg: "bg-green-50",  icon: "text-green-500", text: "text-green-600" },
    amber:  { border: "border-amber-500", bg: "bg-amber-50",  icon: "text-amber-500", text: "text-amber-600" },
    purple: { border: "border-purple-500",bg: "bg-purple-50", icon: "text-purple-500",text: "text-purple-600"},
  };
  const c = colors[color];

  return (
    <div
      className={`bg-white rounded-2xl p-6 border-l-4 ${c.border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{count}</p>
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  );
};

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

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/seeker/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 text-sm animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Welcome back</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your job search</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Applied"  value={data?.totalApplications || 0} icon={Briefcase}   color="blue"   delay={0}   />
            <StatCard label="Pending"         value={data?.pending || 0}           icon={Clock}       color="amber"  delay={100} />
            <StatCard label="Shortlisted"     value={data?.shortlisted || 0}       icon={TrendingUp}  color="purple" delay={200} />
            <StatCard label="Accepted"        value={data?.accepted || 0}          icon={CheckCircle} color="green"  delay={300} />
          </div>

          {/* Two column layout */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Applications</h2>
                <Link to="/seeker/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-gray-50">
                {data?.recentApplications?.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No applications yet</p>
                    <Link to="/seeker/jobs" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                      Browse jobs →
                    </Link>
                  </div>
                ) : (
                  data?.recentApplications?.map((app, i) => (
                    <div
                      key={app.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {app.job?.company?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{app.job?.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Building2 size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">{app.job?.company}</span>
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">{app.job?.location}</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <Briefcase size={28} className="mb-3 opacity-90" />
                <h3 className="font-semibold text-lg">Find Jobs</h3>
                <p className="text-blue-100 text-sm mt-1 mb-4">Discover opportunities that match your skills</p>
                <Link
                  to="/seeker/jobs"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Browse Jobs <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Strength</h3>
                <div className="space-y-2">
                  {[
                    { label: "Basic Info",  done: !!user?.fullName },
                    { label: "Bio Added",   done: !!user?.bio },
                    { label: "Skills Set",  done: user?.skills?.length > 0 },
                    { label: "Resume Uploaded", done: !!user?.resumeFileName },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-green-500" : "bg-gray-200"}`}>
                        {done && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <span className={`text-sm ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Completion</span>
                    <span>{[!!user?.fullName, !!user?.bio, user?.skills?.length > 0, !!user?.resumeFileName].filter(Boolean).length * 25}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${[!!user?.fullName, !!user?.bio, user?.skills?.length > 0, !!user?.resumeFileName].filter(Boolean).length * 25}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeekerDashboard;