import React from "react";
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
  DollarSign, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mockup datasets matching raw_html.html
const monthlySalesData = [
  { name: "Aug", sales: 28.5 },
  { name: "Sep", sales: 31.2 },
  { name: "Oct", sales: 29.6 },
  { name: "Nov", sales: 39.8 },
  { name: "Dec", sales: 45.2 },
  { name: "Jan", sales: 36.1 },
  { name: "Feb", sales: 41.1 },
  { name: "Mar", sales: 52.3 },
  { name: "Apr", sales: 48.9 },
  { name: "May", sales: 53.4 },
  { name: "Jun", sales: 47.2 },
  { name: "Jul", sales: 50.3 },
];

const quotationStatusData = [
  { name: "Approved", value: 201, color: "#1F8A5F" },
  { name: "Pending", value: 27, color: "#B8862F" },
  { name: "Rejected", value: 14, color: "#C0432F" },
  { name: "Draft", value: 70, color: "#5D6B80" },
];

const productWiseSalesData = [
  { name: "8M - Fan/Ctrl", value: 8.42 },
  { name: "8M - Socket/Ctrl", value: 6.91 },
  { name: "4M - Control", value: 5.32 },
  { name: "2M - Control", value: 3.98 },
  { name: "BLE Bridge", value: 3.14 },
  { name: "Curtain Module", value: 2.26 },
];

const brandWiseSalesData = [
  { name: "MAK", value: 32.4 },
  { name: "Lutron", value: 9.8 },
  { name: "Fibaro", value: 4.2 },
  { name: "Other", value: 1.85 },
];

const followupsData = [
  { date: "Jul 03", title: "Rajeev Menon", desc: "Confirm MBR layout change", who: "Sales: Arjun" },
  { date: "Jul 04", title: "Ashok Builders", desc: "Send Rev-3 for site visit", who: "Sales: Divya" },
  { date: "Jul 07", title: "Green Valley", desc: "Approval follow-up call", who: "Sales: Arjun" },
];

