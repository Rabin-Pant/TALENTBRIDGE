import { Link, NavLink } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown, Briefcase, Search, Home, Network, MessageCircle, Info, Mail, Shield, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SearchDropdown from "./SearchDropdown";
import socket from "../api/socket";
import { seekerLinks, employerLinks, adminLinks } from "../config/navLinks";

const loggedOutNavItems = [
  { to: "/",        label: "Home"    },
  { to: "/about",   label: "About"   },
  { to: "/contact", label: "Contact" },
];

// ─── Reusable User Avatar ─────────────────────────────
const UserAvatar = ({ user, size = "sm" }) => {
  const sizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-sm", md: "w-12 h-12 text-base", lg: "w-14 h-14 text-xl" };
  const iconSizes = { xs: 12, sm: 16, md: 24, lg: 28 };
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
    <div className={`${sizes[size]} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm`}>
      <User size={iconSizes[size]} className="text-gray-400" strokeWidth={1.75} />
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef   = useRef(null);
  const searchRef     = useRef(null);
  const mobileMenuRef = useRef(null);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  const notifPath = user?.role === "SEEKER"   ? "/seeker/notifications"  :
                    user?.role === "EMPLOYER" ? "/employer/notifications" : null;

  const profilePath = user?.role === "SEEKER"   ? "/seeker/profile"  :
                      user?.role === "EMPLOYER" ? "/employer/profile" : null;

  // If Admin, logo directs back to Admin Dashboard
  const homePath = isLoggedIn ? (isAdmin ? "/admin/dashboard" : "/home") : "/";

  // Full nav destinations for the mobile menu (desktop nav links + Sidebar's role links, deduped)
  const roleLinks = isAdmin ? adminLinks : user?.role === "SEEKER" ? seekerLinks : user?.role === "EMPLOYER" ? employerLinks : [];
  const mobileNavItems = !isLoggedIn
    ? loggedOutNavItems
    : isAdmin
    ? roleLinks
    : [
        { to: "/home", icon: Home, label: "Home" },
        { to: "/network", icon: Network, label: "Network" },
        { to: "/messages", icon: MessageCircle, label: "Messages" },
        ...roleLinks.filter((l) => l.to !== "/home"),
      ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setMobileMenuOpen(false);
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
      } catch {
        // ignore — unread count is non-critical
      }
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
            <Link to={homePath} className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg flex-shrink-0">
                <Briefcase size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-lg sm:text-2xl bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform whitespace-nowrap">
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
                // Logged In & NOT Admin: Show Search Bar (desktop only — mobile uses the search icon in the right side)
                <div className="relative w-96 hidden md:block" ref={searchRef}>
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
            <div className="flex items-center gap-1 sm:gap-4">

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

                  {/* Mobile Search Trigger (HIDDEN IF ADMIN, desktop uses the search bar above) */}
                  {!isAdmin && (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="md:hidden p-1.5 sm:p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white/50 transition-all duration-200 flex-shrink-0"
                    >
                      <Search size={20} />
                    </button>
                  )}

                  {/* Notification Bell (Automatically hidden for admin since notifPath is null) */}
                  {notifPath && (
                    <NavLink
                      to={notifPath}
                      onClick={() => setUnreadCount(0)}
                      className={({ isActive }) =>
                        `relative flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 border-b-2 transition-all duration-150 flex-shrink-0 ${
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
                      className="flex items-center gap-1 px-1 sm:px-2 py-1.5 rounded-lg hover:bg-white/50 transition-all duration-200 flex-shrink-0"
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
                <div className="flex items-center gap-1 sm:gap-3">
                  <Link to="/login" className="px-2.5 sm:px-5 py-2 text-sm sm:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors whitespace-nowrap">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white/50 transition-all duration-200 flex-shrink-0"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search dropdown (HIDDEN IF ADMIN) */}
        {searchOpen && !isAdmin && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 p-3 shadow-lg z-50">
            <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Nav Menu — replaces the Sidebar's role links on small screens */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto py-2 px-2">
            {mobileNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {Icon && <Icon size={18} className="flex-shrink-0 text-gray-400" />}
                {label}
              </NavLink>
            ))}
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