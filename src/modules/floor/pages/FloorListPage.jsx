import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Layers } from "lucide-react";
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
import { useFloorsQuery } from "../hooks/useFloor";

const FloorListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useFloorsQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const isPaginated = paginationData && typeof paginationData === "object" && "data" in paginationData && Array.isArray(paginationData.data);
  const floorList = isPaginated ? paginationData.data : (Array.isArray(paginationData) ? paginationData : []);

  const filteredData = floorList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.property_floor_status?.toLowerCase() === statusFilter.toLowerCase();
  });
  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Floor Name",
      accessorKey: "property_floor",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "property_floor_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.property_floor_status}
          apiUrl={`/floors/${row.original.id}/status`}
          payloadKey="property_floor_status"
          onSuccess={refetch}
          method="patch"
          activeValue="Active"
          inactiveValue="Inactive"
        />
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Floor">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/floor-list/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>
        </div>
      ),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
            <PageHeader
        icon={Layers}
        title="Floors"
        description="Manage property floor levels"
      />

      <DataTable
        isLoading={isLoading || isFetching}
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
        searchPlaceholder="Search Floors..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/floor-list/create"),
          label: "Add Floor",
        }}
        backendPagination={isPaginated}
        page={isPaginated ? paginationData?.current_page : 1}
        totalPages={isPaginated ? paginationData?.last_page : 1}
        totalRecords={isPaginated ? paginationData?.total : floorList.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default FloorListPage;
