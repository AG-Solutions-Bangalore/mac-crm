import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupButton } from "@/components/group-button";
import { useCreatePlaylistMutation, useUpdatePlaylistMutation } from "../hooks/useLecture";

const initialState = {
  youtube_playlist_sort: "",
  youtube_playlist_name: "",
  youtube_playlist_status: "Active",
};

const LectureYoutubePlaylistDialog = ({ open, onClose, editData = null, onSuccess }) => {
  const isEditMode = Boolean(editData?.id);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const createPlaylistMutation = useCreatePlaylistMutation();
  const updatePlaylistMutation = useUpdatePlaylistMutation();
  const loading = createPlaylistMutation.isPending || updatePlaylistMutation.isPending;

  useEffect(() => {
    if (editData) {
      setData({
        youtube_playlist_sort: editData.youtube_playlist_sort || "",
        youtube_playlist_name: editData.youtube_playlist_name || "",
        youtube_playlist_status: editData.youtube_playlist_status || "Active",
      });
    } else {
      setData(initialState);
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const err = {};

    if (!data.youtube_playlist_sort)
      err.youtube_playlist_sort = "Sort order is required";
    else if (isNaN(Number(data.youtube_playlist_sort)))
      err.youtube_playlist_sort = "Sort must be a number";

    if (!data.youtube_playlist_name)
      err.youtube_playlist_name = "Playlist name is required";

    if (!data.youtube_playlist_status)
      err.youtube_playlist_status = "Status is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditMode) {
        await updatePlaylistMutation.mutateAsync({
          id: editData.id,
          data,
        });
      } else {
        await createPlaylistMutation.mutateAsync(data);
      }
      toast.success("Saved successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Playlist" : "Create Playlist"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sort Order *</label>
            <Input
              type="number"
              value={data.youtube_playlist_sort}
              onChange={(e) =>
                setData({
                  ...data,
                  youtube_playlist_sort: e.target.value,
                })
              }
              min={0}
            />
            {errors.youtube_playlist_sort && (
              <p className="text-xs text-red-500 mt-1">
                {errors.youtube_playlist_sort}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Playlist Name *</label>
            <Input
              value={data.youtube_playlist_name}
              onChange={(e) =>
                setData({
                  ...data,
                  youtube_playlist_name: e.target.value,
                })
              }
            />
            {errors.youtube_playlist_name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.youtube_playlist_name}
              </p>
            )}
          </div>

          {isEditMode && (
            <div>
              <label className="text-sm font-medium">Status *</label>
              <div>
                <GroupButton
                  className="w-fit mt-2"
                  value={data.youtube_playlist_status}
                  onChange={(value) =>
                    setData({
                      ...data,
                      youtube_playlist_status: value,
                    })
                  }
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                />
              </div>
              {errors.youtube_playlist_status && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.youtube_playlist_status}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LectureYoutubePlaylistDialog;
