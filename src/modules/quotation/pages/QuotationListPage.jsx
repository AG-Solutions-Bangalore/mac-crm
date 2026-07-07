import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, GitBranch, FileText } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import { useQuotationsQuery } from "../hooks/useQuotation";
import moment from "moment";

const QuotationListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading, isError, refetch } = useQuotationsQuery(page);

  const paginationData = responseData?.data;
  const quotationList = paginationData?.data || [];

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "quotation_date",
      cell: ({ row }) =>
        row.original.quotation_date
          ? moment(row.original.quotation_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "Buyer",
      accessorKey: "buyer_name",
    },
    {
      header: "Property",
      accessorKey: "property_name",
    },
    {
      header: "Categories",
      accessorKey: "quotation_category_name",
    },
    {
      header: "Services",
      accessorKey: "quotation_service_name",
    },
    {
      header: "Amount (₹)",
      accessorKey: "quotation_amount",
      cell: ({ row }) => {
        const val = row.original.quotation_amount;
        return val ? `₹${Number(val).toLocaleString()}` : "-";
      },
    },
    {
      header: "Status",
      accessorKey: "quotation_status",
      cell: ({ row }) => {
        const status = row.original.quotation_status;
        if (status === "Approved") {
          return <span className="pill pill-approved">Approved</span>;
        }
        return (
          <ToggleStatus
            initialStatus={status}
            apiUrl={`/quotations/${row.original.id}/status`}
            payloadKey="quotation_status"
            activeValue="Pending"
            inactiveValue="Cancel"
            onSuccess={refetch}
            method="patch"
          />
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Quotation">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/quotation-list/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </abbr>

          <abbr title="View Report">
            <Button
              size="icon"
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              onClick={() => navigate(`/quotation-report/${row.original.id}`)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </abbr>

          <abbr title="Revised Quotations">
            <Button
              size="icon"
              variant="outline"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => navigate(`/quotation-list/revised/${row.original.id}`)}
            >
              <GitBranch className="h-4 w-4" />
            </Button>
          </abbr>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <DataTable
        data={quotationList}
        columns={columns}
        searchPlaceholder="Search Quotations..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/quotation-list/create"),
          label: "Add Quotation",
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

export default QuotationListPage;
