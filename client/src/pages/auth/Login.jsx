import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      // Calculate 3D tilt based on mouse position relative to center
      const tiltX = ((y / window.innerHeight) - 0.5) * 15; // Max 7.5 deg tilt
      const tiltY = ((x / window.innerWidth) - 0.5) * -15; 
      setMousePos({ x, y, tiltX, tiltY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", data);
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
     if (role === "SEEKER") navigate("/home");
     else if (role === "EMPLOYER") navigate("/home");
     else if (role === "ADMIN") navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Immersive 3D Animated Background - Premium Blue Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-1000">
        {/* Soft glowing ambient orbs */}
        <div className="absolute w-[40rem] h-[40rem] bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"
             style={{ top: '-10%', left: '-10%' }} />
        <div className="absolute w-[40rem] h-[40rem] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"
             style={{ bottom: '-10%', right: '-10%' }} />
        <div className="absolute w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"
             style={{ top: '40%', left: '30%' }} />
        
        {/* 3D floating geometric shapes with mouse parallax */}
        <div className="absolute top-24 left-20 w-32 h-32 bg-gradient-to-tr from-blue-400 to-cyan-300 rounded-2xl opacity-60 animate-float-3d shadow-2xl shadow-blue-500/20 backdrop-blur-md"
             style={{ transform: `translate(${mousePos.x * 0.04}px, ${mousePos.y * 0.04}px) rotateX(${mousePos.tiltX * 1.5}deg) rotateY(${mousePos.tiltY * 1.5}deg)` }} />
        
        <div className="absolute bottom-32 right-24 w-40 h-40 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full opacity-40 animate-float-3d-delayed shadow-2xl shadow-indigo-500/20"
             style={{ transform: `translate(${mousePos.x * -0.03}px, ${mousePos.y * -0.03}px) rotateX(${mousePos.tiltY}deg) rotateY(${mousePos.tiltX}deg)` }} />
        
        {/* 3D Ring Element */}
        <div className="absolute top-1/2 right-1/4 w-24 h-24 border-[12px] border-blue-200/50 rounded-full opacity-50 animate-spin-slow-3d"
             style={{ transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px) rotateX(60deg)` }} />
             
        {/* Dynamic Data Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full animate-particle-3d shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              opacity: 0.2 + Math.random() * 0.5
            }}
          />
        ))}
      </div>

      {/* Main Container with Perspective */}
      <div 
        className="w-full max-w-md relative z-10 perspective-1000"
      >
        <div 
          className={`transition-all duration-1000 transform-style-3d ${visible ? "opacity-100" : "opacity-0 translate-y-12"}`}
          style={{
            transform: `rotateX(${mousePos.tiltX}deg) rotateY(${mousePos.tiltY}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Glassmorphic Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 sm:p-10 relative overflow-hidden group">
            
            {/* Card internal subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* 3D Popped Content Container */}
            <div className="translate-z-20 transform-style-3d">
              {/* Logo */}
              <div className="text-center mb-10 translate-z-30">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-5 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] transform transition-all duration-500 hover:scale-110 hover:rotate-[10deg] hover:shadow-[0_15px_35px_-5px_rgba(79,70,229,0.6)]">
                  <Briefcase className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  Welcome back
                </h1>
                <p className="text-blue-900/60 mt-2 font-medium">Sign in to your TalentBridge account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl text-red-600 text-sm font-medium animate-shake translate-z-20 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 translate-z-10">
                {/* Email */}
                <div className="group/input">
                  <label className="block text-sm font-semibold text-blue-900/80 mb-2 transition-colors group-hover/input:text-blue-600">
                    Email address
                  </label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-sm border border-blue-100/80 rounded-2xl text-sm text-gray-800 placeholder-blue-900/30 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm hover:bg-white/80"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="group/input">
                  <label className="block text-sm font-semibold text-blue-900/80 mb-2 transition-colors group-hover/input:text-blue-600">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", { required: "Password is required" })}
                      className="w-full px-5 py-3.5 bg-white/50 backdrop-blur-sm border border-blue-100/80 rounded-2xl text-sm text-gray-800 placeholder-blue-900/30 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 pr-12 transition-all duration-300 shadow-sm hover:bg-white/80"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-900/40 hover:text-blue-600 transition-all duration-300 hover:scale-110 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right translate-z-10">
                  <Link to="/reset-password" className="text-sm font-semibold text-blue-600 hover:text-indigo-600 transition-all duration-300 hover:underline decoration-2 underline-offset-4">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button with glowing hover effect */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(79,70,229,0.7)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 group/btn translate-z-20"
                >
                  {/* Button shine animation */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                  
                  {loading ? (
                    <div className="flex items-center justify-center gap-3 relative z-20">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-20">
                      <span>Sign in</span>
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </button>
              </form>

              <p className="text-center text-sm font-medium text-blue-900/60 mt-8 translate-z-10">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:text-indigo-600 transition-colors duration-300 font-bold hover:underline decoration-2 underline-offset-4">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .translate-z-10 { transform: translateZ(10px); }
        .translate-z-20 { transform: translateZ(20px); }
        .translate-z-30 { transform: translateZ(30px); }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float-3d {
          0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
          50% { transform: translateY(-20px) rotateX(10deg) rotateY(10deg); }
        }
        
        @keyframes float-3d-delayed {
          0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
          50% { transform: translateY(25px) rotateX(-15deg) rotateY(-10deg); }
        }
        
        @keyframes spin-slow-3d {
          from { transform: rotateX(60deg) rotateZ(0deg); }
          to { transform: rotateX(60deg) rotateZ(360deg); }
        }
        
        @keyframes particle-3d {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { transform: translate3d(20px, -100px, 50px) scale(0); opacity: 0; }
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateZ(10px) translateY(-5px); }
          to { opacity: 1; transform: translateZ(10px) translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateZ(20px) translateX(0); }
          25% { transform: translateZ(20px) translateX(-5px); }
          75% { transform: translateZ(20px) translateX(5px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animate-float-3d { animation: float-3d 6s ease-in-out infinite; }
        .animate-float-3d-delayed { animation: float-3d-delayed 8s ease-in-out infinite; }
        .animate-spin-slow-3d { animation: spin-slow-3d 20s linear infinite; }
        .animate-particle-3d { animation: particle-3d 4s ease-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Login;