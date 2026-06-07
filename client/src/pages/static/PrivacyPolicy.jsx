import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Shield, Lock, Eye, Database, FileText, Sparkles } from "lucide-react";

const PrivacyPolicy = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, update your profile, apply for jobs, or communicate with other users. This may include your name, email address, phone number, location, work experience, education, skills, and resume."
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: "We use your information to provide, maintain, and improve our services, to help you find job opportunities or candidates, to communicate with you, and to protect the security and integrity of our platform."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use encryption, secure servers, and regular security assessments."
    },
    {
      icon: Lock,
      title: "Information Sharing",
      content: "We do not sell your personal information. We may share your information with potential employers (when you apply for jobs) or job seekers (when you post jobs). We may also share information with service providers who assist us in operating our platform."
    },
    {
      icon: FileText,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You can update your profile information at any time. You may also request a copy of your data or ask us to delete your account."
    }
  ];

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

      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-4">
            <Shield size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Privacy & Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-600 leading-relaxed">
            At TalentBridge, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon size={22} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cookies Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Questions About Privacy?</h2>
          <p className="text-white/90 mb-4">If you have any questions about this Privacy Policy, please contact us.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Contact Us →
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 text-center mt-8">
          By using TalentBridge, you agree to the collection and use of information in accordance with this policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;