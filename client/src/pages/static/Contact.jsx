import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, Mail, Phone, MapPin, Send, MessageCircle, 
  CheckCircle, Sparkles, Clock, Globe, ArrowRight
} from "lucide-react";
import api from "../../api/axios";

const Contact = () => {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "support@talentbridge.com", link: "mailto:support@talentbridge.com" },
    { icon: Phone, label: "Phone", value: "+977 1-1234567", link: "tel:+97711234567" },
    { icon: MapPin, label: "Address", value: "Kathmandu, Nepal", link: null },
    { icon: Clock, label: "Hours", value: "Mon-Fri, 9:00 AM - 6:00 PM", link: null },
  ];

  return (
    <div className="min-h-screen bg-slate-50 perspective-wrapper font-sans text-slate-800 overflow-hidden">
      
      {/* 3D Animated Background - Soft Professional Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse-3d"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse-3d-delayed"></div>
      </div>

      {/* Navbar (Matched to Landing Theme) */}
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
        
        {/* Header */}
        <div className="text-center mb-16 animate-float-slow">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-6 shadow-sm hover:border-indigo-200 transition-colors">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">We're Here to Help</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Get in <span className="text-indigo-600">Touch</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
            Have questions about finding a job or hiring talent? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 perspective-1000">
          
          {/* Left Column: Contact Info & Animated Image */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Animated 3D Image Container */}
            <div className="card-3d bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" 
                  alt="Office" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <MapPin size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">Global Headquarters</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 card-3d-subtle">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:-translate-y-1 transition-all duration-300">
                      <info.icon size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-bold text-slate-900 mb-0.5">{info.label}</p>
                      {info.link ? (
                        <a href={info.link} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                          {info.value} <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-500">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Block */}
            <div className="bg-slate-900 rounded-2xl p-8 text-center card-3d relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <Globe size={36} className="mx-auto mb-4 text-indigo-400 animate-float" />
              <h3 className="text-white font-bold mb-2">Connect Digitally</h3>
              <p className="text-slate-400 text-sm mb-6">Follow us for the latest career tips and job updates.</p>
              <div className="flex justify-center gap-3">
                {['LinkedIn', 'Twitter', 'Facebook'].map((social) => (
                  <a key={social} href="#" className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors duration-300 border border-slate-700 hover:border-indigo-500">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 lg:p-10 card-3d relative">
              
              {/* Decorative Corner Element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10"></div>

              {submitted ? (
                <div className="text-center py-16 animate-float-slow">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-2 border-indigo-200 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle size={40} className="text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Message Sent!</h2>
                  <p className="text-lg text-slate-600 mb-8 max-w-sm mx-auto">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 mb-8">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {error}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300 resize-none"
                        placeholder="Tell us how we can assist you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0 group"
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <Send size={18} className={`${loading ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1'} transition-transform`} />
                    </button>
                  </form>
                </>
              )}
            </div>
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

      {/* Reusing the CSS for 3D and Animations */}
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
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }

        @keyframes pulse-3d {
          0%, 100% { opacity: 0.4; transform: scale(1) translateZ(0); }
          50% { opacity: 0.6; transform: scale(1.05) translateZ(30px); }
        }
        .animate-pulse-3d {
          animation: pulse-3d 10s ease-in-out infinite;
        }
        .animate-pulse-3d-delayed {
          animation: pulse-3d 10s ease-in-out 5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Contact;