import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();         // CRITICAL: prevent page refresh
    setError("");               // clear old error
    setLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === "SEEKER") navigate("/home");
      else if (role === "EMPLOYER") navigate("/home");
      else if (role === "ADMIN") navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Login failed. Please check your email and password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Left side - Login Form */}
        <div className={`w-full md:w-1/2 p-8 md:p-12 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-[#1877f2] rounded-xl flex items-center justify-center shadow-sm">
                  <Briefcase size={24} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">Log in to TalentBridge</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f5f6f7] border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1877f2] focus:bg-white transition"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f5f6f7] border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1877f2] focus:bg-white pr-10 transition"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold py-3 rounded-md transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Log In"}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div className="text-center mt-2">
                <Link to="/reset-password" className="text-sm text-[#1877f2] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Link
                to="/register"
                className="block w-full text-center bg-[#42b72a] hover:bg-[#36a420] text-white font-semibold py-3 rounded-md transition"
              >
                Create new account
              </Link>
            </form>
          </div>
        </div>

        {/* Right side - Image panel (unchanged) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1877f2] to-[#0e5bc4] relative flex-col justify-between p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full animate-pulse-slower"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white mb-12 animate-fade-in-up">
              <Briefcase size={22} />
              <span className="text-sm font-semibold tracking-wide">TalentBridge</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight animate-fade-in-up animation-delay-100">
                Connect talent with opportunity
              </h2>
              <p className="text-blue-100 text-base leading-relaxed animate-fade-in-up animation-delay-200">
                Join a community of professionals and companies growing together.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop"
              alt="Team collaboration"
              className="rounded-xl shadow-2xl w-full object-cover transition duration-500 hover:scale-105"
            />
            <div className="mt-4 text-white/80 text-sm text-center animate-fade-in-up animation-delay-300">
              Thousands of successful connections
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.1; }
        }
        @keyframes pulse-slower {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.8); opacity: 0.05; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 12s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default Login;