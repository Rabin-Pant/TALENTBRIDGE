import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Image, X, Send,
  Briefcase, Award,
  Sparkles, Users,
  UserPlus, MapPin, User
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import PostCard, { Avatar } from "../../components/PostCard";

const POST_TYPES = [
  { value: "UPDATE",       label: "Share Update" },
  { value: "ACHIEVEMENT",  label: "Achievement" },
  { value: "JOB_UPDATE",   label: "Job Update" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
];

const CreatePost = ({ onPost, user }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("UPDATE");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", type);
      if (image) formData.append("image", image);
      const res = await api.post("/feed", formData, { headers: { "Content-Type": "multipart/form-data" } });
      onPost(res.data.post);
      setContent(""); setType("UPDATE"); setImage(null); setImagePreview(null); setOpen(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-1">
      {!open && (
        <div className="flex items-center gap-3">
          <Avatar name={user?.fullName} role={user?.role} size="sm" profilePicture={user?.profilePicture} />
          <button onClick={() => setOpen(true)} className="flex-1 text-left px-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
            What's on your mind, {user?.fullName?.split(" ")[0]}?
          </button>
        </div>
      )}
      {open && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName} role={user?.role} size="sm" profilePicture={user?.profilePicture} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user?.fullName}</p>
                <select value={type} onChange={(e) => setType(e.target.value)} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50">
                  {POST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} className="text-gray-400" /></button>
          </div>
          <textarea autoFocus rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share an update, achievement, or announcement..." className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none border-0 p-0" />
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button onClick={() => { setImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-gray-900/60 text-white rounded-full p-1 hover:bg-gray-900/80 transition-colors"><X size={13} /></button>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button onClick={() => fileRef.current.click()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"><Image size={17} /> Photo</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <button onClick={handleSubmit} disabled={loading || (!content.trim() && !image)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all duration-200"><Send size={13} />{loading ? "Posting..." : "Post"}</button>
          </div>
        </div>
      )}
      {!open && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => { setOpen(true); setType("ACHIEVEMENT"); }} className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"><Award size={15} /> Achievement</button>
          <button onClick={() => { setOpen(true); setType("JOB_UPDATE"); }} className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"><Briefcase size={15} /> Job Update</button>
          <button onClick={() => { fileRef.current?.click(); setOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"><Image size={15} /> Photo</button>
        </div>
      )}
    </div>
  );
};

// ─── Suggestion Card (compact for sidebar) ───────────
const SuggestionRow = ({ user: u, onConnect }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <Link to={`/profile/${u.id}`} className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center ring-2 ring-white shadow-sm overflow-hidden">
        {u.profilePicture
          ? <img src={`http://localhost:5000/uploads/${u.profilePicture}`} alt={u.fullName} className="w-full h-full object-cover rounded-full" />
          : <User size={20} className="text-gray-400" strokeWidth={1.75} />
        }
      </div>
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/profile/${u.id}`} className="text-sm font-semibold text-gray-900 hover:underline truncate block">{u.fullName}</Link>
      <p className="text-xs text-gray-500 truncate">{u.currentTitle || u.companyName || u.role?.toLowerCase()}</p>
      {u.location && (
        <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5"><MapPin size={9} />{u.location}</p>
      )}
    </div>
    <button
      onClick={() => onConnect(u.id)}
      className="flex items-center gap-1 px-2.5 py-1 border border-blue-400 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-all duration-200 flex-shrink-0"
    >
      <UserPlus size={11} /> Connect
    </button>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, suggestRes] = await Promise.all([
          api.get("/feed?page=1"),
          api.get("/connections/suggestions"),
        ]);
        setPosts(feedRes.data.posts);
        setHasMore(feedRes.data.hasMore);
        setSuggestions(suggestRes.data.suggestions);
      } catch (err) { console.error(err); }
      finally { setLoading(false); setTimeout(() => setVisible(true), 100); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get("post");
    if (postId && posts.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`post-${postId}`);
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("ring-2", "ring-blue-400", "ring-offset-2"); setTimeout(() => el.classList.remove("ring-2", "ring-blue-400", "ring-offset-2"), 3000); }
      }, 400);
      window.history.replaceState({}, "", "/home");
    }
  }, [location.search, posts]);

  const loadMore = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await api.get(`/feed?page=${nextPage}`);
      setPosts((prev) => [...prev, ...res.data.posts]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch (err) { console.error(err); } finally { setLoadingMore(false); }
  };

  const handleNewPost  = (post) => setPosts((prev) => [post, ...prev]);
  const handleDelete   = (id)   => setPosts((prev) => prev.filter((p) => p.id !== id));
  const handleConnect  = async (targetId) => {
    try { await api.post("/connections", { receiverId: targetId }); setSuggestions((prev) => prev.filter((u) => u.id !== targetId)); }
    catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /><Sidebar />
      <main className="md:ml-64 pt-14">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                  <div className="flex gap-3 mb-4"><div className="w-11 h-11 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-2 bg-gray-100 rounded w-1/4" /></div></div>
                  <div className="space-y-2"><div className="h-3 bg-gray-100 rounded" /><div className="h-3 bg-gray-100 rounded w-4/5" /></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-14">
        <div className={`max-w-5xl mx-auto px-4 py-5 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="grid lg:grid-cols-3 gap-5">

            {/* ── Feed ── */}
            <div className="lg:col-span-2 space-y-3">
              <CreatePost onPost={handleNewPost} user={user} />

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Your feed is empty</h3>
                  <p className="text-gray-400 text-sm">Connect with people and share your first update</p>
                  <Link to="/network" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Users size={15} /> Grow your network
                  </Link>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <div key={post.id} id={`post-${post.id}`} className="transition-all duration-300">
                      <PostCard post={post} onDelete={handleDelete} user={user} />
                    </div>
                  ))}
                  {hasMore && (
                    <button onClick={loadMore} disabled={loadingMore} className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                      {loadingMore ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />Loading...</span> : "Show more posts"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-4">

              {/* People You May Know */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">People you may know</h3>
                  <Link to="/network?tab=suggestions" className="text-xs text-blue-600 hover:underline font-medium">See all</Link>
                </div>
                {suggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <Users size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No suggestions right now</p>
                    <Link to="/network?tab=suggestions" className="text-xs text-blue-600 hover:underline mt-1 block">Browse network</Link>
                  </div>
                ) : (
                  suggestions.slice(0, 5).map((u) => (
                    <SuggestionRow key={u.id} user={u} onConnect={handleConnect} />
                  ))
                )}
              </div>

              {/* Footer */}
              <p className="text-xs text-gray-400 text-center px-2">
                TalentBridge © 2026 · <Link to="/network" className="hover:underline">Network</Link> · <Link to="/messages" className="hover:underline">Messages</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;