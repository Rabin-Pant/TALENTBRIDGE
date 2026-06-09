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
  <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            i < step
              ? "bg-blue-600 text-white shadow-sm"
              : i === step
              ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-105"
              : "bg-gray-100 text-gray-400"
          }`}>
            {i < step ? "✓" : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${
            i === step ? "text-blue-700 font-medium" : "text-gray-400"
          }`}>
            {labels[i]}
          </span>
        </div>
        {i < total - 1 && (
          <div className={`w-8 h-0.5 rounded-full ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
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
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
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
      fields = ["fullName", "email", "password", "phone"];
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
    if (!agreeToPolicy) {
      setError("You must agree to the Privacy Policy and Terms of Service");
      return;
    }
    
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
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Left side - Multi-step Form */}
        <div className={`w-full md:w-1/2 p-6 md:p-10 transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Briefcase size={20} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">Create an account</h1>
              <p className="text-sm text-gray-500 mt-1">Join TalentBridge today</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator step={step} total={totalSteps} labels={stepLabels} />

            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {stepTitles[selectedRole][step]?.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {stepTitles[selectedRole][step]?.sub}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* STEP 0: Role Selection */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Seeker */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("SEEKER")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        selectedRole === "SEEKER"
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        selectedRole === "SEEKER" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <User size={22} />
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold text-sm ${selectedRole === "SEEKER" ? "text-blue-700" : "text-gray-700"}`}>
                          Job Seeker
                        </p>
                        <p className="text-xs text-gray-500">Find your dream job</p>
                      </div>
                    </button>

                    {/* Employer */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("EMPLOYER")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        selectedRole === "EMPLOYER"
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        selectedRole === "EMPLOYER" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Building2 size={22} />
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold text-sm ${selectedRole === "EMPLOYER" ? "text-blue-700" : "text-gray-700"}`}>
                          Employer
                        </p>
                        <p className="text-xs text-gray-500">Hire top talent</p>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* STEP 1: Account Details (Both) */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      {...register("fullName", {
                        required: "Full name is required",
                        minLength: { value: 3, message: "At least 3 characters" },
                        pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
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
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-300 pr-2">
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
                        className="w-full pl-16 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Min 6 chars with letters & numbers"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(0)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ChevronLeft size={16} className="inline mr-1" /> Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                      Next Step <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 SEEKER: Personal Info */}
              {step === 2 && selectedRole === "SEEKER" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Title</label>
                      <input
                        type="text"
                        {...register("currentTitle", {
                          pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
                        })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Developer"
                      />
                      {errors.currentTitle && <p className="text-red-500 text-xs mt-1">{errors.currentTitle.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                      <select
                        {...register("experienceLevel")}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select level</option>
                        {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      {...register("location", {
                        required: "Location is required",
                        minLength: { value: 3, message: "Too short" },
                        pattern: { value: /^[a-zA-Z\s,.-]+$/, message: "Letters and commas only" },
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      checked={agreeToPolicy}
                      onChange={(e) => setAgreeToPolicy(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreeToPolicy" className="text-xs text-gray-600">
                      I agree to the{" "}
                      <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>{" "}
                      and{" "}
                      <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ChevronLeft size={16} className="inline mr-1" /> Back
                    </button>
                    <button type="submit" disabled={loading || !agreeToPolicy}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                      ) : (
                        <>Create Account <CheckCircle size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 EMPLOYER: Company Details */}
              {step === 2 && selectedRole === "EMPLOYER" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      {...register("companyName", { required: "Required" })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Technologies Pvt. Ltd."
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                      <select
                        {...register("industry", { required: "Required" })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                      {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                      <select
                        {...register("companySize", { required: "Required" })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      {...register("companyWebsite")}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+977</span>
                      <input
                        type="tel"
                        {...register("companyPhone", {
                          required: "Required",
                          pattern: { value: /^(97|98)\d{8}$/, message: "Must start with 97 or 98, 10 digits" },
                        })}
                        className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                      />
                    </div>
                    {errors.companyPhone && <p className="text-red-500 text-xs mt-1">{errors.companyPhone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address *</label>
                    <input
                      type="text"
                      {...register("companyAddress", { required: "Required", minLength: { value: 5, message: "Too short" } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hattisar, Kathmandu 44600"
                    />
                    {errors.companyAddress && <p className="text-red-500 text-xs mt-1">{errors.companyAddress.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                    <textarea
                      {...register("companyDescription")}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Briefly describe your company..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ChevronLeft size={16} className="inline mr-1" /> Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                      Next Step <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 EMPLOYER: Verification */}
              {step === 3 && selectedRole === "EMPLOYER" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 border border-blue-100">
                    <p className="font-semibold">Verification Required</p>
                    <p className="text-xs mt-1">Provide your company registration number and upload a valid document (PAN card, registration certificate). Admin will review to approve your account.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                    <input
                      type="text"
                      {...register("companyRegNumber", { required: "Required", minLength: { value: 5, message: "Too short" } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 123456/078/079 or PAN-XXXXXXXXX"
                    />
                    {errors.companyRegNumber && <p className="text-red-500 text-xs mt-1">{errors.companyRegNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Document *</label>
                    <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition ${
                      companyDocFile ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}>
                      {companyDocFile ? (
                        <>
                          <CheckCircle size={32} className="text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">{companyDocFile}</p>
                        </>
                      ) : (
                        <>
                          <Upload size={28} className="text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">
                            {uploadingDoc ? "Uploading..." : "Click or drag to upload"}
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                        </>
                      )}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="agreeToPolicyEmployer"
                      checked={agreeToPolicy}
                      onChange={(e) => setAgreeToPolicy(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreeToPolicyEmployer" className="text-xs text-gray-600">
                      I agree to the{" "}
                      <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>{" "}
                      and{" "}
                      <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ChevronLeft size={16} className="inline mr-1" /> Back
                    </button>
                    <button type="submit" disabled={loading || uploadingDoc || !agreeToPolicy}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <>Submit for Approval <CheckCircle size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Right side - Image / Branding Panel (same style as login) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-800 relative flex-col justify-between p-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white mb-12">
              <Briefcase size={22} />
              <span className="text-sm font-semibold tracking-wide">TalentBridge</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Join the community
              </h2>
              <p className="text-blue-100 text-base leading-relaxed">
                Create your account and start your journey toward new opportunities.
              </p>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle size={16} className="text-blue-200" />
                  <span className="text-sm">Find jobs or hire talent</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle size={16} className="text-blue-200" />
                  <span className="text-sm">Connect with professionals</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle size={16} className="text-blue-200" />
                  <span className="text-sm">Grow your career or team</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop"
              alt="Team collaboration"
              className="rounded-xl shadow-2xl w-full object-cover transition duration-500 hover:scale-105"
            />
            <div className="mt-4 text-white/80 text-sm text-center">
              Trusted by companies worldwide
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Register;