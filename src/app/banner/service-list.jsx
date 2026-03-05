import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { SERVICE_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

const ServiceList = () => {
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: SERVICE_API.list,
    queryKey: ["service-list"],
  });

  const IMAGE_FOR = "Service";
  const bannerBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const columns = [
    {
      header: "Image",
      accessorKey: "banner_image",
      cell: ({ row }) => {
        const fileName = row.original.banner_image;
        const src = fileName ? `${bannerBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={`${IMAGE_FOR} Image`}
          />
        );
      },
      
      enableSorting: false,
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      enableSorting: true,
    },

    {
      header: "Status",
      accessorKey: "service_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.service_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.service_status}
        </span>
      ),
      enableSorting: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div>
          <Link
            title="banner edit"
            to={`/edit-banner/${row.original.id}`}
            className="cursor-pointer"
          >
            <Edit className=" h-4 w-4 hover:text-blue-600" />
          </Link>
        </div>
      ),
      enableSorting: false,
    },
  ];
  console.log(data, "data");
  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;
  return (
    <>
      <DataTable
        data={data?.data?.data || []}
        columns={columns}
        pageSize={20}
        searchPlaceholder="Search banners..."
        addButton={{
          to: "/add-banner",
          label: "Add Banner",
        }}
      />
    </>
  );
};

export default ServiceList;
