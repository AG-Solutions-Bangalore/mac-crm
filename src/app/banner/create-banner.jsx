import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
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
import { useQueryClient } from "@tanstack/react-query";
import { Image, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateBanner = () => {
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
    banner_image: null,
  });

  const [errors, setErrors] = useState({});
  const {
    data: bannerForData,
    loading: bannerForLoading,
    error: bannerForError,
    refetch,
  } = useGetApiMutation({
    url: YOUTUBEFOR_API.list,
    queryKey: ["bannerFor"],
  });
  const [preview, setPreview] = useState({
    banner_image: "",
  });
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

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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

    formDataObj.append("banner_sort", formData.banner_sort);
    formDataObj.append("banner_text", formData.banner_text);
    formDataObj.append("banner_sub_text", formData.banner_sub_text);
    formDataObj.append("banner_for", formData.banner_for);
    formDataObj.append("banner_link", formData.banner_link || "");
    formDataObj.append("banner_image_alt", formData.banner_image_alt);
    if (formData.banner_image instanceof File) {
      formDataObj.append("banner_image", formData.banner_image);
    }
    try {
      const res = await trigger({
        url: BANNER_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("res", res);
      if (res?.code === 201) {
        toast.success(res?.msg || "Banner created successfully");

        setFormData({
          banner_sort: "",
          banner_text: "",
          banner_sub_text: "",
          banner_for: "",
          banner_link: "",
          banner_image_alt: "",
        });
        setErrors({});

        const fileInput = document.getElementById("banner_image");
        if (fileInput) fileInput.value = "";
        queryClient.invalidateQueries(["banner-list"]);

        navigate("/banner-list");
      } else {
        toast.error(res?.msg || "Failed to create banner");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;

      toast.error(errors);
    }
  };

  return (
    <div className="max-w-full mx-auto  ">
      <PageHeader
        icon={Image}
        title="Add New Banner"
        description="Fill in the details below to create a new banner"
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
              form="create-banner-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Banner"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-banner-form"
            onSubmit={handleSubmit}
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

            <div>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBanner;
