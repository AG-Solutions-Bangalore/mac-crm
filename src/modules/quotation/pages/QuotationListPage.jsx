import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { Edit, FileText, CalendarDays, FolderKanban } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
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
import {
  useQuotationsQuery,
  useUpdateQuotationFinishWorkDateMutation,
  useUpdateQuotationStatusMutation,
} from "../hooks/useQuotation";
import { quotationApi } from "../api/quotationApi";
import { projectApi } from "../../project/api/projectApi";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";

const QuotationListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = usePersistedPage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Estimates-only view: converted (Project) quotes hidden by default (client-side,
  // backend has no hide-converted filter yet). Specific status selection overrides it.
  const [hideConverted, setHideConverted] = useState(true);
  const [finishDateDialogOpen, setFinishDateDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [finishDate, setFinishDate] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertingQuotation, setConvertingQuotation] = useState(null);

  const queryClient = useQueryClient();
  const { data: responseData, isLoading, isFetching, isError, refetch } = useQuotationsQuery(page, searchTerm, statusFilter);
  const updateFinishWorkDateMutation = useUpdateQuotationFinishWorkDateMutation();
  const updateStatusMutation = useUpdateQuotationStatusMutation();

  const handleOpenFinishDateDialog = (quotation) => {
    setSelectedQuotation(quotation);
    setFinishDate(quotation.quotation_finish_work_date || "");
    setFinishDateDialogOpen(true);
  };

  const handleSaveFinishDate = async () => {
    if (!selectedQuotation) return;
    try {
      await updateFinishWorkDateMutation.mutateAsync({
        id: selectedQuotation.id,
        finishWorkDate: finishDate,
      });
      setFinishDateDialogOpen(false);
      setSelectedQuotation(null);
      toast.success("Finish work date updated successfully");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update finish work date");
    }
  };

  const handleOpenConvertDialog = (quotation) => {
    setConvertingQuotation(quotation);
    setConvertDialogOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!convertingQuotation) return;
    try {
      // 1. Fetch full quotation with subs
      let fullQuote = convertingQuotation;
      try {
        const fullQuoteRes = await quotationApi.getQuotationById(convertingQuotation.id);
        if (fullQuoteRes?.data) fullQuote = fullQuoteRes.data;
      } catch (err) {
        console.warn("Could not fetch full quotation details, using row data:", err);
      }

      // 2. Prepare subs for project payload
      const subs = (fullQuote.subs || []).map((item, idx) => {
        const notes = item.quotation_sub_notes || item.project_sub_notes || "";
        const sort = item.quotation_sub_sort ?? item.project_sub_sort ?? (idx + 1);
        return {
          // Sort keys
          quotation_sub_sort: sort,
          project_sub_sort: sort,
          // Project keys
          project_sub_service_id: item.quotation_sub_service_id ?? item.project_sub_service_id,
          project_sub_floor_id: item.quotation_sub_floor_id ?? item.project_sub_floor_id,
          project_sub_area_id: item.quotation_sub_area_id ?? item.project_sub_area_id,
          project_sub_product_id: item.quotation_sub_product_id ?? item.project_sub_product_id,
          project_sub_price: Number(item.quotation_sub_price ?? item.project_sub_price) || 0,
          project_sub_quantity: Number(item.quotation_sub_quantity ?? item.project_sub_quantity) || 1,
          project_sub_amount: Number(item.quotation_sub_amount ?? item.project_sub_amount) || 0,
          project_sub_status: item.quotation_sub_status ?? item.project_sub_status ?? "Pending",
          project_sub_notes: notes,
          // Quotation dual keys
          quotation_sub_service_id: item.quotation_sub_service_id ?? item.project_sub_service_id,
          quotation_sub_floor_id: item.quotation_sub_floor_id ?? item.project_sub_floor_id,
          quotation_sub_area_id: item.quotation_sub_area_id ?? item.project_sub_area_id,
          quotation_sub_product_id: item.quotation_sub_product_id ?? item.project_sub_product_id,
          quotation_sub_price: Number(item.quotation_sub_price ?? item.project_sub_price) || 0,
          quotation_sub_quantity: Number(item.quotation_sub_quantity ?? item.project_sub_quantity) || 1,
          quotation_sub_amount: Number(item.quotation_sub_amount ?? item.project_sub_amount) || 0,
          quotation_sub_status: item.quotation_sub_status ?? item.project_sub_status ?? "Pending",
          quotation_sub_notes: notes,
        };
      });

      // 3. Create real project in /project table
      const projectPayload = {
        project_date: fullQuote.quotation_date || new Date().toISOString().split("T")[0],
        price_validity_date: fullQuote.quotation_validity_date || "",
        project_buyer_id: Number(fullQuote.quotation_buyer_id),
        project_property_id: Number(fullQuote.quotation_property_id),
        project_category_id: fullQuote.quotation_category_id || "",
        project_service_id: fullQuote.quotation_service_id || "",
        project_remarks: fullQuote.quotation_remarks || "",
        project_status: "Project",
        quotation_date: fullQuote.quotation_date || new Date().toISOString().split("T")[0],
        quotation_validity_date: fullQuote.quotation_validity_date || "",
        quotation_buyer_id: Number(fullQuote.quotation_buyer_id),
        quotation_property_id: Number(fullQuote.quotation_property_id),
        quotation_category_id: fullQuote.quotation_category_id || "",
        quotation_service_id: fullQuote.quotation_service_id || "",
        quotation_remarks: fullQuote.quotation_remarks || "",
        quotation_status: "Project",
        buyer_id: Number(fullQuote.quotation_buyer_id),
        property_id: Number(fullQuote.quotation_property_id),
        category_id: fullQuote.quotation_category_id || "",
        service_id: fullQuote.quotation_service_id || "",
        status: "Project",
        subs,
      };

      await projectApi.createProject(projectPayload);

      // 4. Update quotation status
      await updateStatusMutation.mutateAsync({
        id: convertingQuotation.id,
        status: "Project",
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });

      setConvertDialogOpen(false);
      setConvertingQuotation(null);
      toast.success("Quotation successfully converted and created in Projects!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to convert quotation to project"
      );
    }
  };

  const paginationData = responseData?.data;
  const rawQuotationList = paginationData?.data || [];

  const quotationList =
    statusFilter === "all" && hideConverted
      ? rawQuotationList.filter(
          (item) => item.quotation_status?.toLowerCase() !== "project"
        )
      : rawQuotationList;

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "quotation_date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.quotation_date
            ? moment(row.original.quotation_date).format("DD-MM-YYYY")
            : "-"}
        </span>
      ),
    },
    {
      header: "Validity Date",
      accessorKey: "quotation_validity_date",
      cell: ({ row }) => {
        const val = row.original.quotation_validity_date;
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
      header: "Finish Work Date",
      accessorKey: "quotation_finish_work_date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.quotation_finish_work_date
            ? moment(row.original.quotation_finish_work_date).format("DD-MM-YYYY")
            : "-"}
        </span>
      ),
    },
    {
      header: "Lead",
      accessorKey: "buyer_name",
    },
    {
      header: "Property",
      accessorKey: "property_name",
    },
    {
      header: "Categories",
      accessorKey: "quotation_category_name",
    },
    {
      header: "Services",
      accessorKey: "quotation_service_name",
    },
    {
      header: "Amount (₹)",
      accessorKey: "quotation_amount",
      cell: ({ row }) => {
        const val = row.original.quotation_amount;
        return (
          <span className="whitespace-nowrap">
            {val ? `₹${Number(val).toLocaleString()}` : "-"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "quotation_status",
      cell: ({ row }) => {
        const status = row.original.quotation_status;
        if (status === "Approved") {
          return <span className="pill pill-approved">Approved</span>;
        }
        if (status === "Project") {
          return <span className="pill pill-in_progress">Project</span>;
        }
        return (
          <ToggleStatus
            initialStatus={status}
            apiUrl={`/quotations/${row.original.id}/status`}
            payloadKey="quotation_status"
            activeValue="Pending"
            inactiveValue="Cancel"
            onSuccess={refetch}
            method="patch"
          />
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const q = row.original;
        const canFinishDate =
          q.quotation_status === "Approved" && !q.quotation_finish_work_date;
        const showConvertButton = q.quotation_status === "Approved";
        return (
          <div className="flex items-center gap-2">
            <abbr title="Edit Quotation">
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate(`/quotation-list/revised/${q.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </abbr>
            <abbr title="View Report">
              <Button
                size="icon"
                variant="outline"
                className="text-slate-600 hover:text-slate-800"
                onClick={() => navigate(`/quotation-report/${q.id}`)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </abbr>
            {canFinishDate && (
              <abbr title="Add Finish Work Date">
                <Button
                  size="icon"
                  variant="outline"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() => handleOpenFinishDateDialog(q)}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </abbr>
            )}
            {showConvertButton && (
              <abbr title="Convert to Project">
                <Button
                  size="icon"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleOpenConvertDialog(q)}
                >
                  <FolderKanban className="h-4 w-4" />
                </Button>
              </abbr>
            )}
          </div>
        );
      },
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
      <DataTable
        isLoading={isLoading || isFetching}
        extraButton={
          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none whitespace-nowrap"
              title="Hide quotes already converted to projects"
            >
              <input
                type="checkbox"
                checked={hideConverted}
                onChange={(e) => setHideConverted(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 h-3.5 w-3.5"
              />
              Estimates only
            </label>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Cancel">Cancel</SelectItem>
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

      <Dialog open={finishDateDialogOpen} onOpenChange={setFinishDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Finish Work Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Finish Work Date</Label>
              <Input
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveFinishDate}
              disabled={updateFinishWorkDateMutation.isPending}
            >
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Project Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FolderKanban className="h-5 w-5 text-blue-600" /> Convert to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to convert this quotation into an active Project?
            </p>

            {convertingQuotation && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              
                <div className="flex justify-between">
                  <span className="text-slate-500">Lead:</span>
                  <span className="font-medium">{convertingQuotation.buyer_name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-medium">{convertingQuotation.property_name || "-"}</span>
                </div>
                {convertingQuotation.quotation_amount && (
                  <div className="flex justify-between border-t pt-1 dark:border-slate-800">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-semibold text-emerald-600">
                      ₹{Number(convertingQuotation.quotation_amount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmConvert}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Converting..." : "Convert to Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationListPage;
