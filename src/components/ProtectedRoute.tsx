import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { routes } from "../types/routes";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}
