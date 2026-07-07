import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/common/page-header";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useProductQuery, useCreateProductMutation, useUpdateProductMutation } from "../hooks/useProduct";
import { useActiveServicesQuery } from "../../service/hooks/useService";
import { useActiveCategoriesQuery } from "../../category/hooks/useCategory";
import { useActiveBrandsQuery } from "../../brand/hooks/useBrand";
import MemoizedSelect from "@/components/common/memoized-select";

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    service_id: "",
    category_id: "",
    brand_id: "",
    product_module: "",
    product_name: "",
    product_warranty: "",
    product_price: "",
    product_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // Active Masters Queries
  const { data: servicesData, isLoading: servicesLoading } = useActiveServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useActiveCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useActiveBrandsQuery();

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useProductQuery(id, isEdit);
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        service_id: data.service_id?.toString() || "",
        category_id: data.category_id?.toString() || "",
        brand_id: data.brand_id?.toString() || "",
        product_module: data.product_module || "",
        product_name: data.product_name || "",
        product_warranty: data.product_warranty || "",
        product_price: data.product_price?.toString() || "",
        product_status: data.product_status || "Active",
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
    if (formData.product_price && (isNaN(formData.product_price) || Number(formData.product_price) <= 0)) {
      newErrors.product_price = "Price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateProductMutation.mutateAsync({
          id,
          data: formData,
        });
        toast.success("Product updated successfully");
      } else {
        await createProductMutation.mutateAsync(formData);
        toast.success("Product created successfully");
      }
      navigate("/product-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save product");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  const activeServices = servicesData?.data || [];
  const activeCategories = categoriesData?.data || [];
  const activeBrands = brandsData?.data || [];

  if ((isEdit && isFetching) || servicesLoading || categoriesLoading || brandsLoading) {
    return <LoadingBar />;
  }

  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load product details.</p>
        <Button onClick={() => navigate("/product-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-5">
      <PageHeader
        icon={Package}
        title={isEdit ? "Edit Product" : "Add Product"}
        description={isEdit ? "Update the product details below" : "Configure a new product master"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/product-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4 max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Service Select */}
              <div className="space-y-2">
                <Label>Service</Label>
                <MemoizedSelect
                  options={activeServices.map((service) => ({
                    value: service.id?.toString(),
                    label: service.service_name,
                  }))}
                  value={formData.service_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      service_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, service_id: "" }));
                  }}
                  placeholder="Select Service"
                  hasError={Boolean(errors.service_id)}
                />
                {errors.service_id && (
                  <p className="text-red-500 text-xs">{errors.service_id}</p>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <Label>Category</Label>
                <MemoizedSelect
                  options={activeCategories.map((category) => ({
                    value: category.id?.toString(),
                    label: category.category_name,
                  }))}
                  value={formData.category_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      category_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, category_id: "" }));
                  }}
                  placeholder="Select Category"
                  hasError={Boolean(errors.category_id)}
                />
                {errors.category_id && (
                  <p className="text-red-500 text-xs">{errors.category_id}</p>
                )}
              </div>

              {/* Brand Select */}
              <div className="space-y-2">
                <Label>Brand</Label>
                <MemoizedSelect
                  options={activeBrands.map((brand) => ({
                    value: brand.id?.toString(),
                    label: brand.brand_name,
                  }))}
                  value={formData.brand_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      brand_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, brand_id: "" }));
                  }}
                  placeholder="Select Brand"
                  hasError={Boolean(errors.brand_id)}
                />
                {errors.brand_id && (
                  <p className="text-red-500 text-xs">{errors.brand_id}</p>
                )}
              </div>

              {/* Product Module */}
              <div className="space-y-2">
                <Label>Product Module</Label>
                <Input
                  name="product_module"
                  value={formData.product_module}
                  onChange={handleInputChange}
                  className={errorBorder("product_module")}
                  placeholder="Enter Product Module (e.g. 4M)"
                />
                {errors.product_module && (
                  <p className="text-red-500 text-xs">{errors.product_module}</p>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2 md:col-span-2">
                <Label>Product Name</Label>
                <Input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className={errorBorder("product_name")}
                  placeholder="Enter Product Name (e.g. 4M - 8 Control)"
                />
                {errors.product_name && (
                  <p className="text-red-500 text-xs">{errors.product_name}</p>
                )}
              </div>

              {/* Product Warranty */}
              <div className="space-y-2">
                <Label>Warranty (In Years)</Label>
                <Input
                  name="product_warranty"
                  type="number"
                  value={formData.product_warranty}
                  onChange={handleInputChange}
                  className={errorBorder("product_warranty")}
                  placeholder="Enter Warranty in years"
                />
                {errors.product_warranty && (
                  <p className="text-red-500 text-xs">{errors.product_warranty}</p>
                )}
              </div>

              {/* Product Price */}
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  name="product_price"
                  type="number"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  className={errorBorder("product_price")}
                  placeholder="Enter Product Price (e.g. 14200)"
                />
                {errors.product_price && (
                  <p className="text-red-500 text-xs">{errors.product_price}</p>
                )}
              </div>

              {/* Status (Edit only) */}
              {isEdit && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Status</Label>
                  <select
                    name="product_status"
                    value={formData.product_status}
                    onChange={handleInputChange}
                    className="w-full border rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
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
                onClick={() => navigate("/product-list")}
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
                    <Save className="w-4 h-4 mr-2" /> Save Product
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

export default ProductFormPage;
