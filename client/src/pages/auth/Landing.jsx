import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Users, MessageCircle, TrendingUp, Award, Shield,
  ArrowRight, CheckCircle, Star, Globe, Clock, Zap,
  Building2, FileText, Send, Heart, Sparkles, ChevronRight,
  UserPlus, MapPin, UserCheck, Search
} from "lucide-react";
import api from "../../api/axios";

// Import images (you'll need to add these images to your public folder)
// For now using placeholder images from unsplash
const stepImages = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop", // Create account
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200&h=200&fit=crop", // Build profile
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop", // Discover
  "https://images.unsplash.com/photo-1552581234-26160f608093?w=200&h=200&fit=crop", // Connect
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop", // Interview
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop", // Success
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
    {
      icon: Briefcase,
      title: "Find Your Dream Job",
      description: `Browse ${stats.totalJobs.toLocaleString()}+ active job listings from top companies.`,
      color: "blue"
    },
    {
      icon: Building2,
      title: "Hire Top Talent",
      description: `Connect with ${stats.totalSeekers.toLocaleString()}+ qualified job seekers.`,
      color: "green"
    },
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Communicate instantly with employers or candidates.",
      color: "purple"
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: `Join ${stats.totalSeekers.toLocaleString()}+ professionals.`,
      color: "amber"
    },
    {
      icon: FileText,
      title: "Easy Applications",
      description: `Over ${stats.totalHires.toLocaleString()}+ successful hires.`,
      color: "teal"
    },
    {
      icon: Award,
      title: "Career Growth",
      description: "Get personalized job recommendations.",
      color: "pink"
    },
  ];

  const statItems = [
    { value: stats.totalJobs.toLocaleString(), label: "Active Jobs", icon: Briefcase },
    { value: stats.totalSeekers.toLocaleString(), label: "Job Seekers", icon: Users },
    { value: stats.totalEmployers.toLocaleString(), label: "Companies", icon: Building2 },
    { value: stats.totalHires.toLocaleString(), label: "Successful Hires", icon: TrendingUp },
  ];

  // How It Works Steps with images
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up in minutes and create your professional profile. Choose between job seeker or employer account.",
      color: "blue",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop"
    },
    {
      number: "02",
      icon: FileText,
      title: "Build Your Profile",
      description: "Add your skills, work experience, education, and upload your resume to stand out to employers.",
      color: "green",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&h=300&fit=crop"
    },
    {
      number: "03",
      icon: Search,
      title: "Discover Opportunities",
      description: "Search through thousands of jobs or browse through qualified candidates based on your criteria.",
      color: "purple",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop"
    },
    {
      number: "04",
      icon: MessageCircle,
      title: "Connect & Apply",
      description: "Apply to jobs instantly or reach out to candidates. Use real-time messaging to discuss opportunities.",
      color: "amber",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=300&h=300&fit=crop"
    },
    {
      number: "05",
      icon: UserCheck,
      title: "Interview & Hire",
      description: "Schedule interviews, review applications, and make offers to find your perfect match.",
      color: "teal",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop"
    },
    {
      number: "06",
      icon: Award,
      title: "Succeed & Grow",
      description: "Start your new job or welcome your new hire. Continue growing your career or team on TalentBridge.",
      color: "pink",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=300&fit=crop"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        </div>

        <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Briefcase size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  TalentBridge
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-6">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Connect Talent with Opportunity</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-6">
              Your Career Journey
              <br />
              Starts Here
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Find your dream job or discover the perfect candidate. TalentBridge connects talented professionals with leading companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Sign In <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <stat.icon size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TalentBridge?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to find your next opportunity or hire the best talent
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={22} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section - WITH ROUND IMAGES */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-4">
              <Zap size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TalentBridge Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your journey to career success starts here in 6 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-center"
              >
                {/* Round Image */}
                <div className="relative mb-4 flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 mx-auto">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon size={20} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Jobs Section */}
      {recentJobs.length > 0 && (
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Job Openings</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover the latest opportunities from top companies
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <span className="text-xs text-gray-400">{job.jobType || "Full Time"}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin size={12} /> {job.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      Posted {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                    <Link to="/register" className="text-xs text-blue-600 hover:underline">
                      Apply Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/register" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                View all jobs <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 text-lg mb-8">
            Join {stats.totalSeekers.toLocaleString()}+ job seekers and {stats.totalEmployers.toLocaleString()}+ companies on TalentBridge
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-all duration-200"
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
    <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
    <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
    <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
  </ul>
</div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 TalentBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        .animate-pulse {
          animation: pulse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;