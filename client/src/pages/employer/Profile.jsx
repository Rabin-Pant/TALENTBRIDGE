import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, Globe, Users, Save, CheckCircle, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const COMPANY_SIZES = ["STARTUP","SMALL","MEDIUM","LARGE","ENTERPRISE"];

const EmployerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/employer/profile");
        reset(res.data.user);
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
      await api.put("/employer/profile", data);
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          <CheckCircle size={16} /> {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">Company profile</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Company Profile</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Building2 size={18} className="text-green-500" /> Company Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    {...register("fullName")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                  <input
                    {...register("companyName")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Globe size={13} className="inline mr-1 text-gray-400" />Website
                  </label>
                  <input
                    {...register("companyWebsite")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                  <input
                    {...register("industry")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Users size={13} className="inline mr-1 text-gray-400" />Company Size
                  </label>
                  <select
                    {...register("companySize")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
                  <textarea
                    {...register("companyDescription")}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Tell candidates about your company..."
                  />
                </div>
              </div>
            </div>

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