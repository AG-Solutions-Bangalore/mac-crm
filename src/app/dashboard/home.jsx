import React, { useMemo, useState } from "react";
import Page from "../layout/page";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { DASHBOARD_API } from "@/constants/apiConstants";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Users,
  Layers,
  Clock,
  RefreshCw,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  FolderKanban,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  EyeOff,
  UserCheck,
  ArrowRight,
  Search,
  Filter,
  BarChart3,
  Inbox,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const getServiceBadgeClass = (serviceName) => {
  if (!serviceName) return "badge-default";
  const service = serviceName.toLowerCase();
  if (service.includes("switch")) return "badge-switches";
  if (service.includes("door") || service.includes("automation"))
    return "badge-automation";
  if (
    service.includes("network") ||
    service.includes("wifi") ||
    service.includes("internet")
  )
    return "badge-networking";
  if (service.includes("light")) return "badge-lighting";
  if (
    service.includes("secur") ||
    service.includes("camera") ||
    service.includes("cctv")
  )
    return "badge-security";
  return "badge-default";
};

// Calculate previous financial year string (e.g. "2026-27" -> "2025-26")
const getPreviousYearStr = (yearStr) => {
  if (!yearStr) return "2025-26";
  const match = yearStr.match(/^(\d{4})-(\d{2,4})$/);
  if (match) {
    const startYear = parseInt(match[1], 10) - 1;
    const endYear = parseInt(match[2], 10) - 1;
    const endStr =
      match[2].length === 2
        ? String(endYear).padStart(2, "0")
        : String(endYear);
    return `${startYear}-${endStr}`;
  }
  const singleYear = parseInt(yearStr, 10);
  if (!isNaN(singleYear)) {
    return String(singleYear - 1);
  }
  return "2025-26";
};