const getServiceBadgeClass = (serviceName) => {
  if (!serviceName) return "badge-default";
  const service = serviceName.toLowerCase();
  if (service.includes("switch")) return "badge-switches";
  if (service.includes("door") || service.includes("automation")) return "badge-automation";
  if (service.includes("network") || service.includes("wifi") || service.includes("internet")) return "badge-networking";
  if (service.includes("light")) return "badge-lighting";
  if (service.includes("secur") || service.includes("camera") || service.includes("cctv")) return "badge-security";
  return "badge-default";
};

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const showName = data.name && data.name !== "value" && data.name !== "sales" && data.name !== "value";
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2.5 shadow-md text-xs text-[var(--ink)]">
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-[10px] text-[var(--ink-soft)] font-semibold uppercase tracking-wider font-mono">
              {label}
            </span>
          )}
          <span className="font-semibold text-sm">
            {showName ? `${data.name}: ` : ""}
            {prefix}{data.value}{suffix}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const {
    data: DData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ["dashboard-list"],
    staleTime: 0,
  });

  const dashboardData = DData?.data || {};
  const latestRequests = dashboardData?.latest_service_requests || [];
  const usersServiceData = (dashboardData?.users_service || []).filter(
    (service) => service.users_count > 0,
  );

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Page>
      <div className="main space-y-6 md:-mt-12">
        {/* HEADER GREETING BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-xl border border-[var(--line)] shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--ink)] flex items-center gap-2">
              {getGreeting()}, <span className="text-[var(--primary-color)] font-extrabold">{user?.name || "Admin"}</span>
            </h1>
            <p className="text-sm text-[var(--ink-soft)] mt-1 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[var(--copper)]" />
              Here's your business summary for today, {moment().format("MMMM Do, YYYY")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-[var(--line)] hover:bg-[var(--line)] text-xs font-semibold gap-1.5 transition-all duration-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Data
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500 font-semibold p-4 bg-red-50 border border-red-200 rounded-lg">
            Failed to load dashboard data.
          </div>
        ) : (
          <>
            {/* KPI GRID */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Clients KPI */}
              <div
                onClick={() => navigate("/client-list")}
                className="kpi group"
                style={{ "--accent": "var(--primary-color)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="kpi-label">Total Clients</div>
                    <div className="kpi-value mt-1">{dashboardData?.users_count || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[rgba(27,75,145,0.08)] text-[var(--primary-color)] transition-colors group-hover:bg-[var(--primary-color)] group-hover:text-white">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="kpi-delta up mt-4 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Active clients directory</span>
                </div>
              </div>

              {/* Services KPI */}
              <div
                onClick={() => navigate("/service-list")}
                className="kpi group"
                style={{ "--accent": "var(--copper)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="kpi-label">Total Services</div>
                    <div className="kpi-value mt-1">{dashboardData?.services_count || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[rgba(193,121,63,0.08)] text-[var(--copper)] transition-colors group-hover:bg-[var(--copper)] group-hover:text-white">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
                <div className="kpi-delta up mt-4 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Configured service offerings</span>
                </div>
              </div>

              {/* Requests KPI */}
              <div
                onClick={() => navigate("/service-request")}
                className="kpi group"
                style={{ "--accent": "var(--amber)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="kpi-label">Pending Requests</div>
                    <div className="kpi-value mt-1">{dashboardData?.service_requests_pending_count || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[rgba(184,134,47,0.08)] text-[var(--amber)] transition-colors group-hover:bg-[var(--amber)] group-hover:text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="kpi-delta down mt-4 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Action required soon</span>
                </div>
              </div>

              {/* Sales Value KPI (Mockup) */}
              <div
                className="kpi group cursor-default"
                style={{ "--accent": "var(--success)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="kpi-label">Total Sales Value</div>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <div className="kpi-value mt-1 text-2xl font-bold">₹4.82 Cr</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-green-50 text-[var(--success)] transition-colors group-hover:bg-[var(--success)] group-hover:text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="kpi-delta up mt-4 flex items-center gap-1 text-[var(--success)]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>+12.4% vs last quarter</span>
                </div>
              </div>
            </div>

            {/* GRID 2: Business Performance charts */}
            <div className="grid gap-6 lg:grid-cols-3 mt-4">
              {/* Monthly Sales */}
              <div className="card lg:col-span-2">
                <div className="card-head">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-base font-bold font-display text-[var(--ink)]">Monthly Sales Performance</span>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Overall gross sales volume in INR (Lakhs)</p>
                  </div>
                  <span className="card-link text-xs font-semibold">Last 12 Months</span>
                </div>
                <div className="h-[260px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--line)" />
                      <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                      <Tooltip content={<CustomTooltip prefix="₹" suffix=" Lakhs" />} />
                      <Area type="monotone" dataKey="sales" stroke="var(--primary-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quotation Status */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-base font-bold font-display text-[var(--ink)]">Quotation Breakdown</span>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Distribution by status codes</p>
                  </div>
                </div>
                <div className="h-[260px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={quotationStatusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {quotationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--ink-soft)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* GRID 3: Product-wise, Brand-wise & Follow-ups */}
            <div className="grid gap-6 lg:grid-cols-3 mt-4">
              {/* Product-wise Sales */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-base font-bold font-display text-[var(--ink)]">Product-wise Sales</span>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Top performing model ranges</p>
                  </div>
                </div>
                <div className="h-[230px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productWiseSalesData}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="var(--line)" />
                      <XAxis type="number" stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                      <YAxis dataKey="name" type="category" stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} width={90} />
                      <Tooltip cursor={false} content={<CustomTooltip prefix="₹" suffix=" Lakhs" />} />
                      <Bar dataKey="value" fill="var(--copper)" radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Brand-wise Sales */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-base font-bold font-display text-[var(--ink)]">Brand-wise Sales</span>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Manufacturer revenue share</p>
                  </div>
                </div>
                <div className="h-[230px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={brandWiseSalesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--line)" />
                      <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--ink-soft)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                      <Tooltip cursor={false} content={<CustomTooltip prefix="₹" suffix=" Lakhs" />} />
                      <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latest Follow-ups Card */}
              <div className="card">
                <div className="card-head border-b border-[var(--line)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="card-title text-base font-bold font-display text-[var(--ink)]">Latest Follow-ups</span>
                      <span className="text-[9px] bg-[var(--copper-soft)] text-[var(--copper)] font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wider shrink-0">Mock</span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Scheduled client tasks</p>
                  </div>
                </div>
                <div className="space-y-4 mt-4 overflow-y-auto max-h-[230px]">
                  {followupsData.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                      <div className="shrink-0 text-center px-2 py-1 rounded bg-[rgba(193,121,63,0.08)] text-[var(--copper)] font-mono text-[10px] font-bold leading-tight">
                        {item.date.split(" ")[0]}
                        <br />
                        {item.date.split(" ")[1]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[var(--ink)] truncate">{item.title}</h4>
                        <p className="text-[11px] text-[var(--ink-soft)] mt-0.5 line-clamp-1">{item.desc}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <UserCheck className="h-3 w-3 text-slate-400" />
                          <span className="text-[9.5px] font-semibold text-slate-500">{item.who}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GRID 4: Real CRM Data (Client Services & Latest Requests) */}
            <div className="grid gap-6 lg:grid-cols-3 mt-4">
              {/* Client Services Chart Card */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <span className="card-title text-base font-bold font-display text-[var(--ink)]">Client Service Distribution</span>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Live CRM system client volume</p>
                  </div>
                </div>
                <div className="h-[250px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={usersServiceData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--line)" />
                      <XAxis
                        dataKey="service_name"
                        stroke="var(--ink-soft)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--ink-soft)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        cursor={false}
                        content={<CustomTooltip suffix=" Clients" />}
                      />
                      <Bar
                        dataKey="users_count"
                        fill="var(--primary-color)"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latest Service Requests Card */}
              <div className="card lg:col-span-2">
                <div className="card-head">
                  <div>
                    <span className="card-title text-base font-bold font-display text-[var(--ink)]">Latest Service Requests</span>
                    <p className="text-xs text-[var(--ink-soft)] mt-0.5">Real-time incoming member ticket queue</p>
                  </div>
                  <span className="card-link text-xs font-semibold cursor-pointer hover:underline" onClick={() => navigate("/service-request")}>View all</span>
                </div>
                <div className="overflow-x-auto mt-6">
                  <table className="list">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User Name</th>
                        <th>Mobile</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRequests.length > 0 ? (
                        latestRequests.map((request) => (
                          <tr key={request.id} className="clickable hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => navigate("/service-request")}>
                            <td className="mono text-[11px]">
                              {request.services_request_date
                                ? moment(request.services_request_date).format("DD-MM-YYYY")
                                : "-"}
                            </td>
                            <td className="font-medium text-xs text-[var(--ink)]">{request.name}</td>
                            <td className="mono text-[11px] text-[var(--ink-soft)]">{request.mobile}</td>
                            <td>
                              <span className={`service-badge ${getServiceBadgeClass(request.service_name)}`}>
                                {request.service_name}
                              </span>
                            </td>
                            <td>
                              <span className={`pill ${
                                request.services_request_status === "Pending"
                                  ? "pill-pending"
                                  : request.services_request_status === "Approved"
                                    ? "pill-approved"
                                    : "pill-rejected"
                              }`}>
                                {request.services_request_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="empty text-center py-10 text-[var(--ink-soft)]">
                            No recent requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
};

export default Dashboard;
