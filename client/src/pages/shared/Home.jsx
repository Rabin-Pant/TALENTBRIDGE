import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart, MessageCircle, Send, Image, X,
  Briefcase, Award, Megaphone, FileText,
  MoreHorizontal, Trash2, Sparkles, Users,
  ChevronDown, ChevronUp
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const POST_TYPES = [
  { value: "UPDATE",       label: "Share Update",     icon: FileText,  color: "blue"   },
  { value: "ACHIEVEMENT",  label: "Achievement",       icon: Award,     color: "amber"  },
  { value: "JOB_UPDATE",   label: "Job Update",        icon: Briefcase, color: "green"  },
  { value: "ANNOUNCEMENT", label: "Announcement",      icon: Megaphone, color: "purple" },
];

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Avatar = ({ name, size = "sm", role, profilePicture }) => {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-14 h-14 text-xl" };
  const colors = {
    SEEKER:   "from-blue-500 to-purple-600",
    EMPLOYER: "from-green-500 to-teal-600",
    ADMIN:    "from-red-500 to-orange-500",
  };
  
 const profilePictureUrl = profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : null;
  
  if (profilePictureUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-white`}>
        <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 hover:scale-105`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const PostTypeTag = ({ type }) => {
  const t = POST_TYPES.find((p) => p.value === type);
  if (!t) return null;
  const Icon = t.icon;
  const colors = {
    blue:   "bg-blue-100 text-blue-600",
    amber:  "bg-amber-100 text-amber-600",
    green:  "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[t.color]} animate-fadeIn`}>
      <Icon size={11} />{t.label}
    </span>
  );
};

const CreatePost = ({ onPost }) => {
  const { user } = useAuth();
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
      const res = await api.post("/feed", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPost(res.data.post);
      setContent("");
      setType("UPDATE");
      setImage(null);
      setImagePreview(null);
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 mb-4">
      {!open ? (
        <div className="flex items-center gap-3 group">
          <Avatar name={user?.fullName} role={user?.role} size="sm" />
          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left px-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-gray-600 transition-all duration-200 group-hover:shadow-sm"
          >
            Share something, {user?.fullName?.split(" ")[0]}...
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName} role={user?.role} size="sm" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{user?.fullName}</p>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-0.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {POST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-90">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <textarea
            autoFocus
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share an update, achievement, or announcement..."
            className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-3 border border-gray-200 transition-all"
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden animate-fadeIn">
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-all duration-200 hover:scale-110"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={() => fileRef.current.click()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-all duration-200 hover:gap-3"
            >
              <Image size={18} /> Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && !image)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <Send size={14} />
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ postId, initialComments = [], initialCount = 0 }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(initialCount);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadAll = async () => {
    if (fetching) return;
    try {
      setFetching(true);
      const res = await api.get(`/feed/${postId}/comments`);
      setComments(res.data.comments);
      setExpanded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleComment = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const res = await api.post(`/feed/${postId}/comment`, { content: text });
      setComments((prev) => [...prev, res.data.comment]);
      setCount((c) => c + 1);
      setText("");
      setExpanded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {count > 0 && !expanded && (
        <button
          onClick={loadAll}
          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-all duration-200 hover:gap-2"
        >
          <ChevronDown size={14} className="transition-transform duration-200" />
          {fetching ? "Loading..." : `View ${count} comment${count > 1 ? "s" : ""}`}
        </button>
      )}

      {expanded && (
        <div className="animate-slideDown">
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-all duration-200 hover:gap-2"
          >
            <ChevronUp size={14} /> Hide comments
          </button>
          <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
            {comments.map((c, idx) => (
              <div key={c.id} className="flex items-start gap-2 animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                <Avatar name={c.author?.fullName} role={c.author?.role} size="sm" />
                <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-50 hover:to-gray-100 rounded-xl px-3 py-2 transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${c.author?.id}`} className="text-xs font-semibold text-gray-900 hover:underline">
                      {c.author?.fullName}
                    </Link>
                    <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Avatar name={user?.fullName} role={user?.role} size="sm" />
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 hover:bg-gray-100 transition-all duration-200">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleComment}
            disabled={loading || !text.trim()}
            className="text-blue-600 disabled:opacity-30 hover:text-blue-700 transition-all duration-200 hover:scale-110"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
      await api.post(`/feed/${post.id}/like`);
    } catch {
      setLiked(!liked);
      setLikesCount(liked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/feed/${post.id}`);
      onDelete(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fadeIn">
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?.id}`} className="transition-transform duration-300 hover:scale-105">
            <Avatar 
  name={post.author?.fullName} 
  role={post.author?.role} 
  size="md"
  profilePicture={post.author?.profilePicture}
/>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/profile/${post.author?.id}`} className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-sm transition-colors duration-200">
                {post.author?.fullName}
              </Link>
              {post.isConnected && (
                <span className="text-xs text-green-600 font-medium animate-pulse">• Connected</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {post.author?.currentTitle || post.author?.companyName || post.author?.role}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
              <PostTypeTag type={post.type} />
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-90"
          >
            <MoreHorizontal size={18} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 z-10 animate-slideDown">
              <Link
                to={`/profile/${post.author?.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setShowMenu(false)}
              >
                View Profile
              </Link>
              {post.isOwn && (
                <button
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200"
                >
                  <Trash2 size={14} /> Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {post.image && (
        <div className="px-5 pb-3">
          <img
            src={`http://localhost:5000/uploads/${post.image}`}
            alt="post"
            className="w-full rounded-xl object-cover max-h-96 hover:scale-102 transition-transform duration-300 cursor-pointer"
          />
        </div>
      )}

      {(likesCount > 0 || post._count?.comments > 0) && (
        <div className="flex items-center justify-between px-5 py-2 border-t border-gray-50 text-xs text-gray-400">
          {likesCount > 0 && (
            <span className="flex items-center gap-1 animate-fadeIn">
              <span className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart size={9} className="text-white fill-white" />
              </span>
              {likesCount}
            </span>
          )}
          {post._count?.comments > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="ml-auto hover:text-blue-600 transition-all duration-200"
            >
              {post._count.comments} comment{post._count.comments > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            liked
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Heart size={16} className={`${liked ? "fill-blue-600 animate-bounce" : ""} transition-all duration-200`} />
          {liked ? "Liked" : "Like"}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
        >
          <MessageCircle size={16} />
          Comment
        </button>
        <Link
          to="/messages"
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
        >
          <Send size={16} />
          Message
        </Link>
      </div>

      {showComments && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3 animate-slideDown">
          <CommentSection
            postId={post.id}
            initialComments={post.comments || []}
            initialCount={post._count?.comments || 0}
          />
        </div>
      )}
    </div>
  );
};

const SuggestedUser = ({ user: u, onConnect }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-white/30 rounded-lg px-2 transition-all duration-200 group">
    <Link to={`/profile/${u.id}`} className="transition-transform duration-300 hover:scale-105">
      <Avatar name={u.fullName} role={u.role} size="sm" />
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/profile/${u.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block transition-colors duration-200">
        {u.fullName}
      </Link>
      <p className="text-xs text-gray-400 truncate">
        {u.currentTitle || u.companyName || u.role}
      </p>
    </div>
    <button
      onClick={() => onConnect(u.id)}
      className="flex items-center gap-1 px-3 py-1 border border-blue-500 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 hover:scale-105"
    >
      <Users size={11} /> Connect
    </button>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchData();
  }, []);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const res = await api.get(`/feed?page=${nextPage}`);
      setPosts((prev) => [...prev, ...res.data.posts]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewPost = (post) => setPosts((prev) => [post, ...prev]);
  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const handleConnect = async (targetId) => {
    try {
      await api.post("/connections", { receiverId: targetId });
      setSuggestions((prev) => prev.filter((u) => u.id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animation-delay-300" style={{ animationDuration: "1.5s" }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16">
        <div className={`max-w-5xl mx-auto px-4 py-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left Column - Feed */}
            <div className="lg:col-span-2 space-y-4">
              <CreatePost onPost={handleNewPost} />

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center animate-fadeIn">
                  <Sparkles size={48} className="text-gray-300 mx-auto mb-4 animate-pulse" />
                  <h3 className="font-semibold text-gray-700 mb-2 text-lg">Your feed is empty</h3>
                  <p className="text-gray-400 text-sm">Connect with people and share updates to get started</p>
                </div>
              ) : (
                <>
                  {posts.map((post, idx) => (
                    <div key={post.id} style={{ animationDelay: `${idx * 100}ms` }}>
                      <PostCard post={post} onDelete={handleDelete} />
                    </div>
                  ))}
                  {hasMore && (
                    <button
                      onClick={loadMore}
                      className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      Load more posts
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Glass Morphism Sidebar */}
            <div className="space-y-4 relative">
              {/* Animated background for the entire sidebar */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow-delayed"></div>
              </div>

             {/* Profile Card with Glass Morphism */}
<div className="relative group backdrop-blur-xl bg-white/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/20">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
    <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-particle"></div>
    <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-white rounded-full animate-particle-delayed"></div>
    <div className="absolute top-8 right-12 w-1 h-1 bg-white rounded-full animate-particle-slow"></div>
  </div>
  
  <div className="relative px-5 pb-5">
    <div className="-mt-10 mb-3 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1">
      {/* Avatar with profile picture support */}
      {user?.profilePicture ? (
        <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img 
            src={`http://localhost:5000/uploads/${user.profilePicture}`} 
            alt={user?.fullName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <Avatar name={user?.fullName} role={user?.role} size="lg" />
      )}
    </div>
    <Link to={user?.role === "SEEKER" ? "/seeker/profile" : "/employer/profile"}>
      <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-all duration-300">
        {user?.fullName}
      </h3>
    </Link>
    <p className="text-xs text-gray-500 mt-0.5">
      {user?.currentTitle || user?.companyName || user?.role}
    </p>
    <div className="mt-3 flex items-center justify-between">
      <Link
        to="/network"
        className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-all duration-200 inline-flex items-center gap-1 group-hover:gap-2"
      >
        View my network <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  </div>
</div>

              {/* Suggestions Card with Glass Morphism */}
              {suggestions.length > 0 && (
                <div className="relative backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold text-gray-800 text-sm">People you may know</h3>
                    </div>
                    <Link to="/network" className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200">
                      See all
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {suggestions.slice(0, 4).map((u) => (
                      <SuggestedUser key={u.id} user={u} onConnect={handleConnect} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Access Card with Glass Morphism */}
              <div className="relative backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-gray-800 text-sm">Quick Access</h3>
                </div>
                <div className="space-y-2">
                  {user?.role === "SEEKER" ? (
                    <>
                      <Link to="/seeker/jobs" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-200 group">
                        <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Browse Jobs</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1">→</span>
                      </Link>
                      <Link to="/seeker/applications" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-200 group">
                        <FileText size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="flex-1">My Applications</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1">→</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/employer/jobs/post" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-200 group">
                        <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Post a Job</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1">→</span>
                      </Link>
                      <Link to="/employer/applicants" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-200 group">
                        <Users size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="flex-1">View Applicants</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1">→</span>
                      </Link>
                    </>
                  )}
                  <Link to="/messages" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-200 group">
                    <Send size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Messages</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        @keyframes float-slow-delayed {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(20px) scale(1.05);
          }
        }
        
        @keyframes particle {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0;
          }
        }
        
        @keyframes particle-delayed {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-25px) translateX(-10px);
            opacity: 0;
          }
        }
        
        @keyframes particle-slow {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-40px) translateX(15px);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-bounce {
          animation: bounce 0.3s ease-in-out;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-slow-delayed {
          animation: float-slow-delayed 7s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 4s ease-in-out infinite;
        }
        
        .animate-particle-delayed {
          animation: particle-delayed 5s ease-in-out infinite;
        }
        
        .animate-particle-slow {
          animation: particle-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Home;