import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { CLIENT_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ClientList = () => {
  const navigate = useNavigate();
  const {
    data: memerdata,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: CLIENT_API.list,
    queryKey: ["member-list"],
  });
  console.log(memerdata?.data.data);

  const columns = [
    {
      header: "M Id",
      accessorKey: "m_id",
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: false,
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      enableSorting: false,
    },
    {
      header: "Area",
      accessorKey: "area",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.area || "-"}</span>,
    },
    {
      header: "R ID",
      accessorKey: "r_id",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.r_id || "-"}</span>,
    },
    {
      header: "Relation",
      accessorKey: "relation",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.relation || "-"}</span>,
    },
    {
      header: "Services",
      accessorKey: "services_name",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.services_name || "-"}</span>,
    },
    {
      header: "Hide Services",
      accessorKey: "hide_services_name",
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.hide_services_name || "-"}</span>,
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Client">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                navigate(`/client-list/edit/${row.original.id}`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>
          <abbr title="Add Family Member">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                navigate(`/client-list/create-relation/`, {
                  state: { m_id: row.original.m_id },
                });
              }}
            >
              <p className="h-4 w-4 flex justify-center">
                <Users />
              </p>
            </Button>
          </abbr>
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
        data={memerdata?.data.data}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Clients..."
        addButton={{
          onClick: () => {
            navigate("/client-list/create");
          },
          label: "Add Client",
        }}
      />
    </>
  );
};

export default ClientList;
