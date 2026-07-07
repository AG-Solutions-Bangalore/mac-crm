import React, { useState } from "react";
import moment from "moment";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { useComplaintsQuery } from "../hooks/useComplaint";
import ComplaintStatusToggle from "../components/ComplaintStatusToggle";

const ComplaintListPage = () => {
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading, isError, refetch } = useComplaintsQuery(page);

  const paginationData = responseData?.data;
  const complaintList = paginationData?.data || [];

  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "complaint_date",
      cell: ({ row }) =>
        row.original.complaint_date
          ? moment(row.original.complaint_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "User MID",
      accessorKey: "user_m_id",
      enableSorting: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Subject",
      accessorKey: "complaint_subject",
      enableSorting: false,
    },
    {
      header: "Description",
      accessorKey: "complaint_description",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.complaint_description
          ? row.original.complaint_description
          : "-",
    },
    {
      header: "Action",
      accessorKey: "complaint_status",
      cell: ({ row }) => (
        <ComplaintStatusToggle
          initialStatus={row.original.complaint_status}
          id={row.original.id}
          onSuccess={refetch}
        />
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Complaints</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and update pending client complaints</p>
      </div>

      <DataTable
        data={complaintList}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search Complaints..."
        backendPagination={true}
        page={paginationData?.current_page || 1}
        totalPages={paginationData?.last_page || 1}
        totalRecords={paginationData?.total || 0}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ComplaintListPage;
