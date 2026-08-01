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

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "asha_worker":
      return <Navigate to="/asha" replace />;
    case "ngo":
      return <Navigate to="/ngo" replace />;
    case "clinic":
      return <Navigate to="/clinic" replace />;
    default:
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
