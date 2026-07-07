import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Image } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
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
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useServicesQuery } from "../hooks/useService";

const ServiceListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isError, refetch } = useServicesQuery(page);

  const paginationData = responseData?.data;
  const rawData = paginationData?.data || responseData?.data || [];

  const IMAGE_FOR = "Service";
  const companyBaseUrl = getImageBaseUrl(responseData?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(responseData?.image_url);

  const filteredData = rawData.filter((item) => {
    if (statusFilter === "all") return true;
    return item.service_status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns = [
    {
      header: "Logo",
      accessorKey: "service_logo",
      cell: ({ row }) => {
        const fileName = row.original.service_logo;
        const src = fileName ? `${companyBaseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Service Logo" width={52} height={26} />;
      },
      enableSorting: false,
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
    },
    {
      header: "Status",
      accessorKey: "service_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.service_status}
          apiUrl={`/services/${row.original.id}/status`}
          payloadKey="service_status"
          onSuccess={refetch}
          method="patch"
        />
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              navigate(`/service-list/edit/${row.original.id}`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <DataTable
        data={filteredData}
        columns={columns}
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        onPageChange={setPage}
        totalRecords={paginationData?.total || 0}
        searchPlaceholder="Search Service..."
        extraButton={
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
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
        addButton={{
          onClick: () => {
            navigate("/service-list/create");
          },
          label: "Add Service",
        }}
      />
    </div>
  );
};

export default ServiceListPage;
