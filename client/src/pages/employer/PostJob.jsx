import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PlusCircle, Save, ArrowLeft, X, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const JOB_TYPES     = ["FULL_TIME","PART_TIME","CONTRACT","FREELANCE","INTERNSHIP","REMOTE"];
const EXPERIENCE    = ["ENTRY","JUNIOR","MID","SENIOR","LEAD","EXECUTIVE"];

const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [benefits, setBenefits] = useState([""]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    if (isEdit) {
      api.get(`/employer/jobs`).then((res) => {
        const job = res.data.jobs.find((j) => j.id === id);
        if (job) {
          reset({
            title: job.title, description: job.description,
            location: job.location, jobType: job.jobType,
            experienceLevel: job.experienceLevel, industry: job.industry,
            salaryMin: job.salaryMin, salaryMax: job.salaryMax,
          });
          setSkills(job.skills || []);
          setRequirements(job.requirements?.length ? job.requirements : [""]);
          setBenefits(job.benefits?.length ? job.benefits : [""]);
        }
      });
    }
  }, [id]);

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
      setLoading(true);
      const payload = {
        ...data,
        skills,
        requirements: requirements.filter(Boolean),
        benefits: benefits.filter(Boolean),
      };
      if (isEdit) {
        await api.put(`/employer/jobs/${id}`, payload);
        showToast("Job updated successfully!");
      } else {
        await api.post("/employer/jobs", payload);
        showToast("Job posted successfully!");
        setTimeout(() => navigate("/employer/jobs"), 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{isEdit ? "Edit job" : "New job posting"}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Job" : "Post a Job"}</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Job Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
                  <input
                    {...register("title", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                  <input
                    {...register("location", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Kathmandu, Nepal"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry *</label>
                  <input
                    {...register("industry", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Technology"
                  />
                  {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type *</label>
                  <select
                    {...register("jobType", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select type</option>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                  {errors.jobType && <p className="text-red-500 text-xs mt-1">{errors.jobType.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Level *</label>
                  <select
                    {...register("experienceLevel", { required: "Required" })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select level</option>
                    {EXPERIENCE.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Salary ($)</label>
                  <input
                    type="number"
                    {...register("salaryMin")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Salary ($)</label>
                  <input
                    type="number"
                    {...register("salaryMax")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 80000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    {...register("description", { required: "Required" })}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Required Skills</h2>
              <p className="text-xs text-gray-400 mb-4">Press Enter or comma to add</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full font-medium">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))}>
                      <X size={12} className="hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. React, Node.js..."
              />
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-2">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={req}
                      onChange={(e) => {
                        const updated = [...requirements];
                        updated[i] = e.target.value;
                        setRequirements(updated);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Requirement ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                      className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRequirements([...requirements, ""])}
                className="mt-3 flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
              >
                <PlusCircle size={14} /> Add requirement
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Benefits</h2>
              <div className="space-y-2">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={benefit}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[i] = e.target.value;
                        setBenefits(updated);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Benefit ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => setBenefits(benefits.filter((_, j) => j !== i))}
                      className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBenefits([...benefits, ""])}
                className="mt-3 flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
              >
                <PlusCircle size={14} /> Add benefit
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-green-200"
            >
              {isEdit ? <Save size={16} /> : <PlusCircle size={16} />}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Post Job"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostJob;