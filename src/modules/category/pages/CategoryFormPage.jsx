import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListFilter, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useCategoryQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from "../hooks/useCategory";

const CategoryFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_name: "",
    category_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useCategoryQuery(id, isEdit);
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        category_name: data.category_name || "",
        category_status: data.category_status || "Active",
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
    if (!formData.category_name || !formData.category_name.trim()) {
      newErrors.category_name = "Category Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateCategoryMutation.mutateAsync({
          id,
          name: formData.category_name,
          status: formData.category_status,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategoryMutation.mutateAsync(formData.category_name);
        toast.success("Category created successfully");
      }
      navigate("/category-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save category");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load category details.</p>
        <Button onClick={() => navigate("/category-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-5">
      <PageHeader
        icon={ListFilter}
        title={isEdit ? "Edit Category" : "Add Category"}
        description={isEdit ? "Update the category details below" : "Configure a new category master"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/category-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4 max-w-2xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-4">
              {/* Category Name */}
              <div className="space-y-2">
                <Label className="flex">
                  Category Name <RedStar />
                </Label>
                <Input
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleInputChange}
                  className={errorBorder("category_name")}
                  placeholder="Enter Category Name (e.g. Frame, Frameless)"
                />
                {errors.category_name && (
                  <p className="text-red-500 text-sm">{errors.category_name}</p>
                )}
              </div>

              {/* Status (Edit only) */}
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    name="category_status"
                    value={formData.category_status}
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
                onClick={() => navigate("/category-list")}
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
                    <Save className="w-4 h-4 mr-2" /> Save Category
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

export default CategoryFormPage;
