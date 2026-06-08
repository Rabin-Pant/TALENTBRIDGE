import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../api/socket";
import {
  Home, Briefcase, FileText, User, Bell,
  PlusCircle, Users, Shield, MessageCircle,
  Network, LayoutDashboard, ChevronRight,
  Mail
} from "lucide-react";

const seekerLinks = [
  { to: "/home",                 icon: Home,      label: "Home"          },
  { to: "/seeker/jobs",          icon: Briefcase, label: "Browse Jobs"   },
  { to: "/seeker/applications",  icon: FileText,  label: "Applications"  },
  { to: "/seeker/notifications", icon: Bell,      label: "Notifications" },
  { to: "/seeker/profile",       icon: User,      label: "Profile"       },
];

const employerLinks = [
  { to: "/home",                  icon: Home,      label: "Home"           },
  { to: "/employer/jobs",         icon: Briefcase, label: "My Jobs"        },
  { to: "/employer/jobs/post",    icon: PlusCircle,label: "Post a Job"     },
  { to: "/employer/applicants",   icon: Users,     label: "Applicants"     },
  { to: "/employer/notifications",icon: Bell,      label: "Notifications"  },
  { to: "/employer/profile",      icon: User,      label: "Company Profile"},
];

const adminLinks = [
  { to: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/users",      icon: Users,           label: "Users"        },
  { to: "/admin/jobs",       icon: Briefcase,       label: "All Jobs"     },
  { to: "/admin/applications",icon: FileText,        label: "Applications" },
  { to: "/admin/contacts",   icon: Mail,            label: "Messages"     },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const links =
    user?.role === "SEEKER"   ? seekerLinks  :
    user?.role === "EMPLOYER" ? employerLinks : adminLinks;

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/messages/unread-count");
        setUnreadMessages(res.data.totalUnread || 0);
      } catch {}
    };
    if (user) fetchUnread();
    socket.on("newMessage",  fetchUnread);
    socket.on("messageRead", fetchUnread);
    return () => {
      socket.off("newMessage",  fetchUnread);
      socket.off("messageRead", fetchUnread);
    };
  }, [user]);

  const isAdmin = user?.role === "ADMIN";

  // Build profile picture URL
  const profilePictureUrl = user?.profilePicture
    ? `http://localhost:5000/uploads/${user.profilePicture}`
    : null;

  return (
    /* Changed top-14 to top-16 and h-[calc(100vh-3.5rem)] to h-[calc(100vh-4rem)] */
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex overflow-hidden">

      {/* ── Profile Card ── */}
      {!isAdmin && (
        <div className="border-b border-gray-100">
          <div className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="px-4 pb-4 -mt-5">
            {/* ── Avatar with profile picture support ── */}
            {profilePictureUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2">
                <img
                  src={profilePictureUrl}
                  alt={user?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <Link
              to={user?.role === "SEEKER" ? "/seeker/profile" : "/employer/profile"}
              className="font-semibold text-gray-900 text-sm hover:underline block truncate"
            >
              {user?.fullName}
            </Link>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user?.currentTitle || user?.companyName || user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-gray-100">
        {isAdmin ? (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-red-50 rounded-lg text-xs font-semibold text-red-600">
            <Shield size={12} /> ADMIN
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center">
            TalentBridge · {user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;