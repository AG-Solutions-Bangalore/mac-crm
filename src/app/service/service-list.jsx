import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { SERVICE_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import ToggleStatus from "@/components/toogle/status-toogle";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
  const navigate = useNavigate();
  const {
    data: servicedata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: SERVICE_API.list,
    queryKey: ["service-list"],
  });

  const IMAGE_FOR = "Service";
  const companyBaseUrl = getImageBaseUrl(servicedata?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(servicedata?.image_url);

  const columns = [
    {
      header: "Logo",
      accessorKey: "service_logo",
      cell: ({ row }) => {
        const fileName = row.original.service_logo;
        const src = fileName ? `${companyBaseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Service Logo" />;
      },
      enableSorting: false,
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
    },
    // {
    //   header: "Description",
    //   accessorKey: "service_description",
    //   enableSorting: false,
    //   cell: ({ row }) => (
    //     <span
    //       className="line-clamp-2 max-w-[200px]"
    //       title={row.original.service_description}
    //     >
    //       {row.original.service_description || "-"}
    //     </span>
    //   ),
    // },
    {
      header: "Status",
      accessorKey: "service_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium text-center flex justify-center items-center ${
            row.original.service_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.service_status}
            apiUrl={SERVICE_API.updateStatus(row.original.id)}
            payloadKey="service_status"
            onSuccess={refetch}
            method="patch"
          />
        </span>
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
    <>
      <DataTable
        data={servicedata?.data?.data || servicedata?.data || []}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Service..."
        addButton={{
          onClick: () => {
            navigate("/service-list/create");
          },
          label: "Add Service",
        }}
      />
    </>
  );
};

export default ServiceList;
