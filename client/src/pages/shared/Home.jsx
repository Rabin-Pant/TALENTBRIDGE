import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart, MessageCircle, Send, Image, X,
  Briefcase, Award, Megaphone, FileText,
  MoreHorizontal, Trash2, Sparkles, Users,
  ChevronDown, ChevronUp, UserPlus, Globe, MapPin
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const POST_TYPES = [
  { value: "UPDATE",       label: "Share Update",  icon: Globe,     color: "blue"   },
  { value: "ACHIEVEMENT",  label: "Achievement",   icon: Award,     color: "amber"  },
  { value: "JOB_UPDATE",   label: "Job Update",    icon: Briefcase, color: "green"  },
  { value: "ANNOUNCEMENT", label: "Announcement",  icon: Megaphone, color: "purple" },
];

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Avatar = ({ name, role, size = "sm", profilePicture }) => {
  const sizes = { xs: "w-7 h-7 text-xs", sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-14 h-14 text-xl" };
  const colors = {
    SEEKER:   "from-blue-500 to-indigo-600",
    EMPLOYER: "from-emerald-500 to-teal-600",
    ADMIN:    "from-rose-500 to-red-600",
  };
  const profilePictureUrl = profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : null;
  if (profilePictureUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-2 ring-white`}>
        <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white`}>
      <span className="text-white font-bold leading-none">{name?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const PostTypeTag = ({ type }) => {
  const t = POST_TYPES.find((p) => p.value === type);
  if (!t || t.value === "UPDATE") return null;
  const Icon = t.icon;
  const colors = { blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-violet-50 text-violet-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[t.color]}`}>
      <Icon size={10} />{t.label}
    </span>
  );
};

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

const CommentSection = ({ postId, initialComments = [], initialCount = 0, user, postAuthorId }) => {
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(initialCount);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // 👇 New state to track if a user is currently replying to someone
  const [replyingTo, setReplyingTo] = useState(null); 

  const loadAll = async () => {
    if (fetching) return;
    try { 
      setFetching(true); 
      const res = await api.get(`/feed/${postId}/comments`); 
      setComments(res.data.comments); 
      setExpanded(true); 
    }
    catch (err) { console.error(err); } finally { setFetching(false); }
  };

  const handleComment = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      // Pass parentId if we are replying
      const payload = { content: text, parentId: replyingTo?.id || null };
      const res = await api.post(`/feed/${postId}/comment`, payload);
      
      if (replyingTo) {
        // Append reply visually to the parent comment
        setComments((prev) => prev.map(c => c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c));
      } else {
        setComments((prev) => [...prev, res.data.comment]);
      }
      
      setCount((c) => c + 1); 
      setText(""); 
      setReplyingTo(null); // Clear reply state
      setExpanded(true);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/feed/comment/${commentId}`);
      // Visually remove it from state (checks both top level and replies)
      setComments((prev) => prev.filter(c => c.id !== commentId).map(c => ({
        ...c,
        replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
      })));
      setCount((c) => c - 1);
    } catch (err) { console.error(err); alert("Failed to delete comment"); }
  };

  const CommentBlock = ({ c, isReply = false }) => (
    <div className={`flex items-start gap-2 ${isReply ? "mt-2" : "mt-3"}`}>
      <Avatar name={c.author?.fullName} role={c.author?.role} size="xs" profilePicture={c.author?.profilePicture} />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
          <div className="flex items-baseline gap-2">
            <Link to={`/profile/${c.author?.id}`} className="text-xs font-semibold text-gray-900 hover:underline">{c.author?.fullName}</Link>
            <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5 leading-snug">{c.content}</p>
        </div>
        
        {/* ACTION BUTTONS (Reply & Delete) */}
        <div className="flex items-center gap-3 px-2 mt-0.5 mb-1">
          {!isReply && (
            <button onClick={() => setReplyingTo({ id: c.id, name: c.author?.fullName })} className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 transition-colors">
              Reply
            </button>
          )}
          {(user?.id === c.author?.id || user?.id === postAuthorId) && (
            <button onClick={() => handleDeleteComment(c.id)} className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors">
              Delete
            </button>
          )}
        </div>

        {/* Render Replies if they exist */}
        {!isReply && c.replies && c.replies.length > 0 && (
          <div className="pl-6 border-l-2 border-gray-100 ml-2">
            {c.replies.map(reply => <CommentBlock key={reply.id} c={reply} isReply={true} />)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {count > 0 && !expanded && (
        <button onClick={loadAll} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors">
          <ChevronDown size={13} />{fetching ? "Loading..." : `View ${count} comment${count > 1 ? "s" : ""}`}
        </button>
      )}
      
      {expanded && (
        <div>
          <button onClick={() => setExpanded(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2 transition-colors"><ChevronUp size={13} /> Hide comments</button>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {comments.map((c) => <CommentBlock key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-lg mb-2 border border-blue-100">
          <span className="text-xs text-blue-700">Replying to <strong>{replyingTo.name}</strong></span>
          <button onClick={() => setReplyingTo(null)} className="text-blue-500 hover:text-blue-700"><X size={14}/></button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Avatar name={user?.fullName} role={user?.role} size="xs" profilePicture={user?.profilePicture} />
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleComment()} 
            placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Write a comment..."} 
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400" 
          />
          {text.trim() && <button onClick={handleComment} disabled={loading} className="text-blue-600 disabled:opacity-40 hover:text-blue-700 transition-colors"><Send size={14} /></button>}
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, onDelete, user }) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLike = async () => {
    setLiked(!liked); setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try { await api.post(`/feed/${post.id}/like`); }
    catch { setLiked(!liked); setLikesCount(liked ? likesCount + 1 : likesCount - 1); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try { await api.delete(`/feed/${post.id}`); onDelete(post.id); } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?.id}`}>
            <Avatar name={post.author?.fullName} role={post.author?.role} size="md" profilePicture={post.author?.profilePicture} />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/profile/${post.author?.id}`} className="font-semibold text-gray-900 text-sm hover:underline">{post.author?.fullName}</Link>
              {post.isConnected && <span className="text-xs text-gray-400 font-normal">· 1st</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">{post.author?.currentTitle || post.author?.companyName || post.author?.role?.toLowerCase()}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
              <span className="text-gray-300">·</span>
              <Globe size={10} className="text-gray-400" />
              <PostTypeTag type={post.type} />
            </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><MoreHorizontal size={18} className="text-gray-400" /></button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 z-20">
              <Link to={`/profile/${post.author?.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowMenu(false)}>View Profile</Link>
              {post.isOwn && <button onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /> Delete Post</button>}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-3"><p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p></div>
      {post.image && (
        <div className="cursor-zoom-in overflow-hidden border-y border-gray-100" onClick={() => setImgExpanded(!imgExpanded)}>
          <img src={`http://localhost:5000/uploads/${post.image}`} alt="post" className={`w-full object-cover transition-all duration-300 ${imgExpanded ? "max-h-[600px]" : "max-h-80"}`} />
        </div>
      )}
      {(likesCount > 0 || post._count?.comments > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
          {likesCount > 0 && (
            <button onClick={handleLike} className="flex items-center gap-1 hover:underline">
              <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"><Heart size={8} className="text-white fill-white" /></span>
              {likesCount}
            </button>
          )}
          {post._count?.comments > 0 && <button onClick={() => setShowComments(!showComments)} className="ml-auto hover:underline">{post._count.comments} comment{post._count.comments > 1 ? "s" : ""}</button>}
        </div>
      )}
      <div className="flex items-center border-t border-gray-100 px-2 py-1">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${liked ? "text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
          <Heart size={17} className={liked ? "fill-blue-600" : ""} /> Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <MessageCircle size={17} /> Comment
        </button>
        <Link to="/messages" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <Send size={17} /> Send
        </Link>
      </div>
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
<CommentSection 
  postId={post.id} 
  initialComments={post.comments || []} 
  initialCount={post._count?.comments || 0} 
  user={user} 
  postAuthorId={post.author?.id} 
/>
        </div>
      )}
    </div>
  );
};

// ─── Suggestion Card (compact for sidebar) ───────────
const SuggestionRow = ({ user: u, onConnect }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <Link to={`/profile/${u.id}`} className="flex-shrink-0">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${u.role === "EMPLOYER" ? "from-emerald-500 to-teal-600" : "from-blue-500 to-indigo-600"} flex items-center justify-center ring-2 ring-white shadow-sm`}>
        {u.profilePicture
          ? <img src={`http://localhost:5000/uploads/${u.profilePicture}`} alt={u.fullName} className="w-full h-full object-cover rounded-full" />
          : <span className="text-white font-bold text-sm">{u.fullName?.charAt(0)?.toUpperCase()}</span>
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
                  <Link to="/network" className="text-xs text-blue-600 hover:underline font-medium">See all</Link>
                </div>
                {suggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <Users size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No suggestions right now</p>
                    <Link to="/network" className="text-xs text-blue-600 hover:underline mt-1 block">Browse network</Link>
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