import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, Users, TrendingUp, PlusCircle,
  ArrowRight, Clock, Sparkles, CheckCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1000 / steps);
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

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/employer/dashboard");
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
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Employer Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">{user?.companyName} · Here's your hiring overview</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Jobs"       value={data?.totalJobs || 0}        icon={Briefcase}  color="blue"   delay={0}   />
            <StatCard label="Active Jobs"      value={data?.activeJobs || 0}       icon={CheckCircle}color="green"  delay={100} />
            <StatCard label="Total Applicants" value={data?.totalApplications || 0}icon={Users}      color="purple" delay={200} />
            <StatCard label="This Week"        value={data?.recentApplications?.length || 0} icon={TrendingUp} color="amber" delay={300} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Applicants</h2>
                <Link to="/employer/applicants" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {data?.recentApplications?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No applicants yet</p>
                    <Link to="/employer/jobs/post" className="mt-3 inline-block text-sm text-green-600 hover:underline">
                      Post a job →
                    </Link>
                  </div>
                ) : (
                  data?.recentApplications?.map((app, i) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {app.applicant?.fullName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{app.applicant?.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Briefcase size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{app.job?.title}</span>
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
                <PlusCircle size={28} className="mb-3 opacity-90" />
                <h3 className="font-semibold text-lg">Post a Job</h3>
                <p className="text-green-100 text-sm mt-1 mb-4">Reach thousands of qualified candidates</p>
                <Link
                  to="/employer/jobs/post"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Post Now <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: "Manage Jobs",     to: "/employer/jobs",       color: "text-blue-600"  },
                    { label: "View Applicants", to: "/employer/applicants", color: "text-purple-600"},
                    { label: "Company Profile", to: "/employer/profile",    color: "text-green-600" },
                    { label: "Notifications",   to: "/employer/notifications", color: "text-amber-600"},
                  ].map(({ label, to, color }) => (
                    <Link key={to} to={to} className={`flex items-center justify-between py-2 text-sm font-medium ${color} hover:underline`}>
                      {label} <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;