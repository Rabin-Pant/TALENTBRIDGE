import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";  

// Auth
import Login           from "./pages/auth/Login";
import Register        from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";
import ResetPassword   from "./pages/auth/ResetPassword";
import ChangePassword  from "./pages/auth/ChangePassword";
import Landing         from "./pages/auth/Landing";

// Shared
import Home            from "./pages/shared/Home";
import Network         from "./pages/shared/Network";
import Messages        from "./pages/shared/Messages";
import PublicProfile   from "./pages/shared/PublicProfile";

// Seeker
import SeekerJobs          from "./pages/seeker/Jobs";
import JobDetail           from "./pages/seeker/JobDetail";
import SeekerApplications  from "./pages/seeker/Applications";
import SeekerProfile       from "./pages/seeker/Profile";
import SeekerNotifications from "./pages/seeker/Notifications";

// Employer
import EmployerJobs          from "./pages/employer/Jobs";
import PostJob               from "./pages/employer/PostJob";
import EmployerApplicants    from "./pages/employer/Applicants";
import ApplicantDetail       from "./pages/employer/ApplicantDetail";
import EmployerProfile       from "./pages/employer/Profile";
import EmployerNotifications from "./pages/employer/Notifications";

// Admin
import AdminDashboard    from "./pages/admin/Dashboard";
import AdminUsers        from "./pages/admin/Users";
import AdminJobs         from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";

// Static pages
import About         from "./pages/static/About";
import Contact       from "./pages/static/Contact";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import Terms         from "./pages/static/Terms";

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/home" replace />;
};

const App = () => {
  const location = useLocation();
  
  // Define which paths should NOT have the Navbar
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render the Navbar */}
      {shouldShowNavbar && <Navbar />} 
      
      <Routes>
        {/* Public - Landing page first */}
        <Route path="/" element={<Landing />} /> 
        <Route path="/landing" element={<Landing />} />
        
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* Public static routes */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Shared (Seeker + Employer) */}
        <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

        {/* Seeker */}
        <Route path="/seeker/jobs" element={<ProtectedRoute role="SEEKER"><SeekerJobs /></ProtectedRoute>} />
        <Route path="/seeker/jobs/:id" element={<ProtectedRoute role="SEEKER"><JobDetail /></ProtectedRoute>} />
        <Route path="/seeker/applications" element={<ProtectedRoute role="SEEKER"><SeekerApplications /></ProtectedRoute>} />
        <Route path="/seeker/profile" element={<ProtectedRoute role="SEEKER"><SeekerProfile /></ProtectedRoute>} />
        <Route path="/seeker/notifications" element={<ProtectedRoute role="SEEKER"><SeekerNotifications /></ProtectedRoute>} />

        {/* Employer */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;