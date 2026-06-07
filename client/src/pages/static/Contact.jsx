import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, Mail, Phone, MapPin, Send, MessageCircle,
  CheckCircle, Sparkles, Clock, Globe, AlertCircle
} from "lucide-react";
import api from "../../api/axios";

const Contact = () => {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail,  label: "Email",   value: "support@talentbridge.com", link: "mailto:support@talentbridge.com" },
    { icon: Phone, label: "Phone",   value: "+977 1-1234567",           link: "tel:+97711234567"               },
    { icon: MapPin,label: "Address", value: "Kathmandu, Nepal",         link: null                             },
    { icon: Clock, label: "Hours",   value: "Mon-Fri, 9:00 AM - 6:00 PM", link: null                          },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* Background blobs — pointer-events-none so they never block clicks */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full filter blur-[100px] opacity-40" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full filter blur-[80px] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <Briefcase size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                TalentBridge
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/"        className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
              <Link to="/about"   className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</Link>
              <Link to="/contact" className="text-blue-600 font-semibold border-b-2 border-blue-600">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"    className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">Sign In</Link>
              <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-5 shadow-sm">
            <Sparkles size={15} className="text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">We're Here to Help</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Get in <span className="text-indigo-600">Touch</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions about finding a job or hiring talent? Send us a message and we'll get back to you promptly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Office Image */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow duration-300">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Office"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md">
                  <MapPin size={14} className="text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">Kathmandu, Nepal</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Contact Information</h2>
              <div className="space-y-5">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <info.icon size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{info.label}</p>
                      {info.link ? (
                        <a href={info.link} className="text-sm text-slate-700 hover:text-indigo-600 transition-colors font-medium">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-700 font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg">
              <Globe size={28} className="mx-auto mb-3 opacity-80" />
              <p className="font-semibold mb-1">Connect with us</p>
              <p className="text-sm text-white/70 mb-4">Follow us on social media</p>
              <div className="flex justify-center gap-4 text-sm">
                <a href="#" className="hover:text-white/80 transition-colors underline underline-offset-2">LinkedIn</a>
                <a href="#" className="hover:text-white/80 transition-colors underline underline-offset-2">Twitter</a>
                <a href="#" className="hover:text-white/80 transition-colors underline underline-offset-2">Facebook</a>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                  <p className="text-slate-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>

                  {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                        placeholder="Tell us how we can assist you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-gray-400 py-12 mt-16">
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
                <li><Link to="/"        className="hover:text-white transition">Home</Link></li>
                <li><Link to="/about"   className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms"   className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 TalentBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;