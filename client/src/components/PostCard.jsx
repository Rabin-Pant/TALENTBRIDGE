import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart, MessageCircle, Send, X,
  MoreHorizontal, Trash2, Globe,
  ChevronDown, ChevronUp, User,
  Briefcase, Award, Megaphone
} from "lucide-react";
import api from "../api/axios";
import { timeAgo } from "../utils/timeAgo";

const POST_TYPES = [
  { value: "UPDATE",       label: "Share Update",  icon: Globe,     color: "blue"   },
  { value: "ACHIEVEMENT",  label: "Achievement",   icon: Award,     color: "amber"  },
  { value: "JOB_UPDATE",   label: "Job Update",    icon: Briefcase, color: "green"  },
  { value: "ANNOUNCEMENT", label: "Announcement",  icon: Megaphone, color: "purple" },
];

export const Avatar = ({ name, size = "sm", profilePicture }) => {
  const sizes = { xs: "w-7 h-7 text-xs", sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-14 h-14 text-xl" };
  const iconSizes = { xs: 14, sm: 18, md: 22, lg: 28 };
  const profilePictureUrl = profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : null;
  if (profilePictureUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-2 ring-white`}>
        <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white`}>
      <User size={iconSizes[size]} className="text-gray-400" strokeWidth={1.75} />
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

const CommentSection = ({ postId, initialComments = [], initialCount = 0, user, postAuthorId }) => {
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(initialCount);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
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
      const payload = { content: text, parentId: replyingTo?.id || null };
      const res = await api.post(`/feed/${postId}/comment`, payload);

      if (replyingTo) {
        setComments((prev) => prev.map(c => c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c));
      } else {
        setComments((prev) => [...prev, res.data.comment]);
      }

      setCount((c) => c + 1);
      setText("");
      setReplyingTo(null);
      setExpanded(true);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/feed/comment/${commentId}`);
      setComments((prev) => prev.filter(c => c.id !== commentId).map(c => ({
        ...c,
        replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
      })));
      setCount((c) => c - 1);
    } catch (err) { console.error(err); alert("Failed to delete comment"); }
  };

  const CommentBlock = ({ c, isReply = false }) => (
    <div className={`flex items-start gap-2 ${isReply ? "mt-2" : "mt-3"}`}>
      <Avatar name={c.author?.fullName} size="xs" profilePicture={c.author?.profilePicture} />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
          <div className="flex items-baseline gap-2">
            <Link to={`/profile/${c.author?.id}`} className="text-xs font-semibold text-gray-900 hover:underline">{c.author?.fullName}</Link>
            <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5 leading-snug">{c.content}</p>
        </div>

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
        <Avatar name={user?.fullName} size="xs" profilePicture={user?.profilePicture} />
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

const LikesModal = ({ postId, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/feed/${postId}/likes`)
      .then((res) => { if (active) setUsers(res.data.users); })
      .catch((err) => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><Heart size={9} className="text-white fill-white" /></span>
            Liked by
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No likes yet</p>
          ) : (
            users.map((u) => (
              <Link key={u.id} to={`/profile/${u.id}`} onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar name={u.fullName} size="sm" profilePicture={u.profilePicture} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{u.currentTitle || u.companyName || u.role?.toLowerCase()}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const PostCard = ({ post, onDelete, user }) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
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
    try { await api.delete(`/feed/${post.id}`); onDelete?.(post.id); } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?.id}`}>
            <Avatar name={post.author?.fullName} size="md" profilePicture={post.author?.profilePicture} />
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
            <button onClick={() => setShowLikes(true)} className="flex items-center gap-1 hover:underline">
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
      {showLikes && <LikesModal postId={post.id} onClose={() => setShowLikes(false)} />}
    </div>
  );
};

export default PostCard;
