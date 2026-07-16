import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};