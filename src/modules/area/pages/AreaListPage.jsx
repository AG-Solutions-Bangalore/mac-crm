import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, ShieldAlert , Map } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAreasQuery } from "../hooks/useArea";

const AreaListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isError, refetch } = useAreasQuery(page);

  const paginationData = responseData?.data;
  const areaList = paginationData?.data || [];

  const filteredData = areaList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.property_area_status?.toLowerCase() === statusFilter.toLowerCase();
  });


  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Property Area",
      accessorKey: "property_area",
    },
    {
      header: "Status",
      accessorKey: "property_area_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.property_area_status}
          apiUrl={`/areas/${row.original.id}/status`}
          payloadKey="property_area_status"
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
          <abbr title="Edit Area">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/area-list/edit/${row.original.id}`)}
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
        icon={Map}
        title="Areas"
        description="Manage property area configurations"
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
        searchPlaceholder="Search Area..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/area-list/create"),
          label: "Add Area",
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

export default AreaListPage;
