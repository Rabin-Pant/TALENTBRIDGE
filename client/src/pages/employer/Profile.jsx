import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  User, MapPin, Briefcase, FileText, Save,
  Upload, CheckCircle, Sparkles, X, Plus,
  Building2, Lock, Mail, Phone, Globe,
  Users, Camera, Trash2
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const COMPANY_SIZES = [
  { value: "STARTUP", label: "Startup (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Media", "Hospitality", "Construction", "Other"
];

const EmployerProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  // Modal states
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/employer/profile");
        const u = res.data.user;
        setProfileData(u);
        reset({
          fullName: u.fullName || "",
          companyName: u.companyName || "",
          companyWebsite: u.companyWebsite || "",
          companySize: u.companySize || "",
          industry: u.industry || "",
          companyDescription: u.companyDescription || "",
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

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const res = await api.put("/employer/profile", data);
      setProfileData(res.data.user);
      updateUser(res.data.user);
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
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
      const res = await api.post("/employer/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setProfileData((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      updateUser({ profilePicture: res.data.profilePicture });
      showToast("Profile picture updated!");
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
      await api.delete("/employer/profile-picture");
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
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast("Please upload an image file", "error");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("coverPicture", file);
    
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    
    try {
      setUploadingCover(true);
      const res = await api.post("/employer/cover-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setProfileData((prev) => ({ ...prev, coverPicture: res.data.coverPicture }));
      setCoverPreview(null);
      showToast("Cover photo updated!");
    } catch (err) {
      console.error(err);
      setCoverPreview(null);
      showToast(err.response?.data?.message || "Failed to upload cover photo", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCoverPicture = async () => {
    try {
      await api.delete("/employer/cover-picture");
      setProfileData((prev) => ({ ...prev, coverPicture: null }));
      showToast("Cover photo removed");
    } catch {
      showToast("Failed to remove cover photo", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  const profilePictureUrl = profileData?.profilePicture 
    ? `http://localhost:5000/uploads/${profileData.profilePicture}`
    : null;
  const coverPictureUrl = profileData?.coverPicture 
    ? `http://localhost:5000/uploads/${profileData.coverPicture}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

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
              src={profilePictureUrl} 
              alt={profileData?.fullName}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Cover Photo Modal */}
      {showCoverModal && coverPictureUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowCoverModal(false)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setShowCoverModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={coverPictureUrl} 
              alt="Cover"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

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
              <span className="text-sm text-amber-600 font-medium">Company Profile</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Company Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Keep your company information updated to attract top talent</p>
          </div>

          {/* Cover Photo Section */}
          <div className="relative h-48 bg-gray-200 rounded-t-2xl overflow-hidden group">
            {coverPreview ? (
              <img 
                src={coverPreview} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
              />
            ) : profileData?.coverPicture ? (
              <img 
                src={coverPictureUrl} 
                alt="Cover"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowCoverModal(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-400 via-teal-500 to-blue-500" />
            )}
            
            {/* Cover Photo Buttons */}
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
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {profileData?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Profile Picture Buttons */}
              <div className="absolute -bottom-2 -right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                <label className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-full cursor-pointer shadow-lg transition-all z-10">
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
              <p className="text-xs text-amber-600 mt-0.5">Email cannot be changed after registration. Contact support if needed.</p>
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
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-green-500" /> Company Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    {...register("fullName", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your name"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                  <input
                    {...register("companyName", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Acme Inc."
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Globe size={13} className="inline mr-1 text-gray-400" /> Website
                  </label>
                  <input
                    {...register("companyWebsite")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Users size={13} className="inline mr-1 text-gray-400" /> Company Size
                  </label>
                  <select
                    {...register("companySize")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                  <select
                    {...register("industry")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
                  <textarea
                    {...register("companyDescription")}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Tell candidates about your company, culture, and values..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-green-200"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EmployerProfile;