import { Link, NavLink } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown, Briefcase, Search, Home, Network, MessageCircle, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SearchDropdown from "./SearchDropdown";
import socket from "../api/socket";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const dropdownRef = useRef();
  const searchRef   = useRef();

  const notifPath =
    user?.role === "SEEKER"   ? "/seeker/notifications"  :
    user?.role === "EMPLOYER" ? "/employer/notifications" : null;

  const profilePath =
    user?.role === "SEEKER"   ? "/seeker/profile"  :
    user?.role === "EMPLOYER" ? "/employer/profile" : null;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!notifPath) return;
        const res = await api.get(notifPath);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
  }, [notifPath]);

  useEffect(() => {
    const handle = () => setUnreadCount((prev) => prev + 1);
    socket.on("newNotification", handle);
    return () => socket.off("newNotification", handle);
  }, []);

  const navLinks = (user?.role === "SEEKER" || user?.role === "EMPLOYER") ? [
    { to: "/home",    icon: Home,          label: "Home"    },
    { to: "/network", icon: Network,       label: "Network" },
    { to: "/messages",icon: MessageCircle, label: "Messages"},
  ] : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="h-full flex items-center px-4">

        {/* ── LEFT: Logo + Search ── */}
        <div className="flex items-center gap-3 w-64 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-blue-600 hidden sm:block">TalentBridge</span>
          </Link>
        </div>

        {/* Search — separate from logo */}
        <div className="relative w-80 flex-shrink-0" ref={searchRef}>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent rounded-md text-sm focus:outline-none focus:bg-white focus:border-blue-400 transition-all"
          />
          {searchOpen && (
            <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          )}
        </div>

        {/* ── CENTER: Nav Tabs ── */}
        <div className="hidden md:flex items-center justify-center flex-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-6 py-1 border-b-2 transition-all duration-150 ${
                  isActive
                    ? "text-blue-700 border-blue-700"
                    : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* ── RIGHT: Notif + Me ── */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Notification */}
          {notifPath && (
            <NavLink
              to={notifPath}
              onClick={() => setUnreadCount(0)}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-4 py-1 border-b-2 transition-all duration-150 ${
                  isActive
                    ? "text-blue-700 border-blue-700"
                    : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
                }`
              }
            >
              <div className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden md:block">Notifications</span>
            </NavLink>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400 transition-all duration-150"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-xs hidden md:flex items-center gap-0.5">
                Me <ChevronDown size={11} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {user?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>

                {profilePath && (
                  <Link
                    to={profilePath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <User size={15} className="text-gray-400" /> View Profile
                  </Link>
                )}

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <Settings size={15} className="text-gray-400" /> Settings
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {searchOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-gray-200 p-3 shadow-lg z-50">
          <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
      `}</style>
    </nav>
  );
};

export default Navbar;