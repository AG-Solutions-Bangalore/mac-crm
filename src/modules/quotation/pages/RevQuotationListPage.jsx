import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, ArrowLeft, CheckCircle2, Award, FileText } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useRevQuotationsQuery, useApproveRevQuotationMutation } from "../hooks/useQuotation";
import moment from "moment";
import { toast } from "sonner";

const RevQuotationListPage = () => {
  const { id: parentId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingApproveId, setPendingApproveId] = useState(null);

  const { data: responseData, isLoading, isError, refetch } = useRevQuotationsQuery(parentId, page);
  const approveMutation = useApproveRevQuotationMutation();

  const paginationData = responseData?.data;
  const revQuotationList = paginationData?.data || [];

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
          <abbr title="Edit Revised Quotation">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/quotation-list/revised/${parentId}/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>

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

          {row.original.quotation_status !== "Approved" && (
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

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

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

      <DataTable
        data={revQuotationList}
        columns={columns}
        searchPlaceholder="Search Revisions..."
        pageSize={50}
        addButton={{
          onClick: () => navigate(`/quotation-list/revised/${parentId}/create`),
          label: "Add Revised Quotation",
        }}
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
