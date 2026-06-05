import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Users, Settings, Sparkles, Trash2, CheckCircle, CheckCheck, AlertTriangle, UserPlus, Briefcase } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICON = {
  APPLICATION:      { icon: Briefcase,   bg: "bg-green-100",  color: "text-green-600"  },
  STATUS_UPDATE:    { icon: Users,       bg: "bg-blue-100",   color: "text-blue-600"   },
  CONNECTION_REQUEST: { icon: UserPlus,  bg: "bg-green-100",  color: "text-green-600"  },
  CONNECTION_ACCEPTED: { icon: Users,    bg: "bg-green-100",  color: "text-green-600"  },
  SYSTEM:           { icon: Settings,    bg: "bg-gray-100",   color: "text-gray-600"   },
};

const getNotificationLink = (notification) => {
  if (notification.link) return notification.link;
  
  switch (notification.type) {
    case "APPLICATION":
      return "/employer/applicants";
    case "STATUS_UPDATE":
      return "/employer/applicants";
    case "CONNECTION_REQUEST":
      return "/network";
    case "CONNECTION_ACCEPTED":
      return "/network";
    default:
      return "#";
  }
};

const EmployerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/employer/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/employer/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/employer/notifications/read-all");
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/employer/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setShowDeleteModal(false);
      setSelectedNotification(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await api.delete("/employer/notifications");
      setNotifications([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {/* Delete Single Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Notification?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This notification will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNotification(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNotification(selectedNotification.id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete All Notifications?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              All notifications will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteAllNotifications}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-2xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-600 font-medium">{notifications.length} notifications</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              </div>
              
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <CheckCheck size={16} />
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete all
                  </button>
                )}
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Bell size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n, i) => {
                const { icon: Icon, bg, color } = TYPE_ICON[n.type] || TYPE_ICON.SYSTEM;
                const redirectLink = getNotificationLink(n);
                
                return (
                  <div
                    key={n.id}
                    className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      !n.read ? "border-green-100 bg-green-50/30" : "border-gray-100"
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon size={18} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                              <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                              <p className="text-gray-400 text-xs mt-1.5">
                                {formatTime(n.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle size={14} className="text-green-500" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedNotification(n);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Clickable Link Button */}
                          {redirectLink !== "#" && (
                            <Link
                              to={redirectLink}
                              onClick={() => markAsRead(n.id)}
                              className="inline-block mt-3 text-xs text-blue-600 hover:underline font-medium"
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
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

export default EmployerNotifications;