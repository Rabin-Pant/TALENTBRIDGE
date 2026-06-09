import { useState, useEffect } from "react";
import {
  Newspaper, Trash2, Heart, MessageCircle,
  Sparkles, Search, Image as ImageIcon, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: "bg-red-50 text-red-600 border border-red-100",
    EMPLOYER: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    SEEKER: "bg-blue-50 text-blue-600 border border-blue-100",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${styles[role] || styles.SEEKER}`}>
      {role}
    </span>
  );
};

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
      showToast("Failed to load feed posts", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
  
  try {
    setDeletingId(id);
    
    // Smooth and clean simple DELETE request
    await api.delete(`/admin/posts/${id}`);
    
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast("Post deleted successfully");
  } catch (err) {
    console.error("Admin delete action failed:", err);
    showToast("Failed to delete post", "error");
  } finally {
    setDeletingId(null);
  }
};
  const filtered = posts.filter((p) =>
    !search ||
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p._count?.comments || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-50" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-medium text-gray-400">Loading feed directory...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 md:pl-64 pt-20 pb-10 transition-all duration-300">
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-slideIn ${
          toast.type === "success" ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-rose-600 text-white shadow-rose-100"
        }`}>
          {toast.type === "error" && <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* ─── Header ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Newspaper className="text-blue-600" size={26} />
                Feed Posts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor, review, and moderate community posts across the platform timeline.
              </p>
            </div>
            <button 
              onClick={fetchPosts}
              className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* ─── Stats Grid ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Newspaper size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Publications</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalPosts}</h3>
              </div>
            </div>

            <div className="bg-white border border-gray-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Heart size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Accumulated Likes</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalLikes}</h3>
              </div>
            </div>

            <div className="bg-white border border-gray-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">User Responses</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalComments}</h3>
              </div>
            </div>
          </div>

          {/* ─── Search ─── */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search timeline content, creators, or account emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* ─── Post Cards Loop ─── */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/70 shadow-sm flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <Newspaper size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">No Match Found</p>
                <p className="text-xs text-gray-400 mt-0.5">We couldn't find any posts matching your search criteria.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md/50 transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* User Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200/60 flex items-center justify-center flex-shrink-0 border border-gray-200/40 shadow-inner font-bold text-sm text-gray-700">
                      {post.author?.fullName?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Author Line */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm tracking-tight">
                          {post.author?.fullName}
                        </span>
                        <RoleBadge role={post.author?.role} />
                        <span className="text-xs text-gray-400 font-normal hidden md:inline">
                          • {post.author?.email}
                        </span>
                      </div>

                      {/* Time Marker & User ID */}
<div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 mt-1 mb-3">
  <Clock size={12} className="flex-shrink-0" />
  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
  
  <span className="text-gray-300 hidden sm:inline">•</span>
  
  {/* Displays the unique account ID right on the card */}
  <span className="bg-gray-100 font-mono px-1.5 py-0.5 rounded text-[10px] text-gray-500 tracking-tight">
    UID: {post.author?.id}
  </span>
</div>

                      {/* Content text */}
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words pr-2 mb-3">
                        {post.content}
                      </p>

                      {/* ─── RENDERS POSTED IMAGE ATTACHMENT HERE ─── */}
                      {post.image && (
                        <div className="mt-3 mb-4 max-w-xl rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner group relative">
                          <img 
                            src={`http://localhost:5000/uploads/${post.image}`} 
                            alt="Post attachment" 
                            className="max-h-80 w-auto object-contain rounded-2xl transition-transform duration-200 group-hover:scale-[1.01]"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                            }}
                          />
                          <div className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] bg-black/60 text-white backdrop-blur-md px-2 py-0.5 rounded-md font-medium">
                            <ImageIcon size={11} />
                            <span>Attachment View</span>
                          </div>
                        </div>
                      )}

                      {/* Metrics Footer */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-50 text-xs font-semibold text-gray-400">
                        <span className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                          <Heart size={14} className="text-gray-300" /> 
                          {post._count?.likes || 0} <span className="font-medium text-gray-400/80">likes</span>
                        </span>
                        <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageCircle size={14} className="text-gray-300" /> 
                          {post._count?.comments || 0} <span className="font-medium text-gray-400/80">comments</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Moderate Actions */}
                  <div className="sm:self-start flex-shrink-0 pt-1 border-t border-gray-100 sm:border-t-0 mt-2 sm:mt-0 flex justify-end">
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-100 bg-rose-50/50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Trash2 size={13} />
                      {deletingId === post.id ? "Processing..." : "Remove Post"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPosts;