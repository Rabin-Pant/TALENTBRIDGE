import {
  Home, Briefcase, FileText, User, Bell,
  PlusCircle, Users, LayoutDashboard,
  Mail, Newspaper,
} from "lucide-react";

export const seekerLinks = [
  { to: "/home",                 icon: Home,      label: "Home"          },
  { to: "/seeker/jobs",          icon: Briefcase, label: "Browse Jobs"   },
  { to: "/seeker/applications",  icon: FileText,  label: "Applications"  },
  { to: "/seeker/notifications", icon: Bell,      label: "Notifications" },
  { to: "/seeker/profile",       icon: User,      label: "Profile"       },
];

export const employerLinks = [
  { to: "/home",                  icon: Home,      label: "Home"           },
  { to: "/employer/jobs",         icon: Briefcase, label: "My Jobs"        },
  { to: "/employer/jobs/post",    icon: PlusCircle,label: "Post a Job"     },
  { to: "/employer/applicants",   icon: Users,     label: "Applicants"     },
  { to: "/employer/notifications",icon: Bell,      label: "Notifications"  },
  { to: "/employer/profile",      icon: User,      label: "Company Profile"},
];

export const adminLinks = [
  { to: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/users",        icon: Users,           label: "Users"        },
  { to: "/admin/jobs",         icon: Briefcase,       label: "All Jobs"     },
  { to: "/admin/applications", icon: FileText,        label: "Applications" },
  { to: "/admin/posts",        icon: Newspaper,       label: "Feed Posts"   },
  { to: "/admin/contacts",     icon: Mail,            label: "Messages"     },
];
