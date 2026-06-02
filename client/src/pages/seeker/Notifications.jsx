import { useState, useEffect } from "react";
import { Bell, CheckCircle, Briefcase, TrendingUp, Settings, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const TYPE_ICON = {
  APPLICATION:   { icon: Briefcase,   bg: "bg-blue-100",   color: "text-blue-600"   },
  STATUS_UPDATE: { icon: TrendingUp,  bg: "bg-amber-100",  color: "text-amber-600"  },
  JOB_MATCH:     { icon: Sparkles,    bg: "bg-purple-100", color: "text-purple-600" },
  SYSTEM:        { icon: Settings,    bg: "bg-gray-100",   color: "text-gray-600"   },
};

const SeekerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/seeker/notifications");
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-2xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">{notifications.length} notifications</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">Stay updated on your applications</p>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Bell size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, i) => {
                const { icon: Icon, bg, color } = TYPE_ICON[n.type] || TYPE_ICON.SYSTEM;
                return (
                  <div
                    key={n.id}
                    className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      !n.read ? "border-blue-100" : "border-gray-100"
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                      <p className="text-gray-400 text-xs mt-1.5">
                        {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeekerNotifications;