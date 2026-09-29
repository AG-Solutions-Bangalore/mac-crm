import React, { useState } from "react";
import moment from "moment";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { useRequestsQuery } from "../hooks/useRequest";
import RequestStatusToggle from "../components/RequestStatusToggle";

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

const RequestListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useRequestsQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const requestList = paginationData?.data || [];

  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "services_request_date",
      cell: ({ row }) =>
        row.original.services_request_date
          ? moment(row.original.services_request_date).format("DD-MM-YYYY")
          : "-",
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
      cell: ({ row }) => (
        <span className={`service-badge ${getServiceBadgeClass(row.original.service_name)}`}>
          {row.original.service_name || "-"}
        </span>
      ),
    },
    {
      header: "Action",
      accessorKey: "services_request_status",
      cell: ({ row }) => (
        <RequestStatusToggle
          initialStatus={row.original.services_request_status}
          id={row.original.id}
          onSuccess={refetch}
        />
      ),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Requests</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and update pending client requests</p>
      </div>

      <DataTable
        isLoading={isLoading || isFetching}
        data={requestList}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Request..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
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

export default RequestListPage;
