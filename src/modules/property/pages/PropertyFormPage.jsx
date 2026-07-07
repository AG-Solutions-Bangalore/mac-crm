import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { usePropertyQuery, useCreatePropertyMutation, useUpdatePropertyMutation } from "../hooks/useProperty";

const PropertyFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    property: "",
    property_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // TanStack Query & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = usePropertyQuery(id, isEdit);
  const createPropertyMutation = useCreatePropertyMutation();
  const updatePropertyMutation = useUpdatePropertyMutation();

  const isSubmitting = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const prop = fetchedData.data;
      setFormData({
        property: prop.property || "",
        property_status: prop.property_status || "Active",
      });
    }
  }, [isEdit, fetchedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, property_status: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.property.trim()) {
      newErrors.property = "Property Type/Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updatePropertyMutation.mutateAsync({
          id,
          data: formData,
        });
        toast.success("Property updated successfully");
      } else {
        await createPropertyMutation.mutateAsync(formData);
        toast.success("Property created successfully");
      }
      navigate("/property-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load property details.</p>
        <Button onClick={() => navigate("/property-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-4xl mx-auto">
      <PageHeader
        icon={Building2}
        title={isEdit ? "Edit Property" : "Add Property"}
        description={isEdit ? "Modify configuration details for this property type" : "Define a new property type in the master settings"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/property-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property name */}
              <div className="space-y-2">
                <Label htmlFor="property">
                  Property Type <RedStar />
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    placeholder="e.g. Hotel, Apartment, Villa"
                    className="pl-10"
                  />
                </div>
                {errors.property && <p className="text-xs text-red-500">{errors.property}</p>}
              </div>

              {/* Status (Edit only) */}
              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="property_status">Status</Label>
                  <Select value={formData.property_status} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate("/property-list")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
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

export default PropertyFormPage;
