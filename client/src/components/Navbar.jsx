import { Link, NavLink } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown, Briefcase, Search, Home, Network, MessageCircle, Settings, Info, Mail, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SearchDropdown from "./SearchDropdown";
import socket from "../api/socket";

// ─── Reusable User Avatar ─────────────────────────────
const UserAvatar = ({ user, size = "sm" }) => {
  const sizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-sm", md: "w-12 h-12 text-base", lg: "w-14 h-14 text-xl" };
  const profilePictureUrl = user?.profilePicture
    ? `http://localhost:5000/uploads/${user.profilePicture}`
    : null;

  if (profilePictureUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm`}>
        <img src={profilePictureUrl} alt={user?.fullName} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm`}>
      <span className="text-white font-bold leading-none">{user?.fullName?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  
  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  const notifPath = user?.role === "SEEKER"   ? "/seeker/notifications"  :
                    user?.role === "EMPLOYER" ? "/employer/notifications" : null;

  const profilePath = user?.role === "SEEKER"   ? "/seeker/profile"  :
                      user?.role === "EMPLOYER" ? "/employer/profile" : null;

  // If Admin, logo directs back to Admin Dashboard
  const homePath = isLoggedIn ? (isAdmin ? "/admin/dashboard" : "/home") : "/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <>
      {/* 3D Animated Background for Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse-3d"></div>
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse-3d-delayed"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to={homePath} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                TalentBridge
              </span>
              {isAdmin && (
                <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </Link>

            {/* Center Section */}
            <div className="flex-1 flex justify-center">
              {isLoggedIn && !isAdmin ? (
                // Logged In & NOT Admin: Show Search Bar
                <div className="relative w-96" ref={searchRef}>
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for people, jobs, companies..."
                    onFocus={() => setSearchOpen(true)}
                    className="w-full pl-9 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {searchOpen && (
                    <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                  )}
                </div>
              ) : !isLoggedIn ? (
                // Logged Out: Show Home, About, Contact links
                <div className="hidden md:flex items-center gap-12">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 ${
                        isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 ${
                        isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""
                      }`
                    }
                  >
                    About
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `text-gray-600 hover:text-blue-600 transition-colors font-medium px-2 ${
                        isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : ""
                      }`
                    }
                  >
                    Contact
                  </NavLink>
                </div>
              ) : null /* If Admin is logged in, center stays completely clean */}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">

              {isLoggedIn ? (
                // LOGGED IN NAVIGATION
                <>
                  {/* Main Nav Links (HIDDEN IF ADMIN) */}
                  {!isAdmin && (
                    <div className="hidden md:flex items-center gap-4">
                      <NavLink
                        to="/home"
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-0.5 px-3 py-1 border-b-2 transition-all duration-150 ${
                            isActive
                              ? "text-blue-700 border-blue-700"
                              : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
                          }`
                        }
                      >
                        <Home size={20} />
                        <span className="text-xs">Home</span>
                      </NavLink>
                      <NavLink
                        to="/network"
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-0.5 px-3 py-1 border-b-2 transition-all duration-150 ${
                            isActive
                              ? "text-blue-700 border-blue-700"
                              : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
                          }`
                        }
                      >
                        <Network size={20} />
                        <span className="text-xs">Network</span>
                      </NavLink>
                      <NavLink
                        to="/messages"
                        className={({ isActive }) =>
                          `flex flex-col items-center gap-0.5 px-3 py-1 border-b-2 transition-all duration-150 ${
                            isActive
                              ? "text-blue-700 border-blue-700"
                              : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
                          }`
                        }
                      >
                        <MessageCircle size={20} />
                        <span className="text-xs">Messages</span>
                      </NavLink>
                    </div>
                  )}

                  {/* Notification Bell (Automatically hidden for admin since notifPath is null) */}
                  {notifPath && (
                    <NavLink
                      to={notifPath}
                      onClick={() => setUnreadCount(0)}
                      className={({ isActive }) =>
                        `relative flex flex-col items-center gap-0.5 px-2 py-1 border-b-2 transition-all duration-150 ${
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
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/50 transition-all duration-200"
                    >
                      <UserAvatar user={user} size="sm" />
                      <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                          <UserAvatar user={user} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>

                        {/* Admin Dashboard shortcut inside Dropdown */}
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 font-medium"
                          >
                            <Shield size={15} className="text-red-500" /> Admin Dashboard
                          </Link>
                        )}

                        {profilePath && (
                          <Link
                            to={profilePath}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <User size={15} className="text-gray-400" /> View Profile
                          </Link>
                        )}

                        <Link
                          to="/about"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <Info size={15} className="text-gray-400" /> About Us
                        </Link>

                        <Link
                          to="/contact"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <Mail size={15} className="text-gray-400" /> Contact Us
                        </Link>

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
                </>
              ) : (
                // LOGGED OUT - Sign In/Get Started buttons
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-5 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search dropdown (HIDDEN IF ADMIN) */}
        {searchOpen && !isAdmin && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 p-3 shadow-lg z-50">
            <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes pulse-3d {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes pulse-3d-delayed {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-3d {
          animation: pulse-3d 8s ease-in-out infinite;
        }
        .animate-pulse-3d-delayed {
          animation: pulse-3d-delayed 10s ease-in-out 3s infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;