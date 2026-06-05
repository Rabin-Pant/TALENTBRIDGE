import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, DollarSign, Building2,
  Award, FileText, Send, X, Upload, CheckCircle,
  AlertCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/seeker/jobs/${id}`);
        setJob(res.data.job);
        
        // Check if user has existing resume
        const profileRes = await api.get("/seeker/profile");
        if (profileRes.data.user.resumeFileName) {
          setHasExistingResume(true);
          setResumeFileName(profileRes.data.user.resumeFileName);
        }
      } catch (err) {
        console.error(err);
        navigate("/seeker/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedTypes.includes(ext)) {
        setError("Please upload PDF, DOC, or DOCX file");
        setResumeFile(null);
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        setResumeFile(null);
        return;
      }
      setError("");
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!resumeFile && !hasExistingResume) {
      setError("Please upload your resume");
      return;
    }

    setApplying(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await api.post(`/seeker/jobs/${id}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setSuccess(false);
        navigate("/seeker/applications");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
          >
            ← Back to jobs
          </button>

          {/* Job Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
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
                  onClick={() => setShowApplyModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Job Info */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                    <p className="text-xs text-gray-400">Experience Level</p>
                    <p className="font-medium text-gray-900">{job.experienceLevel || "Not specified"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
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
                    <Clock size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Posted Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
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
            <div className="px-6 pb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description || "No description provided"}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {job.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Button at bottom */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Apply for {job?.title}</h2>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setError("");
                  setResumeFile(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Submitted!</h3>
                  <p className="text-gray-500">Your application has been sent successfully.</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {/* Company Info */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900">{job?.title}</p>
                    <p className="text-sm text-gray-500">{job?.company}</p>
                    {job?.location && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </p>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume * <span className="text-xs text-gray-400">(PDF, DOC, DOCX up to 5MB)</span>
                    </label>
                    
                    {hasExistingResume && !resumeFile && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-green-600" />
                          <span className="text-sm text-green-700">Current resume: {resumeFileName}</span>
                        </div>
                        <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Upload new?
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {(!hasExistingResume || resumeFile) && (
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <Upload size={28} className="text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">
                            {resumeFile ? resumeFile.name : "Click to upload resume"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter <span className="text-xs text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell the employer why you're a great fit for this role..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowApplyModal(false);
                        setError("");
                        setResumeFile(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={applying}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;