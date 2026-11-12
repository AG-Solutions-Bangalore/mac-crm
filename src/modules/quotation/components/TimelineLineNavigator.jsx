import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  MapPin,
  Search,
  Pin,
  PinOff,
  X,
  ArrowRight,
} from "lucide-react";

/**
 * TimelineLineNavigator
 * Ultra-performant, zero-lag quick jump navigator for Quotation Floor & Area lines.
 */
const TimelineLineNavigator = ({
  type = "floor", // "floor" | "area"
  serviceIndex = 0,
  serviceName = "",
  floorIndex = 0,
  floorName = "",
  floors = [], // srv.floors
  areas = [], // floor.areas (when type="area")
  floorOptions = [], // API floors
  areaOptions = [], // API areas
  allFloors = [], // srv.floors (passed when type="area" for sibling floor navigation)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 100, left: 100 });
  const [searchQuery, setSearchQuery] = useState("");

  const closeTimerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const isPinnedRef = useRef(false);

  // Keep ref in sync for event listeners
  useEffect(() => {
    isPinnedRef.current = isPinned;
  }, [isPinned]);

  const clearTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Instant open on mouse enter
  const handleMouseEnter = useCallback(
    (e) => {
      clearTimer();
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientY = e.clientY;
      const estimatedHeight = 360;
      const top = Math.max(
        16,
        Math.min(clientY - 50, window.innerHeight - estimatedHeight - 16)
      );
      const left = rect.right + 6;

      setPopoverPos({ top, left });
      setIsOpen(true);
    },
    [clearTimer]
  );

  // Debounced close on mouse leave (ignored if pinned)
  const handleMouseLeave = useCallback(() => {
    if (isPinnedRef.current) return;
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, [clearTimer]);

  const handlePopoverMouseEnter = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handlePopoverMouseLeave = useCallback(() => {
    if (isPinnedRef.current) return;
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, [clearTimer]);

  // Smooth scroll and flash outline
  const scrollToTarget = useCallback(
    (targetId, flashType = "floor") => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });

        const ringClasses =
          flashType === "floor"
            ? ["ring-2", "ring-blue-500", "ring-offset-2", "bg-blue-50/25", "dark:bg-blue-950/25"]
            : ["ring-2", "ring-amber-500", "ring-offset-2", "bg-amber-50/25", "dark:bg-amber-950/25"];

        el.classList.add(...ringClasses);
        setTimeout(() => {
          el.classList.remove(...ringClasses);
        }, 1800);
      }
      // If NOT pinned, close the popover. If PINNED, KEEP IT OPEN!
      if (!isPinnedRef.current) {
        setIsOpen(false);
      }
    },
    []
  );

  // Outside click & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      // If PINNED, DO NOT CLOSE on outside clicks!
      if (isPinnedRef.current) return;

      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsPinned(false);
      }
    };

    const handleWindowScroll = () => {
      // Only close on window scroll if NOT pinned
      if (!isPinnedRef.current) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [isOpen]);

  // Clean timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Helpers (only used when open)
  const resolveFloorName = useCallback(
    (flr, idx) => {
      const id = flr?.floorId?.toString();
      const match = floorOptions?.find((f) => f.id?.toString() === id);
      return match?.property_floor || `Floor #${idx + 1}`;
    },
    [floorOptions]
  );

  const resolveAreaName = useCallback(
    (ar, idx) => {
      const id = ar?.areaId?.toString();
      const match = areaOptions?.find((a) => a.id?.toString() === id);
      return match?.property_area || `Area #${idx + 1}`;
    },
    [areaOptions]
  );

  const getAreaTotal = (ar) => {
    if (!ar?.products) return 0;
    return ar.products.reduce((sum, p) => {
      return sum + (Number(p.price) || 0) * (Number(p.quantity) || 0);
    }, 0);
  };

  const getFloorTotal = (flr) => {
    if (!flr?.areas) return 0;
    return flr.areas.reduce((sum, ar) => sum + getAreaTotal(ar), 0);
  };

  const getFloorProductCount = (flr) => {
    if (!flr?.areas) return 0;
    return flr.areas.reduce((sum, ar) => sum + (ar.products?.length || 0), 0);
  };

  // Filtered lists (lazy evaluated only when open)
  const filteredFloors = useMemo(() => {
    if (!isOpen || type !== "floor") return [];
    if (!searchQuery.trim()) return floors;
    const q = searchQuery.toLowerCase().trim();
    return floors.filter((flr, idx) => {
      const fName = resolveFloorName(flr, idx).toLowerCase();
      if (fName.includes(q)) return true;
      return flr.areas?.some((ar, aIdx) =>
        resolveAreaName(ar, aIdx).toLowerCase().includes(q)
      );
    });
  }, [isOpen, type, searchQuery, floors, resolveFloorName, resolveAreaName]);

  const filteredAreas = useMemo(() => {
    if (!isOpen || type !== "area") return [];
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase().trim();
    return areas.filter((ar, idx) =>
      resolveAreaName(ar, idx).toLowerCase().includes(q)
    );
  }, [isOpen, type, searchQuery, areas, resolveAreaName]);

  const isFloor = type === "floor";
  const titleText = isFloor
    ? "Browse Floors"
    : `Areas in ${floorName || resolveFloorName(allFloors[floorIndex], floorIndex)}`;
  const subtitleText = isFloor
    ? serviceName || `Service #${serviceIndex + 1}`
    : `${serviceName || `Service #${serviceIndex + 1}`} › ${floorName || `Floor #${floorIndex + 1}`}`;

  return (
    <>
      {/* 
        Hit Strip Overlay:
        Narrow, precise hit zone with pointer-events-none on decoration so there is ZERO jitter.
      */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={`Hover to browse ${isFloor ? "floors & areas" : "areas"}`}
        className="absolute -left-[7px] top-0 bottom-0 w-[16px] cursor-pointer z-20 select-none group/tline"
      >
        {/* Visual guide line highlight on hover (pointer-events-none avoids mouseout flickering) */}
        <div
          className={`pointer-events-none absolute left-[6px] top-0 bottom-0 w-[2.5px] rounded-full transition-colors duration-100 ${
            isFloor
              ? "bg-transparent group-hover/tline:bg-blue-600 dark:group-hover/tline:bg-blue-400 group-hover/tline:shadow-[0_0_8px_rgba(37,99,235,0.7)]"
              : "border-l-2 border-dashed border-transparent group-hover/tline:border-amber-500 dark:group-hover/tline:border-amber-400 group-hover/tline:shadow-[0_0_8px_rgba(245,158,11,0.7)]"
          } ${
            isOpen
              ? isFloor
                ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.7)]"
                : "border-l-2 border-dashed border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
              : ""
          }`}
        />
      </div>

      {/* Floating Popover via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            style={{
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
            /* Invisible bridge before: -left-3 connects mouse between line and menu */
            className="fixed z-[9999] w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden before:content-[''] before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 text-slate-800 dark:text-slate-100 animate-in fade-in-50 duration-75"
          >
            {/* Header */}
            <div
              className={`p-3 border-b flex items-center justify-between ${
                isFloor
                  ? "bg-gradient-to-r from-blue-50/90 to-slate-50/50 dark:from-blue-950/40 dark:to-slate-900 border-blue-100 dark:border-slate-800"
                  : "bg-gradient-to-r from-amber-50/90 to-slate-50/50 dark:from-amber-950/40 dark:to-slate-900 border-amber-100 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isFloor
                      ? "bg-blue-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isFloor ? <Building2 size={15} /> : <MapPin size={15} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">
                      {titleText}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isFloor
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {isFloor ? `${floors.length} Floors` : `${areas.length} Areas`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {subtitleText}
                  </p>
                </div>
              </div>

              {/* Pin & Close buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPinned((prev) => !prev)}
                  title={isPinned ? "Pinned! Click to unpin" : "Pin to stay open while you work"}
                  className={`px-1.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    isPinned
                      ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-500"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  {isPinned ? (
                    <>
                      <PinOff size={12} />
                      <span className="text-[10px]">Pinned</span>
                    </>
                  ) : (
                    <>
                      <Pin size={12} />
                      <span className="text-[10px]">Pin</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  title="Close (Esc)"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Quick Search (shown if items > 3) */}
            {((isFloor && floors.length > 2) || (!isFloor && areas.length > 3)) && (
              <div className="p-2 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isFloor ? "Filter floors or areas..." : "Filter areas..."}
                    className="w-full pl-7 pr-2 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Content List */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1.5 text-xs">
              {/* FLOOR MODE: List of floors with their nested areas */}
              {isFloor && (
                <>
                  {filteredFloors.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No matching floors found
                    </div>
                  ) : (
                    filteredFloors.map((flr, fIdx) => {
                      const originalIndex = floors.indexOf(flr);
                      const fNum = originalIndex !== -1 ? originalIndex : fIdx;
                      const fDisplayName = resolveFloorName(flr, fNum);
                      const fAreaCount = flr.areas?.length || 0;
                      const fProdCount = getFloorProductCount(flr);
                      const fTotal = getFloorTotal(flr);

                      return (
                        <div
                          key={fNum}
                          className="group border border-slate-100 dark:border-slate-800/80 rounded-lg p-2 hover:border-blue-200 dark:hover:border-blue-900 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          {/* Floor Jump Row */}
                          <div
                            onClick={() =>
                              scrollToTarget(
                                `quotation-floor-${serviceIndex}-${fNum}`,
                                "floor"
                              )
                            }
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {fNum + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {fDisplayName}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {fAreaCount} {fAreaCount === 1 ? "area" : "areas"} • {fProdCount} {fProdCount === 1 ? "item" : "items"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {fTotal > 0 && (
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  ₹{fTotal.toLocaleString("en-IN")}
                                </span>
                              )}
                              <ArrowRight
                                size={12}
                                className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform"
                              />
                            </div>
                          </div>

                          {/* Nested Areas Pills */}
                          {flr.areas && flr.areas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                              {flr.areas.map((ar, aIdx) => {
                                const aDisplayName = resolveAreaName(ar, aIdx);
                                const aItemCount = ar.products?.length || 0;
                                return (
                                  <button
                                    key={aIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollToTarget(
                                        `quotation-area-${serviceIndex}-${fNum}-${aIdx}`,
                                        "area"
                                      );
                                    }}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
                                    title={`Jump to ${aDisplayName}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="truncate max-w-[100px]">
                                      {aDisplayName}
                                    </span>
                                    {aItemCount > 0 && (
                                      <span className="text-slate-400 text-[9px]">
                                        ({aItemCount})
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* AREA MODE: List of areas in the current floor */}
              {!isFloor && (
                <>
                  {filteredAreas.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No areas found on this floor
                    </div>
                  ) : (
                    filteredAreas.map((ar, aIdx) => {
                      const originalIndex = areas.indexOf(ar);
                      const aNum = originalIndex !== -1 ? originalIndex : aIdx;
                      const aDisplayName = resolveAreaName(ar, aNum);
                      const aProdCount = ar.products?.length || 0;
                      const aTotal = getAreaTotal(ar);

                      return (
                        <div
                          key={aNum}
                          onClick={() =>
                            scrollToTarget(
                              `quotation-area-${serviceIndex}-${floorIndex}-${aNum}`,
                              "area"
                            )
                          }
                          className="group border border-slate-100 dark:border-slate-800/80 rounded-lg p-2 hover:border-amber-300 dark:hover:border-amber-900 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {aNum + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {aDisplayName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {aProdCount} {aProdCount === 1 ? "product" : "products"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            {aTotal > 0 && (
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                ₹{aTotal.toLocaleString("en-IN")}
                              </span>
                            )}
                            <ArrowRight
                              size={12}
                              className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Sibling floor switch pills if service has multiple floors */}
                  {allFloors && allFloors.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Other Floors
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {allFloors.map((flr, oIdx) => {
                          const isCurrent = oIdx === floorIndex;
                          const name = resolveFloorName(flr, oIdx);
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() =>
                                scrollToTarget(
                                  `quotation-floor-${serviceIndex}-${oIdx}`,
                                  "floor"
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                                isCurrent
                                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold"
                                  : "bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                              }`}
                            >
                              <Building2 size={10} />
                              <span className="truncate max-w-[90px]">{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>{isPinned ? "📌 Pinned (won't close on tap)" : "Click to jump • Esc to close"}</span>
              {isPinned ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(false);
                    setIsOpen(false);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-[10px] font-medium"
                >
                  Unpin & Close
                </button>
              ) : (
                <span className="text-[9px] text-slate-300 dark:text-slate-600">
                  Esc to close
                </span>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default TimelineLineNavigator;
