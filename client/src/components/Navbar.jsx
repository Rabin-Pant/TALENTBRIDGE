import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown, Briefcase, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SearchDropdown from "./SearchDropdown";
import socket from "../api/socket";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifPath =
    user?.role === "SEEKER"
      ? "/seeker/notifications"
      : user?.role === "EMPLOYER"
      ? "/employer/notifications"
      : null;

  const profilePath =
    user?.role === "SEEKER"
      ? "/seeker/profile"
      : user?.role === "EMPLOYER"
      ? "/employer/profile"
      : null;

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      if (!notifPath) return;
      const res = await api.get(notifPath);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [notifPath]);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            TalentBridge
          </span>
        </Link>

        {/* Search Bar - Center */}
        <div className="hidden md:block flex-1 max-w-md mx-8 relative">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for people..."
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchOpen && (
            <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Mobile search button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Search size={20} />
          </button>

          {/* Notification Bell */}
          {notifPath && (
            <Link
              to={notifPath}
              className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.fullName?.split(' ')[0]}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                {profilePath && (
                  <Link
                    to={profilePath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {searchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-3 shadow-lg z-50">
          <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;