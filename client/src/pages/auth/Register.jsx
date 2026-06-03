import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Briefcase, User, Building2,
  MapPin, Phone, ChevronRight, ChevronLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const EXPERIENCE_LEVELS = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];

const StepIndicator = ({ step, total }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
          i < step
            ? "bg-blue-600 text-white"
            : i === step
            ? "bg-blue-600 text-white ring-4 ring-blue-100"
            : "bg-gray-200 text-gray-400"
        }`}>
          {i < step ? "✓" : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`w-8 h-0.5 transition-all duration-300 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
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

  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

  const totalSteps = selectedRole === "SEEKER" ? 3 : 2;

  const stepTitles = selectedRole === "SEEKER"
    ? [
        { title: "Choose Role",     sub: "How will you use TalentBridge?"  },
        { title: "Account Details", sub: "Set up your login credentials"   },
        { title: "Personal Info",   sub: "Tell us more about yourself"     },
      ]
    : [
        { title: "Choose Role",     sub: "How will you use TalentBridge?"  },
        { title: "Account Details", sub: "Set up your login credentials"   },
      ];

  const handleNext = async () => {
    let fields = [];
    if (step === 1) fields = ["fullName", "email", "password"];
    if (step === 2) fields = ["phone", "location"];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: selectedRole,
        ...(selectedRole === "EMPLOYER" && { companyName: data.companyName }),
        ...(selectedRole === "SEEKER" && {
          phone: data.phone,
          location: data.location,
          currentTitle: data.currentTitle,
          experienceLevel: data.experienceLevel,
        }),
      };
      const res = await api.post("/auth/register", payload);
      login(res.data.user, res.data.token);
      navigate(selectedRole === "SEEKER" ? "/seeker/dashboard" : "/employer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
            <Briefcase className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join TalentBridge today</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator step={step} total={totalSteps} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">{stepTitles[step]?.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stepTitles[step]?.sub}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── STEP 0: Role Selection ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("SEEKER")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      selectedRole === "SEEKER"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      selectedRole === "SEEKER" ? "bg-blue-600" : "bg-gray-100"
                    }`}>
                      <User size={28} className={selectedRole === "SEEKER" ? "text-white" : "text-gray-400"} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${selectedRole === "SEEKER" ? "text-blue-600" : "text-gray-700"}`}>
                        Job Seeker
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Find your dream job</p>
                    </div>
                    {selectedRole === "SEEKER" && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("EMPLOYER")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      selectedRole === "EMPLOYER"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      selectedRole === "EMPLOYER" ? "bg-green-600" : "bg-gray-100"
                    }`}>
                      <Building2 size={28} className={selectedRole === "EMPLOYER" ? "text-white" : "text-gray-400"} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${selectedRole === "EMPLOYER" ? "text-green-600" : "text-gray-700"}`}>
                        Employer
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Hire top talent</p>
                    </div>
                    {selectedRole === "EMPLOYER" && (
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 1: Account Details ── */}
            {step === 1 && (
              <div className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 3, message: "Name must be at least 3 characters" },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: "Name should only contain letters",
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Company Name (Employer only) */}
                {selectedRole === "EMPLOYER" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      {...register("companyName", {
                        required: selectedRole === "EMPLOYER" ? "Company name is required" : false,
                        minLength: { value: 2, message: "Too short" },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corp"
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.com$/,
                        message: "Must be a valid email e.g. @gmail.com or @yahoo.com",
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@gmail.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "At least 6 characters" },
                        pattern: {
                          value: /^(?=.*[a-zA-Z])(?=.*[0-9])/,
                          message: "Password must contain letters and numbers",
                        },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Min 6 chars with letters & numbers"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  {selectedRole === "SEEKER" ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: Personal Info (Seeker only) ── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Current Title + Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Title</label>
                    <input
                      type="text"
                      {...register("currentTitle", {
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message: "Only letters allowed",
                        },
                        minLength: { value: 2, message: "Too short" },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Developer"
                    />
                    {errors.currentTitle && <p className="text-red-500 text-xs mt-1">{errors.currentTitle.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Level</label>
                    <select
                      {...register("experienceLevel")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select level</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone size={13} className="inline mr-1 text-gray-400" />Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-300 pr-3">
                      +977
                    </span>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^(97|98)\d{8}$/,
                          message: "Must start with 97 or 98 and be 10 digits",
                        },
                        minLength: { value: 10, message: "Must be exactly 10 digits" },
                        maxLength: { value: 10, message: "Must be exactly 10 digits" },
                      })}
                      className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  <p className="text-gray-400 text-xs mt-1">10-digit Nepali number starting with 97 or 98</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin size={13} className="inline mr-1 text-gray-400" />Location / Address *
                  </label>
                  <input
                    type="text"
                    {...register("location", {
                      required: "Location is required",
                      minLength: { value: 3, message: "Location too short" },
                      pattern: {
                        value: /^[a-zA-Z\s,.-]+$/,
                        message: "Only letters, commas and dots allowed",
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Kathmandu, Nepal"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;