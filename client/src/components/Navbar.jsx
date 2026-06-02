import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!notifPath) return;
        const res = await api.get(notifPath.replace("/notifications", "/notifications"));
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TalentBridge</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {notifPath && (
            <Link to={notifPath} className="relative p-2 text-gray-600 hover:text-blue-600">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.fullName}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {profilePath && (
                  <Link
                    to={profilePath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;