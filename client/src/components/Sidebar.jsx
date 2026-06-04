import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home, Briefcase, FileText, User,
  Bell, PlusCircle, Users, Shield, MessageCircle, Network
} from "lucide-react";

const seekerLinks = [
  { to: "/home",                  icon: Home,          label: "Home"          },
  { to: "/network",               icon: Network,       label: "My Network"    },
  { to: "/seeker/jobs",           icon: Briefcase,     label: "Browse Jobs"   },
  { to: "/seeker/applications",   icon: FileText,      label: "Applications"  },
  { to: "/messages",              icon: MessageCircle, label: "Messages"      },
  { to: "/seeker/notifications",  icon: Bell,          label: "Notifications" },
  { to: "/seeker/profile",        icon: User,          label: "Profile"       },
];

const employerLinks = [
  { to: "/home",                  icon: Home,          label: "Home"          },
  { to: "/network",               icon: Network,       label: "My Network"    },
  { to: "/employer/jobs",         icon: Briefcase,     label: "My Jobs"       },
  { to: "/employer/jobs/post",    icon: PlusCircle,    label: "Post a Job"    },
  { to: "/employer/applicants",   icon: Users,         label: "Applicants"    },
  { to: "/messages",              icon: MessageCircle, label: "Messages"      },
  { to: "/employer/notifications",icon: Bell,          label: "Notifications" },
  { to: "/employer/profile",      icon: User,          label: "Company Profile"},
];

const adminLinks = [
  { to: "/admin/dashboard",      icon: Home,      label: "Dashboard"    },
  { to: "/admin/users",          icon: Users,     label: "Users"        },
  { to: "/admin/jobs",           icon: Briefcase, label: "All Jobs"     },
  { to: "/admin/applications",   icon: FileText,  label: "Applications" },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links =
    user?.role === "SEEKER"   ? seekerLinks  :
    user?.role === "EMPLOYER" ? employerLinks : adminLinks;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
      {/* Profile Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Role Badge */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`text-center py-2 rounded-lg text-xs font-semibold ${
          user?.role === "SEEKER"   ? "bg-blue-50 text-blue-600"   :
          user?.role === "EMPLOYER" ? "bg-green-50 text-green-600" :
          "bg-red-50 text-red-600"
        }`}>
          {user?.role === "ADMIN" && <Shield size={12} className="inline mr-1" />}
          {user?.role}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;