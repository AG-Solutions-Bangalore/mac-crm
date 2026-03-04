import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { COMPANY_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import CompanyDialog from "./create-company";

const CompanyList = () => {
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: COMPANY_API.list,
    queryKey: ["company-list"],
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const IMAGE_FOR = "Student Company";
  const companyBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const columns = [
    {
      header: "Image",
      accessorKey: "student_company_image",
      cell: ({ row }) => {
        const fileName = row.original.student_company_image;
        const src = fileName ? `${companyBaseUrl}${fileName}` : noImageUrl;

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
    {
      header: "Company Name",
      accessorKey: "student_company_name",
    },
    {
      header: "Alt Text",
      accessorKey: "student_company_image_alt",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "student_company_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.student_company_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.student_company_status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setEditId(row.original.id);
              setOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;
  const handleCreate = () => {
    setEditId(null);
    setOpen(true);
  };
  return (
    <>
      <DataTable
        data={data?.data || []}
        columns={columns}
        pageSize={50}
        searchPlaceholder="Search companies..."
        addButton={{
          onClick: handleCreate,
          label: "Add Company",
        }}
      />

      <CompanyDialog
        open={open}
        onClose={() => setOpen(false)}
        companyId={editId}
      />
    </>
  );
};

export default CompanyList;
