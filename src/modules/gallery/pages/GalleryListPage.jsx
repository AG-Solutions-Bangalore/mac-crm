import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Image as ImageIcon } from "lucide-react";
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
import { useGalleriesQuery } from "../hooks/useGallery";

const GalleryListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: responseData, isLoading, isError, refetch } = useGalleriesQuery(page);

  const paginationData = responseData?.data;
  const isPaginated =
    paginationData &&
    typeof paginationData === "object" &&
    !Array.isArray(paginationData) &&
    "data" in paginationData &&
    Array.isArray(paginationData.data);

  const galleryList = isPaginated
    ? paginationData.data
    : Array.isArray(paginationData)
    ? paginationData
    : Array.isArray(responseData?.data)
    ? responseData.data
    : [];

  const IMAGE_FOR = "Gallery";
  const galleryBaseUrl = getImageBaseUrl(responseData?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(responseData?.image_url);

  const filteredData = galleryList.filter((item) => {
    if (statusFilter === "all") return true;
    return item.gallery_status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns = [
    {
      header: "Sl No",
      id: "sl_no",
      cell: ({ row }) => (page - 1) * 50 + row.index + 1,
      enableSorting: false,
    },
    {
      header: "Image",
      accessorKey: "gallery_image",
      enableSorting: false,
      cell: ({ row }) => {
        const fileName = row.original.gallery_image;
        const baseUrl = row.original.gallery_url || galleryBaseUrl;
        const src = fileName
          ? `${baseUrl}${fileName}?t=${Date.now()}`
          : `${noImageUrl}?t=${Date.now()}`;
        return <ImageCell src={src} fallback={noImageUrl} alt="Gallery image" />;
      },
    },
    {
      header: "Image File",
      accessorKey: "gallery_image",
      enableSorting: false,
      cell: ({ row }) => (
        <code className="text-xs bg-muted text-foreground px-2 py-1 rounded font-mono">
          {row.original.gallery_image || "-"}
        </code>
      ),
    },
    {
      header: "Status",
      accessorKey: "gallery_status",
      cell: ({ row }) => (
        <ToggleStatus
          initialStatus={row.original.gallery_status}
          apiUrl={`/gallerys/${row.original.id}/status`}
          payloadKey="gallery_status"
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
          <abbr title="Edit Gallery">
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate(`/gallery-list/edit/${row.original.id}`)}
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
        icon={ImageIcon}
        title="Gallery"
        description="Manage images published on the portal"
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
        searchPlaceholder="Search gallery..."
        pageSize={50}
        addButton={{
          onClick: () => navigate("/gallery-list/create"),
          label: "Add Gallery",
        }}
        backendPagination={isPaginated}
        page={isPaginated ? (paginationData?.current_page || 1) : 1}
        totalPages={isPaginated ? (paginationData?.last_page || 1) : 1}
        totalRecords={isPaginated ? (paginationData?.total || 0) : galleryList.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default GalleryListPage;
