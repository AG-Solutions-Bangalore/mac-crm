import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "crm-list-search";

const readSearches = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

const writeSearch = (pathname, value) => {
  try {
    const searches = readSearches();
    searches[pathname] = value;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Ignore unavailable storage
  }
};

export function usePersistedSearch(initialValue = "") {
  const { pathname } = useLocation();

  const [value, setValueState] = useState(() => {
    const saved = readSearches()[pathname];
    return typeof saved === "string" ? saved : initialValue;
  });

  const setValue = useCallback(
    (nextValue) => {
      setValueState((previousValue) => {
        const resolved =
          typeof nextValue === "function" ? nextValue(previousValue) : nextValue;
        writeSearch(pathname, resolved);
        return resolved;
      });
    },
    [pathname]
  );

  return [value, setValue];
}
