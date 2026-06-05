import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, UserX, Clock, MapPin,
  Briefcase, Building2, Sparkles, Search,
  UserPlus, Check, X
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AnimatedBackground from "../../components/AnimatedBackground";

const Avatar = ({ name, role, size = "md" }) => {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-16 h-16 text-xl" };
  const colors = {
    SEEKER:   "from-blue-500 to-purple-600",
    EMPLOYER: "from-green-500 to-teal-600",
    ADMIN:    "from-red-500 to-orange-500",
  };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[role] || colors.SEEKER} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const ConnectionCard = ({ connection, onRemove }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start gap-4">
    <Link to={`/profile/${connection.user?.id}`}>
      <Avatar name={connection.user?.fullName} role={connection.user?.role} size="md" />
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/profile/${connection.user?.id}`} className="font-semibold text-gray-900 hover:underline block truncate">
        {connection.user?.fullName}
      </Link>
      <p className="text-sm text-gray-500 truncate mt-0.5">
        {connection.user?.currentTitle || connection.user?.companyName || connection.user?.role}
      </p>
      {connection.user?.location && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <MapPin size={11} />{connection.user.location}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <Link
          to={`/profile/${connection.user?.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          <UserCheck size={13} /> View Profile
        </Link>
        <button
          onClick={() => onRemove(connection.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <UserX size={13} /> Remove
        </button>
      </div>
    </div>
  </div>
);

const RequestCard = ({ request, onAccept, onDecline }) => (
  <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-start gap-4">
    <Link to={`/profile/${request.sender?.id}`}>
      <Avatar name={request.sender?.fullName} role={request.sender?.role} size="md" />
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/profile/${request.sender?.id}`} className="font-semibold text-gray-900 hover:underline block">
        {request.sender?.fullName}
      </Link>
      <p className="text-sm text-gray-500 truncate mt-0.5">
        {request.sender?.currentTitle || request.sender?.companyName || request.sender?.role}
      </p>
      {request.sender?.location && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <MapPin size={11} />{request.sender.location}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onAccept(request.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
        >
          <Check size={13} /> Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <X size={13} /> Decline
        </button>
      </div>
    </div>
  </div>
);

const SuggestionCard = ({ user: u, onConnect, connecting }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="h-12 bg-gradient-to-r from-blue-400 to-purple-500" />
    <div className="p-4">
      <div className="-mt-8 mb-3">
        <Avatar name={u.fullName} role={u.role} size="md" />
      </div>
      <Link to={`/profile/${u.id}`} className="font-semibold text-gray-900 hover:underline block truncate text-sm">
        {u.fullName}
      </Link>
      <p className="text-xs text-gray-500 truncate mt-0.5">
        {u.currentTitle || u.companyName || u.role}
      </p>
      {u.location && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <MapPin size={10} />{u.location}
        </div>
      )}
      <button
        onClick={() => onConnect(u.id)}
        disabled={connecting === u.id}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border-2 border-blue-500 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        <UserPlus size={13} />
        {connecting === u.id ? "Sending..." : "Connect"}
      </button>
    </div>
  </div>
);

const Network = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [connecting, setConnecting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [connRes, reqRes, sugRes] = await Promise.all([
          api.get("/connections"),
          api.get("/connections/pending"),
          api.get("/connections/suggestions"),
        ]);
        setConnections(connRes.data.connections);
        setRequests(reqRes.data.requests);
        setSuggestions(sugRes.data.suggestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchAll();
  }, []);

  const handleConnect = async (targetId) => {
    try {
      setConnecting(targetId);
      await api.post("/connections", { receiverId: targetId });
      setSuggestions((prev) => prev.filter((u) => u.id !== targetId));
      showToast("Connection request sent!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setConnecting(null);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/connections/${id}/respond`, { action: "ACCEPT" });
      const req = requests.find((r) => r.id === id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (req) {
        setConnections((prev) => [...prev, {
          id,
          status: "ACCEPTED",
          user: req.sender,
        }]);
      }
      showToast("Connection accepted!");
    } catch {
      showToast("Failed to accept", "error");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.put(`/connections/${id}/respond`, { action: "DECLINE" });
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Request declined");
    } catch {
      showToast("Failed to decline", "error");
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this connection?")) return;
    try {
      await api.delete(`/connections/${id}`);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      showToast("Connection removed");
    } catch {
      showToast("Failed to remove", "error");
    }
  };

  const filteredConnections = connections.filter((c) =>
    !search ||
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.currentTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "connections", label: "Connections",  count: connections.length  },
    { id: "requests",    label: "Requests",     count: requests.length     },
    { id: "suggestions", label: "Suggestions",  count: suggestions.length  },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
       <AnimatedBackground />
      <Navbar />
      <Sidebar />

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">
                {connections.length} connections
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your professional connections</p>
          </div>

          {/* Pending Banner */}
          {requests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Clock size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                You have {requests.length} pending connection request{requests.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setActiveTab("requests")}
                className="ml-auto text-xs text-amber-700 font-semibold underline"
              >
                View now
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6">
            {TABS.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Connections Tab ── */}
          {activeTab === "connections" && (
            <div className="space-y-4">
              {connections.length > 0 && (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search connections..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {filteredConnections.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <Users size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No connections yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start connecting with people in your field</p>
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Find People
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredConnections.map((c) => (
                    <ConnectionCard key={c.id} connection={c} onRemove={handleRemove} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Requests Tab ── */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <Clock size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No pending requests</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {requests.map((r) => (
                    <RequestCard
                      key={r.id}
                      request={r}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Suggestions Tab ── */}
          {activeTab === "suggestions" && (
            <div>
              {suggestions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <UserPlus size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No suggestions available</p>
                  <p className="text-gray-400 text-sm mt-1">You may already be connected with everyone!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((u) => (
                    <SuggestionCard
                      key={u.id}
                      user={u}
                      onConnect={handleConnect}
                      connecting={connecting}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Network;