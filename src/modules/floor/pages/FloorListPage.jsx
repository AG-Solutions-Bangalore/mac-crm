import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { useFloorsQuery } from "../hooks/useFloor";

const FloorListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading, isError, refetch } = useFloorsQuery();

  const paginationData = responseData?.data;
  const isPaginated = paginationData && typeof paginationData === "object" && "data" in paginationData && Array.isArray(paginationData.data);
  const floorList = isPaginated ? paginationData.data : (Array.isArray(paginationData) ? paginationData : []);

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

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Floors</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage floor levels and status</p>
      </div>

      <DataTable
        data={floorList}
        columns={columns}
        searchPlaceholder="Search Floors..."
        pageSize={50}
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
