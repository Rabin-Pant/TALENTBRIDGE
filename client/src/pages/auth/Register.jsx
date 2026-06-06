import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Briefcase, User, Building2,
  MapPin, Phone, ChevronRight, ChevronLeft,
  Globe, Users, FileText, Upload, CheckCircle,
  Hash, Mail, Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const EXPERIENCE_LEVELS = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];
const COMPANY_SIZES = [
  { value: "STARTUP",    label: "Startup (1–10)"        },
  { value: "SMALL",      label: "Small (11–50)"         },
  { value: "MEDIUM",     label: "Medium (51–200)"       },
  { value: "LARGE",      label: "Large (201–1000)"      },
  { value: "ENTERPRISE", label: "Enterprise (1000+)"    },
];
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Media", "Hospitality", "Construction", "Other"
];

const StepIndicator = ({ step, total, labels }) => (
  <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 translate-z-20">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-2 relative">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 transform shadow-lg ${
            i < step
              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/40"
              : i === step
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-4 ring-blue-500/20 scale-110 shadow-indigo-500/40"
              : "bg-white border-2 border-blue-100 text-blue-300"
          }`}>
            {i < step ? "✓" : i + 1}
          </div>
          <span className={`text-xs whitespace-nowrap hidden sm:block transition-all duration-300 absolute -bottom-6 ${
            i === step ? "text-blue-700 font-bold" : "text-blue-900/40 font-medium"
          }`}>
            {labels[i]}
          </span>
        </div>
        {i < total - 1 && (
          <div className={`w-12 h-1 rounded-full mb-6 transition-all duration-500 shadow-inner ${
            i < step ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-blue-100"
          }`} />
        )}
      </div>
    ))}
  </div>
);

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("SEEKER");
  const [step, setStep] = useState(0);
  const [companyDocFile, setCompanyDocFile] = useState(null);
  const [companyDocName, setCompanyDocName] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });

  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const tiltX = ((y / window.innerHeight) - 0.5) * 10;
      const tiltY = ((x / window.innerWidth) - 0.5) * -10; 
      setMousePos({ x, y, tiltX, tiltY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const seekerSteps  = ["Role", "Account", "Personal"];
  const employerSteps = ["Role", "Account", "Company", "Verify"];
  const stepLabels   = selectedRole === "SEEKER" ? seekerSteps : employerSteps;
  const totalSteps   = stepLabels.length;

  const stepTitles = {
    SEEKER: [
      { title: "Choose Role",     sub: "How will you use TalentBridge?"         },
      { title: "Account Details", sub: "Set up your login credentials"          },
      { title: "Personal Info",   sub: "Tell us more about yourself"            },
    ],
    EMPLOYER: [
      { title: "Choose Role",      sub: "How will you use TalentBridge?"        },
      { title: "Account Details",  sub: "Your personal login information"       },
      { title: "Company Details",  sub: "Tell us about your company"            },
      { title: "Verification",     sub: "Verify your company identity"          },
    ],
  };

  const handleNext = async () => {
    let fields = [];
    if (step === 1) {
      fields = selectedRole === "SEEKER"
        ? ["fullName", "email", "password", "phone"] 
        : ["fullName", "email", "password", "phone"];
    }
    if (step === 2 && selectedRole === "SEEKER") fields = ["location"]; 
    if (step === 2 && selectedRole === "EMPLOYER") fields = ["companyName", "industry", "companySize", "companyAddress", "companyPhone"];
    if (step === 3 && selectedRole === "EMPLOYER") fields = ["companyRegNumber"];
    
    const valid = await trigger(fields);
    if (valid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingDoc(true);
      setError("");
      const formData = new FormData();
      formData.append("companyDocument", file);
      const res = await api.post("/auth/upload-company-doc", formData);
      setCompanyDocName(res.data.filename);
      setCompanyDocFile(file.name);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upload document. Make sure file is PDF, JPG or PNG under 10MB.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        email:    data.email,
        password: data.password,
        fullName: data.fullName,
        role:     selectedRole,
        phone:    data.phone,
        ...(selectedRole === "SEEKER" && {
          location:        data.location,
          currentTitle:    data.currentTitle,
          experienceLevel: data.experienceLevel,
        }),
        ...(selectedRole === "EMPLOYER" && {
          companyName:        data.companyName,
          companyWebsite:     data.companyWebsite,
          companySize:        data.companySize,
          industry:           data.industry,
          companyDescription: data.companyDescription,
          companyAddress:     data.companyAddress,
          companyPhone:       data.companyPhone,
          companyRegNumber:   data.companyRegNumber,
          companyDocument:    companyDocName,
        }),
      };

      const res = await api.post("/auth/register", payload);

      if (res.data.pendingApproval) {
        navigate("/pending-approval");
        return;
      }

      login(res.data.user, res.data.token);
      navigate("/seeker/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 relative overflow-hidden font-sans py-12">
      {/* Immersive 3D Animated Background - Pure Blue Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-1000">
        <div className="absolute w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[80px] animate-blob transition-colors duration-1000 bg-blue-500/20"
             style={{ top: '5%', left: '0%' }} />
        <div className="absolute w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 transition-colors duration-1000 bg-cyan-400/20"
             style={{ bottom: '5%', right: '0%' }} />
        <div className="absolute w-[30rem] h-[30rem] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000 transition-colors duration-1000 bg-indigo-500/20"
             style={{ top: '50%', left: '40%', transform: 'translate(-50%, -50%)' }} />
        
        {/* 3D floating shapes */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-3xl opacity-50 animate-float-3d shadow-2xl backdrop-blur-md"
             style={{ transform: `translate(${mousePos.x * 0.03}px, ${mousePos.y * 0.03}px) rotateX(${mousePos.tiltX * 2}deg) rotateY(${mousePos.tiltY * 2}deg)` }} />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-40 animate-float-3d-delayed shadow-2xl"
             style={{ transform: `translate(${mousePos.x * -0.02}px, ${mousePos.y * -0.02}px) rotateX(${mousePos.tiltY}deg) rotateY(${mousePos.tiltX}deg)` }} />
             
        {/* Dynamic Data Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-particle-3d bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      {/* Main Container with Perspective */}
      <div className="w-full max-w-xl relative z-10 perspective-1000">
        <div 
          className={`transition-all duration-1000 transform-style-3d ${visible ? "opacity-100" : "opacity-0 translate-y-12"}`}
          style={{
            transform: `rotateX(${mousePos.tiltX}deg) rotateY(${mousePos.tiltY}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Logo Heading (Popped out) */}
          <div className="text-center mb-8 translate-z-30">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] transform transition-all duration-500 hover:scale-110 hover:rotate-[10deg]">
              <Briefcase className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent tracking-tight">Create your account</h1>
            <p className="text-blue-900/60 mt-2 font-medium text-sm">Join TalentBridge today</p>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-8 sm:p-10 relative overflow-hidden group">
            
            {/* Card internal subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="translate-z-20 transform-style-3d">
              {/* Step Indicator */}
              <StepIndicator step={step} total={totalSteps} labels={stepLabels} />

              <div className="mb-8 text-center translate-z-10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-gray-800 bg-clip-text text-transparent">
                  {stepTitles[selectedRole][step]?.title}
                </h2>
                <p className="text-sm font-medium text-blue-900/50 mt-1">
                  {stepTitles[selectedRole][step]?.sub}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl text-red-600 text-sm font-medium animate-shake translate-z-20 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="translate-z-10 relative">

                {/* ── STEP 0: Role Selection ── */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      {/* Seeker */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("SEEKER")}
                        className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 transform ${
                          selectedRole === "SEEKER"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] scale-105"
                            : "border-transparent bg-white/50 hover:bg-white/80 shadow-sm hover:shadow-md hover:scale-105"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                          selectedRole === "SEEKER" ? "bg-gradient-to-br from-blue-500 to-blue-700" : "bg-blue-100"
                        }`}>
                          <User size={30} className={selectedRole === "SEEKER" ? "text-white" : "text-blue-400"} />
                        </div>
                        <div className="text-center">
                          <p className={`font-bold text-lg ${selectedRole === "SEEKER" ? "text-blue-700" : "text-gray-600"}`}>
                            Job Seeker
                          </p>
                          <p className="text-xs font-medium text-blue-900/40 mt-1">Find your dream job</p>
                        </div>
                        {selectedRole === "SEEKER" && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-blue-500/40">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>

                      {/* Employer */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("EMPLOYER")}
                        className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 transform ${
                          selectedRole === "EMPLOYER"
                            ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.3)] scale-105"
                            : "border-transparent bg-white/50 hover:bg-white/80 shadow-sm hover:shadow-md hover:scale-105"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                          selectedRole === "EMPLOYER" ? "bg-gradient-to-br from-indigo-500 to-blue-600" : "bg-blue-100"
                        }`}>
                          <Building2 size={30} className={selectedRole === "EMPLOYER" ? "text-white" : "text-blue-400"} />
                        </div>
                        <div className="text-center">
                          <p className={`font-bold text-lg ${selectedRole === "EMPLOYER" ? "text-indigo-700" : "text-gray-600"}`}>
                            Employer
                          </p>
                          <p className="text-xs font-medium text-blue-900/40 mt-1">Hire top talent</p>
                        </div>
                        {selectedRole === "EMPLOYER" && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-indigo-500/40">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-4 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(79,70,229,0.7)] transition-all duration-300 transform hover:-translate-y-1 group/btn mt-4"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                      <div className="flex items-center justify-center gap-2 relative z-20">
                        Continue <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                )}

                {/* ── STEP 1: Account Details (Both) ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="group/input">
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">Full Name *</label>
                      <input
                        type="text"
                        {...register("fullName", {
                          required: "Full name is required",
                          minLength: { value: 3, message: "At least 3 characters" },
                          pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
                        })}
                        className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="John Doe"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.fullName.message}</p>}
                    </div>

                    <div className="group/input">
  <label className="block text-sm font-semibold text-blue-900/80 mb-2">
    <Mail size={14} className="inline mr-1.5 text-blue-400" />Email Address *
  </label>
  <input
    type="email"
    {...register("email", {
      required: "Email is required",
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.com$/,
        message: "Please enter a valid email address",
      },
      validate: {
       
        checkExists: async (value) => {
          try {
           
            const res = await api.post("/auth/check-email", { email: value });
            return !res.data.exists || "This email is already registered";
          } catch (err) {
            console.error("Email check failed", err);
            return true; 
          }
        }
      }
    })}
    className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
    placeholder="you@example.com"
  />
  {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.email.message}</p>}
</div>

                    <div className="group/input">
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                        <Phone size={14} className="inline mr-1.5 text-blue-400" />Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-900/60 text-sm font-bold border-r border-blue-200 pr-3">
                          +977
                        </span>
                        <input
                          type="tel"
                          {...register("phone", {
                            required: "Phone is required",
                            pattern: {
                              value: /^(97|98)\d{8}$/,
                              message: "Must start with 97 or 98, 10 digits",
                            },
                          })}
                          className="w-full pl-16 pr-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="98XXXXXXXX"
                          maxLength={10}
                          onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.phone.message}</p>}
                    </div>

                    <div className="group/input">
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "At least 6 characters" },
                            pattern: {
                              value: /^(?=.*[a-zA-Z])(?=.*[0-9])/,
                              message: "Must contain letters and numbers",
                            },
                          })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm pr-12 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="Min 6 chars with letters & numbers"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-900/40 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.password.message}</p>}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={() => setStep(0)}
                        className="flex-1 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button type="button" onClick={handleNext}
                        className="flex-[2] py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all duration-300 shadow-lg transform hover:-translate-y-1 relative overflow-hidden group/btn bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/40 hover:shadow-blue-500/60">
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                        <span className="relative z-20">Next Step</span> <ChevronRight size={18} className="relative z-20 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 SEEKER: Personal Info ── */}
                {step === 2 && selectedRole === "SEEKER" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">Current Title</label>
                        <input
                          type="text"
                          {...register("currentTitle", {
                            pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
                          })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g. Developer"
                        />
                        {errors.currentTitle && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.currentTitle.message}</p>}
                      </div>
                      <div className="group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">Experience Level</label>
                        <select
                          {...register("experienceLevel")}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none"
                        >
                          <option value="">Select level</option>
                          {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="group/input">
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                        <MapPin size={14} className="inline mr-1.5 text-blue-400" />Location *
                      </label>
                      <input
                        type="text"
                        {...register("location", {
                          required: "Location is required",
                          minLength: { value: 3, message: "Too short" },
                          pattern: { value: /^[a-zA-Z\s,.-]+$/, message: "Letters and commas only" },
                        })}
                        className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="e.g. Kathmandu, Nepal"
                      />
                      {errors.location && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.location.message}</p>}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-1 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] disabled:opacity-70 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 relative overflow-hidden group/btn">
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                        {loading ? (
                          <div className="flex items-center gap-3 relative z-20">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </div>
                        ) : (
                          <span className="relative z-20 flex items-center gap-2">Create Account <CheckCircle size={18}/></span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 EMPLOYER: Company Details ── */}
                {step === 2 && selectedRole === "EMPLOYER" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                          <Building2 size={14} className="inline mr-1.5 text-blue-500" />Company Name *
                        </label>
                        <input
                          type="text"
                          {...register("companyName", { required: "Required" })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g. Acme Technologies Pvt. Ltd."
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.companyName.message}</p>}
                      </div>

                      <div className="group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">Industry *</label>
                        <select
                          {...register("industry", { required: "Required" })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none"
                        >
                          <option value="">Select industry</option>
                          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                        {errors.industry && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.industry.message}</p>}
                      </div>

                      <div className="group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                          <Users size={14} className="inline mr-1.5 text-blue-500" />Company Size *
                        </label>
                        <select
                          {...register("companySize", { required: "Required" })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none"
                        >
                          <option value="">Select size</option>
                          {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        {errors.companySize && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.companySize.message}</p>}
                      </div>

                      <div className="group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                          <Globe size={14} className="inline mr-1.5 text-blue-500" />Website
                        </label>
                        <input
                          type="text"
                          {...register("companyWebsite")}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="https://company.com"
                        />
                      </div>

                      <div className="group/input">
  <label className="block text-sm font-semibold text-blue-900/80 mb-2">
    <Phone size={14} className="inline mr-1.5 text-blue-500" />Company Phone *
  </label>
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-900/60 text-sm font-bold border-r border-blue-200 pr-3">
      +977
    </span>
    <input
      type="tel"
      {...register("companyPhone", {
        required: "Required",
        pattern: { 
          value: /^(97|98)\d{8}$/, 
          message: "Must start with 97 or 98 and be exactly 10 digits" 
        },
      })}
      className="w-full pl-16 pr-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
      placeholder="98XXXXXXXX"
      maxLength={10}
      onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
    />
  </div>
  {errors.companyPhone && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.companyPhone.message}</p>}
</div>

                      <div className="col-span-2 group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                          <MapPin size={14} className="inline mr-1.5 text-blue-500" />Company Address *
                        </label>
                        <input
                          type="text"
                          {...register("companyAddress", {
                            required: "Required",
                            minLength: { value: 5, message: "Too short" },
                          })}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="e.g. Hattisar, Kathmandu 44600"
                        />
                        {errors.companyAddress && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.companyAddress.message}</p>}
                      </div>

                      <div className="col-span-2 group/input">
                        <label className="block text-sm font-semibold text-blue-900/80 mb-2">Company Description</label>
                        <textarea
                          {...register("companyDescription")}
                          rows={3}
                          className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-300"
                          placeholder="Briefly describe your company, what you do..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-1 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button type="button" onClick={handleNext}
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 relative overflow-hidden group/btn">
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                        <span className="relative z-20">Next Step</span> <ChevronRight size={18} className="relative z-20 group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 EMPLOYER: Verification ── */}
                {step === 3 && selectedRole === "EMPLOYER" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50/80 backdrop-blur-md border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Verification Required</p>
                        <p className="text-xs font-medium text-blue-700/80 mt-1 leading-relaxed">
                          Provide your company registration number and upload a valid document
                          (PAN card, registration certificate). Admin will review to approve your account.
                        </p>
                      </div>
                    </div>

                    <div className="group/input">
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                        <Hash size={14} className="inline mr-1.5 text-blue-500" />Registration Number *
                      </label>
                      <input
                        type="text"
                        {...register("companyRegNumber", {
                          required: "Registration number is required",
                          minLength: { value: 5, message: "Too short" },
                        })}
                        className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="e.g. 123456/078/079 or PAN-XXXXXXXXX"
                      />
                      {errors.companyRegNumber && <p className="text-red-500 text-xs mt-1.5 font-medium animate-fadeIn">{errors.companyRegNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-900/80 mb-2">
                        Company Document / ID Card *
                      </label>
                      <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all duration-300 transform group/upload ${
                        companyDocFile
                          ? "border-blue-400 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 shadow-inner"
                          : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md"
                      }`}>
                        {companyDocFile ? (
                          <>
                            <CheckCircle size={40} className="text-blue-500 animate-bounce" />
                            <div className="text-center">
                              <p className="text-sm font-bold text-blue-800">Document ready</p>
                              <p className="text-xs font-medium text-blue-600 mt-1">{companyDocFile}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover/upload:scale-110 group-hover/upload:shadow-md transition-all duration-300">
                              <Upload size={28} className="text-blue-500" />
                            </div>
                            <div className="text-center mt-2">
                              <p className="text-sm font-bold text-blue-800">
                                {uploadingDoc ? "Uploading securely..." : "Click or drag to upload"}
                              </p>
                              <p className="text-xs font-medium text-blue-600/60 mt-1">
                                PAN Card, Reg Certificate, Business License
                              </p>
                              <p className="text-[10px] font-bold text-blue-400/80 mt-2 uppercase tracking-wider">PDF, JPG, PNG up to 10MB</p>
                            </div>
                          </>
                        )}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocUpload} className="hidden" />
                      </label>
                      {!companyDocFile && (
                        <p className="text-amber-600 text-xs mt-2 font-medium flex items-center gap-1.5">
                          <Sparkles size={12} /> Document upload is required for fast approval
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={() => setStep(2)}
                        className="flex-1 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button type="submit" disabled={loading || uploadingDoc}
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] disabled:opacity-70 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 relative overflow-hidden group/btn">
                        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                        {loading ? (
                          <div className="flex items-center gap-3 relative z-20">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Submitting...
                          </div>
                        ) : (
                          <span className="relative z-20 flex items-center gap-2">Submit for Approval <CheckCircle size={18}/></span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <p className="text-center text-sm font-medium text-blue-900/60 mt-8 translate-z-10">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-indigo-600 transition-colors duration-300 font-bold hover:underline decoration-2 underline-offset-4">
                  Sign in
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
        .animate-particle-3d { animation: particle-3d 4s ease-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Register;