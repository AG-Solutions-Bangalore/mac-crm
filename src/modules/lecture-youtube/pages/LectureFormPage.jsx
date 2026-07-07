import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import {
  useLectureQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useActivePlaylistsQuery,
  useYoutubeForQuery,
  useCoursesQuery,
} from "../hooks/useLecture";

const initialState = {
  youtube_for: "",
  youtube_sort: "",
  youtube_course: "",
  youtube_language: "",
  youtube_title: "",
  youtube_link: "",
  youtube_playlist_id: "",
  youtube_image: null,
  youtube_image_alt: "",
  youtube_status: "Active",
};

const LectureFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const IMAGE_FOR = "Lecture Youtube";

  const [data, setData] = useState(initialState);
  const [preview, setPreview] = useState({
    youtube_image: "",
  });
  const [errors, setErrors] = useState({});

  // TanStack Hooks
  const { data: fetchedVideo, isLoading: isVideoLoading, isError: isVideoError } = useLectureQuery(id, isEditMode);
  const { data: youtubeForData, isLoading: isYoutubeForLoading } = useYoutubeForQuery();
  const { data: playListData } = useActivePlaylistsQuery();
  const { data: coursesData } = useCoursesQuery();

  const createMutation = useCreateLectureMutation();
  const updateMutation = useUpdateLectureMutation();
  const submitLoading = createMutation.isPending || updateMutation.isPending;

  const youtubeForList = youtubeForData?.data || [];
  const playlistOptions = playListData?.data || [];
  const coursesOptions = coursesData?.data || [];

  useEffect(() => {
    if (!isEditMode) return;

    if (fetchedVideo?.data) {
      setData({
        ...fetchedVideo.data,
        youtube_image: null,
      });

      const imageBaseUrl = getImageBaseUrl(fetchedVideo?.image_url, IMAGE_FOR);
      const noImageUrl = getNoImageUrl(fetchedVideo?.image_url);
      setPreview({
        youtube_image: fetchedVideo?.data?.youtube_image
          ? `${imageBaseUrl}${fetchedVideo.data.youtube_image}`
          : noImageUrl,
      });
    }
  }, [isEditMode, fetchedVideo]);

  const validate = () => {
    const err = {};

    if (!data.youtube_for) err.youtube_for = "YouTube For is required";
    if (!data.youtube_link) err.youtube_link = "YouTube link is required";
    if (!data.youtube_image_alt) err.youtube_image_alt = "Image Alt is required";
    if (!preview.youtube_image && !data.youtube_image)
      err.youtube_image = "Image is required";
    if (data.youtube_sort && isNaN(Number(data.youtube_sort))) {
      err.youtube_sort = "Sort order must be a number";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("youtube_for", data.youtube_for ?? "");
    formData.append("youtube_sort", data.youtube_sort ?? "");
    formData.append("youtube_course", data.youtube_course ?? "");
    formData.append("youtube_language", data.youtube_language ?? "");
    formData.append("youtube_playlist_id", data.youtube_playlist_id ?? "");
    formData.append("youtube_title", data.youtube_title ?? "");
    formData.append("youtube_link", data.youtube_link ?? "");
    formData.append("youtube_image_alt", data.youtube_image_alt ?? "");
    formData.append("youtube_status", data.youtube_status);

    if (data.youtube_image instanceof File) {
      formData.append("youtube_image", data.youtube_image);
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      toast.success("Saved successfully");
      navigate("/lecture-youtube");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong. Please try again.");
    }
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setData((p) => ({ ...p, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((p) => ({ ...p, [fieldName]: url }));
      setErrors((p) => ({ ...p, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setData((p) => ({ ...p, [fieldName]: null }));
    setPreview((p) => ({ ...p, [fieldName]: "" }));
  };

  if (isVideoError) {
    return <ApiErrorPage onRetry={() => navigate("/lecture-youtube")} />;
  }

  const isLoading = isVideoLoading || isYoutubeForLoading;

  return (
    <div className="px-5">
      {isLoading && <LoadingBar />}

      <form onSubmit={handleSubmit}>
        <PageHeader
          icon={Youtube}
          title={isEditMode ? "Edit YouTube Lecture" : "Create YouTube Lecture"}
          description="Fill in the lecture youtube details below"
          rightContent={
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/lecture-youtube")}
              >
                Back
              </Button>
              <Button type="submit" disabled={submitLoading || isLoading}>
                {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main info */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>YouTube For *</Label>
                  <Select
                    value={data.youtube_for}
                    onValueChange={(v) => setData({ ...data, youtube_for: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Page" />
                    </SelectTrigger>
                    <SelectContent>
                      {youtubeForList.map((item) => (
                        <SelectItem key={item.youtubeFor} value={item.youtubeFor}>
                          {item.youtubeFor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.youtube_for && (
                    <p className="text-xs text-red-500 mt-1">{errors.youtube_for}</p>
                  )}
                </div>

                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={data.youtube_sort}
                    onChange={(e) => setData({ ...data, youtube_sort: e.target.value })}
                  />
                  {errors.youtube_sort && (
                    <p className="text-xs text-red-500 mt-1">{errors.youtube_sort}</p>
                  )}
                </div>

                <div>
                  <Label>Course *</Label>
                  <Select
                    value={data.youtube_course}
                    onValueChange={(v) => setData({ ...data, youtube_course: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesOptions.map((item) => (
                        <SelectItem key={item.courses} value={item.courses}>
                          {item.courses}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Playlist *</Label>
                  <Select
                    value={data.youtube_playlist_id}
                    onValueChange={(v) => {
                      const selected = playlistOptions.find((p) => String(p.id) === String(v));
                      setData({
                        ...data,
                        youtube_playlist_id: v,
                        youtube_language: selected ? selected.youtube_playlist_name : "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlistOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.youtube_playlist_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={data.youtube_title}
                  onChange={(e) => setData({ ...data, youtube_title: e.target.value })}
                />
              </div>

              <div>
                <Label>YouTube Link *</Label>
                <Textarea
                  value={data.youtube_link}
                  onChange={(e) => setData({ ...data, youtube_link: e.target.value })}
                  placeholder="Paste YouTube embed URL or watch URL"
                />
                {errors.youtube_link && (
                  <p className="text-xs text-red-500 mt-1">{errors.youtube_link}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media upload */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ImageUpload
                id="youtube_image"
                label="Cover Image"
                selectedFile={data.youtube_image}
                previewImage={preview.youtube_image}
                onFileChange={(e) => handleImageChange("youtube_image", e.target.files?.[0])}
                onRemove={() => handleRemoveImage("youtube_image")}
                error={errors.youtube_image}
                format="WEBP"
                maxSize={5}
                allowedExtensions={["webp"]}
              />

              <div>
                <Label>Image Alt Text *</Label>
                <Input
                  value={data.youtube_image_alt}
                  onChange={(e) => setData({ ...data, youtube_image_alt: e.target.value })}
                />
                {errors.youtube_image_alt && (
                  <p className="text-xs text-red-500 mt-1">{errors.youtube_image_alt}</p>
                )}
              </div>

              {isEditMode && (
                <div>
                  <Label className="mb-2 block">Status</Label>
                  <GroupButton
                    value={data.youtube_status}
                    onChange={(v) => setData({ ...data, youtube_status: v })}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default LectureFormPage;
