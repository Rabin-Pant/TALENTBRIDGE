import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  User, MapPin, Briefcase, FileText, Save,
  Upload, CheckCircle, Sparkles, X, Plus,
  GraduationCap, Building2, Lock, Mail, Phone,
  Camera, Trash2, Hash
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const EXPERIENCE_LEVELS = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];

const SeekerProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Education state
  const [education, setEducation] = useState([]);
  // Work Experience state
  const [workExperience, setWorkExperience] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/seeker/profile");
        const u = res.data.user;
        setProfileData(u);
        setSkills(u.skills || []);
        setEducation(u.education || []);
        setWorkExperience(u.workExperience || []);
        reset({
          fullName: u.fullName || "",
          currentTitle: u.currentTitle || "",
          bio: u.bio || "",
          location: u.location || "",
          experienceLevel: u.experienceLevel || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  // Education helpers
  const addEducation = () => setEducation([...education, {
    school: "", degree: "", field: "", startYear: "", endYear: "", current: false
  }]);
  const updateEducation = (i, field, value) => {
    const updated = [...education];
    updated[i][field] = value;
    setEducation(updated);
  };
  const removeEducation = (i) => setEducation(education.filter((_, j) => j !== i));

  // Work experience helpers
  const addWorkExp = () => setWorkExperience([...workExperience, {
    company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: ""
  }]);
  const updateWorkExp = (i, field, value) => {
    const updated = [...workExperience];
    updated[i][field] = value;
    setWorkExperience(updated);
  };
  const removeWorkExp = (i) => setWorkExperience(workExperience.filter((_, j) => j !== i));

  const addSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const s = skillInput.trim();
      if (s && !skills.includes(s)) setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await api.put("/seeker/profile", {
        ...data,
        skills: skills.join(","),
        education,
        workExperience,
      });
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      setUploading(true);
      const res = await api.post("/seeker/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileData((prev) => ({ ...prev, resumeFileName: res.data.filename }));
      showToast("Resume uploaded successfully!");
    } catch {
      showToast("Failed to upload resume", "error");
    } finally {
      setUploading(false);
    }
  };

  // Profile Picture Upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast("Please upload an image file", "error");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size should be less than 2MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);
    
    try {
      setUploadingProfile(true);
      const res = await api.post("/seeker/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setProfileData((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      updateUser({ profilePicture: res.data.profilePicture });
      showToast("Profile picture updated!");
      // Reload to update navbar
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error(err);
      showToast("Failed to upload profile picture", "error");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await api.delete("/seeker/profile-picture");
      setProfileData((prev) => ({ ...prev, profilePicture: null }));
      updateUser({ profilePicture: null });
      showToast("Profile picture removed");
      setTimeout(() => window.location.reload(), 500);
    } catch {
      showToast("Failed to remove profile picture", "error");
    }
  };

  // Cover Picture Upload
const handleCoverPictureUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }
  
  console.log("File selected:", file.name, file.type, file.size);
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showToast("Please upload a valid image (JPEG, PNG, GIF, or WEBP)", "error");
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image size should be less than 5MB", "error");
    return;
  }

  const formData = new FormData();
  formData.append("coverPicture", file);
  
  // Show preview immediately
  const previewUrl = URL.createObjectURL(file);
  setCoverPreview(previewUrl);
  
  try {
    setUploadingCover(true);
    console.log("Uploading cover picture...");
    const res = await api.post("/seeker/cover-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Upload response:", res.data);
    
    setProfileData((prev) => ({ ...prev, coverPicture: res.data.coverPicture }));
    setCoverPreview(null);
    showToast("Cover photo updated!");
  } catch (err) {
    console.error("Upload error:", err);
    console.error("Error response:", err.response?.data);
    setCoverPreview(null);
    showToast(err.response?.data?.message || "Failed to upload cover photo", "error");
  } finally {
    setUploadingCover(false);
  }
};
  const handleRemoveCoverPicture = async () => {
    try {
      await api.delete("/seeker/cover-picture");
      setProfileData((prev) => ({ ...prev, coverPicture: null }));
      showToast("Cover photo removed");
    } catch {
      showToast("Failed to remove cover photo", "error");
    }
  };

  const TABS = [
    { id: "basic",      label: "Basic Info",   icon: User         },
    { id: "experience", label: "Experience",   icon: Briefcase    },
    { id: "education",  label: "Education",    icon: GraduationCap},
    { id: "skills",     label: "Skills",       icon: Sparkles     },
    { id: "resume",     label: "Resume",       icon: FileText     },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  const profilePictureUrl = profileData?.profilePicture 
    ? `http://localhost:5000/uploads/${profileData.profilePicture}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          <CheckCircle size={16} /> {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Your profile</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Keep your profile updated to attract employers</p>
          </div>

          {/* Profile Picture Modal */}
{showProfilePicModal && profilePictureUrl && (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowProfilePicModal(false)}>
    <div className="relative max-w-3xl max-h-[90vh]">
      <button
        onClick={() => setShowProfilePicModal(false)}
        className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
      >
        <X size={24} />
      </button>
      <img 
  src={
    profileData?.profilePicture 
      ? (profileData.profilePicture.startsWith('http') 
          ? profileData.profilePicture // Cloudinary URL
          : `/uploads/${profileData.profilePicture}`) // Old local path
      : "/default-avatar.png" // Fallback
  } 
  alt={profileData?.fullName || "Profile"}
  className="max-w-full max-h-[90vh] object-contain rounded-lg"
/>
    </div>
  </div>
)}

{/* Cover Photo Modal */}
{showCoverModal && profileData?.coverPicture && (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowCoverModal(false)}>
    <div className="relative max-w-5xl max-h-[90vh]">
      <button
        onClick={() => setShowCoverModal(false)}
        className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
      >
        <X size={24} />
      </button>
      <img 
  src={
    profileData?.coverPicture 
      ? (profileData.coverPicture.startsWith('http') 
          ? profileData.coverPicture // Cloudinary URL
          : `/uploads/${profileData.coverPicture}`) // Fallback to local
      : "/default-cover.jpg" // Default fallback image
  } 
  alt="Cover"
  className="max-w-full max-h-[90vh] object-contain rounded-lg"
/>
    </div>
  </div>
)}

{/* Cover Photo Section */}
<div 
  className="relative h-48 bg-gray-200 rounded-t-2xl overflow-hidden cursor-pointer"
  onClick={() => profileData?.coverPicture && setShowCoverModal(true)}
>
  {coverPreview ? (
    <img 
      src={coverPreview} 
      alt="Cover preview" 
      className="w-full h-full object-cover"
    />
  ) : profileData?.coverPicture ? (
    <img 
      src={`http://localhost:5000/uploads/${profileData.coverPicture}`} 
      alt="Cover"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
  )}
  
  {/* Overlay text on hover */}
  {profileData?.coverPicture && (
    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
      <span className="text-white text-sm font-medium">Click to view full size</span>
    </div>
  )}
  
  {/* Buttons - prevent click from triggering the cover click */}
  <div className="absolute bottom-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
    <label className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer z-10">
      <Camera size={14} />
      {profileData?.coverPicture ? "Change Cover" : "Add Cover"}
      <input
        type="file"
        accept="image/*"
        onChange={handleCoverPictureUpload}
        className="hidden"
      />
    </label>
    
    {profileData?.coverPicture && (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemoveCoverPicture();
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer z-10"
      >
        <Trash2 size={14} />
        Remove
      </button>
    )}
  </div>
  
  {uploadingCover && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )}
