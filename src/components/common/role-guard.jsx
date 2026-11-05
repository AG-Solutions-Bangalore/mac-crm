import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isViewerUser } from "@/utils/permissions";

/**
 * RoleGuard — restricts a route subtree to a set of allowed user_type values.
 * Also supports action-level guards:
 *   - disallowRoles: explicitly reject roles
 *   - requireEditor: blocks users with viewer role (user_type === 4 with viewer access)
 */
const RoleGuard = ({ allow, disallowRoles, requireEditor, children }) => {
  const user = useSelector((state) => state.auth.user);
  const userType = Number(user?.user_type);

  if (disallowRoles && disallowRoles.includes(userType)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allow && !allow.includes(userType)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireEditor && isViewerUser(user)) {
    return <Navigate to="/quotation-list" replace />;
  }

  return children;
};

export default RoleGuard;
