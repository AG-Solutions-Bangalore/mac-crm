import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Image, Loader2, Save, ArrowLeft, Wrench, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { getImageBaseUrl } from "@/utils/imageUtils";
import {
  useServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceSubMutation,
} from "../hooks/useService";
import ServiceSubForm from "../components/ServiceSubForm";

const ServiceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    service_name: "",
    service_url: "",
    service_description: "",
    service_other: "",
    service_status: "Active",
    service_logo: null,
  });

  const [preview, setPreview] = useState({
    service_logo: "",
  });

  const [subs, setSubs] = useState([
    {
      id: "",
      service_sub_banner: null,
      service_sub_link: "",
      preview_banner: "",
    },
  ]);

  const [errors, setErrors] = useState({});
  const [initialState, setInitialState] = useState(null);

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError, refetch } = useServiceQuery(id, isEdit);
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();
  const deleteSubMutation = useDeleteServiceSubMutation();

  const isSubmitting = createServiceMutation.isPending || updateServiceMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        service_name: data.service_name || "",
        service_url: data.service_url || "",
        service_description: data.service_description || "",
        service_other: data.service_other || "",
        service_status: data.service_status || "Active",
        service_logo: null,
      });

      const IMAGE_FOR = "Service";
      const baseUrl = getImageBaseUrl(fetchedData?.image_url, IMAGE_FOR);

      if (data.service_logo) {
        setPreview({
          service_logo: `${baseUrl}${data.service_logo}`,
        });
      }

      if (data.subs && Array.isArray(data.subs)) {
        const mappedSubs = data.subs.map((sub) => ({
          id: Number(sub.id),
          service_sub_link: sub.service_sub_link || "",
          service_sub_status: sub.service_sub_status || "Active",
          service_sub_banner: null,
          preview_banner: sub.service_sub_banner
            ? `${baseUrl}${sub.service_sub_banner}`
            : "",
        }));
        setSubs(mappedSubs);
        setInitialState({
          formData: {
            service_name: data.service_name || "",
            service_url: data.service_url || "",
            service_description: data.service_description || "",
            service_other: data.service_other || "",
            service_status: data.service_status || "Active",
          },
          subs: mappedSubs.map((sub) => ({
            id: sub.id,
            service_sub_link: sub.service_sub_link,
            service_sub_status: sub.service_sub_status,
          })),
        });
      }
    }
  }, [isEdit, fetchedData]);

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
        service_sub_link: "",
        service_sub_banner: null,
        preview_banner: "",
      },
    ]);
  };

  const handleRemoveSub = (index) => {
    if (subs.length <= 1) {
      toast.error("At least one sub-service is required");
      return;
    }
    setSubs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubChange = (index, fieldName, value) => {
    setSubs((prev) =>
      prev.map((sub, i) =>
        i === index ? { ...sub, [fieldName]: value } : sub,
      ),
    );
  };

  const handleSubImageChange = (index, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSubs((prev) =>
        prev.map((sub, i) =>
          i === index
            ? { ...sub, service_sub_banner: file, preview_banner: previewUrl }
            : sub,
        ),
      );
    }
  };

  const handleRemoveSubImage = (index) => {
    setSubs((prev) =>
      prev.map((sub, i) =>
        i === index
          ? { ...sub, service_sub_banner: null, preview_banner: "" }
          : sub,
      ),
    );
  };

  const handleDeleteSubApi = async (index, subId) => {
    if (subs.length <= 1) {
      toast.error("At least one sub-service is required");
      return;
    }

    try {
      await deleteSubMutation.mutateAsync(subId);
      toast.success("Sub service deleted successfully");
      setSubs((prev) => prev.filter((_, i) => i !== index));
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete sub service");
    }
  };

  const isDirty = useMemo(() => {
    if (!isEdit) return true;
    if (!initialState) return false;

    if (formData.service_name !== initialState.formData.service_name) return true;
    if (formData.service_url !== initialState.formData.service_url) return true;
    if (formData.service_description !== initialState.formData.service_description) return true;
    if (formData.service_other !== initialState.formData.service_other) return true;
    if (formData.service_status !== initialState.formData.service_status) return true;
    if (formData.service_logo instanceof File) return true;

    if (subs.length !== initialState.subs.length) return true;

    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      const initialSub = initialState.subs[i];
      if (!initialSub) return true;
      if (sub.service_sub_link !== initialSub.service_sub_link) return true;
      if (sub.service_sub_status !== initialSub.service_sub_status) return true;
      if (sub.service_sub_banner instanceof File) return true;
    }

    return false;
  }, [formData, subs, initialState, isEdit]);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.service_name || !formData.service_name.trim()) {
      newErrors.service_name = "Service Name is required";
      isValid = false;
    }

    if (!formData.service_logo && !preview.service_logo) {
      newErrors.service_logo = "Service Logo is required";
      isValid = false;
    }

    const newSubErrors = [];
    subs.forEach((sub) => {
      const subError = {};
      if (!sub.service_sub_banner && !sub.preview_banner) {
        subError.service_sub_banner = "Sub banner is required";
        isValid = false;
      }
      newSubErrors.push(subError);
    });

    setErrors({
      ...newErrors,
      subs: newSubErrors,
    });

    if (!isValid) {
      toast.error("Please fill all required fields");
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();
    formDataObj.append("service_name", formData.service_name);
    formDataObj.append("service_url", formData.service_url);
    formDataObj.append("service_status", formData.service_status);

    if (formData.service_description)
      formDataObj.append("service_description", formData.service_description);
    if (formData.service_other)
      formDataObj.append("service_other", formData.service_other);

    if (formData.service_logo instanceof File) {
      formDataObj.append("service_logo", formData.service_logo);
    }

    subs.forEach((sub, index) => {
      if (sub.id) {
        formDataObj.append(`subs[${index}][id]`, sub.id);
      }
      formDataObj.append(`subs[${index}][service_sub_link]`, sub.service_sub_link || "");
      formDataObj.append(`subs[${index}][service_sub_status]`, sub.service_sub_status || "Active");
      if (sub.service_sub_banner instanceof File) {
        formDataObj.append(`subs[${index}][service_sub_banner]`, sub.service_sub_banner);
      }
    });

    try {
      if (isEdit) {
        await updateServiceMutation.mutateAsync({
          id,
          data: formDataObj,
        });
        toast.success("Service updated successfully");
      } else {
        await createServiceMutation.mutateAsync(formDataObj);
        toast.success("Service created successfully");
      }
      navigate("/service-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save service");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load service details.</p>
        <Button onClick={() => navigate("/service-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-5">
      <PageHeader
        icon={Image}
        title={isEdit ? "Edit Service" : "Add Service"}
        description={isEdit ? "Update the service details below" : "Create a new service configuration"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/service-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Name */}
              <div className="space-y-2">
                <Label className="flex">
                  Service Name <RedStar />
                </Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="service_name"
                    value={formData.service_name}
                    onChange={handleInputChange}
                    className={`${errorBorder("service_name")} pl-10`}
                    placeholder="Enter Service Name"
                  />
                </div>
                {errors.service_name && (
                  <p className="text-red-500 text-sm">{errors.service_name}</p>
                )}
              </div>

              {/* Service URL */}
              <div className="space-y-2">
                <Label className="flex">Service URL</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="service_url"
                    value={formData.service_url}
                    onChange={handleInputChange}
                    className={`${errorBorder("service_url")} pl-10`}
                    placeholder="Enter Service URL"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex">Status</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
                  <Select
                    value={formData.service_status}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "service_status", value },
                      })
                    }
                  >
                    <SelectTrigger className="w-full pl-10 bg-transparent">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Other */}
              <div className="space-y-2">
                <Label className="flex">Service Other</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    name="service_other"
                    value={formData.service_other}
                    onChange={handleInputChange}
                    className="pl-10 pt-2"
                    placeholder="Enter Other details..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Service Description */}
              <div className="space-y-2">
                <Label className="flex">Service Description</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    name="service_description"
                    value={formData.service_description}
                    onChange={handleInputChange}
                    className="pl-10 pt-2"
                    placeholder="Type Your Description Here..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Logo Upload */}
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

            {/* Sub-services list */}
            <ServiceSubForm
              subs={subs}
              isEdit={isEdit}
              handleAddSub={handleAddSub}
              handleRemoveSub={handleRemoveSub}
              handleSubChange={handleSubChange}
              handleSubImageChange={handleSubImageChange}
              handleRemoveSubImage={handleRemoveSubImage}
              handleDeleteSubApi={handleDeleteSubApi}
              errors={errors}
            />

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/service-list")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Service
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

export default ServiceFormPage;
