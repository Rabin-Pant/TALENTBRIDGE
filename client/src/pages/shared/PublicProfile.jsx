import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap,
  Building2, Calendar, ArrowLeft, MessageCircle,
  UserPlus, UserCheck, UserX, Clock, Award,
  Code, FileText, ExternalLink, Sparkles, X
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const Avatar = ({ name, role, size = "lg", profilePicture }) => {
  const sizes = { sm: "w-10 h-10 text-sm", md: "w-14 h-14 text-xl", lg: "w-20 h-20 text-3xl" };
  const colors = {
    SEEKER:   "from-blue-500 to-purple-600",
    EMPLOYER: "from-green-500 to-teal-600",
    ADMIN:    "from-red-500 to-orange-500",
  };
  
  const profilePictureUrl = profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : null;
  
  if (profilePictureUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300`}>
        <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center flex-shrink-0 border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connStatus, setConnStatus] = useState({ status: "NONE", connectionId: null, isSender: false });
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [connecting, setConnecting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const isOwnProfile = userId === currentUser?.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const [profileRes, postsRes, statusRes] = await Promise.all([
          api.get(`/connections/public-profile/${userId}`),
          api.get(`/feed/user/${userId}`),
          !isOwnProfile
            ? api.get(`/connections/status/${userId}`)
            : Promise.resolve({ data: { status: "SELF" } }),
        ]);

        console.log("Profile data:", profileRes.data);
        
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts || []);
        if (!isOwnProfile) setConnStatus(statusRes.data);
        
      } catch (err) {
        console.error("Profile fetch error:", err);
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, isOwnProfile]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await api.post("/connections", { receiverId: userId });
      setConnStatus({ status: "PENDING", isSender: true });
      showToast("Connection request sent!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setConnecting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.delete(`/connections/${connStatus.connectionId}`);
      setConnStatus({ status: "NONE", connectionId: null });
      showToast("Request withdrawn");
    } catch {
      showToast("Failed", "error");
    }
  };

  const handleMessage = async () => {
    try {
      setMessaging(true);
      const res = await api.get(`/messages/conversations/${userId}/get-or-create`);
      if (res.data.conversation && res.data.conversation.id) {
        navigate(`/messages/${res.data.conversation.id}`);
      } else {
        showToast("Could not start conversation", "error");
      }
    } catch (err) {
      console.error("Message error:", err);
      showToast(err.response?.data?.message || "Failed to start conversation", "error");
    } finally {
      setMessaging(false);
    }
  };

  const ConnectButton = () => {
    if (isOwnProfile) return null;

    if (connStatus.status === "ACCEPTED") return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-200">
          <UserCheck size={15} /> Connected
        </span>
        <button
          onClick={handleMessage}
          disabled={messaging}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <MessageCircle size={15} />
          {messaging ? "Opening..." : "Message"}
        </button>
      </div>
    );

    if (connStatus.status === "PENDING" && connStatus.isSender) return (
      <button
        onClick={handleWithdraw}
        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Clock size={15} /> Pending
      </button>
    );

    if (connStatus.status === "PENDING" && !connStatus.isSender) return (
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            await api.put(`/connections/${connStatus.connectionId}/respond`, { action: "ACCEPT" });
            setConnStatus({ ...connStatus, status: "ACCEPTED" });
            showToast("Connection accepted!");
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserCheck size={15} /> Accept
        </button>
        <button
          onClick={async () => {
            await api.put(`/connections/${connStatus.connectionId}/respond`, { action: "DECLINE" });
            setConnStatus({ status: "NONE" });
          }}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <UserX size={15} /> Decline
        </button>
      </div>
    );

    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <UserPlus size={15} />
        {connecting ? "Sending..." : "Connect"}
      </button>
    );
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  const TABS = [
    { id: "about", label: "About" },
    { id: "posts", label: `Posts (${posts.length})` },
  ];

  const education = profile?.education || [];
  const workExperience = profile?.workExperience || [];

  const profilePictureUrl = profile?.profilePicture ? `http://localhost:5000/uploads/${profile.profilePicture}` : null;
  const coverPictureUrl = profile?.coverPicture ? `http://localhost:5000/uploads/${profile.coverPicture}` : null;

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
              alt={profile?.fullName}
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
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            
            {/* Cover Photo */}
            <div 
              className="relative h-40 bg-gray-200 overflow-hidden cursor-pointer group/cover"
              onClick={() => coverPictureUrl && setShowCoverModal(true)}
            >
              {coverPictureUrl ? (
                <img 
                  src={coverPictureUrl} 
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${
                  profile?.role === "EMPLOYER"
                    ? "from-green-400 via-teal-500 to-blue-500"
                    : "from-blue-400 via-purple-500 to-pink-500"
                }`} />
              )}
              {coverPictureUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to view full size</span>
                </div>
              )}
            </div>

            {/* Profile Picture - Overlapping the cover */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-12 mb-4 flex-wrap gap-3">
                <div 
                  className="cursor-pointer"
                  onClick={() => profilePictureUrl && setShowProfilePicModal(true)}
                >
                  <Avatar 
                    name={profile?.fullName} 
                    role={profile?.role} 
                    size="lg"
                    profilePicture={profile?.profilePicture}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ConnectButton />
                  {!isOwnProfile && connStatus.status === "ACCEPTED" && (
                    <button
                      onClick={handleMessage}
                      disabled={messaging}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <MessageCircle size={15} /> Message
                    </button>
                  )}
                  {isOwnProfile && (
                    <Link
                      to={profile?.role === "SEEKER" ? "/seeker/profile" : "/employer/profile"}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900">{profile?.fullName || "User"}</h1>
              {(profile?.currentTitle || profile?.companyName) && (
                <p className={`font-medium mt-0.5 ${profile?.role === "EMPLOYER" ? "text-green-600" : "text-blue-600"}`}>
                  {profile?.currentTitle || profile?.companyName}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {profile?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />{profile.location}
                  </div>
                )}
                {profile?.experienceLevel && (
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-gray-400" />{profile.experienceLevel}
                  </div>
                )}
                {profile?.industry && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-gray-400" />{profile.industry}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-5">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── About Tab ── */}
          {activeTab === "about" && (
            <div className="space-y-5">

              {/* Bio */}
              {profile?.bio && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> About
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Seeker Info */}
              {profile?.role === "SEEKER" && (
                <>
                  {/* Skills */}
                  {profile?.skills?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Code size={16} className="text-blue-500" /> Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-full font-medium border border-blue-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {workExperience.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-blue-500" /> Experience
                      </h2>
                      <div className="space-y-5">
                        {workExperience.map((exp, i) => (
                          <div key={i} className={`flex items-start gap-4 ${i > 0 ? "pt-5 border-t border-gray-100" : ""}`}>
                            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                              <p className="text-blue-600 text-sm font-medium">{exp.company}</p>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                {exp.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} />{exp.location}
                                  </span>
                                )}
                                {(exp.startDate || exp.endDate) && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={11} />
                                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                                  </span>
                                )}
                              </div>
                              {exp.description && (
                                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap size={16} className="text-purple-500" /> Education
                      </h2>
                      <div className="space-y-5">
                        {education.map((edu, i) => (
                          <div key={i} className={`flex items-start gap-4 ${i > 0 ? "pt-5 border-t border-gray-100" : ""}`}>
                            <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <GraduationCap size={18} className="text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                              <p className="text-purple-600 text-sm font-medium">
                                {edu.degree}{edu.field ? ` — ${edu.field}` : ""}
                              </p>
                              {(edu.startYear || edu.endYear) && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Calendar size={11} />
                                  {edu.startYear} — {edu.current ? "Present" : edu.endYear}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {profile?.resumeFileName && connStatus.status === "ACCEPTED" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-green-500" /> Resume
                      </h2>
                      <a href={`http://localhost:5000/uploads/${profile.resumeFileName}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">View Resume</p>
                            <p className="text-xs text-gray-400">PDF Document</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                      </a>
                    </div>
                  )}
                </>
              )}

              {/* Employer Info */}
              {profile?.role === "EMPLOYER" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 size={16} className="text-green-500" /> Company Info
                  </h2>
                  <div className="space-y-3 text-sm">
                    {profile.companyName && (
                      <div className="flex items-center gap-3">
                        <Building2 size={15} className="text-gray-400" />
                        <span className="text-gray-700">{profile.companyName}</span>
                      </div>
                    )}
                    {profile.companyWebsite && (
                      <div className="flex items-center gap-3">
                        <ExternalLink size={15} className="text-gray-400" />
                        <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {profile.companyWebsite}
                        </a>
                      </div>
                    )}
                    {profile.companySize && (
                      <div className="flex items-center gap-3">
                        <Award size={15} className="text-gray-400" />
                        <span className="text-gray-700">{profile.companySize} company</span>
                      </div>
                    )}
                    {profile.companyDescription && (
                      <p className="text-gray-600 leading-relaxed mt-2 pt-2 border-t border-gray-100">
                        {profile.companyDescription}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Posts Tab ── */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <Sparkles size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar 
                        name={profile?.fullName} 
                        role={profile?.role} 
                        size="sm"
                        profilePicture={profile?.profilePicture}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{profile?.fullName}</p>
                        <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
                    {post.image && (
                      <img
                        src={`http://localhost:5000/uploads/${post.image}`}
                        alt="post"
                        className="w-full rounded-xl mt-3 object-cover max-h-64"
                      />
                    )}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      <span>{post._count?.likes || 0} likes</span>
                      <span>{post._count?.comments || 0} comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;