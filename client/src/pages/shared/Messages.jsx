import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Search, MessageCircle, ArrowLeft,
  Sparkles, Trash2, MoreVertical, X, AlertTriangle, UserPlus, Smile
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import socket from "../../api/socket";
import { useAuth } from "../../context/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import AnimatedBackground from "../../components/AnimatedBackground";

// 🌟 FIXED: Supports both 'profilePicture' and 'profilePic' along with resilient URL resolution
const Avatar = ({ name, role, size = "md", online = false, profilePicture, profilePic }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-lg" };
  const colors = {
    SEEKER:   "from-blue-500 to-purple-600",
    EMPLOYER: "from-green-500 to-teal-600",
    ADMIN:    "from-red-500 to-orange-500",
  };

  const [imgError, setImgError] = useState(false);
  const targetPic = profilePicture || profilePic;

  useEffect(() => {
    setImgError(false);
  }, [targetPic]);

  const hasImage = targetPic && targetPic.trim() !== "" && !imgError;
  
  let srcUrl = null;
  if (hasImage) {
    if (targetPic.startsWith("http://") || targetPic.startsWith("https://")) {
      srcUrl = targetPic;
    } else {
      const cleanPath = targetPic.startsWith("/") ? targetPic : `/${targetPic}`;
      srcUrl = cleanPath.startsWith("/uploads/") 
        ? `http://localhost:5000${cleanPath}` 
        : `http://localhost:5000/uploads${cleanPath}`;
    }
  }

  return (
    <div className="relative flex-shrink-0">
      {hasImage ? (
        <img
          src={srcUrl}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border border-gray-100`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center text-white font-bold`}>
          <span>{name?.charAt(0)?.toUpperCase() || "?"}</span>
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
};

const formatMessageTime = (date) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
};

const formatConvTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
};

