import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, Shield, FileText, Scale, Lock, AlertCircle,
  Users, Building2, MessageCircle, Sparkles
} from "lucide-react";

const Terms = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: "By accessing or using TalentBridge, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform."
    },
    {
      icon: Users,
      title: "User Accounts",
      content: "You must be at least 16 years old to use TalentBridge. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      icon: Briefcase,
      title: "Job Postings & Applications",
      content: "Employers are responsible for the accuracy of job postings. Job seekers are responsible for the accuracy of their applications and profile information. TalentBridge does not guarantee employment or hiring outcomes."
    },
    {
      icon: Shield,
      title: "Code of Conduct",
      content: "Users must not post false, misleading, or inappropriate content. Harassment, spam, and unauthorized commercial activities are prohibited. We reserve the right to remove content and suspend accounts that violate these rules."
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: "All content on TalentBridge, including logos, designs, and code, is our property. Users retain ownership of their profile information and content but grant us a license to display it on our platform."
    },
    {
      icon: Lock,
      title: "Privacy",
      content: "Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information."
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: "TalentBridge is provided 'as is' without warranties. We are not liable for any damages arising from your use of the platform, including but not limited to lost opportunities or employment outcomes."
    },
    {
      icon: MessageCircle,
      title: "Termination",
      content: "We may suspend or terminate your account for violation of these terms. You may delete your account at any time through your profile settings."
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
            <Scale size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to TalentBridge</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms of Service govern your use of TalentBridge platform. By using our services, you agree to these terms. Please read them carefully.
              </p>
            </div>
          </div>
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

        {/* Governing Law Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These terms shall be governed by and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Any disputes arising under these terms shall be resolved exclusively in the courts located in Kathmandu, Nepal.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Questions About Terms?</h2>
          <p className="text-white/90 mb-4">If you have any questions about these Terms of Service, please contact us.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Contact Us →
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 text-center mt-8">
          By using TalentBridge, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Terms;