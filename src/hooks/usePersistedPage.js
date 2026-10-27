import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "crm-list-pages";

const readPages = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

const writePage = (pathname, page) => {
  try {
    const pages = readPages();
    pages[pathname] = page;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {
    // Ignore unavailable storage
  }
};

export function usePersistedPage(initialPage = 1) {
  const { pathname } = useLocation();

  const [page, setPageState] = useState(() => {
    const saved = Number(readPages()[pathname]);
    return Number.isFinite(saved) && saved > 0 ? saved : initialPage;
  });

  const setPage = useCallback(
    (nextPage) => {
      setPageState((previousPage) => {
        const resolved =
          typeof nextPage === "function" ? nextPage(previousPage) : nextPage;
        writePage(pathname, resolved);
        return resolved;
      });
    },
    [pathname]
  );

  return [page, setPage];
}
