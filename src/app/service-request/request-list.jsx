import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { REQUEST_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RequestDialog from "./request-dialog";
import { useState } from "react";
import ToggleAction from "@/components/toogle/action-toggle";

const RequestList = () => {
  const {
    data: memerdata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: REQUEST_API.list,
    queryKey: ["reqest-list"],
  });
  console.log(memerdata?.data.data);

  // const [open, setOpen] = useState(false);
  // const [editId, setEditId] = useState(null);

  const columns = [
    {
      header: "Request Date",
      accessorKey: "services_request_date",
      enableSorting: true,
      cell: ({ row }) => {
        const dateStr = row.original.services_request_date;
        if (!dateStr) return "-";
        const [year, month, day] = dateStr.split("-");

        return `${day.trim()} - ${month.trim()} - ${year.trim()}`;
      },
    },
    {
      header: "User ID",
      accessorKey: "user_m_id",
      enableSorting: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      enableSorting: false,
    },
    {
      header: "Action",
      accessorKey: "services_request_status",
      cell: ({ row }) => (
        <span>
          <ToggleAction
            initialStatus={row.original.services_request_status}
            apiUrl={REQUEST_API.updateStatus(row.original.id)}
            payloadKey="services_request_status"
            onSuccess={refetch}
          />
          {/* <ToggleStatus
            initialStatus={row.original.notification_status}
            apiUrl={NOTIFICATION_API.updateStatus(row.original.id)}
            payloadKey="notification_status"
            onSuccess={refetch}
            method="patch"
          /> */}
          {/* {row.original.services_request_status} */}
        </span>
      ),
    },
    // {
    //   header: "Actions",
    //   accessorKey: "actions",
    //   cell: ({ row }) => (
    //     <div className="flex gap-2">
    //       <abbr title="Change Status">
    //         <Button
    //           size="icon"
    //           variant="outline"
    //           onClick={() => {
    //             setEditId(row.original.id);
    //             setOpen(true);
    //           }}
    //         >
    //           <Edit className="h-4 w-4" />
    //         </Button>
    //       </abbr>
    //     </div>
    //   ),
    //   enableSorting: false,
    // },
  ];
  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <>
      <DataTable
        data={memerdata?.data.data}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Request..."
      />

      {/* <RequestDialog
        open={open}
        onClose={() => setOpen(false)}
        Id={editId}
      /> */}
    </>
  );
};

export default RequestList;
