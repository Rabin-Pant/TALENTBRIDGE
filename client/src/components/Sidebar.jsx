import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, ChevronRight } from "lucide-react";
import { seekerLinks, employerLinks, adminLinks } from "../config/navLinks";

const Sidebar = () => {
  const { user } = useAuth();

  const links =
    user?.role === "SEEKER"   ? seekerLinks  :
    user?.role === "EMPLOYER" ? employerLinks : adminLinks;

  const isAdmin = user?.role === "ADMIN";

  return (
    /* Changed top-14 to top-16 and h-[calc(100vh-3.5rem)] to h-[calc(100vh-4rem)] */
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex-col hidden md:flex overflow-hidden">

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