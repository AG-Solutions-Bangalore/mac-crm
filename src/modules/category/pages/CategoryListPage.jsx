import PageHeader from "@/components/common/page-header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit , Tag } from "lucide-react";
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
import { useCategoriesQuery } from "../hooks/useCategory";

const CategoryListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isFetching, isError, refetch } = useCategoriesQuery(page, searchTerm);

  const paginationData = responseData?.data;
  const categoryList = paginationData?.data || [];

  const filteredData = categoryList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.category_status?.toLowerCase() === statusFilter.toLowerCase();
  });


  const columns = [
    {
      header: "SlNo",
      accessorKey: "slno",
      enableSorting: false,
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Category Name",
      accessorKey: "category_name",
    },
    {
      header: "Status",
      accessorKey: "category_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.category_status}
          apiUrl={`/categorys/${row.original.id}/status`}
          payloadKey="category_status"
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
          <abbr title="Edit Category">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/category-list/edit/${row.original.id}`)}
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
        icon={Tag}
        title="Categories"
        description="Manage product categories"
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
        searchPlaceholder="Search Category..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        addButton={{
          onClick: () => navigate("/category-list/create"),
          label: "Add Category",
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

export default CategoryListPage;
