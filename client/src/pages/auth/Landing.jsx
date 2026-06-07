import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Users, MessageCircle, TrendingUp, Award, Shield,
  ArrowRight, CheckCircle, Star, Globe, Clock, Zap,
  Building2, FileText, Send, Heart, Sparkles, ChevronRight,
  UserPlus, MapPin, UserCheck, Search
} from "lucide-react";
import api from "../../api/axios";

const stepImages = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop", 
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200&h=200&fit=crop", 
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop", 
  "https://images.unsplash.com/photo-1552581234-26160f608093?w=200&h=200&fit=crop", 
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop", 
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop", 
];

const Landing = () => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalSeekers: 0,
    totalEmployers: 0,
    totalHires: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await api.get("/admin/landing-stats");
        
        setStats({
          totalJobs: res.data.stats?.totalJobs || 0,
          totalSeekers: res.data.stats?.totalSeekers || 0,
          totalEmployers: res.data.stats?.totalEmployers || 0,
          totalHires: res.data.stats?.totalHires || 0,
        });
        setRecentJobs(res.data.recentJobs || []);
      } catch (err) {
        console.error("Failed to fetch landing data:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchLandingData();
  }, []);

  const features = [
    { icon: Briefcase, title: "Find Your Dream Job", description: `Browse ${stats.totalJobs.toLocaleString()}+ active job listings from top companies.`, color: "blue" },
    { icon: Building2, title: "Hire Top Talent", description: `Connect with ${stats.totalSeekers.toLocaleString()}+ qualified job seekers.`, color: "green" },
    { icon: MessageCircle, title: "Real-time Messaging", description: "Communicate instantly with employers or candidates.", color: "purple" },
    { icon: Users, title: "Build Your Network", description: `Join ${stats.totalSeekers.toLocaleString()}+ professionals.`, color: "amber" },
    { icon: FileText, title: "Easy Applications", description: `Over ${stats.totalHires.toLocaleString()}+ successful hires.`, color: "teal" },
    { icon: Award, title: "Career Growth", description: "Get personalized job recommendations.", color: "pink" },
  ];

  const statItems = [
    { value: stats.totalJobs.toLocaleString(), label: "Active Jobs", icon: Briefcase },
    { value: stats.totalSeekers.toLocaleString(), label: "Job Seekers", icon: Users },
    { value: stats.totalEmployers.toLocaleString(), label: "Companies", icon: Building2 },
    { value: stats.totalHires.toLocaleString(), label: "Successful Hires", icon: TrendingUp },
  ];

  const steps = [
    { number: "01", icon: UserPlus, title: "Create Your Account", description: "Sign up in minutes and create your professional profile. Choose between job seeker or employer account.", image: stepImages[0] },
    { number: "02", icon: FileText, title: "Build Your Profile", description: "Add your skills, work experience, education, and upload your resume to stand out to employers.", image: stepImages[1] },
    { number: "03", icon: Search, title: "Discover Opportunities", description: "Search through thousands of jobs or browse through qualified candidates based on your criteria.", image: stepImages[2] },
    { number: "04", icon: MessageCircle, title: "Connect & Apply", description: "Apply to jobs instantly or reach out to candidates. Use real-time messaging to discuss opportunities.", image: stepImages[3] },
    { number: "05", icon: UserCheck, title: "Interview & Hire", description: "Schedule interviews, review applications, and make offers to find your perfect match.", image: stepImages[4] },
    { number: "06", icon: Award, title: "Succeed & Grow", description: "Start your new job or welcome your new hire. Continue growing your career or team on TalentBridge.", image: stepImages[5] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative w-20 h-20 animate-float">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 shadow-xl" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin-fast" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 perspective-wrapper">
      
      {/* 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse-3d"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse-3d-delayed"></div>
      </div>

      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                TalentBridge
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-5 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 transition-all duration-1000 transform-style-3d ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <div className="text-center animate-float-slow">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow">
            <Sparkles size={16} className="text-blue-600 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Connect Talent with Opportunity</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-gray-900 mb-8 tracking-tight drop-shadow-sm">
            Your Career Journey
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-clip-text text-transparent bg-300% animate-gradient">Starts Here</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-light">
            Find your dream job or discover the perfect candidate. TalentBridge connects talented professionals with leading companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 text-lg group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 text-lg group"
            >
              Sign In <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section with 3D Hover */}
      <div className="bg-white/80 backdrop-blur-lg border-y border-gray-100 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, idx) => (
              <div key={idx} className="text-center group card-3d-subtle p-6 rounded-2xl hover:bg-white transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-inner">
                    <stat.icon size={28} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - 3D Cards */}
      <div className="py-24 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TalentBridge?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to find your next opportunity or hire the best talent
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group card-3d bg-white rounded-3xl p-8 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 transform-style-3d">
                  <feature.icon size={26} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Animated Images */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-full mb-4 border border-purple-100">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-600 tracking-wide uppercase">Simple Process</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How TalentBridge Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your journey to career success starts here in 6 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl p-8 hover:bg-gradient-to-b hover:from-white hover:to-blue-50/50 transition-colors duration-500 text-center border border-transparent hover:border-blue-100 card-3d"
              >
                {/* 3D Round Image Container */}
                <div className={`relative mb-8 flex justify-center ${idx % 2 === 0 ? 'animate-float' : 'animate-float-delayed'}`}>
                  
                  {/* Decorative Spinning Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 opacity-0 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity duration-500 scale-110"></div>
                  
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_20px_40px_rgba(37,99,235,0.2)] transition-shadow duration-500 relative z-10 border-4 border-white">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute -top-2 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl rotate-12 flex items-center justify-center text-white text-lg font-black shadow-xl group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 z-20">
                    {step.number}
                  </div>
                </div>
                
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:-translate-y-2 group-hover:shadow-md transition-all duration-300">
                    <step.icon size={22} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Jobs Section */}
      {recentJobs.length > 0 && (
        <div className="py-24 bg-gradient-to-b from-gray-50 to-white perspective-1000">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Job Openings</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the latest opportunities from top companies
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-3d-subtle hover:border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-sm font-medium text-blue-600">{job.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{job.jobType || "Full Time"}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                      <MapPin size={16} className="text-gray-400" /> {job.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> Posted {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                    <Link to="/register" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
                      Apply Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 card-3d">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-md">Ready to Get Started?</h2>
          <p className="text-blue-100 text-xl mb-10 font-medium">
            Join {stats.totalSeekers.toLocaleString()}+ job seekers and {stats.totalEmployers.toLocaleString()}+ companies on TalentBridge
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-blue-700 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-2 shadow-[0_20px_40px_rgba(0,0,0,0.2)] text-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 border-2 border-white/50 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-2 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

     {/* Footer */}
<footer className="bg-gray-900 text-gray-400 py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">TalentBridge</span>
        </div>
        <p className="text-sm">Connecting talent with opportunity worldwide.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">For Job Seekers</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/register" className="hover:text-white transition">Browse Jobs</Link></li>
          <li><Link to="/register" className="hover:text-white transition">Career Advice</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">For Employers</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/register" className="hover:text-white transition">Post a Job</Link></li>
          <li><Link to="/register" className="hover:text-white transition">Hiring Solutions</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-white transition">Home</Link></li>
          <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
          <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
      <p>&copy; 2026 TalentBridge. All rights reserved.</p>
    </div>
  </div>
</footer>

      {/* Advanced Custom CSS for 3D and Animations */}
      <style jsx>{`
        .perspective-wrapper {
          perspective: 1200px;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        /* 3D Card Physics */
        .card-3d {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform-style: preserve-3d;
        }
        .card-3d:hover {
          transform: rotateY(4deg) rotateX(4deg) translateY(-10px) translateZ(20px);
          box-shadow: -15px 15px 35px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(37, 99, 235, 0.05);
        }
        
        .card-3d-subtle {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .card-3d-subtle:hover {
          transform: translateY(-5px) translateZ(10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.06);
        }

        /* Floating Animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out 2.5s infinite;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }

        /* Background 3D Pulses */
        @keyframes pulse-3d {
          0%, 100% { opacity: 0.3; transform: scale(1) translateZ(0); }
          50% { opacity: 0.6; transform: scale(1.1) translateZ(50px); }
        }
        .animate-pulse-3d {
          animation: pulse-3d 8s ease-in-out infinite;
        }
        .animate-pulse-3d-delayed {
          animation: pulse-3d 8s ease-in-out 4s infinite;
        }

        /* Text Gradients */
        .bg-300\\% {
          background-size: 300% 300%;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient-shift 6s ease infinite;
        }

        /* Spinners */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-slow 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;