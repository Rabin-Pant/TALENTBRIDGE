import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Users, MessageCircle, TrendingUp, Award, Shield,
  ArrowRight, CheckCircle, Star, Globe, Clock, Zap,
  Building2, FileText, Send, Heart, Sparkles, ChevronRight,
  UserPlus
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const features = [
    {
      icon: Briefcase,
      title: "Find Your Dream Job",
      description: "Browse thousands of job listings from top companies. Filter by location, salary, and experience level.",
      color: "blue"
    },
    {
      icon: Building2,
      title: "Hire Top Talent",
      description: "Post jobs and find the perfect candidates for your company. Connect with qualified professionals.",
      color: "green"
    },
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Communicate instantly with employers or candidates. Never miss an opportunity.",
      color: "purple"
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: "Connect with professionals in your industry. Grow your professional network.",
      color: "amber"
    },
    {
      icon: FileText,
      title: "Easy Applications",
      description: "Apply to jobs with one click. Track your applications status in real-time.",
      color: "teal"
    },
    {
      icon: Award,
      title: "Career Growth",
      description: "Get personalized job recommendations based on your skills and experience.",
      color: "pink"
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Jobs", icon: Briefcase },
    { value: "50K+", label: "Job Seekers", icon: Users },
    { value: "5K+", label: "Companies", icon: Building2 },
    { value: "30K+", label: "Successful Hires", icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: "Rabin Pant",
      role: "Full Stack Developer",
      company: "Tech Solutions",
      content: "TalentBridge helped me find my dream job! The platform is easy to use and the messaging feature is great.",
      rating: 5
    },
    {
      name: "Sabin Pant",
      role: "HR Manager",
      company: "Cinebook",
      content: "We've hired 3 amazing employees through TalentBridge. The quality of candidates is outstanding.",
      rating: 5
    },
    {
      name: "Mikey Nepal",
      role: "Software Engineer",
      company: "Google",
      content: "Best job portal I've ever used. The application process is smooth and notifications are real-time.",
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        {/* Navbar */}
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
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
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

        {/* Hero Content */}
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
            {stats.map((stat, idx) => (
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
                style={{ animationDelay: `${idx * 100}ms` }}
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

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to start your journey with TalentBridge
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and create your profile in minutes", icon: UserPlus },
              { step: "02", title: "Build Profile", desc: "Add your skills, experience, and resume", icon: FileText },
              { step: "03", title: "Connect & Apply", desc: "Start applying to jobs or finding candidates", icon: Briefcase },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who found success with TalentBridge
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 text-lg mb-8">
            Join TalentBridge today and take the next step in your career
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
                <li><Link to="/register" className="hover:text-white transition">Salary Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition">Post a Job</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Hiring Solutions</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 TalentBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
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