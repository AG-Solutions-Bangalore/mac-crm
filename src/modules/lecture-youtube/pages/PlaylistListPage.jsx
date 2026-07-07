import React, { useState } from "react";
import { Edit, Play } from "lucide-react";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { usePlaylistsQuery } from "../hooks/useLecture";
import LectureYoutubePlaylistDialog from "../components/LectureYoutubePlaylistDialog";

const PlaylistListPage = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data: responseData, isLoading, isError, refetch } = usePlaylistsQuery();

  const columns = [
    {
      header: "Sort",
      accessorKey: "youtube_playlist_sort",
    },
    {
      header: "Playlist Name",
      accessorKey: "youtube_playlist_name",
    },
    {
      header: "Status",
      accessorKey: "youtube_playlist_status",
      cell: ({ row }) => {
        const status = row.original.youtube_playlist_status;
        const isActive = status === "Active" || status === 1;

        return (
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full inline-block
              ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setEditData(row.original);
            setOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleCreate = () => {
    setEditData(null);
    setOpen(true);
  };

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={Play}
        title="YouTube Playlists"
        description="Configure playlists for client video lectures"
      />

      <div className="mt-6">
        <DataTable
          data={responseData?.data ?? []}
          columns={columns}
          pageSize={50}
          searchPlaceholder="Search Playlist..."
          addButton={{
            onClick: handleCreate,
            label: "Add PlayList",
          }}
        />
      </div>

      <LectureYoutubePlaylistDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PlaylistListPage;
