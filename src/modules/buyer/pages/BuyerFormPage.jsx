import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Mail, Phone, Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import { useBuyerQuery, useCreateBuyerMutation, useUpdateBuyerMutation } from "../hooks/useBuyer";

const BuyerFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_mobile: "",
    buyer_email: "",
    buyer_address: "",
  });

  const [errors, setErrors] = useState({});

  // TanStack Query & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useBuyerQuery(id, isEdit);
  const createBuyerMutation = useCreateBuyerMutation();
  const updateBuyerMutation = useUpdateBuyerMutation();

  const isSubmitting = createBuyerMutation.isPending || updateBuyerMutation.isPending;

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const buyer = fetchedData.data;
      setFormData({
        buyer_name: buyer.buyer_name || "",
        buyer_mobile: buyer.buyer_mobile || "",
        buyer_email: buyer.buyer_email || "",
        buyer_address: buyer.buyer_address || "",
        buyer_status: buyer.buyer_status || "Active",
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
    setFormData((prev) => ({ ...prev, buyer_status: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.buyer_name.trim()) newErrors.buyer_name = "Buyer Name is required";
    if (formData.buyer_mobile.trim() && !/^\d{10}$/.test(formData.buyer_mobile.trim())) {
      newErrors.buyer_mobile = "Mobile must be a 10-digit number";
    }
    if (!formData.buyer_email.trim()) {
      newErrors.buyer_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.buyer_email.trim())) {
      newErrors.buyer_email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateBuyerMutation.mutateAsync({
          id,
          data: formData,
        });
        toast.success("Buyer updated successfully");
      } else {
        await createBuyerMutation.mutateAsync(formData);
        toast.success("Buyer created successfully");
      }
      navigate("/buyer-list");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load buyer details.</p>
        <Button onClick={() => navigate("/buyer-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-4xl mx-auto">
      <PageHeader
        icon={User}
        title={isEdit ? "Edit Buyer" : "Add Buyer"}
        description={isEdit ? "Update details of an existing buyer" : "Register a new buyer in the system"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/buyer-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="buyer_name">
                  Buyer Name <RedStar />
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="buyer_name"
                    name="buyer_name"
                    value={formData.buyer_name}
                    onChange={handleChange}
                    placeholder="Enter buyer name"
                    className="pl-10"
                  />
                </div>
                {errors.buyer_name && <p className="text-xs text-red-500">{errors.buyer_name}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="buyer_mobile">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="buyer_mobile"
                    name="buyer_mobile"
                    type="tel"
                    value={formData.buyer_mobile}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile"
                    className="pl-10"
                  />
                </div>
                {errors.buyer_mobile && <p className="text-xs text-red-500">{errors.buyer_mobile}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="buyer_email">
                  Email Address <RedStar />
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="buyer_email"
                    name="buyer_email"
                    type="email"
                    value={formData.buyer_email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
                {errors.buyer_email && <p className="text-xs text-red-500">{errors.buyer_email}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="buyer_address">Address</Label>
                <Textarea
                  id="buyer_address"
                  name="buyer_address"
                  value={formData.buyer_address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="buyer_status">Status</Label>
                  <Select value={formData.buyer_status} onValueChange={handleSelectChange}>
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
              <Button type="button" variant="outline" onClick={() => navigate("/buyer-list")} disabled={isSubmitting}>
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

export default BuyerFormPage;
