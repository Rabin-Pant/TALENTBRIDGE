import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Briefcase, DollarSign, Clock, Building2,
  Globe, Users, CheckCircle, ArrowLeft, Send, X, Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const formatJobType = (type) => type?.replace("_", " ");

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/seeker/jobs/${id}`);
        setJob(res.data.job);
      } catch {
        navigate("/seeker/jobs");
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setError("");
      await api.post(`/seeker/jobs/${id}/apply`, { coverLetter });
      setApplied(true);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
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

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to jobs
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Job Header Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-2xl">{job.company?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                    <p className="text-blue-600 font-medium mt-0.5">{job.company}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-gray-400" />
                        {formatJobType(job.jobType)}
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-gray-400" />
                          {job.salaryMin && `$${job.salaryMin.toLocaleString()}`}
                          {job.salaryMin && job.salaryMax && " – "}
                          {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {job.skills?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">REQUIRED SKILLS</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  Job Description
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Benefits</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {job.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                {applied ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={28} className="text-green-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Applied!</h3>
                    <p className="text-sm text-gray-500 mt-1">Your application has been submitted</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-1">Ready to apply?</h3>
                    <p className="text-sm text-gray-500 mb-4">Submit your application for this position</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                    >
                      <Send size={16} />
                      Apply Now
                    </button>
                  </>
                )}
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={15} className="text-gray-400" />
                    <span>{job.employer?.companyName || job.company}</span>
                  </div>
                  {job.employer?.companyWebsite && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe size={15} className="text-gray-400" />
                      <a href={job.employer.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                        {job.employer.companyWebsite}
                      </a>
                    </div>
                  )}
                  {job.employer?.companySize && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={15} className="text-gray-400" />
                      <span>{job.employer.companySize} employees</span>
                    </div>
                  )}
                  {job.employer?.companyDescription && (
                    <p className="text-gray-500 text-xs leading-relaxed mt-2 pt-2 border-t border-gray-100">
                      {job.employer.companyDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Industry",    value: job.industry },
                    { label: "Experience",  value: job.experienceLevel },
                    { label: "Job Type",    value: formatJobType(job.jobType) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Apply for {job.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;