import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * RoleGuard — restricts a route subtree to a set of allowed user_type values.
 *
 * Usage:
 *   <RoleGuard allow={[3]}>
 *     <SomePage />
 *   </RoleGuard>
 *
 * If the current user is missing or their user_type is not in `allow`,
 * the user is redirected to /dashboard. This complements (does not replace)
 * sidebar filtering — defense in depth so direct URL access is also blocked.
 */
const RoleGuard = ({ allow, children }) => {
  const user = useSelector((state) => state.auth.user);
  const userType = user?.user_type;
  const ok = userType !== undefined && userType !== null && allow.includes(userType);

  if (!ok) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RoleGuard;
