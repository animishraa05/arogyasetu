import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/AdminDashboard";
import AshaWorkerDashboard from "./pages/AshaWorkerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import ClinicDashboard from "./pages/ClinicDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Landing />;
  }

  // Handle case-sensitivity and null values gracefully
  const role = user.role ? String(user.role).toLowerCase().trim() : "";
  
  if (role === "admin" || user.email === "admin@mdoner.gov.in") {
    return <Navigate to="/admin" replace />;
  }
  
  switch (role) {
    case "asha_worker":
    case "asha":
      return <Navigate to="/asha" replace />;
    case "ngo":
      return <Navigate to="/ngo" replace />;
    case "clinic":
      return <Navigate to="/clinic" replace />;
    default:
      console.warn("Unknown user role, falling back to landing:", user);
      return <Landing />;
  }
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RoleBasedRedirect />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/asha"
      element={
        <ProtectedRoute>
          <AshaWorkerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/ngo"
      element={
        <ProtectedRoute>
          <NgoDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/clinic"
      element={
        <ProtectedRoute>
          <ClinicDashboard />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
