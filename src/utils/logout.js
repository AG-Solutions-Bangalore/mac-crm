import { logout } from "@/store/auth/authSlice";
import { persistor, store } from "@/store/store";
import { queryClient } from "@/lib/query-client";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Plain logout (usable outside React, e.g. axios 401 interceptor).
 * NOTE: does NOT use localStorage.clear() — browser drafts (quotation/project
 * autosave + pending line items) must survive a forced logout so the user can
 * recover work after logging back in.
 */
export const performAppLogout = async ({ navigate } = {}) => {
  try {
    store.dispatch(logout());
    // Drop every cached query/mutation so the next login never sees the
    // previous account's data (lists, dropdowns, detail pages).
    queryClient.clear();
  } catch (error) {
    console.error("Logout failed:", error);
  }

  try {
    await persistor.purge();
  } catch (error) {
    console.error("Failed to clear persisted session:", error);
  }

  // Remove only redux-persist data; keep autosave drafts in localStorage.
  try {
    localStorage.removeItem("persist:root-aia");
  } catch {
    /* ignore */
  }

  if (typeof navigate === "function") {
    navigate("/", { replace: true });
  } else if (typeof window !== "undefined") {
    window.location.replace("/");
  }
};

const useAppLogout = () => {
  const navigate = useNavigate();

  return useCallback(() => performAppLogout({ navigate }), [navigate]);
};

export default useAppLogout;