// Tooltip for Year-Wise Comparison
const YearWiseTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs text-foreground min-w-[210px] backdrop-blur-md">
        {label && (
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 pb-1.5 border-b border-border flex items-center justify-between">
            <span>Fiscal Year</span>
            <span className="font-mono text-foreground font-bold text-xs">
              {label}
            </span>
          </div>
        )}
        <div className="space-y-2">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color || item.fill }}
                />
                {item.name}:
              </span>
              <span className="font-bold text-foreground font-mono text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [expandedActiveService, setExpandedActiveService] = useState(null);
  const [expandedHideService, setExpandedHideService] = useState(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [onlyWithClients, setOnlyWithClients] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");

  const {
    data: DData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ["dashboard-list"],
    staleTime: 0,
  });

  const dashboardData = DData?.data || {};
  const graph1List = dashboardData?.graph1 || [];

  // Determine current year and previous year purely as year numbers/strings
  const currentYearStr = useMemo(() => {
    if (graph1List.length > 0 && graph1List[0].year) {
      return graph1List[0].year;
    }
    const curr = moment().year();
    const nextShort = String((curr + 1) % 100).padStart(2, "0");
    return `${curr}-${nextShort}`;
  }, [graph1List]);

  const prevYearStr = useMemo(() => {
    return getPreviousYearStr(currentYearStr);
  }, [currentYearStr]);

  // Current year data from graph1
  const currentYearData = useMemo(() => {
    const found = graph1List.find((g) => g.year === currentYearStr);
    return {
      year: currentYearStr,
      pending: Number(found?.pending_count || 0),
      approved: Number(found?.approved_count || 0),
      running: Number(found?.running_project_count || 0),
      finished: Number(found?.finish_project_count || 0),
    };
  }, [graph1List, currentYearStr]);

  // Previous year data from graph1 if available, otherwise baseline 0
  const prevYearData = useMemo(() => {
    const found = graph1List.find((g) => g.year === prevYearStr);
    return {
      year: prevYearStr,
      pending: Number(found?.pending_count || 0),
      approved: Number(found?.approved_count || 0),
      running: Number(found?.running_project_count || 0),
      finished: Number(found?.finish_project_count || 0),
      isFromApi: Boolean(found),
    };
  }, [graph1List, prevYearStr]);

  // Chart data: ONLY the years on X-Axis (e.g. "2025-26", "2026-27")
  const yearWiseChartData = useMemo(() => {
    if (graph1List.length > 1) {
      return graph1List.map((item) => ({
        year: item.year, // ONLY YEAR
        "Pending Quotations": Number(item.pending_count || 0),
        "Approved Quotations": Number(item.approved_count || 0),
        "Running Projects": Number(item.running_project_count || 0),
        "Finished Projects": Number(item.finish_project_count || 0),
      }));
    }

    // Default comparison between prevYear and currentYear showing ONLY year strings
    return [
      {
        year: prevYearStr, // ONLY YEAR e.g. "2025-26"
        "Pending Quotations": prevYearData.pending,
        "Approved Quotations": prevYearData.approved,
        "Running Projects": prevYearData.running,
        "Finished Projects": prevYearData.finished,
      },
      {
        year: currentYearStr, // ONLY YEAR e.g. "2026-27"
        "Pending Quotations": currentYearData.pending,
        "Approved Quotations": currentYearData.approved,
        "Running Projects": currentYearData.running,
        "Finished Projects": currentYearData.finished,
      },
    ];
  }, [graph1List, prevYearStr, currentYearStr, prevYearData, currentYearData]);

  // Image URLs resolution from image_url array
  const serviceBaseUrl = useMemo(() => {
    const item = (dashboardData?.image_url || []).find(
      (img) => (img.image_for || "").toLowerCase() === "service"
    );
    return (
      item?.image_url ||
      "https://makcautomations.com/crmapi/public/assets/images/service_images/"
    );
  }, [dashboardData?.image_url]);

  const noImageUrl = useMemo(() => {
    const item = (dashboardData?.image_url || []).find(
      (img) => (img.image_for || "").toLowerCase() === "no image"
    );
    return (
      item?.image_url ||
      "https://makcautomations.com/crmapi/public/assets/images/no_image.jpg"
    );
  }, [dashboardData?.image_url]);

  const getServiceLogoUrl = (logo) => {
    if (!logo) return noImageUrl;
    return `${serviceBaseUrl}${logo}`;
  };

  const latestRequests = dashboardData?.latest_service_requests || [];
  const usersServiceList = dashboardData?.users_service || [];
  const usersHideServiceList = dashboardData?.users_hide_service || [];

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") return latestRequests;
    return latestRequests.filter(
      (r) =>
        (r.services_request_status || "").toLowerCase() ===
        requestFilter.toLowerCase()
    );
  }, [latestRequests, requestFilter]);

  // Filtered active services
  const filteredActiveServices = useMemo(() => {
    return usersServiceList.filter((s) => {
      const matchesSearch =
        s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
        (s.users || []).some((u) =>
          (u.name || "").toLowerCase().includes(serviceSearchTerm.toLowerCase())
        );
      const matchesClients = onlyWithClients
        ? Number(s.users_count || 0) > 0
        : true;
      return matchesSearch && matchesClients;
    });
  }, [usersServiceList, serviceSearchTerm, onlyWithClients]);

  // Filtered hidden services
  const filteredHideServices = useMemo(() => {
    return usersHideServiceList.filter((s) => {
      const matchesSearch =
        s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
        (s.users || []).some((u) =>
          (u.name || "").toLowerCase().includes(serviceSearchTerm.toLowerCase())
        );
      const matchesClients = onlyWithClients
        ? Number(s.users_count || 0) > 0
        : true;
      return matchesSearch && matchesClients;
    });
  }, [usersHideServiceList, serviceSearchTerm, onlyWithClients]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  const renderVarianceBadge = (diff, prevVal) => {
    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
          <TrendingUp className="h-3.5 w-3.5" />
          +{diff} {prevVal === 0 ? "(New)" : `(+${Math.round((diff / prevVal) * 100)}%)`}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">
          <TrendingDown className="h-3.5 w-3.5" />
          {diff} {prevVal !== 0 ? `(${Math.round((diff / prevVal) * 100)}%)` : ""}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground font-mono text-xs">
        <Minus className="h-3 w-3" />
        0 (Equal)
      </span>
    );
  };

  return (
    <Page>
      <div className="main space-y-6 max-w-7xl mx-auto">
        {/* HEADER GREETING BANNER */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs">
          <div className="relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live CRM Dashboard
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-foreground">
                {getGreeting()},{" "}
                <span className="text-primary">{user?.name || "Admin"}</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Today is {moment().format("dddd, MMMM Do, YYYY")}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-xs font-semibold gap-2 h-9 px-3.5 shadow-2xs cursor-pointer hover:bg-muted transition-all"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
                />
                <span>{isFetching ? "Updating..." : "Refresh Data"}</span>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-center text-sm font-semibold text-destructive">
            Failed to load dashboard data. Please verify your connection and click Refresh.
          </div>
        ) : (
          <>
            {/* 1. TOP ROW: PRIMARY ENTITY COUNTS (3 Cards) */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Total Clients Card */}
              <div
                onClick={() => navigate("/client-list")}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Clients
                    </span>
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground pt-1">
                      {dashboardData?.users_count ?? 0}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-muted-foreground">Registered accounts</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Clients <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* Total Services Card */}
              <div
                onClick={() => navigate("/service-list")}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Services
                    </span>
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground pt-1">
                      {dashboardData?.services_count ?? 0}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-muted-foreground">Active service catalog</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Services <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* Pending Requests Card */}
              <div
                onClick={() => navigate("/service-request")}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-orange-500/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pending Requests
                    </span>
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground pt-1">
                      {dashboardData?.service_requests_pending_count ?? 0}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-105 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Action required
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Manage Queue <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PIPELINE LIFECYCLE (5 Stage Quotations & Projects Workflow) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  
                </span>
              </div>

              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {/* 1. Pending Quotations */}
                <div
                  onClick={() => navigate("/quotation-list")}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-amber-500/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Pending Quotes
                    </span>
                    <FileText className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {dashboardData?.pending_quotation_count ?? 0}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Awaiting response
                  </div>
                </div>

                {/* 2. Approved Quotations */}
                <div
                  onClick={() => navigate("/quotation-list")}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Approved Quotes
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {dashboardData?.approved_quotation_count ?? 0}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Accepted by client
                  </div>
                </div>

                {/* 3. Cancelled Quotations */}
                <div
                  onClick={() => navigate("/quotation-list")}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-rose-500/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Cancelled Quotes
                    </span>
                    <XCircle className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {dashboardData?.cancel_quotation_count ?? 0}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    Declined proposals
                  </div>
                </div>

                {/* 4. Running Projects */}
                <div
                  onClick={() => navigate("/project-list")}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Running Projects
                    </span>
                    <FolderKanban className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {dashboardData?.running_project_count ?? 0}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    In execution
                  </div>
                </div>

                {/* 5. Finished Projects */}
                <div
                  onClick={() => navigate("/project-list")}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-purple-500/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Finished Projects
                    </span>
                    <CheckCheck className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {dashboardData?.finish_project_count ?? 0}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Delivered & closed
                  </div>
                </div>
              </div>
            </div>

            {/* 3. YEAR-WISE COMPARISON GRAPH (Strictly from API graph1, ONLY YEARS on X-Axis) */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-base font-display text-foreground">
                      Year-Wise Comparison
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quotations and projects performance grouped by fiscal year
                  </p>
                </div>

                {/* Year indicator badges */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1 text-xs font-semibold font-mono text-muted-foreground">
                    {prevYearStr}
                  </span>
                  <span className="text-muted-foreground text-xs font-bold">vs</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold font-mono text-primary">
                    {currentYearStr}
                  </span>
                </div>
              </div>



              {/* BAR CHART: ONLY YEARS ON X-AXIS */}
              <div className="h-[310px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearWiseChartData}
                    margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                      opacity={0.7}
                    />
                    <XAxis
                      dataKey="year"
                      stroke="var(--ink-soft)"
                      fontSize={13}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-border)" }}
                      dy={8}
                    />
                    <YAxis
                      stroke="var(--ink-soft)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<YearWiseTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={40}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
                    />
                    <Bar
                      dataKey="Pending Quotations"
                      fill="#F59E0B"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="Approved Quotations"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="Running Projects"
                      fill="#3B82F6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="Finished Projects"
                      fill="#8B5CF6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* YoY COMPARISON SUMMARY DATA TABLE */}
              <div className="overflow-x-auto mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Year Comparison Variance Table
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                      <th className="py-2.5 px-3">Metric Category</th>
                      <th className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono">
                        {prevYearStr}
                      </th>
                      <th className="py-2.5 px-3 text-primary font-mono">
                        {currentYearStr}
                      </th>
                      <th className="py-2.5 px-3">Variance (Difference)</th>
                      <th className="py-2.5 px-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Pending Quotations
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {prevYearData.pending}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {currentYearData.pending}
                      </td>
                      <td className="py-3 px-3">
                        {renderVarianceBadge(
                          currentYearData.pending - prevYearData.pending,
                          prevYearData.pending
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {currentYearData.pending > prevYearData.pending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Increased <TrendingUp className="h-3 w-3" />
                          </span>
                        ) : currentYearData.pending < prevYearData.pending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Decreased <TrendingDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Equal
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Approved Quotations
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {prevYearData.approved}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {currentYearData.approved}
                      </td>
                      <td className="py-3 px-3">
                        {renderVarianceBadge(
                          currentYearData.approved - prevYearData.approved,
                          prevYearData.approved
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {currentYearData.approved > prevYearData.approved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Increased <TrendingUp className="h-3 w-3" />
                          </span>
                        ) : currentYearData.approved < prevYearData.approved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Decreased <TrendingDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Equal
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Running Projects
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {prevYearData.running}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {currentYearData.running}
                      </td>
                      <td className="py-3 px-3">
                        {renderVarianceBadge(
                          currentYearData.running - prevYearData.running,
                          prevYearData.running
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {currentYearData.running > prevYearData.running ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Increased <TrendingUp className="h-3 w-3" />
                          </span>
                        ) : currentYearData.running < prevYearData.running ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Decreased <TrendingDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Equal
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Finished Projects
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {prevYearData.finished}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {currentYearData.finished}
                      </td>
                      <td className="py-3 px-3">
                        {renderVarianceBadge(
                          currentYearData.finished - prevYearData.finished,
                          prevYearData.finished
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {currentYearData.finished > prevYearData.finished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Increased <TrendingUp className="h-3 w-3" />
                          </span>
                        ) : currentYearData.finished < prevYearData.finished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Decreased <TrendingDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Equal
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Total Row */}
                    <tr className="bg-muted/20 font-bold">
                      <td className="py-3 px-3 text-foreground">
                        Total Activities
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {prevYearData.pending +
                          prevYearData.approved +
                          prevYearData.running +
                          prevYearData.finished}
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground">
                        {currentYearData.pending +
                          currentYearData.approved +
                          currentYearData.running +
                          currentYearData.finished}
                      </td>
                      <td className="py-3 px-3">
                        {renderVarianceBadge(
                          currentYearData.pending +
                            currentYearData.approved +
                            currentYearData.running +
                            currentYearData.finished -
                            (prevYearData.pending +
                              prevYearData.approved +
                              prevYearData.running +
                              prevYearData.finished),
                          prevYearData.pending +
                            prevYearData.approved +
                            prevYearData.running +
                            prevYearData.finished
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        Summary
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. SERVICE USERS BREAKDOWN (users_service & users_hide_service) */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="font-bold text-base font-display text-foreground">
                    Service Clients Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Registered users enrolled per catalog service
                  </p>
                </div>

                {/* Filter and search toolbar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search service or client..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="h-8 w-48 sm:w-56 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <Button
                    variant={onlyWithClients ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOnlyWithClients(!onlyWithClients)}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Filter className="h-3 w-3" />
                    <span>With Clients</span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="active" className="w-full mt-4">
                <TabsList className="grid w-full sm:w-[380px] grid-cols-2 p-1 bg-muted/60">
                  <TabsTrigger
                    value="active"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Active Services ({usersServiceList.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="hidden"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Hidden Services ({usersHideServiceList.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: ACTIVE SERVICES */}
                <TabsContent value="active" className="mt-5">
                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredActiveServices.length > 0 ? (
                      filteredActiveServices.map((service) => {
                        const isExpanded =
                          expandedActiveService === service.service_id;
                        const hasUsers = (service.users || []).length > 0;

                        return (
                          <div
                            key={service.service_id}
                            className={`rounded-xl border transition-all ${
                              isExpanded
                                ? "border-primary/50 bg-card shadow-sm"
                                : "border-border bg-card/60 hover:bg-card hover:border-border/90 hover:shadow-2xs"
                            } p-4`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={getServiceLogoUrl(service.service_logo)}
                                  alt={service.service_name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = noImageUrl;
                                  }}
                                  className="h-10 w-10 rounded-lg object-cover border border-border/80 bg-muted/40 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-foreground truncate">
                                    {service.service_name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                                        hasUsers
                                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {service.users_count}{" "}
                                      {service.users_count === 1
                                        ? "client"
                                        : "clients"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {hasUsers ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedActiveService(
                                      isExpanded ? null : service.service_id
                                    )
                                  }
                                  className="h-8 px-2.5 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <span>{isExpanded ? "Close" : "View"}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60 italic px-2">
                                  Empty
                                </span>
                              )}
                            </div>

                            {/* Collapsible Enrolled Clients */}
                            {isExpanded && hasUsers && (
                              <div className="mt-3.5 pt-3 border-t border-border space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  <span>Enrolled Clients</span>
                                  <span className="font-mono">
                                    {service.users.length} registered
                                  </span>
                                </div>
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                                  {service.users.map((client, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {getInitials(client.name)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-foreground truncate">
                                            {client.name}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground font-mono">
                                            M-ID: #{client.m_id}
                                          </div>
                                        </div>
                                      </div>

                                      {client.mobile && (
                                        <a
                                          href={`tel:${client.mobile}`}
                                          className="text-[11px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border shrink-0 transition-colors"
                                        >
                                          <Phone className="h-3 w-3 text-muted-foreground" />
                                          <span>{client.mobile}</span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                        No active services matched your filter.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: HIDDEN SERVICES */}
                <TabsContent value="hidden" className="mt-5">
                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredHideServices.length > 0 ? (
                      filteredHideServices.map((service) => {
                        const isExpanded =
                          expandedHideService === service.service_id;
                        const hasUsers = (service.users || []).length > 0;

                        return (
                          <div
                            key={service.service_id}
                            className={`rounded-xl border transition-all ${
                              isExpanded
                                ? "border-primary/50 bg-card shadow-sm"
                                : "border-border bg-card/60 hover:bg-card hover:border-border/90 hover:shadow-2xs"
                            } p-4`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={getServiceLogoUrl(service.service_logo)}
                                  alt={service.service_name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = noImageUrl;
                                  }}
                                  className="h-10 w-10 rounded-lg object-cover border border-border/80 bg-muted/40 shrink-0 opacity-80"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                                    {service.service_name}
                                    <EyeOff className="h-3 w-3 text-muted-foreground shrink-0" />
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                                        hasUsers
                                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {service.users_count}{" "}
                                      {service.users_count === 1
                                        ? "client"
                                        : "clients"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {hasUsers ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedHideService(
                                      isExpanded ? null : service.service_id
                                    )
                                  }
                                  className="h-8 px-2.5 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <span>{isExpanded ? "Close" : "View"}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60 italic px-2">
                                  Empty
                                </span>
                              )}
                            </div>

                            {/* Collapsible Hidden Clients */}
                            {isExpanded && hasUsers && (
                              <div className="mt-3.5 pt-3 border-t border-border space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  <span>Hidden Service Clients</span>
                                  <span className="font-mono">
                                    {service.users.length} registered
                                  </span>
                                </div>
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                                  {service.users.map((client, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="h-7 w-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {getInitials(client.name)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-foreground truncate">
                                            {client.name}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground font-mono">
                                            M-ID: #{client.m_id}
                                          </div>
                                        </div>
                                      </div>

                                      {client.mobile && (
                                        <a
                                          href={`tel:${client.mobile}`}
                                          className="text-[11px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border shrink-0 transition-colors"
                                        >
                                          <Phone className="h-3 w-3 text-muted-foreground" />
                                          <span>{client.mobile}</span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                        No hidden services matched your filter.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 5. LATEST SERVICE REQUESTS */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base font-display text-foreground">
                      Latest Service Requests
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                      {latestRequests.length} recent
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Incoming client tickets and maintenance requests
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status filter buttons */}
                  <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                    <button
                      onClick={() => setRequestFilter("all")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        requestFilter === "all"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setRequestFilter("pending")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        requestFilter === "pending"
                          ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setRequestFilter("approved")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        requestFilter === "approved"
                          ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Approved
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/service-request")}
                    className="text-xs gap-1.5 h-8 font-semibold cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Mobile</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr
                          key={request.id}
                          onClick={() => navigate("/service-request")}
                          className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            {request.services_request_date
                              ? moment(request.services_request_date).format(
                                  "DD MMM YYYY"
                                )
                              : "-"}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(request.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {request.name}
                                </div>
                                {request.m_id && (
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    M-ID: #{request.m_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            {request.mobile ? (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-muted-foreground/70" />
                                {request.mobile}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              {request.service_logo && (
                                <img
                                  src={getServiceLogoUrl(request.service_logo)}
                                  alt={request.service_name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = noImageUrl;
                                  }}
                                  className="h-6 w-6 rounded-md object-cover border border-border/80 bg-muted/40 shrink-0"
                                />
                              )}
                              <span
                                className={`service-badge ${getServiceBadgeClass(
                                  request.service_name
                                )}`}
                              >
                                {request.service_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                (request.services_request_status || "").toLowerCase() === "pending"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : (request.services_request_status || "").toLowerCase() === "approved" ||
                                    (request.services_request_status || "").toLowerCase() === "closed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  (request.services_request_status || "").toLowerCase() === "pending"
                                    ? "bg-amber-500 animate-pulse"
                                    : (request.services_request_status || "").toLowerCase() === "approved" ||
                                      (request.services_request_status || "").toLowerCase() === "closed"
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                                }`}
                              />
                              {request.services_request_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="text-muted-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1 text-[11px] font-semibold">
                              Details <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-muted-foreground text-xs"
                        >
                          <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                          No service requests match the selected status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
};

export default Dashboard;
