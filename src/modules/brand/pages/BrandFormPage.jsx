import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useBrandQuery, useCreateBrandMutation, useUpdateBrandMutation } from "../hooks/useBrand";

const BrandFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand_name: "",
    brand_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useBrandQuery(id, isEdit);
  const createBrandMutation = useCreateBrandMutation();
  const updateBrandMutation = useUpdateBrandMutation();

  const isSubmitting = createBrandMutation.isPending || updateBrandMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        brand_name: data.brand_name || "",
        brand_status: data.brand_status || "Active",
      });
    }
  }, [isEdit, fetchedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.brand_name || !formData.brand_name.trim()) {
      newErrors.brand_name = "Brand Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateBrandMutation.mutateAsync({
          id,
          name: formData.brand_name,
          status: formData.brand_status,
        });
        toast.success("Brand updated successfully");
      } else {
        await createBrandMutation.mutateAsync(formData.brand_name);
        toast.success("Brand created successfully");
      }
      navigate("/brand-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save brand");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load brand details.</p>
        <Button onClick={() => navigate("/brand-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-5">
      <PageHeader
        icon={Tag}
        title={isEdit ? "Edit Brand" : "Add Brand"}
        description={isEdit ? "Update the brand details below" : "Configure a new brand master"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/brand-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4 max-w-2xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-4">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label className="flex">
                  Brand Name <RedStar />
                </Label>
                <Input
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  className={errorBorder("brand_name")}
                  placeholder="Enter Brand Name (e.g. MAK, Philips)"
                />
                {errors.brand_name && (
                  <p className="text-red-500 text-sm">{errors.brand_name}</p>
                )}
              </div>

              {/* Status (Edit only) */}
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    name="brand_status"
                    value={formData.brand_status}
                    onChange={handleInputChange}
                    className="w-full border rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/brand-list")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Brand
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

export default BrandFormPage;
