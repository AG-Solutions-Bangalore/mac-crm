import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { usePersistedSearch } from "@/hooks/usePersistedSearch";
import { Edit, FileText, CalendarDays, CalendarCheck, FolderKanban } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useProjectsQuery,
  useOngoingProjectsQuery,
  useCompleteProjectsQuery,
  useUpdateProjectStartDateMutation,
  useUpdateProjectFinishDateMutation,
} from "../hooks/useProject";
import { useCyearQuery } from "../../quotation/hooks/useQuotation";
import moment from "moment";

const STATUS_TABS = [
  { value: "Pending", label: "Pending", dotClass: "bg-amber-500" },
  { value: "Ongoing", label: "Ongoing", dotClass: "bg-sky-500" },
  { value: "Completed", label: "Completed", dotClass: "bg-emerald-500" },
];

const normalizeProjectStatus = (value) =>
  String(value ?? "").trim().toLowerCase();

const getProjectStatus = (item) =>
  item.project_status || item.status || item.quotation_status || "Project";

const matchesStatusFilter = (item, filter) => {
  const current = normalizeProjectStatus(getProjectStatus(item));
  const target = normalizeProjectStatus(filter);
  if (target === "cancel") {
    return current === "cancel" || current === "cancelled";
  }
  return current === target;
};

const normalizeQueryResult = (payload) => {
  const root = payload?.data ?? payload;
  if (Array.isArray(root)) {
    return {
      list: root,
      isPaginated: false,
      currentPage: 1,
      lastPage: 1,
      total: root.length,
    };
  }
  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root?.projects)
      ? root.projects
      : [];
  return {
    list,
    isPaginated: Boolean(
      root && (root.current_page !== undefined || root.last_page !== undefined)
    ),
    currentPage: root?.current_page || 1,
    lastPage: root?.last_page || 1,
    total: root?.total ?? list.length,
  };
};

