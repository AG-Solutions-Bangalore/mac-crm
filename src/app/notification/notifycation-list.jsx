import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { NOTIFICATION_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NotificationDialog from "./create-notification";
import ToggleStatus from "@/components/toogle/status-toogle";

const NotificationList = () => {
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: NOTIFICATION_API.list,
    queryKey: ["notification-list"],
  });
  console.log(data);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const IMAGE_FOR = "Notification";
  const companyBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  // console.log(companyBaseUrl, "companyBaseUrl");
  const noImageUrl = getNoImageUrl(data?.image_url);

  // console.log(columns);

  const columns = [
    {
      header: "Image",
      accessorKey: "notification_image",
      cell: ({ row }) => {
        const fileName = row.original.notification_image;
        const src = fileName ? `${companyBaseUrl}${fileName}` : noImageUrl;

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
      header: "Heading",
      accessorKey: "notification_heading",
    },
    {
      header: "Date",
      accessorKey: "notification_date",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.notification_date
          ? moment(row.original.notification_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "Status",
      accessorKey: "notification_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium text-center flex justify-center items-center ${
            row.original.notification_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.notification_status}
            apiUrl={NOTIFICATION_API.updateStatus(row.original.id)}
            payloadKey="notification_status"
            onSuccess={refetch}
            method="patch"
          />
          {/* {row.original.notification_status} */}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setEditId(row.original.id);
              setOpen(true);
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
  const handleCreate = () => {
    setEditId(null);
    setOpen(true);
  };
  return (
    <>
      <DataTable
        data={data?.data.data}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Notifications..."
        addButton={{
          onClick: handleCreate,
          label: "Add Notification",
        }}
      />

      <NotificationDialog
        open={open}
        onClose={() => setOpen(false)}
        Id={editId}
      />
    </>
  );
};

export default NotificationList;
