import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, ArrowLeft, CheckCircle2, Award, FileText, CalendarDays } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useRevQuotationsQuery, useApproveRevQuotationMutation, useQuotationQuery } from "../hooks/useQuotation";
import moment from "moment";
import { toast } from "sonner";

const RevQuotationListPage = () => {
  const { id: parentId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingApproveId, setPendingApproveId] = useState(null);

  const { data: responseData, isLoading, isFetching, isError, refetch } = useRevQuotationsQuery(parentId, page, searchTerm);
  const { data: parentQuotationData, isLoading: isParentLoading, isError: isParentError } = useQuotationQuery(parentId);
  const approveMutation = useApproveRevQuotationMutation();

  const paginationData = responseData?.data;
  const revQuotationList = paginationData?.data || [];
  const parentFinishWorkDate = parentQuotationData?.data?.quotation_finish_work_date;

  const handleApprove = (revId) => {
    setPendingApproveId(revId);
    setConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!pendingApproveId) return;
    try {
      await approveMutation.mutateAsync(pendingApproveId);
      toast.success("Revised quotation approved successfully!");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to approve revised quotation");
    } finally {
      setPendingApproveId(null);
    }
  };

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Rev Date",
      accessorKey: "quotation_date_rev",
      cell: ({ row }) =>
        row.original.quotation_date_rev
          ? moment(row.original.quotation_date_rev).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "Buyer",
      accessorKey: "buyer_name",
    },
    {
      header: "Amount (₹)",
      accessorKey: "quotation_amount",
      cell: ({ row }) => {
        const val = row.original.quotation_amount;
        return val ? `₹${Number(val).toLocaleString()}` : "-";
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
        if (parentFinishWorkDate) {
          return (
            <span className={`text-xs font-bold ${status === "Pending" ? "text-amber-500" : "text-red-500"}`}>
              {status}
            </span>
          );
        }
        return (
          <ToggleStatus
            initialStatus={status}
            apiUrl={`/rev-quotations/${row.original.id}/status`}
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          {!parentFinishWorkDate && (
            <abbr title="Edit Revised Quotation">
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate(`/quotation-list/revised/${parentId}/edit/${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </abbr>
          )}

          <abbr title="View Report">
            <Button
              size="icon"
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              onClick={() => navigate(`/quotation-report/${row.original.id}?type=rev`)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </abbr>

          {!parentFinishWorkDate &&
            !revQuotationList.some((q) => q.quotation_status === "Approved") &&
            row.original.quotation_status !== "Approved" && (
              <abbr title="Approve & Finalize">
                <Button
                  size="icon"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleApprove(row.original.id)}
                  disabled={approveMutation.isPending}
                >
                  <Award className="h-4 w-4" />
                </Button>
              </abbr>
            )}
        </div>
      ),
    },
  ];

  if ((isLoading && !responseData) || (isParentLoading && !parentQuotationData)) return <LoadingBar />;
  if ((isError && !responseData) || (isParentError && !parentQuotationData)) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={CheckCircle2}
        title="Revised Quotations"
        description={`Manage revisions for Parent Quotation #${parentId}`}
        rightContent={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/quotation-list")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Parent Quotations
            </Button>
          </div>
        }
      />

      {parentFinishWorkDate && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="font-semibold text-sm">Parent Quotation Finalized</p>
            <p className="text-xs opacity-90">The parent quotation has a finish work date. Revisions cannot be added, edited, or approved.</p>
          </div>
        </div>
      )}

      <DataTable
        isLoading={isLoading || isFetching}
        data={revQuotationList}
        columns={columns}
        searchPlaceholder="Search Revisions..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={
          !parentFinishWorkDate
            ? {
                onClick: () => navigate(`/quotation-list/revised/${parentId}/create`),
                label: "Add Revised Quotation",
              }
            : undefined
        }
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Revised Quotation"
        description="Are you sure you want to approve this revised quotation? This will finalize the revised terms."
        confirmText="Approve"
      />
    </div>
  );
};

export default RevQuotationListPage;