const matchesSearch = (item, term) => {
  const q = String(term || "").trim().toLowerCase();
  if (!q) return true;
  return [
    item.buyer_name,
    item.project_name,
    item.property_name,
    item.quotation_no,
    item.project_no,
    item.id,
  ].some((value) => String(value ?? "").toLowerCase().includes(q));
};

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = usePersistedPage();
  const [searchTerm, setSearchTerm] = usePersistedSearch();
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [yearFilter, setYearFilter] = useState("all");
  const { data: cyearData } = useCyearQuery();
  const cyearList = cyearData?.data || [];
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateField, setDateField] = useState("start");
  const [dateValue, setDateValue] = useState("");

  const updateStartDateMutation = useUpdateProjectStartDateMutation();
  const updateFinishDateMutation = useUpdateProjectFinishDateMutation();

  const pendingQuery = useProjectsQuery(
    page,
    searchTerm,
    "Pending",
    yearFilter,
    statusFilter === "Pending"
  );
  const ongoingQuery = useOngoingProjectsQuery(
    page,
    searchTerm,
    yearFilter,
    statusFilter === "Ongoing"
  );
  const completedQuery = useCompleteProjectsQuery(
    page,
    searchTerm,
    yearFilter,
    statusFilter === "Completed"
  );

  const activeQuery =
    statusFilter === "Ongoing"
      ? ongoingQuery
      : statusFilter === "Completed"
        ? completedQuery
        : pendingQuery;

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = activeQuery;

  const {
    list: rawProjectList,
    isPaginated,
    currentPage,
    lastPage,
    total,
  } = normalizeQueryResult(responseData);

  const yearScopedList = yearFilter && yearFilter !== "all"
    ? rawProjectList.filter((item) => String(item.year || "").trim() === String(yearFilter).trim())
    : rawProjectList;
  const searchedList =
    statusFilter === "Pending"
      ? yearScopedList
      : yearScopedList.filter((item) => matchesSearch(item, searchTerm));
  const projectList =
    statusFilter === "Pending"
      ? searchedList.filter((item) => matchesStatusFilter(item, "Pending"))
      : searchedList;

  const handleOpenDateDialog = (project, field) => {
    setSelectedProject(project);
    setDateField(field);
    setDateValue(
      field === "start"
        ? project.project_start_date || ""
        : project.quotation_finish_work_date ||
            project.project_finish_work_date ||
            ""
    );
    setDateDialogOpen(true);
  };

  const handleSaveDate = async () => {
    if (!selectedProject) return;
    try {
      if (dateField === "start") {
        await updateStartDateMutation.mutateAsync({
          id: selectedProject.id,
          startDate: dateValue,
        });
        toast.success("Start date updated successfully");
      } else {
        await updateFinishDateMutation.mutateAsync({
          id: selectedProject.id,
          finishDate: dateValue,
        });
        toast.success("Finish work date updated successfully");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to update date"
      );
    } finally {
      setDateDialogOpen(false);
      setSelectedProject(null);
      refetch();
    }
  };

  const formatDate = (value) =>
    value ? moment(value).format("DD-MM-YYYY") : "—";

  const truncateCell = (value) => {
    if (!value) return <span className="text-slate-400">-</span>;
    return (
      <span
        className="line-clamp-2 break-words [overflow-wrap:anywhere]"
        title={value}
      >
        {value}
      </span>
    );
  };

  const renderStatus = (p) => {
    const status = getProjectStatus(p);
    const normalized = normalizeProjectStatus(status);

    if (normalized === "project") {
      return <span className="pill pill-in_progress">Project</span>;
    }
    if (
      normalized === "ongoing" ||
      normalized === "in progress" ||
      normalized === "in_progress" ||
      normalized === "running"
    ) {
      return <span className="pill pill-in_progress">Ongoing</span>;
    }
    if (
      normalized === "completed" ||
      normalized === "complete" ||
      normalized === "finished"
    ) {
      return <span className="pill pill-approved">Completed</span>;
    }
    if (normalized === "approved") {
      return <span className="pill pill-approved">Approved</span>;
    }
    if (normalized === "closed") {
      return <span className="pill pill-rejected">Closed</span>;
    }
    if (normalized === "pending") {
      return <span className="pill pill-pending">Pending</span>;
    }
    if (normalized === "cancel" || normalized === "cancelled") {
      return <span className="pill pill-rejected">Cancel</span>;
    }

    return <span className="pill pill-draft">{status}</span>;
  };

  const renderActions = (p) => {
    const normalizedTab = normalizeProjectStatus(statusFilter);
    const isPending = normalizedTab === "pending";
    const isOngoing =
      normalizedTab === "ongoing" ||
      normalizedTab === "in progress" ||
      normalizedTab === "in_progress" ||
      normalizedTab === "running";

    return (
      <div className="flex flex-nowrap items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => navigate(`/project-list/edit/${p.id}`)}
          title="Edit Project"
          aria-label="Edit Project"
        >
          <Edit className="h-4 w-4 shrink-0" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 text-slate-600 hover:text-slate-800"
          onClick={() => navigate(`/quotation-report/${p.id}?type=project`)}
          title="View Report"
          aria-label="View Report"
        >
          <FileText className="h-4 w-4 shrink-0" />
        </Button>
        {isPending && (
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30"
            onClick={() => handleOpenDateDialog(p, "start")}
            title="Update Start Date"
            aria-label="Update Start Date"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
          </Button>
        )}
        {isOngoing && (
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            onClick={() => handleOpenDateDialog(p, "finish")}
            title="Update Finish Date"
            aria-label="Update Finish Date"
          >
            <CalendarCheck className="h-4 w-4 shrink-0" />
          </Button>
        )}
      </div>
    );
  };

  const renderMobileCard = (p, index) => (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {p.buyer_name || "—"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {p.property_name || "—"}
          </p>
        </div>
        <div className="shrink-0">{renderStatus(p)}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium">
            {formatDate(p.project_date || p.quotation_date)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Price Validity</p>
          <p className="font-medium">
            {formatDate(p.price_validity_date || p.quotation_validity_date)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Amount</p>
          <p className="font-medium">
            {p.project_amount || p.quotation_amount
              ? `₹${Number(p.project_amount || p.quotation_amount).toLocaleString("en-IN")}`
              : "—"}
          </p>
        </div>
      </div>

      {(p.project_category_name ||
        p.quotation_category_name ||
        p.category_name ||
        p.project_service_name ||
        p.quotation_service_name ||
        p.service_name) && (
        <div className="space-y-1 text-xs">
          {(p.project_category_name ||
            p.quotation_category_name ||
            p.category_name) && (
            <p className="line-clamp-2 break-words [overflow-wrap:anywhere]">
              <span className="font-medium text-muted-foreground">
                Categories:{" "}
              </span>
              {p.project_category_name ||
                p.quotation_category_name ||
                p.category_name}
            </p>
          )}
          {(p.project_service_name ||
            p.quotation_service_name ||
            p.service_name) && (
            <p className="line-clamp-2 break-words [overflow-wrap:anywhere]">
              <span className="font-medium text-muted-foreground">
                Services:{" "}
              </span>
              {p.project_service_name ||
                p.quotation_service_name ||
                p.service_name}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-[11px] text-muted-foreground">
          #{(page - 1) * 50 + index + 1}
        </span>
        {renderActions(p)}
      </div>
    </div>
  );

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      size: 48,
      meta: { className: "hidden 2xl:table-cell" },
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "project_date",
      size: 104,
      cell: ({ row }) => {
        const d = row.original.project_date || row.original.quotation_date;
        return (
          <span className="whitespace-nowrap">
            {d ? moment(d).format("DD-MM-YYYY") : "-"}
          </span>
        );
      },
    },
    {
      header: "Price Validity Date",
      accessorKey: "price_validity_date",
      size: 120,
      cell: ({ row }) => {
        const val = row.original.price_validity_date || row.original.quotation_validity_date;
        if (!val) {
          return <span className="text-slate-400">-</span>;
        }

        const validMoment = moment(val).startOf("day");
        const todayMoment = moment().startOf("day");
        const diffDays = validMoment.diff(todayMoment, "days");

        return (
          <div className="flex flex-col gap-1 items-start whitespace-nowrap">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {validMoment.format("DD-MM-YYYY")}
            </span>
            {diffDays < 0 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Expired
              </span>
            ) : diffDays <= 7 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Expiring {diffDays === 0 ? "today" : `in ${diffDays}d`}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900">
                Valid
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Lead",
      accessorKey: "buyer_name",
      size: 120,
      cell: ({ row }) => truncateCell(row.original.buyer_name),
    },
    {
      header: "Property",
      accessorKey: "property_name",
      size: 130,
      cell: ({ row }) => truncateCell(row.original.property_name),
    },
    {
      header: "Categories",
      accessorKey: "category_name",
      size: 150,
      cell: ({ row }) =>
        truncateCell(
          row.original.project_category_name ||
            row.original.quotation_category_name ||
            row.original.category_name
        ),
    },
    {
      header: "Services",
      accessorKey: "service_name",
      size: 170,
      cell: ({ row }) =>
        truncateCell(
          row.original.project_service_name ||
            row.original.quotation_service_name ||
            row.original.service_name
        ),
    },
    {
      header: "Amount (₹)",
      accessorKey: "project_amount",
      size: 100,
      cell: ({ row }) => {
        const val = row.original.project_amount || row.original.quotation_amount;
        return (
          <span className="whitespace-nowrap">
            {val ? `₹${Number(val).toLocaleString("en-IN")}` : "-"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      size: 110,
      cell: ({ row }) => renderStatus(row.original),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      size: 130,
      enableSorting: false,
      cell: ({ row }) => renderActions(row.original),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-1">
      <PageHeader
        icon={FolderKanban}
        title="Projects"
        description="Manage active projects and scope of execution"
      />

      <div className="mb-2 overflow-x-auto">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <TabsList className="h-10 w-max min-w-full justify-start gap-1 bg-muted/60 p-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 px-3 text-xs font-semibold sm:text-sm"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${tab.dotClass}`}
                />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        isLoading={isLoading || isFetching}
        fitWidth
        mobileCard={renderMobileCard}
        extraButtonFullWidthOnMobile
        extraButton={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select
              value={yearFilter}
              onValueChange={(val) => {
                setYearFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[125px]">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {cyearList.map((c) => (
                  <SelectItem key={c.cyear} value={c.cyear}>
                    {c.cyear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        data={projectList}
        columns={columns}
        searchPlaceholder="Search Projects..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        backendPagination={statusFilter === "Pending" ? true : isPaginated}
        page={isPaginated ? currentPage : 1}
        totalPages={isPaginated ? lastPage : 1}
        totalRecords={isPaginated ? total : projectList.length}
        onPageChange={setPage}
      />

      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dateField === "start"
                ? "Update Start Date"
                : "Update Finish Work Date"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {dateField === "start" ? "Start Date" : "Finish Work Date"}
              </Label>
              <Input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDate}
              disabled={
                updateStartDateMutation.isPending ||
                updateFinishDateMutation.isPending
              }
            >
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectListPage;
