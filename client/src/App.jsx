import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Seeker Pages
import SeekerDashboard from "./pages/seeker/Dashboard";
import SeekerJobs from "./pages/seeker/Jobs";
import JobDetail from "./pages/seeker/JobDetail";
import SeekerApplications from "./pages/seeker/Applications";
import SeekerProfile from "./pages/seeker/Profile";
import SeekerNotifications from "./pages/seeker/Notifications";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerJobs from "./pages/employer/Jobs";
import PostJob from "./pages/employer/PostJob";
import EmployerApplicants from "./pages/employer/Applicants";
import ApplicantDetail from "./pages/employer/ApplicantDetail";
import EmployerProfile from "./pages/employer/Profile";
import EmployerNotifications from "./pages/employer/Notifications";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import PendingApproval from "./pages/auth/PendingApproval";

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "SEEKER") return <Navigate to="/seeker/dashboard" replace />;
  if (user.role === "EMPLOYER") return <Navigate to="/employer/dashboard" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Seeker */}
      <Route path="/seeker/dashboard" element={<ProtectedRoute role="SEEKER"><SeekerDashboard /></ProtectedRoute>} />
      <Route path="/seeker/jobs" element={<ProtectedRoute role="SEEKER"><SeekerJobs /></ProtectedRoute>} />
      <Route path="/seeker/jobs/:id" element={<ProtectedRoute role="SEEKER"><JobDetail /></ProtectedRoute>} />
      <Route path="/seeker/applications" element={<ProtectedRoute role="SEEKER"><SeekerApplications /></ProtectedRoute>} />
      <Route path="/seeker/profile" element={<ProtectedRoute role="SEEKER"><SeekerProfile /></ProtectedRoute>} />
      <Route path="/seeker/notifications" element={<ProtectedRoute role="SEEKER"><SeekerNotifications /></ProtectedRoute>} />

      {/* Employer */}
      <Route path="/employer/dashboard" element={<ProtectedRoute role="EMPLOYER"><EmployerDashboard /></ProtectedRoute>} />
      <Route path="/employer/jobs" element={<ProtectedRoute role="EMPLOYER"><EmployerJobs /></ProtectedRoute>} />
      <Route path="/employer/jobs/post" element={<ProtectedRoute role="EMPLOYER"><PostJob /></ProtectedRoute>} />
      <Route path="/employer/jobs/edit/:id" element={<ProtectedRoute role="EMPLOYER"><PostJob /></ProtectedRoute>} />
      <Route path="/employer/applicants" element={<ProtectedRoute role="EMPLOYER"><EmployerApplicants /></ProtectedRoute>} />
      <Route path="/employer/applicants/:id" element={<ProtectedRoute role="EMPLOYER"><ApplicantDetail /></ProtectedRoute>} />
      <Route path="/employer/profile" element={<ProtectedRoute role="EMPLOYER"><EmployerProfile /></ProtectedRoute>} />
      <Route path="/employer/notifications" element={<ProtectedRoute role="EMPLOYER"><EmployerNotifications /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute role="ADMIN"><AdminJobs /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute role="ADMIN"><AdminApplications /></ProtectedRoute>} />
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;