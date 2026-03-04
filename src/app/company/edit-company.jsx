import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getNoImageUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditCompany = () => {
  const { id } = useParams();
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    student_company_name: "",
    student_company_image_alt: "",
    student_company_status: "Active",
    student_company_image: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    student_company_image: "",
  });
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
  const {
    data: companyData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: COMPANY_API.byId(id),
    queryKey: ["company-edit", id],
  });

  useEffect(() => {
    if (companyData?.data) {
      const data = companyData.data;
      setFormData({
        student_company_name: data.student_company_name || "",
        student_company_image_alt: data.student_company_image_alt || "",
        student_company_status: data.student_company_status || "Active",
      });

      if (data.student_company_image) {
        const IMAGE_FOR = "Student Company";
        const companyBaseUrl = getImageBaseUrl(
          companyData?.image_url,
          IMAGE_FOR
        );
        const noImageUrl = getNoImageUrl(companyData?.image_url);
        const imageUrl = `${companyBaseUrl}${data.student_company_image}`;
        setPreview({
          student_company_image: imageUrl,
        });
      }
    }
  }, [companyData]);

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

    if (!formData.student_company_name.trim()) {
      newErrors.student_company_name = "Company name is required";
      isValid = false;
    }

    if (!formData.student_company_image_alt.trim()) {
      newErrors.student_company_image_alt = "Image alt text is required";
      isValid = false;
    }
    if (!preview.student_company_image && !formData.student_company_image) {
      newErrors.student_company_image = "Company image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const formDataObj = new FormData();

    formDataObj.append("student_company_name", formData.student_company_name);
    formDataObj.append(
      "student_company_image_alt",
      formData.student_company_image_alt
    );
    formDataObj.append(
      "student_company_status",
      formData.student_company_status
    );

    if (formData.student_company_image instanceof File) {
      formDataObj.append(
        "student_company_image",
        formData.student_company_image
      );
    }
    try {
      const res = await trigger({
        url: COMPANY_API.updateById(id),
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200) {
        toast.success(res?.msg || "Company updated successfully");
        queryClient.invalidateQueries(["company-list"]);
        queryClient.invalidateQueries(["company-edit", id]);
        navigate("/company-list");
      } else {
        toast.error(res?.msg || "Failed to update company");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;
      toast.error(errors || "Something went wrong");

      console.error("Company update error:", error);
    }
  };

  if (isLoading) {
    return <LoadingBar />;
  }

  if (isError) {
    return <ApiErrorPage onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Building2}
        title="Edit Company"
        description="Update the details below to edit the company"
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
              form="edit-company-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Company"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            onSubmit={handleSubmit}
            id="edit-company-form"
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <div className="space-y-2">
              <Label
                htmlFor="student_company_name"
                className="text-sm font-medium"
              >
                Company Name *
              </Label>
              <Input
                id="student_company_name"
                name="student_company_name"
                placeholder="Enter company name"
                value={formData.student_company_name}
                onChange={handleInputChange}
                className={errors.student_company_name ? "border-red-500" : ""}
              />
              <div className="flex justify-between">
                {errors.student_company_name && (
                  <p className="text-sm text-red-500">
                    {errors.student_company_name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="student_company_image_alt"
                className="text-sm font-medium"
              >
                Image Alt Text *
              </Label>
              <Textarea
                id="student_company_image_alt"
                name="student_company_image_alt"
                placeholder="Describe the company image for accessibility"
                value={formData.student_company_image_alt}
                onChange={handleInputChange}
                className={
                  errors.student_company_image_alt ? "border-red-500" : ""
                }
              />
              <div className="flex justify-between">
                {errors.student_company_image_alt && (
                  <p className="text-sm text-red-500">
                    {errors.student_company_image_alt}
                  </p>
                )}
              </div>
            </div>
            <div>
              <ImageUpload
                id="student_company_image"
                label="Company Image"
                required
                selectedFile={formData.student_company_image}
                previewImage={preview.student_company_image}
                onFileChange={(e) =>
                  handleImageChange(
                    "student_company_image",
                    e.target.files?.[0]
                  )
                }
                onRemove={() => handleRemoveImage("student_company_image")}
                error={errors.student_company_image}
                format="WEBP"
                allowedExtensions={["webp"]}
                dimensions="150x150"
                maxSize={5}
                requiredDimensions={[150, 150]}
              />
            </div>

            <div className="flex items-center h-full ml-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="student_company_status"
                  className="text-sm font-medium"
                >
                  Status
                </Label>

                <GroupButton
                  value={formData.student_company_status}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      student_company_status: value,
                    })
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

export default EditCompany;
