import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Required role:", role);
  console.log("ProtectedRoute - Loading:", loading);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-gray-900"></div>
      </div>
    </div>
  );

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    console.log(`User role ${user.role} does not match required role ${role}`);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;