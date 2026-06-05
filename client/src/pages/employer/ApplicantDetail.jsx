import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, MapPin, Phone, Mail,
  FileText, Briefcase, CheckCircle, Save, Sparkles,
  GraduationCap, Building2, Calendar, ExternalLink,
  Award, Code, Clock
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const STATUSES = ["PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED"];

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

const SectionCard = ({ title, icon: Icon, color = "blue", children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-${color}-50`}>
      <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        <Icon size={16} className={`text-${color}-600`} />
      </div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

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
  const [activeTab, setActiveTab] = useState("profile");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
       const res = await api.get(`/employer/applicants/${id}`);
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
  const education     = applicant?.education     || [];
  const workExperience = applicant?.workExperience || [];

  const TABS = [
    { id: "profile",    label: "Profile"      },
    { id: "experience", label: "Experience"   },
    { id: "education",  label: "Education"    },
    { id: "application",label: "Application"  },
  ];

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
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to applicants
          </button>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* LEFT — Profile Card (LinkedIn style) */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cover Banner */}
                <div className="h-24 bg-gradient-to-r from-green-400 via-teal-500 to-blue-500" />

                <div className="px-6 pb-6">
                  {/* Avatar */}
                  <div className="flex items-end justify-between -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">
                        {applicant?.fullName?.charAt(0)}
                      </span>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>

                  {/* Name & Title */}
                  <h1 className="text-xl font-bold text-gray-900">{applicant?.fullName}</h1>
                  {applicant?.currentTitle && (
                    <p className="text-green-600 font-medium mt-0.5">{applicant.currentTitle}</p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {applicant?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {applicant.location}
                      </div>
                    )}
                    {applicant?.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        {applicant.email}
                      </div>
                    )}
                    {applicant?.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" />
                        +977 {applicant.phone}
                      </div>
                    )}
                    {applicant?.experienceLevel && (
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-gray-400" />
                        {applicant.experienceLevel}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {applicant?.bio && (
                    <p className="text-gray-600 text-sm mt-4 leading-relaxed border-t border-gray-100 pt-4">
                      {applicant.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === id
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Profile Tab ── */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  {/* Skills */}
                  {applicant?.skills?.length > 0 && (
                    <SectionCard title="Skills" icon={Code} color="blue">
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-full font-medium border border-blue-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </SectionCard>
                  )}

{/* Resume */}
{application?.resumeSnapshot && (
  <SectionCard title="Resume" icon={FileText} color="green">
    <a
      href={`http://localhost:5000/uploads/resumes/${application.resumeSnapshot}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{application.resumeSnapshot}</p>
          <p className="text-xs text-gray-400 mt-0.5">Click to view full resume</p>
        </div>
      </div>
      <ExternalLink size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
    </a>
  </SectionCard>
)}
                </div>
              )}

              {/* ── Experience Tab ── */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  {workExperience.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                      <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No work experience added</p>
                    </div>
                  ) : workExperience.map((exp, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                          <p className="text-blue-600 font-medium text-sm mt-0.5">{exp.company}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            {exp.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={11} />{exp.location}
                              </div>
                            )}
                            {(exp.startDate || exp.endDate) && (
                              <div className="flex items-center gap-1">
                                <Calendar size={11} />
                                {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                              </div>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm mt-3 leading-relaxed border-t border-gray-100 pt-3">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Education Tab ── */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  {education.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                      <GraduationCap size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No education added</p>
                    </div>
                  ) : education.map((edu, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                          <p className="text-purple-600 font-medium text-sm mt-0.5">
                            {edu.degree}{edu.field ? ` — ${edu.field}` : ""}
                          </p>
                          {(edu.startYear || edu.endYear) && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar size={11} />
                              {edu.startYear} — {edu.current ? "Present" : edu.endYear}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Application Tab ── */}
              {activeTab === "application" && (
                <div className="space-y-4">
                  {/* Applied For */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase size={16} className="text-green-500" /> Applied For
                    </h2>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <Briefcase size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{job?.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <Clock size={11} />
                          Applied {new Date(application.appliedAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric"
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application?.coverLetter && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" /> Cover Letter
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — Actions */}
            <div className="space-y-4">

              {/* Update Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>

                <div className="space-y-2 mb-4">
                  {STATUSES.map((s) => {
                    const colors = {
                      PENDING:     "border-gray-300 bg-gray-50 text-gray-700",
                      REVIEWING:   "border-blue-400 bg-blue-50 text-blue-700",
                      SHORTLISTED: "border-amber-400 bg-amber-50 text-amber-700",
                      ACCEPTED:    "border-green-500 bg-green-50 text-green-700",
                      REJECTED:    "border-red-400 bg-red-50 text-red-700",
                    };
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          status === s
                            ? colors[s]
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {s}
                        {status === s && <CheckCircle size={16} />}
                      </button>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Note / Feedback
                  </label>
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

              {/* Quick Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick Info</h3>
                <div className="space-y-2 text-xs text-gray-500">
                  {applicant?.experienceLevel && (
                    <div className="flex items-center justify-between">
                      <span>Experience</span>
                      <span className="font-medium text-gray-700">{applicant.experienceLevel}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Skills</span>
                    <span className="font-medium text-gray-700">{applicant?.skills?.length || 0} listed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Work Experience</span>
                    <span className="font-medium text-gray-700">{workExperience.length} entries</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Education</span>
                    <span className="font-medium text-gray-700">{education.length} entries</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Resume</span>
                    <span className={`font-medium ${applicant?.resumeFileName ? "text-green-600" : "text-red-400"}`}>
                      {applicant?.resumeFileName ? "Uploaded" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantDetail;