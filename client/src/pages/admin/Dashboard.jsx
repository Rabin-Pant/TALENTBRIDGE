import { useState, useEffect } from "react";
import { 
  Users, Briefcase, FileText, CheckCircle, TrendingUp, 
  Building2, Sparkles, Activity, Zap, TrendingDown, 
  Minus, Clock, Award 
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, icon: Icon, trend, delay, trendLabel = "from last month" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
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
    }, 1000 / steps);
    return () => clearInterval(timer);
  }, [value]);
  
  const getTrendColor = () => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };
  
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp size={12} className="text-green-500" />;
    if (trend < 0) return <TrendingDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-400" />;
  };
  
  const trendDisplay = Math.abs(trend).toFixed(1);
  
  return (
    <div 
      className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms`, animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{count.toLocaleString()}</p>
          {trend !== undefined && trend !== null && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon()}
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trend > 0 ? "+" : ""}{trendDisplay}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
          <Icon size={18} className="text-blue-500" />
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/dashboard");
        console.log("Dashboard data:", res.data);
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load dashboard</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const stats = [
    { label: "TOTAL USERS", value: data?.totalUsers || 0, icon: Users, trend: data?.trends?.users },
    { label: "JOB SEEKERS", value: data?.totalSeekers || 0, icon: Users, trend: data?.trends?.seekers },
    { label: "EMPLOYERS", value: data?.totalEmployers || 0, icon: Building2, trend: data?.trends?.employers },
    { label: "ACTIVE JOBS", value: data?.activeJobs || 0, icon: Briefcase, trend: data?.trends?.jobs },
    { label: "APPLICATIONS", value: data?.totalApplications || 0, icon: FileText, trend: data?.trends?.applications },
    { label: "ACCEPTED", value: data?.acceptedApplications || 0, icon: CheckCircle, trend: data?.trends?.accepted },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-64 pt-16 p-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Admin Console</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
                <p className="text-gray-500 mt-2">
                  Welcome back, <span className="font-semibold text-blue-600">{user?.fullName?.split(' ')[0] || 'Admin'}</span> — here's your platform snapshot
                </p>
              </div>
              
              {/* Date Badge */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {stats.map((stat, idx) => (
              <StatCard 
                key={stat.label} 
                {...stat} 
                delay={idx * 50}
                trendLabel="from last 30 days"
              />
            ))}
          </div>

          {/* Pending Employers Alert */}
          {data?.insights?.pendingEmployers > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Clock size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                {data.insights.pendingEmployers} employer{data.insights.pendingEmployers > 1 ? "s" : ""} waiting for verification
              </p>
              <Link to="/admin/users" className="ml-auto text-sm text-amber-700 hover:underline">
                Review now →
              </Link>
            </div>
          )}

          {/* Quick Actions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <Link 
                to="/admin/users" 
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                    <Users size={22} className="text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">User Management</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Manage user accounts, permissions, and access levels across the platform
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-400">{data?.totalUsers || 0} total users</span>
                </div>
              </Link>

              <Link 
                to="/admin/jobs" 
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                    <Briefcase size={22} className="text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Job Listings</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Monitor and moderate all job postings, verify listings, and ensure quality
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-400">{data?.activeJobs || 0} active jobs</span>
                </div>
              </Link>

              <Link 
                to="/admin/applications" 
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                    <FileText size={22} className="text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Applications</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Review and track all job applications submitted through the platform
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-400">{data?.totalApplications || 0} total applications</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

export default AdminDashboard;