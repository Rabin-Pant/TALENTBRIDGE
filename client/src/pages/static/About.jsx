import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, Users, TrendingUp, Award,
  Sparkles, Building2, Globe, Heart, Zap, 
  ArrowRight, Target, Rocket
} from "lucide-react";
import api from "../../api/axios";

const About = () => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalSeekers: 0,
    totalEmployers: 0,
    totalHires: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/landing-stats");
        setStats({
          totalJobs: res.data.stats?.totalJobs || 0,
          totalSeekers: res.data.stats?.totalSeekers || 0,
          totalEmployers: res.data.stats?.totalEmployers || 0,
          totalHires: res.data.stats?.totalHires || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { value: stats.totalJobs.toLocaleString(), label: "Active Jobs", icon: Briefcase },
    { value: stats.totalSeekers.toLocaleString(), label: "Job Seekers", icon: Users },
    { value: stats.totalEmployers.toLocaleString(), label: "Companies", icon: Building2 },
    { value: stats.totalHires.toLocaleString(), label: "Successful Hires", icon: TrendingUp },
  ];

  const values = [
    { icon: Heart, title: "Trust & Transparency", description: "We believe in honest communication and completely transparent processes for all users." },
    { icon: Users, title: "Community First", description: "Building a supportive, engaged community of ambitious professionals and leading employers." },
    { icon: Rocket, title: "Innovation", description: "Constantly improving our platform with cutting-edge technology and smart algorithms." },
    { icon: Award, title: "Excellence", description: "Committed to providing the absolute best experience and highest quality matches." },
  ];

  const team = [
    { 
      name: "Rabin Pant", 
      role: "Founder & Full Stack Developer", 
      image: "1000001117.jpg", 
      bio: "Passionate about connecting talent with opportunity through innovative technology." 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-20 h-20 animate-float">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 shadow-sm" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin-fast" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 perspective-wrapper font-sans text-slate-800 overflow-hidden">
      
      {/* 3D Animated Background - Soft Professional Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse-3d"></div>
        <div className="absolute top-60 -left-20 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse-3d-delayed"></div>
      </div>

      {/* Navbar (Matched Theme) */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 group-hover:text-indigo-700 transition-colors">
                TalentBridge
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-5 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative overflow-hidden px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 h-full w-full bg-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 transition-all duration-1000 transform-style-3d ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        
        {/* Hero Section */}
        <div className="text-center mb-24 animate-float-slow">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-6 shadow-sm hover:border-indigo-200 transition-colors">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Connecting Talent with <br/><span className="text-indigo-600">Opportunity</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            TalentBridge was founded with a simple mission: to make job searching and hiring easier, faster, and more effective for everyone.
          </p>
        </div>

        {/* Stats Section - 3D Cards */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 mb-24 relative card-3d-subtle z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {statItems.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300">
                    <stat.icon size={28} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section with 3D Image Container */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center perspective-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-2">
              <Target size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Our Mission</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Empowering Professionals in the Digital Age
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-light">
              We believe that everyone deserves access to opportunities that match their skills and aspirations. Our platform breaks down barriers and makes professional networking accessible to all.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed font-light">
              By leveraging advanced matching algorithms and a user-first design, we ensure that organizations find their ideal candidates and professionals land their dream roles.
            </p>
            <div className="pt-4">
              <div className="flex items-center gap-4 text-slate-900 font-bold">
                <Globe size={24} className="text-indigo-600" />
                "Bridging the gap between global talent and opportunity"
              </div>
            </div>
          </div>
          
          {/* 3D Animated Image */}
          <div className="card-3d relative h-[500px] rounded-3xl overflow-hidden shadow-lg group border-4 border-white bg-slate-100">
            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
              alt="Team Collaboration" 
              className="w-full h-full object-cover transform group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-1000 ease-out"
            />
            {/* Floating accent block */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-600 rounded-3xl -z-10 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-32 perspective-1000">
          <div className="text-center mb-16 animate-float">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
              The unwavering principles that guide our product, our team, and our community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-slate-200 card-3d group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-indigo-50 transition-all duration-300 transform-style-3d">
                  <value.icon size={26} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24 perspective-1000">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Meet Our Founder</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
              The vision behind TalentBridge.
            </p>
          </div>
          <div className="flex justify-center">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md card-3d group">
                
                {/* 3D Avatar Container */}
                <div className="relative mb-8 flex justify-center animate-float-delayed">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 opacity-0 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity duration-500 scale-110"></div>
                  
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-sm group-hover:shadow-xl transition-shadow duration-500 relative z-10 border-4 border-white bg-slate-100">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-black text-5xl">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative badge */}
                  <div className="absolute bottom-0 right-8 w-10 h-10 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center shadow-md z-20 group-hover:scale-125 transition-transform duration-300">
                    <Zap size={16} className="text-white" />
                  </div>
                </div>

                <h3 className="font-black text-slate-900 text-2xl mb-1">{member.name}</h3>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-4">{member.role}</p>
                <p className="text-slate-600 font-light leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Professional Dark Slate */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 card-3d p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Join Us?</h2>
            <p className="text-slate-300 text-xl mb-10 font-light max-w-2xl mx-auto">
              Become part of a growing network of ambitious professionals and forward-thinking companies.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg text-lg border border-indigo-500 group"
            >
              Create Free Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
        
        .card-3d {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform-style: preserve-3d;
        }
        .card-3d:hover {
          transform: rotateY(3deg) rotateX(3deg) translateY(-8px) translateZ(15px);
          box-shadow: -10px 10px 30px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04);
        }
        
        .card-3d-subtle {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .card-3d-subtle:hover {
          transform: translateY(-4px) translateZ(8px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out 3s infinite;
        }
        .animate-float-slow {
          animation: float 9s ease-in-out infinite;
        }

        @keyframes pulse-3d {
          0%, 100% { opacity: 0.4; transform: scale(1) translateZ(0); }
          50% { opacity: 0.7; transform: scale(1.05) translateZ(30px); }
        }
        .animate-pulse-3d {
          animation: pulse-3d 10s ease-in-out infinite;
        }
        .animate-pulse-3d-delayed {
          animation: pulse-3d 10s ease-in-out 5s infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-slow 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default About;