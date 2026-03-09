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
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getImageBaseUrl } from "@/utils/imageUtils";
import LoadingBar from "@/components/loader/loading-bar";

const UpdateService = () => {
  const { id } = useParams();
  const { trigger, loading: isSubmitting } = useApiMutation();
  const { trigger: fetchService, loading: isFetching } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    service_name: "",
    service_description: "",
    service_other: "",
    service_status: "Active",
    service_logo: null,
  });

  const [preview, setPreview] = useState({
    service_logo: "",
  });

  const [subs, setSubs] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    const fetchServiceData = async () => {
      try {
        const res = await fetchService({
          url: SERVICE_API.byId(id),
          method: "get",
        });
        const data = res?.data;
        if (data) {
          setFormData({
            service_name: data.service_name || "",
            service_description: data.service_description || "",
            service_other: data.service_other || "",
            service_status: data.service_status || "Active",
            service_logo: null,
          });

          const IMAGE_FOR = "Service";
          const baseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);

          if (data.service_logo) {
            setPreview({
              service_logo: `${baseUrl}${data.service_logo}`,
            });
          }

          if (data.subs && Array.isArray(data.subs)) {
            const mappedSubs = data.subs.map((sub) => ({
              uid: Date.now() + Math.random(), // local unique id for UI
              id: sub.id, // actual sub_service id
              service_sub_link: sub.service_sub_link || "",
              service_sub_status: sub.service_sub_status || "Active",
              service_sub_banner: null,
              preview_banner: sub.service_sub_banner
                ? `${baseUrl}${sub.service_sub_banner}`
                : "",
            }));
            setSubs(mappedSubs);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch service details");
      }
    };
    fetchServiceData();
  }, [id]);

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
        uid: Date.now() + Math.random(),
        service_sub_link: "",
        service_sub_status: "Active",
        service_sub_banner: null,
        preview_banner: "",
      },
    ]);
  };

  const handleRemoveSub = (uid) => {
    setSubs((prev) => prev.filter((sub) => sub.uid !== uid));
  };

  const handleSubChange = (uid, fieldName, value) => {
    setSubs((prev) =>
      prev.map((sub) =>
        sub.uid === uid ? { ...sub, [fieldName]: value } : sub,
      ),
    );
  };

  const handleSubImageChange = (uid, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSubs((prev) =>
        prev.map((sub) =>
          sub.uid === uid
            ? { ...sub, service_sub_banner: file, preview_banner: previewUrl }
            : sub,
        ),
      );
    }
  };

  const handleRemoveSubImage = (uid) => {
    setSubs((prev) =>
      prev.map((sub) =>
        sub.uid === uid
          ? { ...sub, service_sub_banner: null, preview_banner: "" }
          : sub,
      ),
    );
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.service_name)
      newErrors.service_name = "Service Name is required";
    if (!preview.service_logo && !formData.service_logo)
      newErrors.service_logo = "Service Logo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!validateForm()) return;

  //     const formDataObj = new FormData();
  //     formDataObj.append("service_name", formData.service_name);
  //     if (formData.service_description)
  //       formDataObj.append("service_description", formData.service_description);
  //     if (formData.service_other)
  //       formDataObj.append("service_other", formData.service_other);
  //     formDataObj.append("service_status", formData.service_status);

  //     if (formData.service_logo instanceof File) {
  //       formDataObj.append("service_logo", formData.service_logo);
  //     }

  //     // Append Subs
  //     subs.forEach((sub, index) => {
  //       formDataObj.append(
  //         `subs[${index}][service_sub_link]`,
  //         sub.service_sub_link,
  //       );
  //       formDataObj.append(
  //         `subs[${index}][service_sub_status]`,
  //         sub.service_sub_status || "Active",
  //       );

  //       if (sub.id) {
  //         formDataObj.append(`subs[${index}][id]`, sub.id);
  //       }
  //       if (sub.service_sub_banner instanceof File) {
  //         formDataObj.append(
  //           `subs[${index}][service_sub_banner]`,
  //           sub.service_sub_banner,
  //         );
  //       }
  //     });

  //     try {
  //       const res = await trigger({
  //         url: SERVICE_API.updateById(id),
  //         method: "post",
  //         data: formDataObj,
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });

  //       if (res?.code === 200 || res?.code === 201 || res?.status === true) {
  //         queryClient.invalidateQueries({ queryKey: ["service-list"] });
  //         toast.success(res?.message || "Service updated successfully");
  //         navigate(-1);
  //       } else {
  //         toast.error(res?.message || "Operation failed");
  //       }
  //     } catch (error) {
  //       toast.error(error?.response?.data?.message || "Something went wrong");
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();

    // 1. Standard Fields
    formDataObj.append("service_name", formData.service_name);
    formDataObj.append("service_status", formData.service_status);
    formDataObj.append("_method", "PATCH"); // MUST HAVE for Laravel Multipart Update

    if (formData.service_description)
      formDataObj.append("service_description", formData.service_description);
    if (formData.service_other)
      formDataObj.append("service_other", formData.service_other);

    // 2. Main Logo
    if (formData.service_logo instanceof File) {
      formDataObj.append("service_logo", formData.service_logo);
    }

    // 3. Append Subs Array
    subs.forEach((sub, index) => {
      // If it's an existing sub-service, include the ID
      if (sub.id) {
        formDataObj.append(`subs[${index}][id]`, sub.id);
      }

      formDataObj.append(
        `subs[${index}][service_sub_link]`,
        sub.service_sub_link || "",
      );
      formDataObj.append(
        `subs[${index}][service_sub_status]`,
        sub.service_sub_status || "Active",
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
        url: SERVICE_API.updateById(id),
        method: "POST", // Browser uses POST to send files
        data: formDataObj,
      });

      if (res?.code === 200 || res?.status === true) {
        queryClient.invalidateQueries({ queryKey: ["service-list"] });
        toast.success(res?.message || "Updated successfully");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isFetching) return <LoadingBar />;

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Image}
        title="Edit Service"
        description="Update the service details below"
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="update-service-form"
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

              <div className="space-y-2">
                <Label className="flex">Status</Label>
                <select
                  name="service_status"
                  value={formData.service_status}
                  onChange={handleInputChange}
                  className="w-full border px-3 rounded-md h-10 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                      key={sub.uid}
                      className="p-4 border rounded-md relative bg-gray-50"
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleRemoveSub(sub.uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <p className="font-medium text-sm mb-3 text-gray-700">
                        Sub Service #{index + 1}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Sub Service Link</Label>
                          <Input
                            placeholder="Enter Link (e.g., https://...)"
                            value={sub.service_sub_link}
                            onChange={(e) =>
                              handleSubChange(
                                sub.uid,
                                "service_sub_link",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Sub Service Status</Label>
                          <select
                            value={sub.service_sub_status}
                            onChange={(e) =>
                              handleSubChange(
                                sub.uid,
                                "service_sub_status",
                                e.target.value,
                              )
                            }
                            className="w-full border px-3 rounded-md h-10 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                          <ImageUpload
                            id={`service_sub_banner_${sub.uid}`}
                            label="Sub Service Banner"
                            previewImage={sub.preview_banner}
                            onFileChange={(e) =>
                              handleSubImageChange(sub.uid, e.target.files?.[0])
                            }
                            onRemove={() => handleRemoveSubImage(sub.uid)}
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
                    Updating...
                  </>
                ) : (
                  "Update Service"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateService;
