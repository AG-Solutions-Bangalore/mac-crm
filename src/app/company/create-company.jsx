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
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getImageBaseUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const initialState = {
  student_company_name: "",
  student_company_image_alt: "",
  student_company_status: "Active",
  student_company_image: null,
};
const CompanyDialog = ({ open, onClose, companyId }) => {
  const isEdit = Boolean(companyId);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialState);
  const { trigger: fetchCompany } = useApiMutation();
  const { trigger, loading } = useApiMutation();

  const [preview, setPreview] = useState({
    student_company_image: "",
  });

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      setErrors({});
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetchCompany({
          url: COMPANY_API.byId(companyId),
        });
        const data = res.data;
        setFormData({
          student_company_name: data.student_company_name,
          student_company_image_alt: data.student_company_image_alt,
          student_company_status: data.student_company_status,
          student_company_image: null,
        });
        const IMAGE_FOR = "Student Company";
        const baseUrl = getImageBaseUrl(res?.image_url, IMAGE_FOR);

        setPreview({
          student_company_image: `${baseUrl}${data.student_company_image}`,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load country data");
      }
    };
    fetchData();
  }, [open, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.student_company_name) err.student_company_name = "Required";
    if (!formData.student_company_image_alt)
      err.student_company_image_alt = "Required";
    if (!preview.student_company_image) err.student_company_image = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
        url: isEdit ? COMPANY_API.updateById(companyId) : COMPANY_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res.msg);
        queryClient.invalidateQueries(["company-list"]);
        queryClient.invalidateQueries(["companies-dropdown"]);
        onClose();
      } else {
        toast.error(res?.msg || "Failed");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;
      toast.error(errors || "Something went wrong");
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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Company" : "Create Company"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1  gap-4">
          <div>
            <Label>Company Name *</Label>
            <Input
              name="student_company_name"
              value={formData.student_company_name}
              onChange={handleChange}
            />
            <div className="flex justify-between">
              {errors.student_company_name && (
                <p className="text-sm text-red-500">
                  {errors.student_company_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Image Alt *</Label>
            <Textarea
              name="student_company_image_alt"
              value={formData.student_company_image_alt}
              onChange={handleChange}
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
              previewImage={preview.student_company_image}
              onFileChange={(e) =>
                handleImageChange("student_company_image", e.target.files?.[0])
              }
              onRemove={() => handleRemoveImage("student_company_image")}
              error={errors.student_company_image}
              format="WEBP"
              maxSize={5}
              allowedExtensions={["webp"]}
              requiredDimensions={[150, 150]}
            />
          </div>
          {isEdit && (
            <div>
              <Label>Status</Label>
              <GroupButton
                value={formData.student_company_status}
                onChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    student_company_status: v,
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

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDialog;
