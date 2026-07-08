import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Map, Loader2, Save, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useAreaQuery, useCreateAreaMutation, useUpdateAreaMutation } from "../hooks/useArea";

const AreaFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    property_area: "",
    property_area_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useAreaQuery(id, isEdit);
  const createAreaMutation = useCreateAreaMutation();
  const updateAreaMutation = useUpdateAreaMutation();

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      setFormData({
        property_area: data.property_area || "",
        property_area_status: data.property_area_status || "Active",
      });
    }
  }, [isEdit, fetchedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, property_area_status: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.property_area || !formData.property_area.trim()) {
      newErrors.property_area = "Property Area is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateAreaMutation.mutateAsync({
          id,
          name: formData.property_area,
          status: formData.property_area_status,
        });
        toast.success("Area updated successfully");
      } else {
        await createAreaMutation.mutateAsync(formData);
        toast.success("Area created successfully");
      }
      navigate("/area-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save area");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load area details.</p>
        <Button onClick={() => navigate("/area-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-5">
      <PageHeader
        icon={Map}
        title={isEdit ? "Edit Area" : "Add Area"}
        description={isEdit ? "Update the area details below" : "Configure a new property area master"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/area-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Area Name */}
              <div className="space-y-2">
                <Label htmlFor="property_area" className="flex items-center gap-1">
                  Property Area <RedStar />
                </Label>
                <div className="relative">
                  <Map className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="property_area"
                    name="property_area"
                    value={formData.property_area}
                    onChange={handleInputChange}
                    className={`${errorBorder("property_area")} pl-10`}
                    placeholder="Enter Area (e.g. Foyer, Kitchen, Common)"
                  />
                </div>
                {errors.property_area && (
                  <p className="text-red-500 text-sm">{errors.property_area}</p>
                )}
              </div>

              {/* Status */}
              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="property_area_status" className="flex items-center gap-1">Status</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
                    <Select value={formData.property_area_status} onValueChange={handleSelectChange}>
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
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/area-list")}
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
                    <Save className="w-4 h-4 mr-2" /> Save Area
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

export default AreaFormPage;
