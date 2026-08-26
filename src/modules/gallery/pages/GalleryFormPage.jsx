import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import {
  useCreateGalleryMutation,
  useGalleryQuery,
  useUpdateGalleryMutation,
} from "../hooks/useGallery";

const GalleryFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [galleryStatus, setGalleryStatus] = useState("Active");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [errors, setErrors] = useState({});

  // queries / mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useGalleryQuery(id, isEdit);
  const createMutation = useCreateGalleryMutation();
  const updateMutation = useUpdateGalleryMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // hydrate on edit
  useEffect(() => {
    if (!isEdit || !fetchedData?.data) return;
    const item = fetchedData.data;
    const IMAGE_FOR = "Gallery";
    const baseUrl = getImageBaseUrl(fetchedData?.image_url, IMAGE_FOR);
    const noImg = getNoImageUrl(fetchedData?.image_url);

    setGalleryStatus(item.gallery_status || "Active");

    if (item.gallery_image && baseUrl) {
      const fullUrl = `${baseUrl}${item.gallery_image}?t=${Date.now()}`;
      setExistingImage(item.gallery_image);
      setPreviewImage(fullUrl);
    } else {
      setPreviewImage(noImg);
    }
  }, [isEdit, fetchedData]);

  /* ---------- handlers ---------- */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, gallery_image: "" }));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(existingImage ? previewImage : "");
    setErrors((prev) => ({ ...prev, gallery_image: "" }));
  };

  /* ---------- validation ---------- */

  const validateForm = () => {
    const newErrors = {};
    if (!isEdit && !selectedFile) {
      newErrors.gallery_image = "Image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const fd = new FormData();
    fd.append("gallery_status", galleryStatus);

    if (selectedFile) {
      fd.append("gallery_image", selectedFile);
    } else if (isEdit && existingImage) {
      // keep existing image on backend if no new file is provided
      fd.append("existing_gallery_image", existingImage);
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: fd });
        toast.success("Gallery updated successfully");
      } else {
        await createMutation.mutateAsync(fd);
        toast.success("Gallery created successfully");
      }
      navigate("/gallery-list");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          "Something went wrong",
      );
    }
  };

  /* ---------- loading / error states ---------- */

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load gallery details.</p>
        <Button onClick={() => navigate("/gallery-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  /* ---------- view ---------- */

  return (
    <div className="w-full px-5">
      <PageHeader
        icon={ImageIcon}
        title={isEdit ? "Edit Gallery" : "Add Gallery"}
        description={
          isEdit
            ? "Update an existing gallery image"
            : "Upload a new image to the gallery"
        }
        rightContent={
          <Button variant="outline" onClick={() => navigate("/gallery-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="space-y-2">
                <ImageUpload
                  id="gallery_image"
                  label="Gallery Image"
                  required={!isEdit}
                  selectedFile={selectedFile}
                  previewImage={previewImage}
                  onFileChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  format="WEBP"
                  allowedExtensions={["webp"]}
                  maxSize={5}
                />
                {errors.gallery_image && (
                  <p className="text-xs text-red-500">{errors.gallery_image}</p>
                )}
              </div>

              {/* Status */}
              {isEdit && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <GroupButton
                    className="w-fit"
                    value={galleryStatus}
                    onChange={setGalleryStatus}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/gallery-list")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />{" "}
                    {isEdit ? "Update Gallery" : "Save Gallery"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryFormPage;
