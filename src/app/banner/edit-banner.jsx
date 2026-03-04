import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BANNER_API, YOUTUBEFOR_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getNoImageUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditBanner = () => {
  const { id } = useParams();
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    banner_sort: "",
    banner_text: "",
    banner_sub_text: "",
    banner_for: "",
    banner_link: "",
    banner_image_alt: "",
    banner_status: "Active",
    banner_image: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    banner_image: "",
  });
  const {
    data: bannerForData,
    loading: bannerForLoading,
    error: bannerForError,
  } = useGetApiMutation({
    url: YOUTUBEFOR_API.list,
    queryKey: ["bannerFor"],
  });
  const {
    data: bannerData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: BANNER_API.byId(id),
    queryKey: ["banner-edit", id],
  });

  useEffect(() => {
    if (bannerData?.data) {
      const data = bannerData.data;
      setFormData({
        banner_sort: data.banner_sort || "",
        banner_text: data.banner_text || "",
        banner_link: data.banner_link || "",
        banner_sub_text: data.banner_sub_text || "",
        banner_for: data.banner_for || "",
        banner_image_alt: data.banner_image_alt || "",
        banner_status: data.banner_status || "Active",
      });

      if (data.banner_image) {
        const IMAGE_FOR = "Banner";
        const bannerBaseUrl = getImageBaseUrl(bannerData?.image_url, IMAGE_FOR);
        const noImageUrl = getNoImageUrl(bannerData?.image_url);
        const imagepath = bannerData?.data?.banner_image
          ? `${bannerBaseUrl}${bannerData?.data?.banner_image}`
          : noImageUrl;
        setPreview({
          banner_image: imagepath,
        });
      }
    }
  }, [bannerData]);

  const getImageBaseUrl = (imageUrlArray, imageFor) => {
    const imageObj = imageUrlArray?.find((img) => img.image_for === imageFor);
    return imageObj?.image_url || "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!String(formData.banner_sort || "").trim()) {
      newErrors.banner_sort = "Sort order is required";
      isValid = false;
    } else if (!/^\d+$/.test(String(formData.banner_sort))) {
      newErrors.banner_sort = "Sort order must be a number";
      isValid = false;
    }

    if (!formData.banner_for.trim()) {
      newErrors.banner_for = "Banner For is required";
      isValid = false;
    }
    if (!formData.banner_image_alt.trim()) {
      newErrors.banner_image_alt = "Alt text is required";
      isValid = false;
    }

    if (!preview.banner_image && !formData.banner_image) {
      newErrors.banner_image = "Banner image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };
  const handleRemoveImage = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("banner_text", formData.banner_text);
    formDataObj.append("banner_sub_text", formData.banner_sub_text);
    formDataObj.append("banner_sort", formData.banner_sort);
    formDataObj.append("banner_for", formData.banner_for);
    formDataObj.append("banner_link", formData.banner_link || "");
    formDataObj.append("banner_image_alt", formData.banner_image_alt);
    formDataObj.append("banner_status", formData.banner_status);

    if (formData.banner_image instanceof File) {
      formDataObj.append("banner_image", formData.banner_image);
    }

    try {
      const res = await trigger({
        url: BANNER_API.updateById(id),
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200) {
        toast.success(res?.msg || "Banner updated successfully");

        queryClient.invalidateQueries(["banner-list"]);
        queryClient.invalidateQueries(["banner-edit", id]);
        navigate("/banner-list");
      } else {
        toast.error(res?.msg || "Failed to update banner");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;
      toast.error(errors || "Something went wrong");

      console.error("Banner update error:", error);
    }
  };

  if (isError || bannerForError) return <ApiErrorPage onRetry={refetch} />;
  return (
    <div className="max-w-full mx-auto">
      {(isLoading || bannerForLoading) && <LoadingBar />}

      <PageHeader
        icon={Image}
        title="Edit Banner"
        description=" Update the details below to edit the banner"
        rightContent={
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              form="edit-banner-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Banner"
              )}
            </Button>
          </div>
        }
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            onSubmit={handleSubmit}
            id="edit-banner-form"
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <div>
              <label className="text-sm font-medium">Banner For *</label>
              <Select
                value={formData.banner_for}
                onValueChange={(v) =>
                  setFormData({ ...formData, banner_for: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Banner For" />
                </SelectTrigger>
                <SelectContent>
                  {bannerForData?.data?.map((item, key) => (
                    <SelectItem key={key} value={item.page_one_url}>
                      {item.page_one_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.banner_for && (
                <p className="text-xs text-red-500 mt-1">{errors.banner_for}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_sort" className="text-sm font-medium">
                Sort Order *
              </Label>
              <Input
                id="banner_sort"
                name="banner_sort"
                type="number"
                min="1"
                placeholder="Enter sort order (e.g., 1, 2, 3)"
                value={formData.banner_sort}
                onChange={handleInputChange}
                className={errors.banner_sort ? "border-red-500" : ""}
              />
              {errors.banner_sort && (
                <p className="text-sm text-red-500">{errors.banner_sort}</p>
              )}
            </div>
            {formData.banner_for == "home" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="banner_text" className="text-sm font-medium">
                    Banner Text
                  </Label>
                  <Textarea
                    id="banner_text"
                    name="banner_text"
                    placeholder="Enter banner text"
                    value={formData.banner_text}
                    onChange={handleInputChange}
                    className={errors.banner_text ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="banner_sub_text"
                    className="text-sm font-medium"
                  >
                    Banner Sub Text
                  </Label>
                  <Textarea
                    id="banner_sub_text"
                    name="banner_sub_text"
                    placeholder="Enter Sub banner text"
                    value={formData.banner_sub_text}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="banner_link" className="text-sm font-medium">
                Banner Link
              </Label>
              <Textarea
                id="banner_link"
                name="banner_link"
                placeholder="https://example.com"
                value={formData.banner_link}
                onChange={handleInputChange}
                className={errors.banner_link ? "border-red-500" : ""}
              />
              {errors.banner_link && (
                <p className="text-sm text-red-500">{errors.banner_link}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_image_alt" className="text-sm font-medium">
                Image Alt Text *
              </Label>
              <Textarea
                id="banner_image_alt"
                name="banner_image_alt"
                placeholder="Describe the image for accessibility"
                value={formData.banner_image_alt}
                onChange={handleInputChange}
                className={errors.banner_image_alt ? "border-red-500" : ""}
              />
              <div className="flex justify-between">
                {errors.banner_image_alt && (
                  <p className="text-sm text-red-500">
                    {errors.banner_image_alt}
                  </p>
                )}
              </div>
            </div>
            <div className="">
              <ImageUpload
                id="banner_image"
                label="Banner Image"
                required
                selectedFile={formData.banner_image}
                previewImage={preview.banner_image}
                onFileChange={(e) =>
                  handleImageChange("banner_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("banner_image")}
                error={errors.banner_image}
                format="WEBP"
                allowedExtensions={["webp"]}
                dimensions="1920x858"
                maxSize={5}
                requiredDimensions={[1920, 858]}
              />
            </div>

            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="banner_status"
                  className="text-sm text-muted-foreground"
                >
                  Status
                </Label>

                <GroupButton
                  className="w-fit"
                  value={formData.banner_status}
                  onChange={(value) =>
                    setFormData({ ...formData, banner_status: value })
                  }
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBanner;
