import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useBlogsQuery } from "../hooks/useBlog";

/**
 * Small visual badge for "Yes" / "No" fields like blog_featured and blog_front.
 */
const YesNoBadge = ({ value }) => {
  const isYes =
    value === true ||
    value === 1 ||
    value === "1" ||
    (typeof value === "string" && value.toLowerCase() === "yes");

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isYes
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isYes ? "Yes" : "No"}
    </span>
  );
};

const BlogListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isError, refetch } = useBlogsQuery(page);

  const paginationData = responseData?.data;
  const isPaginated =
    paginationData &&
    typeof paginationData === "object" &&
    !Array.isArray(paginationData) &&
    "data" in paginationData &&
    Array.isArray(paginationData.data);

  const blogList = isPaginated
    ? paginationData.data
    : Array.isArray(paginationData)
    ? paginationData
    : Array.isArray(responseData?.data)
    ? responseData.data
    : [];

  const IMAGE_FOR = "Blog";
  const blogBaseUrl = getImageBaseUrl(responseData?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(responseData?.image_url);

  const filteredData = blogList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.blog_status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
      enableSorting: false,
    },
    {
      header: "Banner",
      accessorKey: "blog_banner_image",
      enableSorting: false,
      cell: ({ row }) => {
        const fileName = row.original.blog_banner_image;
        const baseUrl = row.original.blog_url || blogBaseUrl;
        const src = fileName ? `${baseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Blog banner" />;
      },
    },
    {
      header: "Title",
      accessorKey: "blog_title",
      cell: ({ row }) => (
        <div className="max-w-[280px]">
          <p className="font-medium truncate">{row.original.blog_title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {row.original.blog_short_description}
          </p>
        </div>
      ),
    },
    {
      header: "Index",
      accessorKey: "blog_index",
      cell: ({ row }) => <YesNoBadge value={row.original.blog_index} />,
    },
    {
      header: "Featured",
      accessorKey: "blog_featured",
      cell: ({ row }) => <YesNoBadge value={row.original.blog_featured} />,
    },
    {
      header: "Front",
      accessorKey: "blog_front",
      cell: ({ row }) => <YesNoBadge value={row.original.blog_front} />,
    },
    {
      header: "Status",
      accessorKey: "blog_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.blog_status}
          apiUrl={`/blogs/${row.original.id}/status`}
          payloadKey="blog_status"
          activeValue="Active"
          inactiveValue="Inactive"
          onSuccess={refetch}
          method="patch"
        />
      ),
    },
    {
      header: "Actions",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <abbr title="Edit Blog">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/blog-list/edit/${row.original.id}`)}
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
      <PageHeader
        icon={BookOpen}
        title="Blogs"
        description="Manage blog posts published on the portal"
      />
      <DataTable
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
        searchPlaceholder="Search blogs..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/blog-list/create"),
          label: "Add Blog",
        }}
        backendPagination={isPaginated}
        page={isPaginated ? (paginationData?.current_page || 1) : 1}
        totalPages={isPaginated ? (paginationData?.last_page || 1) : 1}
        totalRecords={isPaginated ? (paginationData?.total || 0) : blogList.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default BlogListPage;
