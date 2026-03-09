import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/image-upload/image-upload";
import RedStar from "@/components/RedStar";
import { SERVICE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CreateService = () => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_name: "",
    service_description: "",
    service_other: "",
    service_logo: null,
  });

  const [preview, setPreview] = useState({
    service_logo: "",
  });

  const [subs, setSubs] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [fieldName]: url }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleAddSub = () => {
    setSubs((prev) => [
      ...prev,
      {
        id: Date.now(),
        service_sub_link: "",
        service_sub_banner: null,
        preview_banner: "",
      },
    ]);
  };

  const handleRemoveSub = (id) => {
    setSubs((prev) => prev.filter((sub) => sub.id !== id));
  };

  const handleSubChange = (id, fieldName, value) => {
    setSubs((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, [fieldName]: value } : sub)),
    );
  };

  const handleSubImageChange = (id, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSubs((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? { ...sub, service_sub_banner: file, preview_banner: previewUrl }
            : sub,
        ),
      );
    }
  };

  const handleRemoveSubImage = (id) => {
    setSubs((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, service_sub_banner: null, preview_banner: "" }
          : sub,
      ),
    );
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.service_name)
      newErrors.service_name = "Service Name is required";
    if (!formData.service_logo)
      newErrors.service_logo = "Service Logo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();
    formDataObj.append("service_name", formData.service_name);
    if (formData.service_description)
      formDataObj.append("service_description", formData.service_description);
    if (formData.service_other)
      formDataObj.append("service_other", formData.service_other);

    if (formData.service_logo instanceof File) {
      formDataObj.append("service_logo", formData.service_logo);
    }

    // Append Subs
    subs.forEach((sub, index) => {
      formDataObj.append(
        `subs[${index}][service_sub_link]`,
        sub.service_sub_link,
      );
      if (sub.service_sub_banner instanceof File) {
        formDataObj.append(
          `subs[${index}][service_sub_banner]`,
          sub.service_sub_banner,
        );
      }
    });

    try {
      const res = await trigger({
        url: SERVICE_API.create,
        method: "post",
        data: formDataObj,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === true) {
        queryClient.invalidateQueries({ queryKey: ["service-list"] });
        toast.success(
          res?.msg || res?.message || "Service created successfully",
        );
        navigate(-1);
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Image}
        title="Add New Service"
        description="Fill in the service details below"
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-service-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex">
                  Service Name <RedStar />
                </Label>
                <Input
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className={errorBorder("service_name")}
                  placeholder="Enter Service Name"
                />
                {errors.service_name && (
                  <p className="text-red-500 text-sm">{errors.service_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex">Service Other</Label>
                <Input
                  name="service_other"
                  value={formData.service_other}
                  onChange={handleInputChange}
                  placeholder="Enter Other details"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex">Service Description</Label>
                <Textarea
                  name="service_description"
                  value={formData.service_description}
                  onChange={handleInputChange}
                  placeholder="Type Your Description Here..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <ImageUpload
                  id="service_logo"
                  label="Service Logo *"
                  previewImage={preview.service_logo}
                  onFileChange={(e) =>
                    handleImageChange("service_logo", e.target.files?.[0])
                  }
                  onRemove={() => handleRemoveImage("service_logo")}
                  error={errors.service_logo}
                  format="WEBP"
                  maxSize={5}
                  allowedExtensions={["webp", "png", "jpg", "jpeg"]}
                />
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Sub Services</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSub}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Sub Service
                </Button>
              </div>

              {subs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No sub services added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {subs.map((sub, index) => (
                    <div
                      key={sub.id}
                      className="p-4 border rounded-md relative bg-gray-50"
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleRemoveSub(sub.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <p className="font-medium text-sm mb-3 text-gray-700">
                        Sub Service #{index + 1}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sub Service Link</Label>
                          <Input
                            placeholder="Enter Link (e.g., https://...)"
                            value={sub.service_sub_link}
                            onChange={(e) =>
                              handleSubChange(
                                sub.id,
                                "service_sub_link",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <ImageUpload
                            id={`service_sub_banner_${sub.id}`}
                            label="Sub Service Banner"
                            previewImage={sub.preview_banner}
                            onFileChange={(e) =>
                              handleSubImageChange(sub.id, e.target.files?.[0])
                            }
                            onRemove={() => handleRemoveSubImage(sub.id)}
                            format="WEBP"
                            maxSize={5}
                            allowedExtensions={["webp", "png", "jpg", "jpeg"]}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Service"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;
