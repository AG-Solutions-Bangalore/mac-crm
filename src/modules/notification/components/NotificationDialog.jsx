import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GroupButton } from "@/components/group-button";
import ImageUpload from "@/components/image-upload/image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImageBaseUrl } from "@/utils/imageUtils";
import {
  useNotificationQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
} from "../hooks/useNotification";

const initialState = {
  notification_heading: "",
  notification_date: "",
  notification_status: "Active",
  notification_image: null,
};

const NotificationDialog = ({ open, onClose, Id, onSaveSuccess }) => {
  const isEdit = Boolean(Id);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialState);
  const [preview, setPreview] = useState({
    notification_image: "",
  });

  // Queries & Mutations
  const { data: fetchedData, isLoading: isFetching } = useNotificationQuery(Id, open && isEdit);
  const createMutation = useCreateNotificationMutation();
  const updateMutation = useUpdateNotificationMutation();

  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      setPreview({ notification_image: "" });
      setErrors({});
      return;
    }

    if (fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        notification_heading: data.notification_heading || "",
        notification_date: data.notification_date || "",
        notification_status: data.notification_status || "Active",
        notification_image: null,
      });

      const IMAGE_FOR = "Notification";
      const baseUrl = getImageBaseUrl(fetchedData?.image_url, IMAGE_FOR);

      setPreview({
        notification_image: data.notification_image ? `${baseUrl}${data.notification_image}` : "",
      });
    }
  }, [open, Id, fetchedData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = formData.notification_date
      ? new Date(formData.notification_date)
      : null;

    if (!formData.notification_heading) err.notification_heading = "Required";
    if (!formData.notification_date) {
      err.notification_date = "Required";
    } else if (selectedDate && selectedDate < today && !isEdit) {
      err.notification_date = "Date cannot be in the past";
    }
    if (!preview.notification_image) err.notification_image = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formDataObj = new FormData();
    formDataObj.append("notification_heading", formData.notification_heading);
    formDataObj.append("notification_date", formData.notification_date);
    formDataObj.append("notification_status", formData.notification_status);

    if (formData.notification_image instanceof File) {
      formDataObj.append("notification_image", formData.notification_image);
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: Id,
          data: formDataObj,
        });
        toast.success("Notification updated successfully");
      } else {
        await createMutation.mutateAsync(formDataObj);
        toast.success("Notification created successfully");
      }
      onSaveSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    }
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData((p) => ({ ...p, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreview((p) => ({ ...p, [fieldName]: url }));
      setErrors((p) => ({ ...p, [fieldName]: "" }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((p) => ({ ...p, [fieldName]: null }));
    setPreview((p) => ({ ...p, [fieldName]: "" }));
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Notification" : "Create Notification"}
          </DialogTitle>
        </DialogHeader>

        {isEdit && isFetching ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Notification Heading *</Label>
              <Input
                name="notification_heading"
                value={formData.notification_heading}
                onChange={handleChange}
              />
              {errors.notification_heading && (
                <p className="text-sm text-red-500 mt-1">{errors.notification_heading}</p>
              )}
            </div>

            <div>
              <Label>Notification Date*</Label>
              <Input
                type="date"
                name="notification_date"
                value={formData.notification_date}
                onChange={handleChange}
                min={todayStr}
              />
              {errors.notification_date && (
                <p className="text-sm text-red-500 mt-1">{errors.notification_date}</p>
              )}
            </div>

            <div>
              <ImageUpload
                id="notification_image"
                label="Notification Image"
                previewImage={preview.notification_image}
                onFileChange={(e) =>
                  handleImageChange("notification_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("notification_image")}
                error={errors.notification_image}
                format="WEBP"
                maxSize={5}
                allowedExtensions={["webp"]}
              />
            </div>

            {isEdit && (
              <div className="flex flex-col">
                <Label className="mb-2">Status</Label>
                <GroupButton
                  value={formData.notification_status}
                  onChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      notification_status: v,
                    }))
                  }
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || (isEdit && isFetching)}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
