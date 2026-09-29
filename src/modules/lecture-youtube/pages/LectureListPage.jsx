import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Youtube } from "lucide-react";
import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { useLecturesQuery } from "../hooks/useLecture";

const LectureListPage = () => {
  const navigate = useNavigate();
  const IMAGE_FOR = "Lecture Youtube";

  const { data: responseData, isLoading, isError, refetch } = useLecturesQuery();

  const list = responseData?.data || [];
  const imageBaseUrl = getImageBaseUrl(responseData?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(responseData?.image_url);

  const activeList = useMemo(
    () => list.filter((i) => i.youtube_status === "Active"),
    [list]
  );
  const inactiveList = useMemo(
    () => list.filter((i) => i.youtube_status !== "Active"),
    [list]
  );

  const getPages = (data) =>
    [...new Set(data.map((i) => i.page_one_name))].filter(Boolean);

  const groupByPage = (data, page) =>
    data.filter((i) => i.page_one_name === page);

  const columns = [
    {
      header: "Image",
      accessorKey: "youtube_image",
      cell: ({ row }) => {
        const fileName = row.original.youtube_image;
        const src = fileName ? `${imageBaseUrl}${fileName}` : noImageUrl;
        return <ImageCell src={src} fallback={noImageUrl} alt="Youtube Image" />;
      },
      enableSorting: false,
    },
    { header: "Page", accessorKey: "page_one_name", enableSorting: false },
    { header: "Sort", accessorKey: "youtube_sort" },
    { header: "Course", accessorKey: "youtube_course" },
    { header: "Title", accessorKey: "youtube_title" },
    { header: "PlayList", accessorKey: "youtube_language" },
    {
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate(`/lecture-youtube/edit/${row.original.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isError && !responseData) return <ApiErrorPage onRetry={refetch} />;

  const renderGroupedTabs = (data) => {
    const pages = getPages(data);

    return (
      <Tabs defaultValue="ALL" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">All Pages</TabsTrigger>
          {pages.map((page) => (
            <TabsTrigger key={page} value={page}>
              {page}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL">
          <DataTable
            isLoading={isLoading}
            data={data}
            columns={columns}
            pageSize={50}
            searchPlaceholder="Search Lecture Youtube..."
            addButton={{
              onClick: () => navigate("/lecture-youtube/create"),
              label: "Add Lecture Youtube",
            }}
          />
        </TabsContent>

        {pages.map((page) => (
          <TabsContent key={page} value={page}>
            <DataTable
              isLoading={isLoading}
              data={groupByPage(data, page)}
              columns={columns}
              pageSize={50}
              searchPlaceholder={`Search ${page}...`}
              addButton={{
                onClick: () => navigate("/lecture-youtube/create"),
                label: "Add Lecture Youtube",
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="px-5">
      <PageHeader
        icon={Youtube}
        title="YouTube Lectures"
        description="Manage portal client video lectures and guides"
      />

      <Tabs defaultValue="ACTIVE" className="mt-6 w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="ACTIVE">Active Lectures</TabsTrigger>
          <TabsTrigger value="INACTIVE">Inactive Lectures</TabsTrigger>
        </TabsList>

        <TabsContent value="ACTIVE">
          {renderGroupedTabs(activeList)}
        </TabsContent>
        <TabsContent value="INACTIVE">
          {renderGroupedTabs(inactiveList)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LectureListPage;
