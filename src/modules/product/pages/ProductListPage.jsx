import PageHeader from "@/components/common/page-header";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { usePersistedSearch } from "@/hooks/usePersistedSearch";
import { Edit , Package } from "lucide-react";
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
import { useProductsQuery } from "../hooks/useProduct";
import { useActiveServicesQuery } from "../../service/hooks/useService";

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Strict whole-word search: "2M" matches "2M" but not "12M".
const matchesSearch = (record, term) => {
  if (!term) return true;
  const tokens = term.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = `${record.product_module || ""} ${record.product_name || ""}`;
  return tokens.every((t) => {
    const re = new RegExp(`(^|\\s)${escapeRegExp(t)}(\\s|$)`, "i");
    return re.test(haystack);
  });
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = usePersistedPage();
  const [searchTerm, setSearchTerm] = usePersistedSearch();
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  const { data: servicesData } = useActiveServicesQuery();
  const services = servicesData?.data || [];
  const selectedService = services.find(
    (service) => service.id?.toString() === serviceFilter
  );
  const effectiveSearch =
    serviceFilter === "all" ? searchTerm : selectedService?.service_name || "";

  const { data: responseData, isLoading, isFetching, isError, refetch } = useProductsQuery(
    page,
    effectiveSearch,
    statusFilter
  );

  const paginationData = responseData?.data;
  const backendList = paginationData?.data || [];

  // Backend does a loose LIKE search (e.g. "2M" also returns "12M"), so apply
  // strict whole-word filtering on the module/product name client-side.
  const productList = useMemo(
    () => backendList.filter((r) => matchesSearch(r, searchTerm)),
    [backendList, searchTerm]
  );


  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
    },
    {
      header: "Module",
      accessorKey: "product_module",
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
      header: "Price (₹)",
      accessorKey: "product_price",
      cell: ({ row }) => {
        const val = row.original.product_price;
        return val ? `₹${Number(val).toLocaleString("en-IN")}` : "-";
      },
    },
    {
      header: "Warranty",
      accessorKey: "product_warranty",
      cell: ({ row }) => {
        const val = row.original.product_warranty;
        return val ? `${val} Years` : "-";
      },
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

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={Package}
        title="Products"
        description="Manage product catalog items"
      />
      <DataTable
        isLoading={isLoading || isFetching}
        extraButton={
          <div className="flex items-center gap-2">
            <Select
              value={serviceFilter}
              onValueChange={(val) => {
                setServiceFilter(val);
                setSearchTerm("");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem
                    key={service.id}
                    value={service.id?.toString()}
                  >
                    {service.service_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        data={productList}
        columns={columns}
        searchPlaceholder="Search Product..."
        pageSize={50}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          if (serviceFilter !== "all") setServiceFilter("all");
          setPage(1);
        }}
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
