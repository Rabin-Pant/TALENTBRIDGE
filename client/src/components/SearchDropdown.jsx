import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, UserPlus, UserCheck, Clock } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SearchDropdown = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isClickingInside = useRef(false);

  // Helper function to render connection button (NOT a component inside component)
  const renderConnectionButton = (targetUser) => {
    if (targetUser.connectionStatus === "ACCEPTED") {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium whitespace-nowrap">
          <UserCheck size={12} /> Connected
        </span>
      );
    }

    if (targetUser.connectionStatus === "PENDING") {
      if (targetUser.isSender) {
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-medium whitespace-nowrap">
            <Clock size={12} /> Pending
          </span>
        );
      } else {
        return (
          <div className="flex gap-1">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isClickingInside.current = true;
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAccept(targetUser.connectionId, targetUser.id);
                isClickingInside.current = false;
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              Accept
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isClickingInside.current = true;
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDecline(targetUser.connectionId, targetUser.id);
                isClickingInside.current = false;
              }}
              className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 whitespace-nowrap"
            >
              Decline
            </button>
          </div>
        );
      }
    }

    return (
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          isClickingInside.current = true;
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleConnect(targetUser.id);
          isClickingInside.current = false;
        }}
        disabled={connecting[targetUser.id]}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
      >
        <UserPlus size={12} />
        {connecting[targetUser.id] ? "Sending..." : "Connect"}
      </button>
    );
  };

  // Close dropdown when clicking outside - BULLETPROOFED
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If we're in the middle of a click inside, don't close
      if (isClickingInside.current) {
        isClickingInside.current = false;
        return;
      }

      // Check if dropdown exists and click is outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/search/users?q=${encodeURIComponent(searchTerm)}`);
        const filtered = res.data.users.filter(u => 
          u.id !== user?.id && u.role !== "ADMIN"
        );
        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, user?.id]);

  const handleConnect = async (targetId) => {
    setConnecting(prev => ({ ...prev, [targetId]: true }));
    try {
      await api.post("/connections", { receiverId: targetId });
      setResults(prev =>
        prev.map(u =>
          u.id === targetId
            ? { ...u, connectionStatus: "PENDING", isSender: true }
            : u
        )
      );
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setConnecting(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const handleAccept = async (connectionId, userId) => {
    try {
      await api.put(`/connections/${connectionId}/respond`, { action: "ACCEPT" });
      setResults(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, connectionStatus: "ACCEPTED" }
            : u
        )
      );
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleDecline = async (connectionId, userId) => {
    try {
      await api.put(`/connections/${connectionId}/respond`, { action: "DECLINE" });
      setResults(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  const handleViewProfile = (userId) => {
    isClickingInside.current = true;
    onClose();
    setTimeout(() => {
      navigate(`/profile/${userId}`);
      isClickingInside.current = false;
    }, 50);
  };

  const getProfilePictureUrl = (profilePicture) => {
    return profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : null;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
    >
      <div className="sticky top-0 bg-white p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for people by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : searchTerm.length < 2 ? (
          <div className="text-center py-8">
            <Search size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Type at least 2 characters to search</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
            <p className="text-gray-400 text-xs mt-1">Try a different name</p>
          </div>
        ) : (
          results.map((result) => {
            const profilePicUrl = getProfilePictureUrl(result.profilePicture);
            return (
              <div
                key={result.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {/* Avatar - Clickable to view profile */}
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isClickingInside.current = true;
                  }}
                  onClick={() => handleViewProfile(result.id)}
                >
                  {profilePicUrl ? (
                    <img 
                      src={profilePicUrl} 
                      alt={result.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {result.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* User Info - Clickable to view profile */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isClickingInside.current = true;
                  }}
                  onClick={() => handleViewProfile(result.id)}
                >
                  <p className="font-medium text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">
                    {result.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.currentTitle || result.companyName || result.role}
                  </p>
                  {result.location && (
                    <p className="text-xs text-gray-400 truncate">{result.location}</p>
                  )}
                </div>
                
                {/* Connection Button - Using helper function */}
                {renderConnectionButton(result)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;