import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BookOpen,
  Loader2,
  User,
  Mail,
  Phone,
  FormInput,
  GitBranch,
  Locate,
  ArrowLeft,
  Save,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import MemoizedSelect from "@/components/common/memoized-select";
import { toast } from "sonner";
import { useActiveServicesQuery } from "@/modules/service/hooks/useService";
import { useClientQuery, useCreateClientMutation, useUpdateClientMutation } from "../hooks/useClient";

const ClientFormPage = ({ isEdit, isRelation = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const m_id_from_state = location.state?.m_id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    area: "",
    description: "",
    relation: "",
    status: "Active",
    m_id: null,
    r_id: null,
  });

  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedHideServices, setSelectedHideServices] = useState([]);

  // TanStack Queries & Mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useClientQuery(id, isEdit);
  const { data: activeServicesData, isLoading: isActiveServicesLoading } = useActiveServicesQuery();
  const createClientMutation = useCreateClientMutation();
  const updateClientMutation = useUpdateClientMutation();

  const isSubmitting = createClientMutation.isPending || updateClientMutation.isPending;

  const serviceOptions = useMemo(() => {
    return (activeServicesData?.data || []).map((service) => ({
      value: String(service.id),
      label: service.service_name,
    }));
  }, [activeServicesData]);

  useEffect(() => {
    if (isEdit && fetchedData?.data && serviceOptions.length > 0) {
      const data = fetchedData.data;

      const fetchedForm = {
        name: data?.name || "",
        email: data?.email || "",
        mobile: data?.mobile || "",
        whatsapp: data?.whatsapp || "",
        area: data?.area || "",
        description: data?.description || "",
        relation: data?.relation || "",
        status: data?.status || "Active",
        m_id: data?.m_id,
        r_id: data?.r_id,
      };

      setFormData(fetchedForm);

      let fetchedServices = [];
      if (data?.services) {
        const servicesArray = data.services.split(",");
        fetchedServices = servicesArray.map((s) => ({
          value: s,
          label:
            serviceOptions.find((opt) => opt.value === s)?.label ||
            `Service ${s}`,
        }));
        setSelectedServices(fetchedServices);
      }

      let fetchedHideServices = [];
      if (data?.hide_services) {
        const hideArray = data.hide_services.split(",");
        fetchedHideServices = hideArray.map((s) => ({
          value: s,
          label:
            serviceOptions.find((opt) => opt.value === s)?.label ||
            `Service ${s}`,
        }));
        setSelectedHideServices(fetchedHideServices);
      }

      setInitialData({
        ...fetchedForm,
        services: fetchedServices,
        hide_services: fetchedHideServices,
      });
    }
  }, [isEdit, fetchedData, serviceOptions]);

  const isFormUnchanged = () => {
    if (!isEdit || !initialData) return false;

    const isBaseChanged = Object.keys(formData).some(
      (key) => formData[key] !== initialData[key],
    );

    const isServicesChanged =
      JSON.stringify(selectedServices) !== JSON.stringify(initialData.services);
    const isHideServicesChanged =
      JSON.stringify(selectedHideServices) !==
      JSON.stringify(initialData.hide_services);

    return !isBaseChanged && !isServicesChanged && !isHideServicesChanged;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "name") updatedValue = value.replace(/[^a-zA-Z\s]/g, "");
    if (name === "mobile" || name === "whatsapp")
      updatedValue = value.replace(/\D/g, "").slice(0, 10);

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleStatusSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.mobile || formData.mobile.length !== 10)
      newErrors.mobile = "10 digit mobile required";
    if (selectedServices.length === 0)
      newErrors.services = "Select at least one service";

    const showRelation =
      isRelation || (formData.m_id !== formData.r_id && formData.m_id !== null);
    if (showRelation && !formData.relation)
      newErrors.relation = "Relation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataObj.append(key, value);
    });

    if (isRelation && m_id_from_state) {
      formDataObj.append("r_id", m_id_from_state);
    }

    formDataObj.append(
      "services",
      selectedServices.map((s) => s.value).join(","),
    );
    formDataObj.append(
      "hide_services",
      selectedHideServices.map((s) => s.value).join(","),
    );

    try {
      if (isEdit) {
        await updateClientMutation.mutateAsync({
          id,
          data: formDataObj,
        });
        toast.success("Client updated successfully");
      } else {
        await createClientMutation.mutateAsync(formDataObj);
        toast.success("Client created successfully");
      }
      navigate("/client-list");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save client");
    }
  };

  const errorBorder = (field) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load client details.</p>
        <Button onClick={() => navigate("/client-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-5">
      <PageHeader
        icon={User}
        title={isEdit ? "Edit Client" : "Add New Client"}
        description={isEdit ? "Update client details below" : "Register a new client profile"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/client-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Name <RedStar />
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${errorBorder("name")} pl-10`}
                    placeholder="Enter Name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Email <RedStar />
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${errorBorder("email")} pl-10`}
                    placeholder="Enter Email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Mobile <RedStar />
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`${errorBorder("mobile")} pl-10`}
                    placeholder="Enter Mobile"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              {/* Whatsapp */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Whatsapp
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter Whatsapp"
                  />
                </div>
              </div>

              {/* Services select */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Services <RedStar />
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
                  <MemoizedSelect
                    isMulti
                    options={serviceOptions.filter(
                      (service) =>
                        !selectedHideServices?.some(
                          (hidden) => hidden.value === service.value,
                        ),
                    )}
                    value={selectedServices}
                    onChange={setSelectedServices}
                    hasIcon={true}
                  />
                </div>
                {errors.services && (
                  <p className="text-red-500 text-sm">{errors.services}</p>
                )}
              </div>

              {/* Hide Services select */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Hide Services
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
                  <MemoizedSelect
                    isMulti
                    options={serviceOptions.filter(
                      (service) =>
                        !selectedServices?.some(
                          (selected) => selected.value === service.value,
                        ),
                    )}
                    value={selectedHideServices}
                    onChange={setSelectedHideServices}
                    hasIcon={true}
                  />
                </div>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Area
                </Label>
                <div className="relative">
                  <Locate className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter Area"
                  />
                </div>
              </div>

              {/* Relation (if relation or child/sub profile) */}
              {(isRelation ||
                (formData.m_id !== formData.r_id &&
                  formData.m_id !== null)) ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Relation <RedStar />
                  </Label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      name="relation"
                      value={formData.relation}
                      onChange={handleInputChange}
                      className={`${errorBorder("relation")} pl-10`}
                      placeholder="Enter Relation"
                    />
                  </div>
                  {errors.relation && (
                    <p className="text-red-500 text-sm">{errors.relation}</p>
                  )}
                </div>
              ) : (
                /* Empty div placeholder to keep grid aligned */
                <div className="hidden md:block"></div>
              )}

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-1">
                  Description
                </Label>
                <div className="relative">
                  <FormInput className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="pl-10 pt-2"
                    placeholder="Type Your Description Here..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-1">
                  Status
                </Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
                  <Select value={formData.status} onValueChange={handleStatusSelectChange}>
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

            <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/client-list")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (isEdit && isFormUnchanged())}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Client
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

export default ClientFormPage;