</div>

 {/* Profile Picture - Overlapping the cover */}
<div className="relative px-6">
  <div className="-mt-12 mb-3 relative">
    <div 
      className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white cursor-pointer"
      onClick={() => profilePictureUrl && setShowProfilePicModal(true)}
    >
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={profileData?.fullName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-3xl">
            {profileData?.fullName?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
    
    {/* Profile Picture Buttons - prevent click from triggering the profile click */}
    <div className="absolute -bottom-2 -right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
      <label className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-lg transition-all z-10">
        <Camera size={14} />
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureUpload}
          className="hidden"
        />
      </label>
      {profileData?.profilePicture && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveProfilePicture();
          }}
          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all z-10"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  </div>
</div>
          {/* Locked Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Lock size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Some fields are locked</p>
              <p className="text-xs text-amber-600 mt-0.5">Email and phone cannot be changed after registration. Contact support if needed.</p>
            </div>
          </div>

          {/* Locked Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Mail size={12} /> Email Address
                  <Lock size={11} className="text-gray-300 ml-1" />
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed">
                  {profileData?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                  <Lock size={11} className="text-gray-300 ml-1" />
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed">
                  {profileData?.phone || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

           {activeTab === "basic" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> Basic Information
                </h2>

                {/* ── ADDED: Read-Only Unique Platform Identifier Block ── */}
                <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Hash size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unique Account Identifier (UID)</p>
                      <p className="font-mono text-xs text-gray-600 font-medium mt-0.5 break-all">
                        {user?.id || "Loading identity..."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (user?.id) {
                        navigator.clipboard.writeText(user.id);
                        if (typeof showToast === "function") {
                          showToast("Account UID copied successfully!");
                        } else {
                          alert("Account UID copied successfully!");
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 text-xs font-medium rounded-lg shadow-sm transition-all shrink-0 self-start sm:self-center"
                  >
                    Copy ID
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      {...register("fullName", { required: "Required" })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Title</label>
                    <input
                      {...register("currentTitle")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin size={13} className="inline mr-1 text-gray-400" />Location
                    </label>
                    <input
                      {...register("location")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Level</label>
                    <select
                      {...register("experienceLevel")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select level</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea
                      {...register("bio")}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell employers about yourself..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── WORK EXPERIENCE TAB ── */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                {workExperience.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                    <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No work experience added</p>
                    <p className="text-gray-400 text-sm mt-1">Add your past jobs and internships</p>
                  </div>
                ) : workExperience.map((exp, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 size={16} className="text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">Experience {i + 1}</h3>
                      </div>
                      <button type="button" onClick={() => removeWorkExp(i)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Job Title *</label>
                        <input
                          value={exp.title}
                          onChange={(e) => updateWorkExp(i, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
                        <input
                          value={exp.company}
                          onChange={(e) => updateWorkExp(i, "company", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Google"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                        <input
                          value={exp.location}
                          onChange={(e) => updateWorkExp(i, "location", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Kathmandu"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateWorkExp(i, "startDate", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateWorkExp(i, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id={`current-${i}`}
                          checked={exp.current}
                          onChange={(e) => updateWorkExp(i, "current", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`current-${i}`} className="text-sm text-gray-600">Currently working here</label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateWorkExp(i, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Describe your responsibilities..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addWorkExp}
                  className="w-full py-3 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Work Experience
                </button>
              </div>
            )}

            {/* ── EDUCATION TAB ── */}
            {activeTab === "education" && (
              <div className="space-y-4">
                {education.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                    <GraduationCap size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No education added</p>
                    <p className="text-gray-400 text-sm mt-1">Add your degrees and certifications</p>
                  </div>
                ) : education.map((edu, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <GraduationCap size={16} className="text-purple-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">Education {i + 1}</h3>
                      </div>
                      <button type="button" onClick={() => removeEducation(i)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">School / University *</label>
                        <input
                          value={edu.school}
                          onChange={(e) => updateEducation(i, "school", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Tribhuvan University"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
                        <input
                          value={edu.degree}
                          onChange={(e) => updateEducation(i, "degree", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Bachelor's"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Field of Study</label>
                        <input
                          value={edu.field}
                          onChange={(e) => updateEducation(i, "field", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Year</label>
                        <input
                          type="number"
                          value={edu.startYear}
                          onChange={(e) => updateEducation(i, "startYear", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2018"
                          min="1950" max="2030"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Year</label>
                        <input
                          type="number"
                          value={edu.endYear}
                          onChange={(e) => updateEducation(i, "endYear", e.target.value)}
                          disabled={edu.current}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          placeholder="2022"
                          min="1950" max="2030"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`edu-current-${i}`}
                          checked={edu.current}
                          onChange={(e) => updateEducation(i, "current", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`edu-current-${i}`} className="text-sm text-gray-600">Currently studying</label>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full py-3 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 text-sm font-medium hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Education
                </button>
              </div>
            )}

            {/* ── SKILLS TAB ── */}
            {activeTab === "skills" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Skills
                </h2>
                <p className="text-xs text-gray-400 mb-4">Press Enter or comma to add a skill</p>
                <div className="flex flex-wrap gap-2 mb-4 min-h-12">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-full font-medium">
                      {skill}
                      <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))}>
                        <X size={12} className="hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-gray-400 text-sm">No skills added yet</p>
                  )}
                </div>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. React, Node.js, Python..."
                />
              </div>
            )}

            {/* ── RESUME TAB ── */}
            {activeTab === "resume" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Resume
                </h2>
                <p className="text-xs text-gray-400 mb-6">PDF or DOC, max 10MB</p>

                {profileData?.resumeFileName ? (
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <FileText size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Current Resume</p>
                          <p className="text-xs text-green-600 mt-0.5">{profileData.resumeFileName}</p>
                        </div>
                      </div>
                      <a href={`http://localhost:5000/uploads/${profileData.resumeFileName}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                        <CheckCircle size={13} /> View Resume
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Upload a new file to replace current resume</p>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <FileText size={18} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">No resume uploaded yet</p>
                      <p className="text-xs text-amber-600 mt-0.5">Upload your resume to apply for jobs faster</p>
                    </div>
                  </div>
                )}

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload size={28} className="text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {uploading ? "Uploading..." : profileData?.resumeFileName ? "Upload new resume" : "Click to upload resume"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== "resume" && (
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default SeekerProfile;