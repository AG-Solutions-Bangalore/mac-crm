import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { usePersistedSearch } from "@/hooks/usePersistedSearch";
import { Edit, FileText, CalendarDays, FolderKanban } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ApiErrorPage from "@/components/api-error/api-error";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
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
  useQuotationsQuery,
  useUpdateQuotationValidateDateMutation,
  useUpdateQuotationStatusMutation,
  useCyearQuery,
} from "../hooks/useQuotation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import moment from "moment";
import { isQuotationOwnedByUser } from "@/utils/permissions";

const STATUS_TABS = [
  { value: "Pending", label: "Pending", dotClass: "bg-amber-500" },
  { value: "Approved", label: "Approved", dotClass: "bg-emerald-500" },
  { value: "Project", label: "Project", dotClass: "bg-sky-500" },
  { value: "Cancel", label: "Cancel", dotClass: "bg-rose-500" },
];

const normalizeQuotationStatus = (value) =>
  String(value ?? "").trim().toLowerCase();

const matchesStatusFilter = (item, filter) => {
  const current = normalizeQuotationStatus(item.quotation_status);
  const target = normalizeQuotationStatus(filter);
  if (target === "cancel") {
    return current === "cancel" || current === "cancelled";
  }
  return current === target;
};

const QuotationListPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isRestrictedUser = Number(user?.user_type) === 4;
  const [page, setPage] = usePersistedPage();
  const [searchTerm, setSearchTerm] = usePersistedSearch();
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [yearFilter, setYearFilter] = useState("all");
  const { data: cyearData } = useCyearQuery();
  const cyearList = cyearData?.data || [];
  const [validityDialogOpen, setValidityDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [validityDate, setValidityDate] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertingQuotation, setConvertingQuotation] = useState(null);

  const { data: responseData, isLoading, isFetching, isError, refetch } = useQuotationsQuery(page, searchTerm, statusFilter, yearFilter);
  const updateValidateDateMutation = useUpdateQuotationValidateDateMutation();
  const updateStatusMutation = useUpdateQuotationStatusMutation();

  const handleOpenValidateDateDialog = (quotation) => {
    setSelectedQuotation(quotation);
    setValidityDate(quotation.quotation_validity_date || "");
    setValidityDialogOpen(true);
  };

  const handleSaveValidityDate = async () => {
    if (!selectedQuotation) return;
    try {
      await updateValidateDateMutation.mutateAsync({
        id: selectedQuotation.id,
        validityDate,
      });
      toast.success("Validity date updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update date");
    } finally {
      setValidityDialogOpen(false);
      setSelectedQuotation(null);
      refetch();
    }
  };

  const handleOpenConvertDialog = (quotation) => {
    setConvertingQuotation(quotation);
    setConvertDialogOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!convertingQuotation) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: convertingQuotation.id,
        status: "Project",
      });
      setConvertDialogOpen(false);
      setConvertingQuotation(null);
      toast.success("Quotation converted to Project successfully");
      refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to convert quotation to project"
      );
    }
  };

  const paginationData = responseData?.data;
  const rawQuotationList = paginationData?.data || [];

  // Enforce quote isolation: user_type 4 can only view their own quotes
  const userScopedList = isRestrictedUser
    ? rawQuotationList.filter((item) => isQuotationOwnedByUser(item, user))
    : rawQuotationList;

  const yearScopedList = yearFilter && yearFilter !== "all"
    ? userScopedList.filter((item) => String(item.year || "").trim() === String(yearFilter).trim())
    : userScopedList;

  const quotationList = yearScopedList.filter((item) =>
    matchesStatusFilter(item, statusFilter)
  );

  quotationList.sort(
    (a, b) =>
      new Date(b.created_at || b.created_at_rev || 0).getTime() -
      new Date(a.created_at || a.created_at_rev || 0).getTime()
  );

  const formatDate = (value) =>
    value ? moment(value).format("DD-MM-YYYY") : "-";

  const getQuotationDisplayDate = (q) =>
    q.quotation_date_rev || q.quotation_date;

  const renderStatus = (q) => {
    const status = q.quotation_status;
    const normalized = normalizeQuotationStatus(status);
    if (normalized === "approved") {
      return <span className="pill pill-approved">Approved</span>;
    }
    if (normalized === "project") {
      return <span className="pill pill-in_progress">Project</span>;
    }
    if (normalized === "cancel" || normalized === "cancelled") {
      return <span className="pill pill-rejected">Cancel</span>;
    }
    if (normalized === "pending") {
      return <span className="pill pill-pending">Pending</span>;
    }
    return <span className="pill pill-draft">{status || "-"}</span>;
  };

  const renderActions = (q, labeled = false) => {
    const isPending = normalizeQuotationStatus(q.quotation_status) === "pending";
    const isApproved =
      normalizeQuotationStatus(q.quotation_status) === "approved";
    const actions = [
      {
        label: "Edit",
        title: "Edit Quotation",
        icon: Edit,
        onClick: () => navigate(`/quotation-list/revised/${q.id}`),
      },
      ...(isPending
        ? [
            {
              label: "Validity",
              title: "Update Validity Date",
              icon: CalendarDays,
              onClick: () => handleOpenValidateDateDialog(q),
              extra:
                "text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30",
            },
          ]
        : []),
      {
        label: "View",
        title: "View Report",
        icon: FileText,
        onClick: () => navigate(`/quotation-report/${q.id}`),
        extra: "text-slate-600 hover:text-slate-800",
      },
      ...(isApproved
        ? [
            {
              label: "Convert",
              title: "Convert to Project",
              icon: FolderKanban,
              onClick: () => handleOpenConvertDialog(q),
              extra:
                "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
            },
          ]
        : []),
    ];

    return (
      <div className="flex flex-nowrap items-center gap-1">
        {actions.map(({ label, title, icon: Icon, onClick, extra }) => (
          <Button
            key={title}
            size={labeled ? "sm" : "icon"}
            variant="outline"
            className={
              labeled
                ? `h-8 gap-1.5 px-2.5 text-xs ${extra || ""}`
                : `h-8 w-8 ${extra || ""}`
            }
            onClick={onClick}
            title={title}
            aria-label={title}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {labeled && <span>{label}</span>}
          </Button>
        ))}
      </div>
    );
  };

  const truncateCell = (value, full = false) => {
    if (!value) return <span className="text-slate-400">-</span>;
    return (
      <span
        className={
          full
            ? "break-words text-[11px] leading-tight [overflow-wrap:anywhere]"
            : "line-clamp-2 break-words [overflow-wrap:anywhere]"
        }
        title={value}
      >
        {value}
      </span>
    );
  };

  const renderMobileCard = (q, index) => (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{q.buyer_name || "—"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {q.property_name || "—"}
          </p>
        </div>
        <div className="shrink-0">{renderStatus(q)}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <p className="text-muted-foreground">Customer</p>
          <p className="font-medium">{q.buyer_name || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium">{formatDate(getQuotationDisplayDate(q))}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Validity</p>
          <p className="font-medium">
            {formatDate(q.quotation_validity_date)}
          </p>
        </div>
      </div>

      {(q.quotation_category_name || q.quotation_service_name) && (
        <div className="space-y-1 text-xs">
          {q.quotation_category_name && (
            <p className="line-clamp-2 break-words [overflow-wrap:anywhere]">
              <span className="font-medium text-muted-foreground">
                Categories:{" "}
              </span>
              {q.quotation_category_name}
            </p>
          )}
          {q.quotation_service_name && (
            <p className="line-clamp-2 break-words [overflow-wrap:anywhere]">
              <span className="font-medium text-muted-foreground">
                Services:{" "}
              </span>
              {q.quotation_service_name}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-[11px] text-muted-foreground">
          #{(page - 1) * 50 + index + 1}
        </span>
        {renderActions(q)}
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
      header: "Lead",
      accessorKey: "buyer_name",
      size: 110,
      cell: ({ row }) => truncateCell(row.original.buyer_name),
    },
    {
      header: "Date",
      accessorKey: "quotation_date",
      size: 104,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(getQuotationDisplayDate(row.original))}
        </span>
      ),
    },
    {
      header: "Validity Date",
      accessorKey: "quotation_validity_date",
      size: 104,
      cell: ({ row }) => {
        const val = row.original.quotation_validity_date;
        if (!val) {
          return <span className="text-slate-400">-</span>;
        }

        const validMoment = moment(val).startOf("day");
        const todayMoment = moment().startOf("day");
        const diffDays = validMoment.diff(todayMoment, "days");
        const showValidityBadge =
          normalizeQuotationStatus(row.original.quotation_status) === "pending";

        return (
          <div className="flex flex-col gap-1 items-start whitespace-nowrap">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {validMoment.format("DD-MM-YYYY")}
            </span>
            {showValidityBadge &&
              (diffDays < 0 ? (
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
              ))}
          </div>
        );
      },
    },
    {
      header: "Services",
      accessorKey: "quotation_service_name",
      size: 200,
      cell: ({ row }) => truncateCell(row.original.quotation_service_name, true),
    },
    {
      header: "Amount (₹)",
      accessorKey: "quotation_amount",
      size: 96,
      cell: ({ row }) => {
        const val = row.original.quotation_amount;
        return (
          <span className="whitespace-nowrap text-[11px] tabular-nums">
            {val ? `₹${Number(val).toLocaleString("en-IN")}` : "-"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "quotation_status",
      size: 130,
      cell: ({ row }) => renderStatus(row.original),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      size: 145,
      enableSorting: false,
      cell: ({ row }) => renderActions(row.original),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-1">
      <PageHeader
        icon={FileText}
        title="Quotations"
        description="Manage customer quotations and revisions"
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
        data={quotationList}
        columns={columns}
        searchPlaceholder="Search Quotations..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/quotation-list/create"),
          label: "Add Quotation",
        }}
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />

      <Dialog open={validityDialogOpen} onOpenChange={setValidityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Validity Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Validity Date</Label>
              <Input
                type="date"
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveValidityDate}
              disabled={updateValidateDateMutation.isPending}
            >
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-emerald-600" />
              Convert to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to convert this quotation into a Project?
              The quotation status will be updated to Project.
            </p>
            {convertingQuotation && (
              <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="text-right font-medium">
                    {convertingQuotation.buyer_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Property</span>
                  <span className="text-right font-medium">
                    {convertingQuotation.property_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-right font-medium">
                    ₹
                    {Number(
                      convertingQuotation.quotation_amount || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmConvert}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending
                ? "Converting..."
                : "Convert to Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationListPage;
