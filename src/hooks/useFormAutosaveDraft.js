import { useCallback, useEffect, useRef, useState } from "react";

const DRAFT_PREFIX = "mac-crm:form-autosave:";
const DRAFT_VERSION = 1;

export const formAutosaveKey = (scope, id, userId) =>
  `${DRAFT_PREFIX}${userId ?? "anon"}:${scope}:${id ?? "new"}`;

export const readFormAutosaveDraft = (storageKey) => {
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed?.version !== DRAFT_VERSION ||
      !parsed?.formData ||
      typeof parsed.formData !== "object" ||
      !Array.isArray(parsed?.servicesState)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writeFormAutosaveDraft = (
  storageKey,
  { baseSnapshot, formData, servicesState }
) => {
  if (!storageKey) return false;
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: DRAFT_VERSION,
        savedAt: Date.now(),
        baseSnapshot,
        formData,
        servicesState,
      })
    );
    return true;
  } catch {
    return false;
  }
};

export const clearFormAutosaveDraft = (storageKey) => {
  if (!storageKey) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
};

/**
 * Keeps a local draft of the form in sync as the user types/adds line items.
 * The draft survives reloads, tab close and the 401 logout redirect.
 *
 * Restore rules:
 *  - edit mode: only restore when the draft was based on the same server
 *    snapshot (`initialSnapshot`), so newer server data is never overwritten.
 *  - create mode: restore whenever a draft exists for this user/scope.
 */
export const useFormAutosaveDraft = ({
  storageKey,
  formData,
  servicesState,
  initialSnapshot,
  onRestore,
  enabled = true,
  requireMatchingBaseline = true,
  debounceMs = 900,
}) => {
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const restoredRef = useRef(false);
  const suppressRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  const latestRef = useRef({
    storageKey,
    formData,
    servicesState,
    initialSnapshot,
  });

  onRestoreRef.current = onRestore;
  latestRef.current = { storageKey, formData, servicesState, initialSnapshot };

  useEffect(() => {
    restoredRef.current = false;
    suppressRef.current = false;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    suppressRef.current = true;
    clearFormAutosaveDraft(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled || !storageKey || !initialSnapshot) return;
    if (restoredRef.current) return;

    const draft = readFormAutosaveDraft(storageKey);
    if (!draft) {
      restoredRef.current = true;
      return;
    }

    if (
      requireMatchingBaseline &&
      draft.baseSnapshot &&
      draft.baseSnapshot !== initialSnapshot
    ) {
      // Server data changed since this draft was written. Never clobber it.
      return;
    }

    const draftSnapshot = JSON.stringify({
      formData: draft.formData,
      servicesState: draft.servicesState,
    });
    const currentSnapshot = JSON.stringify({
      formData: latestRef.current.formData,
      servicesState: latestRef.current.servicesState,
    });

    if (
      draftSnapshot === initialSnapshot ||
      draftSnapshot === currentSnapshot
    ) {
      clearFormAutosaveDraft(storageKey);
      restoredRef.current = true;
      return;
    }

    try {
      onRestoreRef.current?.(draft);
      setLastSavedAt(draft.savedAt || Date.now());
    } catch {
      /* keep the form usable even if the draft is malformed */
      return;
    }
    restoredRef.current = true;
  }, [enabled, storageKey, initialSnapshot, requireMatchingBaseline]);

  useEffect(() => {
    if (!enabled || !storageKey || !initialSnapshot) return;
    if (JSON.stringify({ formData, servicesState }) === initialSnapshot) return;

    suppressRef.current = false;

    const timer = setTimeout(() => {
      if (suppressRef.current) return;
      const saved = writeFormAutosaveDraft(storageKey, {
        baseSnapshot: initialSnapshot,
        formData,
        servicesState,
      });
      if (saved) setLastSavedAt(Date.now());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    enabled,
    storageKey,
    initialSnapshot,
    formData,
    servicesState,
    debounceMs,
  ]);

  useEffect(() => {
    if (!enabled || !storageKey) return;

    const flush = () => {
      if (suppressRef.current) return;
      const latest = latestRef.current;
      if (!latest.initialSnapshot) return;
      if (
        JSON.stringify({
          formData: latest.formData,
          servicesState: latest.servicesState,
        }) === latest.initialSnapshot
      ) {
        return;
      }
      writeFormAutosaveDraft(latest.storageKey, {
        baseSnapshot: latest.initialSnapshot,
        formData: latest.formData,
        servicesState: latest.servicesState,
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, storageKey]);

  return { lastSavedAt, clearDraft };
};

export default useFormAutosaveDraft;
