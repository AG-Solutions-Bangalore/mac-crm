import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import { useProductsQuery } from "../hooks/useProduct";

const ProductListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading, isError, refetch } = useProductsQuery(page);

  const paginationData = responseData?.data;
  const productList = paginationData?.data || [];

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Product Name",
      accessorKey: "product_name",
    },
    {
      header: "Service",
      accessorKey: "service_name",
    },
    {
      header: "Category",
      accessorKey: "category_name",
    },
    {
      header: "Brand",
      accessorKey: "brand_name",
    },
    {
      header: "Module",
      accessorKey: "product_module",
    },
    {
      header: "Price (₹)",
      accessorKey: "product_price",
      cell: ({ row }) => {
        const val = row.original.product_price;
        return val ? `₹${Number(val).toLocaleString()}` : "-";
      },
    },
    {
      header: "Warranty",
      accessorKey: "product_warranty",
    },
    {
      header: "Status",
      accessorKey: "product_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.product_status}
          apiUrl={`/products/${row.original.id}/status`}
          payloadKey="product_status"
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
          <abbr title="Edit Product">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/product-list/edit/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
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
        data={productList}
        columns={columns}
        searchPlaceholder="Search Product..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/product-list/create"),
          label: "Add Product",
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

export default ProductListPage;
