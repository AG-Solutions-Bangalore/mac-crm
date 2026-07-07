import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layers, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useFloorQuery, useCreateFloorMutation, useUpdateFloorMutation } from "../hooks/useFloor";

const FloorFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    property_floor: "",
    property_floor_status: "Active",
  });

  const [errors, setErrors] = useState({});

  // TanStack Query & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useFloorQuery(id, isEdit);
  const createFloorMutation = useCreateFloorMutation();
  const updateFloorMutation = useUpdateFloorMutation();

  const isSubmitting = createFloorMutation.isPending || updateFloorMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const flr = fetchedData.data;
      setFormData({
        property_floor: flr.property_floor || "",
        property_floor_status: flr.property_floor_status || "Active",
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
    setFormData((prev) => ({ ...prev, property_floor_status: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.property_floor.trim()) {
      newErrors.property_floor = "Floor Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateFloorMutation.mutateAsync({
          id,
          data: formData,
        });
        toast.success("Floor updated successfully");
      } else {
        await createFloorMutation.mutateAsync(formData);
        toast.success("Floor created successfully");
      }
      navigate("/floor-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load floor details.</p>
        <Button onClick={() => navigate("/floor-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-4xl mx-auto">
      <PageHeader
        icon={Layers}
        title={isEdit ? "Edit Floor" : "Add Floor"}
        description={isEdit ? "Modify level details for this floor" : "Define a new floor level in the master settings"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/floor-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Floor name */}
              <div className="space-y-2">
                <Label htmlFor="property_floor">
                  Floor Name <RedStar />
                </Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="property_floor"
                    name="property_floor"
                    value={formData.property_floor}
                    onChange={handleChange}
                    placeholder="e.g. Ground Floor, First Floor"
                    className="pl-10"
                  />
                </div>
                {errors.property_floor && <p className="text-xs text-red-500">{errors.property_floor}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="property_floor_status">Status</Label>
                <Select value={formData.property_floor_status} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full bg-transparent">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate("/floor-list")} disabled={isSubmitting}>
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

export default FloorFormPage;
