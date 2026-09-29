import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit , Users } from "lucide-react";
import DataTable from "@/components/common/data-table";
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
import { useClientsQuery } from "../hooks/useClient";

const getServiceBadgeClass = (serviceName) => {
  if (!serviceName) return "badge-default";
  const service = serviceName.toLowerCase();
  if (service.includes("switch")) return "badge-switches";
  if (service.includes("door") || service.includes("automation")) return "badge-automation";
  if (service.includes("network") || service.includes("wifi") || service.includes("internet")) return "badge-networking";
  if (service.includes("light")) return "badge-lighting";
  if (service.includes("secur") || service.includes("camera") || service.includes("cctv")) return "badge-security";
  return "badge-default";
};

const ClientListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useClientsQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const clientList = paginationData?.data || [];

  const filteredData = clientList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status?.toLowerCase() === statusFilter.toLowerCase();
  });


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
      header: "Services",
      accessorKey: "services_name",
      enableSorting: false,
      cell: ({ row }) => {
        const services = row.original.services_name;
        if (!services) return <span>-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {services.split(",").map((s) => {
              const name = s.trim();
              return (
                <span key={name} className={`service-badge ${getServiceBadgeClass(name)}`}>
                  {name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      header: "Hide Services",
      accessorKey: "hide_services_name",
      enableSorting: false,
      cell: ({ row }) => {
        const services = row.original.hide_services_name;
        if (!services) return <span>-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {services.split(",").map((s) => {
              const name = s.trim();
              return (
                <span key={name} className="service-badge badge-default opacity-85">
                  {name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.status}
          apiUrl={`/members/${row.original.id}/status`}
          payloadKey="status"
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
        <div className="flex gap-2">
          <abbr title="Edit Client">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/client-list/edit/${row.original.id}`)}
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
        icon={Users}
        title="Clients"
        description="Manage customer accounts and service mappings"
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
        searchPlaceholder="Search Clients..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/client-list/create"),
          label: "Add Client",
        }}
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ClientListPage;
