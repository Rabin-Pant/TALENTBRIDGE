import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, MapPin, Phone, Mail,
  FileText, Briefcase, CheckCircle, Save, Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const STATUSES = ["PENDING","REVIEWING","SHORTLISTED","ACCEPTED","REJECTED"];

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:     "bg-gray-100 text-gray-600",
    REVIEWING:   "bg-blue-100 text-blue-600",
    SHORTLISTED: "bg-amber-100 text-amber-600",
    ACCEPTED:    "bg-green-100 text-green-600",
    REJECTED:    "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
};

const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/employer/applications/${id}`);
        setApplication(res.data.application);
        setStatus(res.data.application.status);
        setNote(res.data.application.employerNote || "");
      } catch {
        navigate("/employer/applicants");
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/employer/applications/${id}/status`, { status, employerNote: note });
      showToast("Application updated successfully!");
      setApplication({ ...application, status, employerNote: note });
    } catch {
      showToast("Failed to update", "error");
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

  const { applicant, job } = application;

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
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to applicants
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left — Applicant Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-2xl">{applicant?.fullName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">{applicant?.fullName}</h1>
                    {applicant?.currentTitle && <p className="text-green-600 font-medium">{applicant.currentTitle}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                      {applicant?.email && (
                        <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" />{applicant.email}</div>
                      )}
                      {applicant?.phone && (
                        <div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" />{applicant.phone}</div>
                      )}
                      {applicant?.location && (
                        <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" />{applicant.location}</div>
                      )}
                    </div>
                  </div>
                </div>

                {applicant?.bio && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">BIO</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{applicant.bio}</p>
                  </div>
                )}

                {applicant?.skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">SKILLS</p>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((s) => (
                        <span key={s} className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              {application?.coverLetter && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Cover Letter
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              {/* Resume */}
              {applicant?.resumeFileName && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" /> Resume
                  </h2>
                  
                    <a href={`http://localhost:5000/uploads/${applicant.resumeFileName}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors">
  <FileText size={20} className="text-green-500" />
  <span className="text-sm font-medium text-gray-700">{applicant.resumeFileName}</span>
</a>
                </div>
              )}
            </div>

            {/* Right — Actions */}
            <div className="space-y-4">

              {/* Job Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Applied For</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Briefcase size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{job?.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>

                <div className="space-y-2 mb-4">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        status === s
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {s}
                      {status === s && <CheckCircle size={16} className="text-green-500" />}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Note / Feedback</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Leave feedback for the applicant..."
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantDetail;