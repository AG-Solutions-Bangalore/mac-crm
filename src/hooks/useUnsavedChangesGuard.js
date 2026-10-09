import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * useUnsavedChangesGuard — shadcn popup wala guard (no native confirm/alert).
 *
 * BrowserRouter (non-data router) me react-router ka useBlocker kaam nahi karta,
 * isliye SPA navigation ko manually guard kiya gaya hai — sab me shadcn dialog:
 *  - click capture -> sidebar / header / andar ke <a href> links par shadcn popup
 *  - popstate guard-> browser Back button par shadcn popup
 *  - requestNavigate -> Back / Cancel buttons par shadcn popup
 *  - beforeunload  -> SIRF refresh/tab-close par browser ka native prompt
 *    (browsers waha custom/shadcn UI allow nahi karte — ye OS-level restriction hai)
 *
 * @param {boolean} isDirty - form me unsaved changes hai ya nahi
 * @param {() => Promise<boolean>} onSave - bina navigate kiye save kare, success par true
 * @returns guard helpers + dialog state
 */
export function useUnsavedChangesGuard({ isDirty, onSave }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState(null); // { type: 'path', to } | { type: 'back' }
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);

  const isDirtyRef = useRef(isDirty);
  const dialogOpenRef = useRef(false);
  const pendingRef = useRef(null);
  const allowRef = useRef(false);
  const onSaveRef = useRef(onSave);

  isDirtyRef.current = isDirty;
  dialogOpenRef.current = dialogOpen;
  pendingRef.current = pendingNav;
  onSaveRef.current = onSave;

  const locationRef = useRef(location.pathname + location.search + location.hash);
  locationRef.current = location.pathname + location.search + location.hash;

  // --- refresh / tab close ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirtyRef.current && !allowRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Programmatic navigation request (Back / Cancel buttons)
  const requestNavigate = useCallback((to) => {
    if (!isDirtyRef.current || allowRef.current) {
      if (typeof to === "number") navigate(to);
      else if (typeof to === "function") to();
      else navigate(to);
      return;
    }
    const target =
      typeof to === "string"
        ? { type: "path", to }
        : typeof to === "number"
          ? { type: "back", delta: to }
          : { type: "callback", fn: to };
    setPendingNav(target);
    setDialogOpen(true);
  }, [navigate]);

  // --- sidebar / in-app <Link> clicks ko capture phase me roko ---
  // NOTE: capture listener dialog ke buttons ko block na kare — isliye pehle
  // check karo click unsaved-dialog ke andar hai ya nahi.
  useEffect(() => {
    const handleClick = (e) => {
      // Shadcn unsaved-dialog ke andar ke clicks (Stay / Leave / Save buttons)
      // ko kabhi block mat karo — warna buttons unclickable lagenge.
      if (e.target?.closest?.("[data-unsaved-dialog]")) return;
      if (!isDirtyRef.current || allowRef.current) return;
      if (dialogOpenRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      if (/^(http|mailto:|tel:)/i.test(href)) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const nextPath = url.pathname + url.search + url.hash;
        if (nextPath === locationRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        setPendingNav({ type: "path", to: nextPath });
        setDialogOpen(true);
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // --- browser Back button guard (dummy history entry) ---
  useEffect(() => {
    if (!isDirty) return;
    window.history.pushState({ __unsavedGuard: true }, "", window.location.href);

    const handlePop = () => {
      if (!isDirtyRef.current || allowRef.current) return;
      // dummy entry pop hui — turant wapas push karke page par roko + popup dikhao
      window.history.pushState({ __unsavedGuard: true }, "", window.location.href);
      setPendingNav({ type: "back" });
      setDialogOpen(true);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [isDirty]);

  const doPendingNavigation = useCallback(() => {
    const pending = pendingRef.current;
    allowRef.current = true;
    setDialogOpen(false);
    setPendingNav(null);
    // allow flag ko next tick me reset taaki agle page ka guard fresh rahe
    setTimeout(() => {
      allowRef.current = false;
    }, 500);

    if (!pending) return;
    if (pending.type === "path") {
      navigate(pending.to);
    } else if (pending.type === "back") {
      if (typeof pending.delta === "number") {
        navigate(pending.delta);
      } else if (window.history.length > 2) {
        // dummy guard entry ko skip karke asli previous page par jao
        window.history.go(-2);
      } else {
        navigate("/quotation-list");
      }
    } else if (pending.type === "callback" && typeof pending.fn === "function") {
      pending.fn();
    }
  }, [navigate]);

  const handleStay = useCallback(() => {
    setDialogOpen(false);
    setPendingNav(null);
  }, []);

  const handleLeaveWithoutSaving = useCallback(() => {
    doPendingNavigation();
  }, [doPendingNavigation]);

  const handleSaveAndLeave = useCallback(async () => {
    const saveFn = onSaveRef.current;
    if (typeof saveFn !== "function") {
      doPendingNavigation();
      return false;
    }
    setIsSavingAndLeaving(true);
    try {
      const ok = await saveFn();
      if (ok) {
        doPendingNavigation();
        return true;
      }
      // validation/save fail -> dialog band karke form par rehne do taaki error dikhe
      setDialogOpen(false);
      setPendingNav(null);
      return false;
    } finally {
      setIsSavingAndLeaving(false);
    }
  }, [doPendingNavigation]);

  return {
    dialogOpen,
    pendingNav,
    isSavingAndLeaving,
    requestNavigate,
    handleStay,
    handleLeaveWithoutSaving,
    handleSaveAndLeave,
    setDialogOpen,
  };
}

export default useUnsavedChangesGuard;
