import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { POPUP_API, PR_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { useState } from "react";
import PrForm from "./pr-form";

const PrList = () => {
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: PR_API.list,
    queryKey: ["pr-list"],
  });

  const IMAGE_FOR = "Popup";
  const prBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const [selectedId, setSelectedId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setSelectedId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: "Image",
      accessorKey: "popup_image",
      cell: ({ row }) => {
        const fileName = row.original.popup_image;
        const src = fileName ? `${prBaseUrl}${fileName}` : noImageUrl;
        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={`${IMAGE_FOR} Image`}
          />
        );
      },
      enableSorting: false,
    },
    { header: "Page", accessorKey: "page_one_name", enableSorting: false },
    { header: "Required", accessorKey: "popup_required", enableSorting: false },
    { header: "Heading", accessorKey: "popup_heading", enableSorting: false },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleEdit(row.original.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
    },
  ];
  if (isError) {
    return <ApiErrorPage onRetry={() => refetch()} />;
  }
  return (
    <>
      {isLoading && <LoadingBar />}

      <DataTable
        data={data?.data || []}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search pr..."
        addButton={{
          onClick: handleCreate,
          label: "Add PR",
        }}
      />

      <PrForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        prId={selectedId}
        refetch={refetch}
      />
    </>
  );
};

export default PrList;
