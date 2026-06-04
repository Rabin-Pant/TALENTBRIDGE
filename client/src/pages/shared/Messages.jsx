import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Search, MessageCircle, ArrowLeft,
  Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import socket from "../../api/socket";
import { useAuth } from "../../context/AuthContext";
import { format, isToday, isYesterday } from "date-fns";

const Avatar = ({ name, role, size = "md", online = false }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-lg" };
  const colors = {
    SEEKER:   "from-blue-500 to-purple-600",
    EMPLOYER: "from-green-500 to-teal-600",
    ADMIN:    "from-red-500 to-orange-500",
  };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center`}>
        <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase()}</span>
      </div>
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
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversations
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

  // Open conversation from URL param
  useEffect(() => {
    if (urlConvId && conversations.length > 0 && !activeConv) {
      const conv = conversations.find((c) => c.id === urlConvId);
      if (conv) {
        openConversation(conv);
      }
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
    
    // Mark messages as read via API
    await api.put(`/messages/${conv.id}/read`);
    
    // Clear unread count for this conversation
    setConversations(prev =>
      prev.map(c =>
        c.id === conv.id
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
    
    // Update sidebar badge count
    const unreadRes = await api.get("/messages/unread-count");
    // You'll need to pass this to sidebar via a global state or context
    // Or trigger a refetch in sidebar
    
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
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
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
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: activeConv.id,
        receiverId: activeConv.otherUser?.id,
      });
    }, 1500);
  }, [activeConv]);

  // Socket listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleNewMessage = (message) => {
      if (!message?.conversationId) return;
      
      // Update messages if it's the active conversation
      if (activeConv?.id === message.conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
      
      // Update conversations list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              // Only increment unread if not active conversation
              unreadCount: activeConv?.id === message.conversationId 
                ? (conv.unreadCount || 0) 
                : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        });
        
        // Sort by latest message
        return updated.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    const handleUserTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConv?.id && userId !== user?.id) {
        setTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (conversationId === activeConv?.id) {
        setTyping(false);
      }
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, [activeConv?.id, user?.id]);

  const isOnline = (userId) => onlineUsers.includes(userId);

  const filteredConvs = conversations.filter((conv) =>
    !search ||
    conv.otherUser?.fullName?.toLowerCase().includes(search.toLowerCase())
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
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 h-[calc(100vh-4rem)]">
        <div className={`h-full flex transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>

          {/* Conversations List */}
          <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 ${
            isMobileChat ? "hidden md:flex" : "flex"
          }`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500" />
                <h2 className="font-bold text-gray-900">Messages</h2>
              </div>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">Connect with people and start messaging</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                      activeConv?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <Avatar
                      name={conv.otherUser?.fullName}
                      role={conv.otherUser?.role}
                      size="md"
                      online={isOnline(conv.otherUser?.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {conv.otherUser?.fullName}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatConvTime(conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {conv.lastMessage
                            ? conv.lastMessage.senderId === user?.id
                              ? `You: ${conv.lastMessage.content}`
                              : conv.lastMessage.content
                            : "Start a conversation"
                          }
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
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={36} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-1">Your Messages</h3>
                  <p className="text-gray-400 text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
                  <button
                    onClick={() => { 
                      setIsMobileChat(false); 
                      setActiveConv(null);
                      navigate("/messages", { replace: true }); 
                    }}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft size={18} className="text-gray-600" />
                  </button>
                  <Avatar
                    name={activeConv.otherUser?.fullName}
                    role={activeConv.otherUser?.role}
                    size="md"
                    online={isOnline(activeConv.otherUser?.id)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activeConv.otherUser?.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {isOnline(activeConv.otherUser?.id) ? (
                        <span className="text-green-500 font-medium">● Online</span>
                      ) : (
                        activeConv.otherUser?.currentTitle || 
                        activeConv.otherUser?.companyName || 
                        activeConv.otherUser?.role
                      )}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex justify-center pt-8">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.id;
                        const showDate = idx === 0 || 
                          new Date(messages[idx - 1]?.createdAt).toDateString() !== 
                          new Date(msg.createdAt).toDateString();

                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">
                                  {isToday(new Date(msg.createdAt)) ? "Today" :
                                   isYesterday(new Date(msg.createdAt)) ? "Yesterday" :
                                   format(new Date(msg.createdAt), "MMMM d, yyyy")}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                              </div>
                            )}
                            <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                              {!isMine && (
                                <Avatar 
                                  name={msg.sender?.fullName || activeConv.otherUser?.fullName} 
                                  role={activeConv.otherUser?.role} 
                                  size="sm" 
                                />
                              )}
                              <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isMine
                                    ? "bg-blue-600 text-white rounded-br-md"
                                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                                }`}>
                                  {msg.content}
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-1">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing Indicator */}
                      {typing && (
                        <div className="flex items-end gap-2">
                          <Avatar 
                            name={activeConv.otherUser?.fullName} 
                            role={activeConv.otherUser?.role} 
                            size="sm" 
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

                {/* Input */}
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
                    <button
                      onClick={handleSend}
                      disabled={!text.trim()}
                      className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    Press Enter to send
                  </p>
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