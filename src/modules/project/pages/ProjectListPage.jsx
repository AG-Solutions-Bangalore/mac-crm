import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, FileText, MoreHorizontal, FolderKanban } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsQuery } from "../hooks/useProject";
import moment from "moment";

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useProjectsQuery(
    page,
    searchTerm,
    statusFilter
  );

  const paginationData = responseData?.data;
  const rawProjectList = paginationData?.data || [];

  const filteredData = rawProjectList.filter((item) => {
    if (statusFilter === "all") return true;
    const itemStatus = (item.project_status || item.status || item.quotation_status || "")?.toLowerCase();
    const filter = statusFilter.toLowerCase();
    if (filter === "cancel") {
      return itemStatus === "cancel" || itemStatus === "cancelled";
    }
    return itemStatus === filter;
  });

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "project_date",
      cell: ({ row }) => {
        const d = row.original.project_date || row.original.quotation_date;
        return (
          <span className="whitespace-nowrap">
            {d ? moment(d).format("DD-MM-YYYY") : "-"}
          </span>
        );
      },
    },
    {
      header: "Price Validity Date",
      accessorKey: "price_validity_date",
      cell: ({ row }) => {
        const val = row.original.price_validity_date || row.original.quotation_validity_date;
        if (!val) {
          return <span className="text-slate-400">-</span>;
        }

        const validMoment = moment(val).startOf("day");
        const todayMoment = moment().startOf("day");
        const diffDays = validMoment.diff(todayMoment, "days");

        return (
          <div className="flex flex-col gap-1 items-start whitespace-nowrap">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {validMoment.format("DD-MM-YYYY")}
            </span>
            {diffDays < 0 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Expired
              </span>
            ) : diffDays <= 7 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Expiring {diffDays === 0 ? "today" : `in ${diffDays}d`}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900">
                Valid
              </span>
            )}
          </div>
        );
      },
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
      accessorKey: "category_name",
      cell: ({ row }) =>
        row.original.project_category_name ||
        row.original.quotation_category_name ||
        row.original.category_name ||
        "-",
    },
    {
      header: "Services",
      accessorKey: "service_name",
      cell: ({ row }) =>
        row.original.project_service_name ||
        row.original.quotation_service_name ||
        row.original.service_name ||
        "-",
    },
    {
      header: "Amount (₹)",
      accessorKey: "project_amount",
      cell: ({ row }) => {
        const val = row.original.project_amount || row.original.quotation_amount;
        return (
          <span className="whitespace-nowrap">
            {val ? `₹${Number(val).toLocaleString()}` : "-"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status =
          row.original.project_status ||
          row.original.status ||
          row.original.quotation_status ||
          "Project";

        if (status === "Project") {
          return <span className="pill pill-in_progress">Project</span>;
        }
        if (status === "Approved") {
          return <span className="pill pill-approved">Approved</span>;
        }

        return (
          <ToggleStatus
            initialStatus={status}
            apiUrl={`/projects/${row.original.id}/status`}
            payloadKey="project_status"
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
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[11rem]">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`/project-list/edit/${p.id}`)}
              >
                <Edit className="h-4 w-4" /> Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`/quotation-report/${p.id}`)}
              >
                <FileText className="h-4 w-4" /> View Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-1">
      <PageHeader
        icon={FolderKanban}
        title="Projects"
        description="Manage active projects and scope of execution"
      />
      <DataTable
        isLoading={isLoading || isFetching}
        extraButton={
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        }
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search Projects..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/project-list/create"),
          label: "Add Project",
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

export default ProjectListPage;
