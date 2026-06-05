import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, DollarSign, Building2,
  Award, FileText, ArrowLeft, Users, Calendar,
  CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-600",
    CLOSED: "bg-gray-100 text-gray-600",
    DRAFT:  "bg-amber-100 text-amber-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};

const AdminJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/admin/jobs/${id}`);
        setJob(res.data.job);
      } catch (err) {
        console.error(err);
        showToast("Failed to load job details", "error");
        setTimeout(() => navigate("/admin/jobs"), 2000);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/jobs/${id}`);
      showToast("Job deleted successfully");
      setTimeout(() => navigate("/admin/jobs"), 1500);
    } catch {
      showToast("Failed to delete job", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* Back Button */}
          <button
            onClick={() => navigate("/admin/jobs")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </button>

          {/* Job Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-600">{job.company}</span>
                    {job.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-gray-600">{job.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? "Deleting..." : "Delete Job"}
                </button>
              </div>
            </div>

            {/* Job Info Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Job Type</p>
                  <p className="font-medium text-gray-900">{job.jobType || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Experience</p>
                  <p className="font-medium text-gray-900">{job.experienceLevel || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Salary Range</p>
                  <p className="font-medium text-gray-900">
                    {job.salaryMin && job.salaryMax 
                      ? `$${job.salaryMin} - $${job.salaryMax}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Applications</p>
                  <p className="font-medium text-gray-900">{job._count?.applications || 0}</p>
                </div>
              </div>
            </div>

            {/* Employer Info */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-blue-500" />
                Employer Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900">{job.employer?.companyName || job.employer?.fullName}</p>
                <p className="text-sm text-gray-500 mt-1">{job.employer?.email}</p>
                {job.employer?.companyWebsite && (
                  <a 
                    href={job.employer.companyWebsite} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    {job.employer.companyWebsite}
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-purple-500" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Job Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description || "No description provided"}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Requirements
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {job.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Posted Date */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  Posted on {new Date(job.postedAt).toLocaleDateString()}
                </div>
                {job.updatedAt !== job.postedAt && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={14} />
                    Last updated on {new Date(job.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminJobDetail;