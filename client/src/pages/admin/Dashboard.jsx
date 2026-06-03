import { useState, useEffect } from "react";
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Building2, Sparkles } from "lucide-react";
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
    blue:   { border: "border-blue-500",   bg: "bg-blue-50",   icon: "text-blue-500",   text: "text-blue-600"   },
    green:  { border: "border-green-500",  bg: "bg-green-50",  icon: "text-green-500",  text: "text-green-600"  },
    amber:  { border: "border-amber-500",  bg: "bg-amber-50",  icon: "text-amber-500",  text: "text-amber-600"  },
    purple: { border: "border-purple-500", bg: "bg-purple-50", icon: "text-purple-500", text: "text-purple-600" },
    red:    { border: "border-red-500",    bg: "bg-red-50",    icon: "text-red-500",    text: "text-red-600"    },
    teal:   { border: "border-teal-500",   bg: "bg-teal-50",   icon: "text-teal-500",   text: "text-teal-600"   },
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/dashboard");
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

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Admin Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.fullName} — here's what's happening</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Users"        value={data?.totalUsers || 0}          icon={Users}       color="blue"   delay={0}   />
            <StatCard label="Job Seekers"        value={data?.totalSeekers || 0}        icon={Users}       color="purple" delay={100} />
            <StatCard label="Employers"          value={data?.totalEmployers || 0}      icon={Building2}   color="teal"   delay={200} />
            <StatCard label="Active Jobs"        value={data?.activeJobs || 0}          icon={Briefcase}   color="green"  delay={300} />
            <StatCard label="Total Applications" value={data?.totalApplications || 0}   icon={FileText}    color="amber"  delay={400} />
            <StatCard label="Accepted"           value={data?.acceptedApplications || 0}icon={CheckCircle} color="green"  delay={500} />
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "User Management",
                desc: "View, enable, disable or delete user accounts",
                to: "/admin/users",
                color: "from-blue-600 to-blue-700",
                shadow: "shadow-blue-200",
                icon: Users,
              },
              {
                title: "Job Listings",
                desc: "Monitor and manage all job postings platform-wide",
                to: "/admin/jobs",
                color: "from-green-600 to-teal-600",
                shadow: "shadow-green-200",
                icon: Briefcase,
              },
              {
                title: "Applications",
                desc: "View all applications across the platform",
                to: "/admin/applications",
                color: "from-purple-600 to-purple-700",
                shadow: "shadow-purple-200",
                icon: FileText,
              },
            ].map(({ title, desc, to, color, shadow, icon: Icon }) => (
              
                key={to}
                href={to}
                className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg ${shadow} hover:-translate-y-1 transition-all duration-300`}
              >
                <Icon size={28} className="mb-3 opacity-90" />
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-white/70 text-sm mt-1">{desc}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;