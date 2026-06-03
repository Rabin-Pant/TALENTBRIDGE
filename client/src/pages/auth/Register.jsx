import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Briefcase, User, Building2,
  MapPin, Phone, ChevronRight, ChevronLeft,
  Globe, Users, FileText, Upload, CheckCircle,
  Hash, Mail
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
  <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-1">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
            i < step
              ? "bg-blue-600 text-white"
              : i === step
              ? "bg-blue-600 text-white ring-4 ring-blue-100"
              : "bg-gray-200 text-gray-400"
          }`}>
            {i < step ? "✓" : i + 1}
          </div>
          <span className={`text-xs whitespace-nowrap hidden sm:block ${
            i === step ? "text-blue-600 font-medium" : "text-gray-400"
          }`}>
            {labels[i]}
          </span>
        </div>
        {i < total - 1 && (
          <div className={`w-6 h-0.5 mb-4 transition-all duration-300 ${
            i < step ? "bg-blue-600" : "bg-gray-200"
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

  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

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
        ? ["fullName", "email", "password"]
        : ["fullName", "email", "password", "phone"];
    }
    if (step === 2 && selectedRole === "SEEKER")  fields = ["phone", "location"];
    if (step === 2 && selectedRole === "EMPLOYER") fields = ["companyName", "industry", "companySize", "companyAddress", "companyPhone"];
    if (step === 3 && selectedRole === "EMPLOYER") fields = ["companyRegNumber"];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
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
        <StepIndicator step={step} total={totalSteps} labels={stepLabels} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {stepTitles[selectedRole][step]?.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {stepTitles[selectedRole][step]?.sub}
            </p>
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
                  {/* Seeker */}
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

                  {/* Employer */}
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
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── STEP 1: Account Details (Both) ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 3, message: "At least 3 characters" },
                      pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Mail size={13} className="inline mr-1 text-gray-400" />Email Address *
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.com$/,
                        message: "Must be @gmail.com, @yahoo.com etc.",
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@gmail.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

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
                        required: "Phone is required",
                        pattern: {
                          value: /^(97|98)\d{8}$/,
                          message: "Must start with 97 or 98, 10 digits",
                        },
                      })}
                      className="w-full pl-16 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

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
                          message: "Must contain letters and numbers",
                        },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Min 6 chars with letters & numbers"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(0)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={handleNext}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-white ${
                      selectedRole === "EMPLOYER" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 SEEKER: Personal Info ── */}
            {step === 2 && selectedRole === "SEEKER" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Title</label>
                    <input
                      type="text"
                      {...register("currentTitle", {
                        pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" },
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
                      {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin size={13} className="inline mr-1 text-gray-400" />Location *
                  </label>
                  <input
                    type="text"
                    {...register("location", {
                      required: "Location is required",
                      minLength: { value: 3, message: "Too short" },
                      pattern: { value: /^[a-zA-Z\s,.-]+$/, message: "Letters and commas only" },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Kathmandu, Nepal"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 EMPLOYER: Company Details ── */}
            {step === 2 && selectedRole === "EMPLOYER" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Building2 size={13} className="inline mr-1 text-gray-400" />Company Name *
                    </label>
                    <input
                      type="text"
                      {...register("companyName", { required: "Required" })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Acme Technologies Pvt. Ltd."
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry *</label>
                    <select
                      {...register("industry", { required: "Required" })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Users size={13} className="inline mr-1 text-gray-400" />Company Size *
                    </label>
                    <select
                      {...register("companySize", { required: "Required" })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Globe size={13} className="inline mr-1 text-gray-400" />Website
                    </label>
                    <input
                      type="text"
                      {...register("companyWebsite")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Phone size={13} className="inline mr-1 text-gray-400" />Company Phone *
                    </label>
                    <input
                      type="tel"
                      {...register("companyPhone", {
                        required: "Required",
                        pattern: { value: /^[0-9]{7,15}$/, message: "Invalid phone" },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="01-XXXXXXX"
                      onKeyPress={(e) => { if (!/[0-9-]/.test(e.key)) e.preventDefault(); }}
                    />
                    {errors.companyPhone && <p className="text-red-500 text-xs mt-1">{errors.companyPhone.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin size={13} className="inline mr-1 text-gray-400" />Company Address *
                    </label>
                    <input
                      type="text"
                      {...register("companyAddress", {
                        required: "Required",
                        minLength: { value: 5, message: "Too short" },
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Hattisar, Kathmandu 44600"
                    />
                    {errors.companyAddress && <p className="text-red-500 text-xs mt-1">{errors.companyAddress.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
                    <textarea
                      {...register("companyDescription")}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Briefly describe your company, what you do..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={handleNext}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 EMPLOYER: Verification ── */}
            {step === 3 && selectedRole === "EMPLOYER" && (
              <div className="space-y-5">

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <FileText size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Verification Required</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Provide your company registration number and upload a valid document
                      (PAN card, company registration certificate, or business license).
                      Admin will review and approve your account.
                    </p>
                  </div>
                </div>

                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Hash size={13} className="inline mr-1 text-gray-400" />Company Registration Number *
                  </label>
                  <input
                    type="text"
                    {...register("companyRegNumber", {
                      required: "Registration number is required",
                      minLength: { value: 5, message: "Too short" },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 123456/078/079 or PAN-XXXXXXXXX"
                  />
                  {errors.companyRegNumber && <p className="text-red-500 text-xs mt-1">{errors.companyRegNumber.message}</p>}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Document / ID Card *
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${
                    companyDocFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 hover:border-green-400 hover:bg-green-50"
                  }`}>
                    {companyDocFile ? (
                      <>
                        <CheckCircle size={28} className="text-green-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-700">Document uploaded</p>
                          <p className="text-xs text-green-600 mt-0.5">{companyDocFile}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">
                            {uploadingDoc ? "Uploading..." : "Click to upload document"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PAN Card, Registration Certificate, Business License
                          </p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                  </label>
                  {!companyDocFile && (
                    <p className="text-amber-500 text-xs mt-1">⚠ Document upload is strongly recommended for faster approval</p>
                  )}
                </div>

                {/* What happens next */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">What happens next?</p>
                  {[
                    "Your application is submitted for review",
                    "Admin verifies your company details and document",
                    "You receive an email notification once approved",
                    "You can then log in and start posting jobs",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-600">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="submit" disabled={loading || uploadingDoc}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? "Submitting..." : "Submit for Approval"}
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