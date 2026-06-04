import { useState, useEffect } from "react";
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Building2, Sparkles, Activity, Award, Zap } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, icon: Icon, trend, delay }) => {
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

  const colors = {
    blue:   { border: "border-blue-500",   bg: "bg-blue-50",   icon: "text-blue-500",   text: "text-blue-600"   },
    purple: { border: "border-purple-500", bg: "bg-purple-50", icon: "text-purple-500", text: "text-purple-600" },
    teal:   { border: "border-teal-500",   bg: "bg-teal-50",   icon: "text-teal-500",   text: "text-teal-600"   },
    green:  { border: "border-green-500",  bg: "bg-green-50",  icon: "text-green-500",  text: "text-green-600"  },
    amber:  { border: "border-amber-500",  bg: "bg-amber-50",  icon: "text-amber-500",  text: "text-amber-600"  },
  };

  return (
    <div 
      className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms`, animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{count.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">{trend}% from last month</span>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const stats = [
    { label: "TOTAL USERS", value: data?.totalUsers || 0, icon: Users, trend: 12, color: "blue" },
    { label: "JOB SEEKERS", value: data?.totalSeekers || 0, icon: Users, trend: 8, color: "purple" },
    { label: "EMPLOYERS", value: data?.totalEmployers || 0, icon: Building2, trend: 5, color: "teal" },
    { label: "ACTIVE JOBS", value: data?.activeJobs || 0, icon: Briefcase, trend: 15, color: "green" },
    { label: "APPLICATIONS", value: data?.totalApplications || 0, icon: FileText, trend: 23, color: "amber" },
    { label: "ACCEPTED", value: data?.acceptedApplications || 0, icon: CheckCircle, trend: 18, color: "green" },
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
                  Welcome back, <span className="font-semibold text-blue-600">{user?.fullName?.split(' ')[0]}</span> — here's your platform snapshot
                </p>
              </div>
              
              {/* Date Badge */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={stat.label} {...stat} delay={idx * 50} />
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
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
                  <span className="text-xs text-gray-400">{data?.totalUsers || 0} active users</span>
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

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Platform Activity</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Applications</p>
                    <p className="text-xs text-gray-400">Across all job listings</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{data?.totalApplications || 0}</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Acceptance Rate</p>
                    <p className="text-xs text-gray-400">Applications that were accepted</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {data?.totalApplications > 0 
                      ? Math.round((data?.acceptedApplications / data?.totalApplications) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Jobs per Employer</p>
                    <p className="text-xs text-gray-400">Average jobs posted per employer</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.totalEmployers > 0 
                      ? (data?.activeJobs / data?.totalEmployers).toFixed(1) 
                      : 0}
                  </p>
                </div>
              </div>
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