import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit , UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { useBuyersQuery } from "../hooks/useBuyer";

const BuyerListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isError, refetch } = useBuyersQuery(page);

  const paginationData = responseData?.data;
  const buyerList = paginationData?.data || [];

  const filteredData = buyerList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.buyer_status?.toLowerCase() === statusFilter.toLowerCase();
  });


  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Buyer Name",
      accessorKey: "buyer_name",
      enableSorting: false,
    },
    {
      header: "Mobile",
      accessorKey: "buyer_mobile",
      enableSorting: false,
    },
    {
      header: "Email",
      accessorKey: "buyer_email",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "buyer_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.buyer_status}
          apiUrl={`/buyers/${row.original.id}/status`}
          payloadKey="buyer_status"
          onSuccess={refetch}
          method="patch"
        />
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Buyer">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/buyer-list/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={UserCheck}
        title="Buyers"
        description="Manage buyer profiles and contact details"
      />
      <DataTable
        extraButton={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search Buyers..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/buyer-list/create"),
          label: "Add Buyer",
        }}
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />
    </div>
  );
};

export default BuyerListPage;
