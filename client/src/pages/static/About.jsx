import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, Users, MessageCircle, TrendingUp, Award, Shield,
  Sparkles, Building2, Globe, Heart, Zap, CheckCircle
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
    { icon: Heart, title: "Trust & Transparency", description: "We believe in honest communication and transparent processes." },
    { icon: Users, title: "Community First", description: "Building a supportive community of professionals and employers." },
    { icon: Zap, title: "Innovation", description: "Constantly improving our platform with cutting-edge technology." },
    { icon: Award, title: "Excellence", description: "Committed to providing the best experience for our users." },
  ];

  const team = [
    { name: "Rabin Pant", role: "Founder & Full Stack Developer", image: null, bio: "Passionate about connecting talent with opportunity" },
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
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                TalentBridge
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-4">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Connecting Talent with Opportunity
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TalentBridge was founded with a simple mission: to make job searching and hiring easier, faster, and more effective for everyone.
          </p>
        </div>

        {/* Stats Section - Dynamic */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <stat.icon size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To empower professionals and organizations to achieve their full potential by creating meaningful connections in the digital age.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that everyone deserves access to opportunities that match their skills and aspirations. Our platform breaks down barriers and makes professional networking accessible to all.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <Globe size={48} className="mx-auto mb-4 opacity-80" />
            <p className="text-lg font-medium">"Bridging the gap between talent and opportunity"</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section - Only Rabin Pant */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Founder</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate about connecting talent with opportunity
            </p>
          </div>
          <div className="flex justify-center">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-md text-center max-w-sm">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-3xl">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xl">{member.name}</h3>
                <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h2>
          <p className="text-white/90 mb-6">Join thousands of professionals and companies on TalentBridge</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Create Free Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;