const Messages = () => {
  const { user } = useAuth();
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const [showDeleteConvModal, setShowDeleteConvModal] = useState(false);
  const [showDeleteMsgModal, setShowDeleteMsgModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [deleteMsgOption, setDeleteMsgOption] = useState(null);
  const [activeEmojiMenu, setActiveEmojiMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await api.get("/messages/conversations");
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchConversations();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const connectionsRes = await api.get("/connections");
        const connectedUsers = connectionsRes.data.connections || [];
        const filtered = connectedUsers.filter(conn => 
          conn.user?.fullName?.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(filtered);
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const startConversation = async (targetUser) => {
    try {
      setSearching(true);
      const res = await api.get(`/messages/conversations/${targetUser.id}/get-or-create`);
      if (res.data.conversation && res.data.conversation.id) {
        const convRes = await api.get("/messages/conversations");
        setConversations(convRes.data.conversations || []);
        openConversation(res.data.conversation);
        setShowSearchResults(false);
        setSearch("");
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (urlConvId && conversations.length > 0 && !activeConv) {
      const conv = conversations.find((c) => c.id === urlConvId);
      if (conv) openConversation(conv);
    }
  }, [urlConvId, conversations]);

  const openConversation = async (conv) => {
    if (!conv?.id) return;
    setActiveConv(conv);
    setIsMobileChat(true);
    setLoadingMessages(true);
    
    try {
      const res = await api.get(`/messages/${conv.id}`);
      setMessages(res.data.messages || []);
      await api.put(`/messages/${conv.id}/read`);
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      );
      navigate(`/messages/${conv.id}`, { replace: true });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeConv?.id) return;
    const messageContent = text.trim();
    setText("");
    
    socket.emit("sendMessage", {
      conversationId: activeConv.id,
      content: messageContent,
      receiverId: activeConv.otherUser?.id,
    });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", {
      conversationId: activeConv.id,
      receiverId: activeConv.otherUser?.id,
    });
  }, [text, activeConv]);

  const handleTyping = useCallback((e) => {
    const value = e.target.value;
    setText(value);
    if (!activeConv?.id) return;
    
    socket.emit("typing", {
      conversationId: activeConv.id,
      receiverId: activeConv.otherUser?.id,
    });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: activeConv.id,
        receiverId: activeConv.otherUser?.id,
      });
    }, 1500);
  }, [activeConv]);

  // 🌟 FIXED: Added client-side execution to update state instantly on click
  const handleReact = async (messageId, emojiType) => {
    try {
      setActiveEmojiMenu(null);
      const res = await api.post(`/messages/message/${messageId}/react`, { type: emojiType });
      if (res.data && res.data.reactions) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, reactions: res.data.reactions } : msg
        ));
      }
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  const handleDeleteMessage = async (type) => {
    if (!selectedMessage) return;
    try {
      if (type === 'me') {
        await api.delete(`/messages/message/${selectedMessage.id}/soft`);
      } else {
        await api.delete(`/messages/message/${selectedMessage.id}/hard`);
      }
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      const remainingMessages = messages.filter(m => m.id !== selectedMessage.id);
      const lastMessage = remainingMessages.length > 0 ? remainingMessages[remainingMessages.length - 1] : null;
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConv?.id
            ? { ...conv, lastMessage: lastMessage, updatedAt: lastMessage?.createdAt || conv.updatedAt }
            : conv
        )
      );
      setShowDeleteMsgModal(false);
      setSelectedMessage(null);
      setDeleteMsgOption(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message");
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConv?.id) return;
    try {
      await api.delete(`/messages/conversation/${activeConv.id}/soft`);
      setConversations(prev => prev.filter(c => c.id !== activeConv.id));
      setActiveConv(null);
      setMessages([]);
      setShowDeleteConvModal(false);
      navigate("/messages", { replace: true });
      setIsMobileChat(false);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation");
    }
  };

  // Socket configurations
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleOnlineUsers = (users) => setOnlineUsers(users || []);

    const handleNewMessage = (message) => {
      if (!message?.conversationId) return;
      if (activeConv?.id === message.conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: activeConv?.id === message.conversationId ? (conv.unreadCount || 0) : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        });
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const handleUserTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConv?.id && userId !== user?.id) setTyping(true);
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (conversationId === activeConv?.id) setTyping(false);
    };

    // 🌟 FIXED: Live socket interceptor updates receiver screen instantly
    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions } : msg
      ));
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);
    socket.on("messageReactionUpdated", handleReactionUpdated);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      socket.off("messageReactionUpdated", handleReactionUpdated);
    };
  }, [activeConv?.id, user?.id]);

  const isOnline = (userId) => onlineUsers.includes(userId);

  const filteredConvs = conversations.filter((conv) =>
    !search || conv.otherUser?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedBackground />
      <Navbar />
      <Sidebar />

      {/* Delete Message Confirmation Modal */}
      {showDeleteMsgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Message?</h3>
            </div>
            <p className="text-gray-600 mb-6">Choose how you want to delete this message.</p>
            <div className="space-y-3">
              <button
                onClick={() => { setDeleteMsgOption('me'); handleDeleteMessage('me'); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Delete for me</div>
                <div className="text-xs text-gray-500">Message will be deleted from your side only</div>
              </button>
              <button
                onClick={() => { setDeleteMsgOption('everyone'); handleDeleteMessage('everyone'); }}
                className="w-full px-4 py-3 border border-red-200 rounded-xl text-left hover:bg-red-50 transition-colors"
              >
                <div className="font-medium text-red-600">Delete for everyone</div>
                <div className="text-xs text-gray-500">Message will be deleted from both sides</div>
              </button>
            </div>
            <button
              onClick={() => { setShowDeleteMsgModal(false); setSelectedMessage(null); }}
              className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {showDeleteConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Conversation?</h3>
            </div>
            <p className="text-gray-600 mb-6">This conversation will be deleted from your side only. The other person will still see it.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConvModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteConversation} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      <main className="md:ml-64 pt-16 h-[calc(100vh-4rem)]">
        <div className={`h-full flex transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>

          {/* Conversations List */}
          <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 ${isMobileChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500" />
                <h2 className="font-bold text-gray-900">Messages</h2>
              </div>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search connected users..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => search && searchResults.length > 0 && setShowSearchResults(true)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100"><p className="text-xs text-gray-400 px-3 py-1">Start a new conversation</p></div>
                  {searchResults.map((conn) => (
                    <button key={conn.user.id} onClick={() => startConversation(conn.user)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                      <Avatar name={conn.user.fullName} role={conn.user.role} size="sm" online={isOnline(conn.user.id)} profilePicture={conn.user?.profilePicture} profilePic={conn.user?.profilePic} />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-sm">{conn.user.fullName}</p>
                        <p className="text-xs text-gray-500">{conn.user.currentTitle || conn.user.companyName || conn.user.role}</p>
                      </div>
                      <UserPlus size={16} className="text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conversation List Sidebar */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${activeConv?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                  >
                    {/* 🌟 FIXED: Added profilePic configuration hook */}
                    <Avatar
                      name={conv.otherUser?.fullName}
                      role={conv.otherUser?.role}
                      size="md"
                      online={isOnline(conv.otherUser?.id)}
                      profilePicture={conv.otherUser?.profilePicture}
                      profilePic={conv.otherUser?.profilePic}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">{conv.otherUser?.fullName}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatConvTime(conv.updatedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {conv.lastMessage ? (conv.lastMessage.senderId === user?.id ? `You: ${conv.lastMessage.content}` : conv.lastMessage.content) : "Start a conversation"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!isMobileChat ? "hidden md:flex" : "flex"}`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle size={36} className="text-blue-600" /></div>
                  <h3 className="font-semibold text-gray-700 mb-1">Your Messages</h3>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setIsMobileChat(false); setActiveConv(null); navigate("/messages", { replace: true }); }} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg">
                      <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    {/* 🌟 FIXED: Added structural layout parameter backup attributes */}
                    <Avatar
                      name={activeConv.otherUser?.fullName}
                      role={activeConv.otherUser?.role}
                      size="md"
                      online={isOnline(activeConv.otherUser?.id)}
                      profilePicture={activeConv.otherUser?.profilePicture}
                      profilePic={activeConv.otherUser?.profilePic}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{activeConv.otherUser?.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {isOnline(activeConv.otherUser?.id) ? <span className="text-green-500 font-medium">● Online</span> : (activeConv.otherUser?.currentTitle || activeConv.otherUser?.companyName || activeConv.otherUser?.role)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowDeleteConvModal(true)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group" title="Delete conversation">
                    <Trash2 size={18} className="text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex justify-center pt-8"><div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8"><p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p></div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.id;
                        const showDate = idx === 0 || new Date(messages[idx - 1]?.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">
                                  {isToday(new Date(msg.createdAt)) ? "Today" : isYesterday(new Date(msg.createdAt)) ? "Yesterday" : format(new Date(msg.createdAt), "MMMM d, yyyy")}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                              </div>
                            )}
                            <div className={`flex items-end gap-2 relative group ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                              {/* 🌟 FIXED: Passed complete data schemas so other user profile pics display inside feeds */}
                              {!isMine && (
                                <Avatar 
                                  name={msg.sender?.fullName || activeConv.otherUser?.fullName} 
                                  role={activeConv.otherUser?.role} 
                                  size="sm" 
                                  profilePicture={msg.sender?.profilePicture || activeConv.otherUser?.profilePicture}
                                  profilePic={msg.sender?.profilePic || activeConv.otherUser?.profilePic}
                                />
                              )}
                              <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-blue-600 text-white rounded-br-md" : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"}`}>
                                  {msg.content}
                                </div>

                                {/* Render Active Reactions Row */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                    {Object.entries(
                                      msg.reactions.reduce((acc, r) => {
                                        acc[r.type] = (acc[r.type] || 0) + 1;
                                        return acc;
                                      }, {})
                                    ).map(([emoji, count]) => (
                                      <span key={emoji} className="inline-flex items-center bg-white border border-gray-100 rounded-full px-2 py-0.5 text-xs shadow-sm select-none">
                                        {emoji} <span className="text-gray-500 ml-0.5 text-[10px] font-bold">{count}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-end gap-2 mt-1 px-1">
                                  <span className="text-xs text-gray-400">{formatMessageTime(msg.createdAt)}</span>
                                  
                                  {/* Emoji React Button Trigger */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setActiveEmojiMenu(activeEmojiMenu === msg.id ? null : msg.id)}
                                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all"
                                      title="React to message"
                                    >
                                      <Smile size={12} className="text-gray-400 hover:text-amber-500" />
                                    </button>

                                    {activeEmojiMenu === msg.id && (
                                      <div className={`absolute bottom-6 flex items-center gap-1 bg-white border border-gray-200 shadow-xl rounded-full p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 ${isMine ? "right-0" : "left-0"}`}>
                                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                                          <button 
                                            key={emoji} 
                                            onClick={() => handleReact(msg.id, emoji)}
                                            className="hover:scale-125 transition-transform px-1 text-sm"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {isMine && (
                                    <button onClick={() => { setSelectedMessage(msg); setShowDeleteMsgModal(true); }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all" title="Delete message">
                                      <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing Loader */}
                      {typing && (
                        <div className="flex items-end gap-2">
                          {/* 🌟 FIXED: Added profile configuration hooks to Typing avatar block */}
                          <Avatar 
                            name={activeConv.otherUser?.fullName} 
                            role={activeConv.otherUser?.role} 
                            size="sm" 
                            profilePicture={activeConv.otherUser?.profilePicture}
                            profilePic={activeConv.otherUser?.profilePic}
                          />
                          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Panel */}
                <div className="px-5 py-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input
                      type="text"
                      value={text}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder={`Message ${activeConv.otherUser?.fullName}...`}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                    />
                    <button onClick={handleSend} disabled={!text.trim()} className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
                      <Send size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">Press Enter to send</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;