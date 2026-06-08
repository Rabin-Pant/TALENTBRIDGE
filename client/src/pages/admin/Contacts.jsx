import { useState, useEffect } from "react";
import { 
  Mail, MailOpen, Trash2, CheckCircle, Clock, 
  Inbox, AlertCircle, Eye, RefreshCw, ChevronRight
} from "lucide-react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar"; // 👈 Added the missing import

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/contacts"); 
      setMessages(Array.isArray(res.data) ? res.data : res.data.messages || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/admin/contacts/${id}/read`);
      setMessages(messages.map(msg => msg.id === id ? { ...msg, read: true } : msg));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: true });
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      setMessages(messages.filter(msg => msg.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const totalCount = messages.length;
  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = totalCount - unreadCount;

  const filteredMessages = messages.filter(msg => {
    if (filter === "unread") return !msg.read;
    if (filter === "read") return msg.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 md:pl-64 pt-20 pb-10 transition-all duration-300">
      {/* 👈 Render the Sidebar here */}
      <Sidebar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── Header Section ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Inbox className="text-blue-600" size={26} />
              User Inquiries
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and respond to incoming contact forms submitted by users.
            </p>
          </div>
          <button 
            onClick={fetchMessages}
            className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Messages</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Unread</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-0.5">{unreadCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Resolved / Read</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{readCount}</h3>
            </div>
          </div>
        </div>

        {/* ─── Main Content Layout ─── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col lg:flex-row">
          
          {/* Left Column: Messages List Pane */}
          <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
            
            {/* Filters bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-gray-200/60 p-1 rounded-xl w-full">
                {["all", "unread", "read"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg capitalize transition-all ${
                      filter === t 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[600px] flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading inquiries...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500 text-sm flex flex-col gap-2 items-center">
                  <AlertCircle size={24} /> {error}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2 h-full">
                  <MailOpen size={32} className="text-gray-300" />
                  <span>No messages found here.</span>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/70"
                      } ${!msg.read ? "bg-white border-l-4 border-blue-600 pl-3" : ""}`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${!msg.read ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                        {msg.read ? <MailOpen size={16} /> : <Mail size={16} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${!msg.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                            {msg.name}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                            <Clock size={10} />
                            {new Date(msg.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${!msg.read ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-1">{msg.message}</p>
                      </div>
                      
                      <ChevronRight size={16} className={`text-gray-300 self-center hidden sm:block ${isSelected ? "text-blue-400" : ""}`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Message Reader Pane */}
          <div className="w-full lg:w-7/12 bg-gray-50/30 flex flex-col min-h-[400px]">
            {selectedMessage ? (
              <div className="p-6 flex flex-col h-full flex-1 justify-between">
                <div>
                  {/* Meta Card Details */}
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                          {selectedMessage.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{selectedMessage.name}</h4>
                          <a href={`mailto:${selectedMessage.email}`} className="text-xs text-blue-600 hover:underline block mt-0.5">
                            {selectedMessage.email}
                          </a>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg self-start flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Subject</span>
                      <h2 className="text-base font-bold text-gray-900 mt-1">{selectedMessage.subject}</h2>
                    </div>
                  </div>

                  {/* Message Body Pane */}
                  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm min-h-[200px]">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block border-b border-gray-50 pb-2 mb-3">
                      Message Content
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Tray */}
                <div className="border-t border-gray-200/60 mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 bg-white -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                    >
                      <Mail size={16} />
                      Reply via Email
                    </a>
                    
                    {!selectedMessage.read && (
                      <button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                      >
                        <CheckCircle size={16} />
                        Mark as Read
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-3">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                  <Eye size={28} />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">No Message Selected</p>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs">
                    Select an inquiry from the list view on the left pane to view its full context and details.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminContacts;