import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

// Only admins can open the pages wrapped in this.
export default function AdminRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/login" replace />;
}