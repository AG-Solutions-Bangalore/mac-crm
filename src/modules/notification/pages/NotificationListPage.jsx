import React, { useState } from "react";
import moment from "moment";
import { Edit, Bell } from "lucide-react";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useNotificationsQuery } from "../hooks/useNotification";
import NotificationDialog from "../components/NotificationDialog";

const NotificationListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data: responseData, isLoading, isFetching, isError, refetch } = useNotificationsQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const notificationList = paginationData?.data || [];

  const IMAGE_FOR = "Notification";
  const companyBaseUrl = getImageBaseUrl(responseData?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(responseData?.image_url);

  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Image",
      accessorKey: "notification_image",
      enableSorting: false,
      cell: ({ row }) => {
        const fileName = row.original.notification_image;
        const src = fileName ? `${companyBaseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Notification Image" />;
      },
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
        <ToggleStatus
          initialStatus={row.original.notification_status}
          apiUrl={`/notifications/${row.original.id}/status`}
          payloadKey="notification_status"
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
      ),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  const handleCreate = () => {
    setEditId(null);
    setOpen(true);
  };

  return (
    <div className="px-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage client portal broadcast notifications</p>
      </div>

      <DataTable
        isLoading={isLoading || isFetching}
        data={notificationList}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Notifications..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: handleCreate,
          label: "Add Notification",
        }}
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />

      <NotificationDialog
        open={open}
        onClose={() => setOpen(false)}
        Id={editId}
        onSaveSuccess={refetch}
      />
    </div>
  );
};

export default NotificationListPage;
