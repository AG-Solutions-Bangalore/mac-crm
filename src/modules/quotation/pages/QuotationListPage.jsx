import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, GitBranch, FileText, CalendarDays, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "../hooks/useQuotation";
import moment from "moment";

const QuotationListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [finishDateDialogOpen, setFinishDateDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [finishDate, setFinishDate] = useState("");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useQuotationsQuery(page, searchTerm, statusFilter);
  const updateFinishWorkDateMutation = useUpdateQuotationFinishWorkDateMutation();

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
      toast.success("Finish work date updated successfully");
      refetch();
      setFinishDateDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update finish work date");
    }
  };

  const paginationData = responseData?.data;
  const rawQuotationList = paginationData?.data || [];

  const filteredData = rawQuotationList.filter((item) => {
    if (statusFilter === "all") return true;
    const itemStatus = item.quotation_status?.toLowerCase();
    const filter = statusFilter.toLowerCase();
    if (filter === "cancel") {
      return itemStatus === "cancel" || itemStatus === "cancelled";
    }
    return itemStatus === filter;
  });

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
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.quotation_validity_date
            ? moment(row.original.quotation_validity_date).format("DD-MM-YYYY")
            : "-"}
        </span>
      ),
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
      header: "Buyer",
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
        const canEdit = !q.quotation_finish_work_date;
        const canFinishDate =
          q.quotation_status === "Approved" && !q.quotation_finish_work_date;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[11rem]">
              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate(`/quotation-list/edit/${q.id}`)}
                >
                  <Edit className="h-4 w-4" /> Edit Quotation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`/quotation-report/${q.id}`)}
              >
                <FileText className="h-4 w-4" /> View Report
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`/quotation-list/revised/${q.id}`)}
              >
                <GitBranch className="h-4 w-4" /> Revised Quotations
              </DropdownMenuItem>
              {canFinishDate && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleOpenFinishDateDialog(q)}
                >
                  <CalendarDays className="h-4 w-4" /> Add Finish Work Date
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <SelectItem value="Cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        }
        data={filteredData}
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
    </div>
  );
};

export default QuotationListPage;
