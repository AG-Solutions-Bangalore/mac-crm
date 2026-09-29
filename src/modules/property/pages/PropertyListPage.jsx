import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Building2 } from "lucide-react";
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
import { usePropertiesQuery } from "../hooks/useProperty";

const PropertyListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isFetching, isError, refetch } = usePropertiesQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const isPaginated = paginationData && typeof paginationData === "object" && "data" in paginationData && Array.isArray(paginationData.data);
  const propertyList = isPaginated ? paginationData.data : (Array.isArray(paginationData) ? paginationData : []);

  const filteredData = propertyList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.property_status?.toLowerCase() === statusFilter.toLowerCase();
  });
  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Property Type",
      accessorKey: "property",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "property_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.property_status}
          apiUrl={`/propertys/${row.original.id}/status`}
          payloadKey="property_status"
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
          <abbr title="Edit Property">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/property-list/edit/${row.original.id}`)}
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
        icon={Building2}
        title="Properties"
        description="Manage property type configurations"
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
        searchPlaceholder="Search Properties..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/property-list/create"),
          label: "Add Property",
        }}
        backendPagination={isPaginated}
        page={isPaginated ? paginationData?.current_page : 1}
        totalPages={isPaginated ? paginationData?.last_page : 1}
        totalRecords={isPaginated ? paginationData?.total : propertyList.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PropertyListPage;
