import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Loader2, Save, ArrowLeft, Plus, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import LoadingBar from "@/components/loader/loading-bar";
import { toast } from "sonner";
import {
  useQuotationQuery,
  useRevQuotationQuery,
  useCreateRevQuotationMutation,
  useUpdateRevQuotationMutation,
  useGetProductsForQuotationQuery,
  useDeleteRevQuotationSubMutation,
} from "../hooks/useQuotation";
import { useActiveBuyersQuery } from "../../buyer/hooks/useBuyer";
import { useActivePropertiesQuery } from "../../property/hooks/useProperty";
import { useActiveServicesQuery } from "../../service/hooks/useService";
import { useActiveCategoriesQuery } from "../../category/hooks/useCategory";
import { useActiveFloorsQuery } from "../../floor/hooks/useFloor";
import { useActiveAreasQuery } from "../../area/hooks/useArea";
import MemoizedSelect from "@/components/common/memoized-select";
import ConfirmDialog from "@/components/common/confirm-dialog";

// Helper: Group flat subs to nested Services structure (Service -> Floor -> Area -> Product)
const groupSubsToServices = (subsList) => {
  if (!subsList || subsList.length === 0) {
    return [
      {
        serviceId: "",
        floors: [
          {
            floorId: "",
            areas: [
              {
                areaId: "",
                products: [
                  {
                    id: null,
                    productId: "",
                    price: 0,
                    quantity: 1,
                    status: "Pending",
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  }

  const serviceMap = {};
  subsList.forEach((item) => {
    const serviceId = item.quotation_sub_service_id?.toString() || "";
    const floorId = item.quotation_sub_floor_id?.toString() || "";
    const areaId = item.quotation_sub_area_id?.toString() || "";

    if (!serviceMap[serviceId]) {
      serviceMap[serviceId] = {
        serviceId,
        floors: {},
      };
    }

    if (!serviceMap[serviceId].floors[floorId]) {
      serviceMap[serviceId].floors[floorId] = {
        floorId,
        areas: {},
      };
    }

    if (!serviceMap[serviceId].floors[floorId].areas[areaId]) {
      serviceMap[serviceId].floors[floorId].areas[areaId] = {
        areaId,
        products: [],
      };
    }

    serviceMap[serviceId].floors[floorId].areas[areaId].products.push({
      id: item.id || null,
      productId: item.quotation_sub_product_id?.toString() || "",
      price: Number(item.quotation_sub_price) || 0,
      quantity: Number(item.quotation_sub_quantity) || 1,
      status: item.quotation_sub_status || "Pending",
    });
  });

  return Object.values(serviceMap).map((srv) => ({
    serviceId: srv.serviceId,
    floors: Object.values(srv.floors).map((f) => ({
      floorId: f.floorId,
      areas: Object.values(f.areas).map((a) => ({
        areaId: a.areaId,
        products: a.products,
      })),
    })),
  }));
};

// Helper: Flatten nested Services structure to subs array
const flattenServicesToSubs = (servicesList) => {
  const flattened = [];
  servicesList.forEach((srv) => {
    srv.floors.forEach((floor) => {
      floor.areas.forEach((area) => {
        area.products.forEach((product) => {
          if (product.productId) {
            flattened.push({
              id: product.id || undefined,
              quotation_sub_service_id: Number(srv.serviceId),
              quotation_sub_floor_id: Number(floor.floorId),
              quotation_sub_area_id: Number(area.areaId),
              quotation_sub_product_id: Number(product.productId),
              quotation_sub_price: Number(product.price),
              quotation_sub_quantity: Number(product.quantity),
              quotation_sub_amount: Number(product.price) * Number(product.quantity),
              quotation_sub_status: product.status || "Pending",
            });
          }
        });
      });
    });
  });
  return flattened;
};

const RevQuotationFormPage = () => {
  const { id: parentId, revId } = useParams();
  const isEdit = Boolean(revId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    quotation_id: parentId,
    quotation_date_rev: new Date().toISOString().split("T")[0],
    quotation_buyer_id: "",
    quotation_property_id: "",
    quotation_category_id: "",
    quotation_service_id: "",
    quotation_remarks: "",
    quotation_status: "Pending",
  });

  const [servicesState, setServicesState] = useState([
    {
      serviceId: "",
      floors: [
        {
          floorId: "",
          areas: [
            {
              areaId: "",
              products: [
                {
                  id: null,
                  productId: "",
                  price: 0,
                  quantity: 1,
                  status: "Pending",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Active Masters Queries
  const { data: buyersData, isLoading: buyersLoading } = useActiveBuyersQuery();
  const { data: propertiesData, isLoading: propertiesLoading } = useActivePropertiesQuery();
  const { data: servicesData, isLoading: servicesLoading } = useActiveServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useActiveCategoriesQuery();
  const { data: floorsData, isLoading: floorsLoading } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading } = useActiveAreasQuery();

  // Fetch parent quotation for prefilling revised quote details on CREATE mode, and checking finish work date
  const { data: parentQuotationData, isLoading: parentLoading } = useQuotationQuery(parentId);
  const parentFinishWorkDate = parentQuotationData?.data?.quotation_finish_work_date;

  // Fetch revised quotation on EDIT mode
  const { data: revQuotationData, isLoading: revLoading, isError, refetch } = useRevQuotationQuery(revId, isEdit);

  // Fetch products matching selected categories and services
  const { data: productsData, isLoading: productsLoading } = useGetProductsForQuotationQuery(
    formData.quotation_category_id,
    formData.quotation_service_id,
    Boolean(formData.quotation_category_id && formData.quotation_service_id)
  );

  const productsList = productsData?.data || [];

  // TanStack Mutations
  const createRevQuotationMutation = useCreateRevQuotationMutation();
  const updateRevQuotationMutation = useUpdateRevQuotationMutation();
  const deleteRevSubMutation = useDeleteRevQuotationSubMutation();

  const isSubmitting = createRevQuotationMutation.isPending || updateRevQuotationMutation.isPending;

  // 1. Prefill from parent quotation on CREATE mode
  useEffect(() => {
    if (!isEdit && parentQuotationData?.data) {
      const parent = parentQuotationData.data;
      setFormData({
        quotation_id: parent.id?.toString() || parentId,
        quotation_date_rev: new Date().toISOString().split("T")[0],
        quotation_buyer_id: parent.quotation_buyer_id?.toString() || "",
        quotation_property_id: parent.quotation_property_id?.toString() || "",
        quotation_category_id: parent.quotation_category_id || "",
        quotation_service_id: parent.quotation_service_id || "",
        quotation_remarks: parent.quotation_remarks || "",
        quotation_status: "Pending",
      });

      if (parent.subs && Array.isArray(parent.subs) && parent.subs.length > 0) {
        setServicesState(groupSubsToServices(parent.subs));
      }
    }
  }, [isEdit, parentQuotationData, parentId]);

  // 2. Populate from revised quotation on EDIT mode
  useEffect(() => {
    if (isEdit && revQuotationData?.data) {
      const rev = revQuotationData.data;
      setFormData({
        quotation_id: rev.quotation_id?.toString() || parentId,
        quotation_date_rev: rev.quotation_date_rev || "",
        quotation_buyer_id: rev.quotation_buyer_id?.toString() || "",
        quotation_property_id: rev.quotation_property_id?.toString() || "",
        quotation_category_id: rev.quotation_category_id || "",
        quotation_service_id: rev.quotation_service_id || "",
        quotation_remarks: rev.quotation_remarks || "",
        quotation_status: rev.quotation_status || "Pending",
      });

      if (rev.subs && Array.isArray(rev.subs) && rev.subs.length > 0) {
        setServicesState(groupSubsToServices(rev.subs));
      }
    }
  }, [isEdit, revQuotationData, parentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Nested State Actions
  const addService = () => {
    setServicesState((prev) => [
      ...prev,
      {
        serviceId: "",
        floors: [
          {
            floorId: "",
            areas: [
              {
                areaId: "",
                products: [
                  {
                    id: null,
                    productId: "",
                    price: 0,
                    quantity: 1,
                    status: "Pending",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  };

  const removeService = (serviceIndex) => {
    const srv = servicesState[serviceIndex];
    const ids = [];
    srv.floors.forEach(floor => {
      floor.areas.forEach(area => {
        area.products.forEach(p => {
          if (p.id) ids.push(p.id);
        });
      });
    });

    if (ids.length > 0) {
      setPendingDelete({
        type: "service",
        ids,
        indices: { serviceIndex }
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => prev.filter((_, i) => i !== serviceIndex));
    }
  };

  const addFloor = (serviceIndex) => {
    setServicesState((prev) => {
      const updated = [...prev];
      updated[serviceIndex].floors.push({
        floorId: "",
        areas: [
          {
            areaId: "",
            products: [
              {
                id: null,
                productId: "",
                price: 0,
                quantity: 1,
                status: "Pending",
              },
            ],
          },
        ],
      });
      return updated;
    });
  };

  const removeFloor = (serviceIndex, floorIndex) => {
    const floor = servicesState[serviceIndex].floors[floorIndex];
    const ids = [];
    floor.areas.forEach(area => {
      area.products.forEach(p => {
        if (p.id) ids.push(p.id);
      });
    });

    if (ids.length > 0) {
      setPendingDelete({
        type: "floor",
        ids,
        indices: { serviceIndex, floorIndex }
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors =
          updated[serviceIndex].floors.filter((_, i) => i !== floorIndex);
        return updated;
      });
    }
  };

  const addArea = (serviceIndex, floorIndex) => {
    setServicesState((prev) => {
      const updated = [...prev];
      updated[serviceIndex].floors[floorIndex].areas.push({
        areaId: "",
        products: [
          {
            id: null,
            productId: "",
            price: 0,
            quantity: 1,
            status: "Pending",
          },
        ],
      });
      return updated;
    });
  };

  const removeArea = (serviceIndex, floorIndex, areaIndex) => {
    const area = servicesState[serviceIndex].floors[floorIndex].areas[areaIndex];
    const ids = area.products.map(p => p.id).filter(Boolean);

    if (ids.length > 0) {
      setPendingDelete({
        type: "area",
        ids,
        indices: { serviceIndex, floorIndex, areaIndex }
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors[floorIndex].areas =
          updated[serviceIndex].floors[floorIndex].areas.filter((_, i) => i !== areaIndex);
        return updated;
      });
    }
  };

  const addProduct = (serviceIndex, floorIndex, areaIndex) => {
    setServicesState((prev) => {
      const updated = [...prev];
      updated[serviceIndex].floors[floorIndex].areas[areaIndex].products.push({
        id: null,
        productId: "",
        price: 0,
        quantity: 1,
        status: "Pending",
      });
      return updated;
    });
  };

  const removeProduct = (serviceIndex, floorIndex, areaIndex, productIndex, subId) => {
    if (subId) {
      setPendingDelete({
        type: "product",
        ids: [subId],
        indices: { serviceIndex, floorIndex, areaIndex, productIndex }
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors[floorIndex].areas[areaIndex].products = updated[serviceIndex].floors[floorIndex].areas[areaIndex].products.filter(
          (_, i) => i !== productIndex
        );
        return updated;
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { type, ids, indices } = pendingDelete;
    try {
      if (ids && ids.length > 0) {
        await Promise.all(ids.map(id => deleteRevSubMutation.mutateAsync(id)));
        toast.success("Revised items deleted successfully");
      }
      
      setServicesState((prev) => {
        const updated = [...prev];
        if (type === "product") {
          const { serviceIndex, floorIndex, areaIndex, productIndex } = indices;
          updated[serviceIndex].floors[floorIndex].areas[areaIndex].products = updated[serviceIndex].floors[floorIndex].areas[areaIndex].products.filter(
            (_, i) => i !== productIndex
          );
        } else if (type === "area") {
          const { serviceIndex, floorIndex, areaIndex } = indices;
          updated[serviceIndex].floors[floorIndex].areas =
            updated[serviceIndex].floors[floorIndex].areas.filter((_, i) => i !== areaIndex);
        } else if (type === "floor") {
          const { serviceIndex, floorIndex } = indices;
          updated[serviceIndex].floors =
            updated[serviceIndex].floors.filter((_, i) => i !== floorIndex);
        } else if (type === "service") {
          const { serviceIndex } = indices;
          return updated.filter((_, i) => i !== serviceIndex);
        }
        return updated;
      });
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setPendingDelete(null);
    }
  };

  const handleNestedFieldChange = (serviceIndex, floorIndex, areaIndex, productIndex, field, value) => {
    setServicesState((prev) => {
      const updated = [...prev];
      if (productIndex !== null) {
        // Product change
        const product = updated[serviceIndex].floors[floorIndex].areas[areaIndex].products[productIndex];
        product[field] = value;

        if (field === "productId") {
          const matchedProd = productsList.find((p) => p.id?.toString() === value?.toString());
          if (matchedProd) {
            product.price = matchedProd.product_price || 0;
          }
        }
      } else if (areaIndex !== null) {
        // Area change
        updated[serviceIndex].floors[floorIndex].areas[areaIndex].areaId = value;
      } else if (floorIndex !== null) {
        // Floor change
        updated[serviceIndex].floors[floorIndex].floorId = value;
      } else {
        // Service change
        updated[serviceIndex].serviceId = value;
        // Reset products under this service block if service changes
        updated[serviceIndex].floors.forEach((flr) => {
          flr.areas.forEach((area) => {
            area.products.forEach((prod) => {
              prod.productId = "";
              prod.price = 0;
            });
          });
        });
      }
      return updated;
    });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.quotation_buyer_id) newErrors.quotation_buyer_id = "Buyer is required";
    if (!formData.quotation_property_id) newErrors.quotation_property_id = "Property is required";
    if (!formData.quotation_category_id) {
      toast.error("Please select at least one Category");
      return false;
    }
    if (!formData.quotation_service_id) {
      toast.error("Please select at least one Service");
      return false;
    }

    let hasLineItems = false;
    for (let s = 0; s < servicesState.length; s++) {
      const srv = servicesState[s];
      if (!srv.serviceId) {
        toast.error(`Please select a Service in Service block #${s + 1}`);
        return false;
      }
      for (let f = 0; f < srv.floors.length; f++) {
        const floor = srv.floors[f];
        if (!floor.floorId) {
          toast.error(`Please select a Floor under Service block #${s + 1}, floor block #${f + 1}`);
          return false;
        }
        for (let a = 0; a < floor.areas.length; a++) {
          const area = floor.areas[a];
          if (!area.areaId) {
            toast.error(`Please select an Area under Service block #${s + 1}, Floor block #${f + 1}, area block #${a + 1}`);
            return false;
          }
          for (let p = 0; p < area.products.length; p++) {
            const prod = area.products[p];
            if (!prod.productId) {
              toast.error(`Please complete Product selection under Service #${s + 1} ➔ Floor #${f + 1} ➔ Area #${a + 1}, product #${p + 1}`);
              return false;
            }
            hasLineItems = true;
          }
        }
      }
    }

    if (!hasLineItems) {
      toast.error("Please add at least one line item");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const flattenedSubs = flattenServicesToSubs(servicesState);
    const payload = {
      ...formData,
      quotation_id: Number(formData.quotation_id),
      quotation_buyer_id: Number(formData.quotation_buyer_id),
      quotation_property_id: Number(formData.quotation_property_id),
      subs: flattenedSubs,
    };

    try {
      if (isEdit) {
        await updateRevQuotationMutation.mutateAsync({
          id: revId,
          data: payload,
        });
        toast.success("Revised quotation updated successfully");
      } else {
        await createRevQuotationMutation.mutateAsync(payload);
        toast.success("Revised quotation created successfully");
      }
      navigate(`/quotation-list/revised/${parentId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save revised quotation");
    }
  };

  const buyers = buyersData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];

  const checkedCategories = formData.quotation_category_id ? formData.quotation_category_id.split(",") : [];
  const checkedServices = formData.quotation_service_id ? formData.quotation_service_id.split(",") : [];

  const isFormLoading =
    buyersLoading ||
    propertiesLoading ||
    servicesLoading ||
    categoriesLoading ||
    floorsLoading ||
    areasLoading ||
    parentLoading ||
    (isEdit && revLoading);

  if (isFormLoading) return <LoadingBar />;

  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load revised quotation details.</p>
        <Button onClick={() => navigate(`/quotation-list/revised/${parentId}`)} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Revisions List
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalQty = servicesState.reduce((sum, s) => {
    return sum + s.floors.reduce((fSum, f) => {
      return fSum + f.areas.reduce((aSum, a) => {
        return aSum + a.products.reduce((pSum, p) => pSum + (Number(p.quantity) || 0), 0);
      }, 0);
    }, 0);
  }, 0);

  const totalAmount = servicesState.reduce((sum, s) => {
    return sum + s.floors.reduce((fSum, f) => {
      return fSum + f.areas.reduce((aSum, a) => {
        return aSum + a.products.reduce((pSum, p) => pSum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
      }, 0);
    }, 0);
  }, 0);

  const activeServicesForRows = services.filter((srv) =>
    checkedServices.includes(srv.id?.toString())
  );

  return (
    <div className="max-w-full mx-auto px-5 pb-10">
      <PageHeader
        icon={FileText}
        title={isEdit ? "Edit Revised Quotation" : "Add Revised Quotation"}
        description={isEdit ? "Update revised quotation details" : "Create revised quotation from parent"}
        rightContent={
          <Button variant="outline" onClick={() => navigate(`/quotation-list/revised/${parentId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      {parentFinishWorkDate && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="font-semibold text-sm">Parent Quotation Finalized</p>
            <p className="text-xs opacity-90">The parent quotation has a finish work date. Revisions cannot be created or edited.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revision Date */}
              <div className="space-y-2">
                <Label className="flex">
                  Revision Date <RedStar />
                </Label>
                <Input
                  type="date"
                  name="quotation_date_rev"
                  value={formData.quotation_date_rev}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Buyer (Read-only reference) */}
              <div className="space-y-2">
                <Label>Buyer</Label>
                <select
                  name="quotation_buyer_id"
                  value={formData.quotation_buyer_id}
                  disabled
                  className="w-full border rounded-md h-10 px-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 text-sm"
                >
                  <option value="">Select Buyer</option>
                  {buyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.buyer_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property (Read-only reference) */}
              <div className="space-y-2">
                <Label>Property</Label>
                <select
                  name="quotation_property_id"
                  value={formData.quotation_property_id}
                  disabled
                  className="w-full border rounded-md h-10 px-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 text-sm"
                >
                  <option value="">Select Property</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.property}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox Groups (Disabled read-only display) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t dark:border-slate-800">
              <div>
                <Label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Categories</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg max-h-[160px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checkedCategories.includes(cat.id?.toString())}
                        disabled
                        className="rounded border-slate-300 dark:border-slate-700 h-4 w-4 bg-transparent"
                      />
                      <span>{cat.category_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Services</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg max-h-[160px] overflow-y-auto">
                  {services.map((srv) => (
                    <div key={srv.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checkedServices.includes(srv.id?.toString())}
                        disabled
                        className="rounded border-slate-300 dark:border-slate-700 h-4 w-4 bg-transparent"
                      />
                      <span>{srv.service_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Remarks & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t dark:border-slate-800">
              <div className="md:col-span-2 space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  name="quotation_remarks"
                  value={formData.quotation_remarks}
                  onChange={handleInputChange}
                  placeholder="Enter remarks/notes"
                  className="h-16 resize-none bg-transparent border-slate-200 dark:border-slate-800"
                />
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    name="quotation_status"
                    value={formData.quotation_status}
                    onChange={handleInputChange}
                    className="w-full border rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nested Timeline Tree Line Items Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 pb-2 border-b dark:border-slate-800">
              Quotation Items (Hierarchical Setup)
            </h3>

            <div className="space-y-8">
              {servicesState.map((srv, serviceIndex) => (
                <div
                  key={serviceIndex}
                  className="p-5 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 shadow-sm space-y-4"
                >
                  {/* Service Header */}
                  <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3 w-full md:w-1/3">
                      <Label className="text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
                        Service
                      </Label>
                      <MemoizedSelect
                        options={activeServicesForRows.map((s) => ({
                          value: s.id?.toString(),
                          label: s.service_name,
                        }))}
                        value={srv.serviceId}
                        onChange={(option) =>
                          handleNestedFieldChange(
                            serviceIndex,
                            null,
                            null,
                            null,
                            "serviceId",
                            option ? option.value : "",
                          )
                        }
                        placeholder="Select Service"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(serviceIndex)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Timeline Floors List */}
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
                    {srv.floors.map((floor, floorIndex) => (
                      <div key={floorIndex} className="relative space-y-4">
                        {/* Bullet for Floor */}
                        <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-blue-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>

                        {/* Floor Header */}
                        <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-3 w-full md:w-1/3">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                              Floor
                            </Label>
                            <MemoizedSelect
                              options={floors.map((flr) => ({
                                value: flr.id?.toString(),
                                label: flr.property_floor,
                              }))}
                              value={floor.floorId}
                              onChange={(option) =>
                                handleNestedFieldChange(
                                  serviceIndex,
                                  floorIndex,
                                  null,
                                  null,
                                  "floorId",
                                  option ? option.value : "",
                                )
                              }
                              placeholder="Select Floor"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeFloor(serviceIndex, floorIndex)
                            }
                            className="text-red-500 hover:text-red-700 h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>

                        {/* Timeline Areas List */}
                        <div className="relative pl-6 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-4 space-y-6">
                          {floor.areas.map((area, areaIndex) => (
                            <div key={areaIndex} className="relative space-y-3 pt-1">
                              {/* Bullet for Area */}
                              <div className="absolute -left-[31px] top-3.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-amber-600 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              </div>

                              {/* Area Header */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full md:w-1/3">
                                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                    Area
                                  </Label>
                                  <MemoizedSelect
                                    options={areas.map((ar) => ({
                                      value: ar.id?.toString(),
                                      label: ar.property_area,
                                    }))}
                                    value={area.areaId}
                                    onChange={(option) =>
                                      handleNestedFieldChange(
                                        serviceIndex,
                                        floorIndex,
                                        areaIndex,
                                        null,
                                        "areaId",
                                        option ? option.value : "",
                                      )
                                    }
                                    placeholder="Select Area"
                                  />
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeArea(
                                      serviceIndex,
                                      floorIndex,
                                      areaIndex,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700 h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>

                              {/* Products Block */}
                              <div className="pl-3 bg-white dark:bg-slate-900/40 p-3 rounded-lg border dark:border-slate-800 ml-2 space-y-2">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                  Products
                                </div>

                                {/* Desktop Table Header */}
                                <div className="hidden md:grid grid-cols-6 gap-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 border-b dark:border-slate-800 pb-1.5">
                                  <div className="col-span-3">Product Name</div>
                                  <div className="col-span-1">Rate</div>
                                  <div className="col-span-1">Quantity</div>
                                  <div className="col-span-1 pl-2">Amount</div>
                                </div>

                                {area.products.map((prod, prodIndex) => {
                                  const rowAmount =
                                    (Number(prod.price) || 0) *
                                    (Number(prod.quantity) || 0);

                                  return (
                                    <div
                                      key={prodIndex}
                                      className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border-b dark:border-slate-800/60 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0"
                                    >
                                      {/* Product select */}
                                      <div className="col-span-3">
                                        <MemoizedSelect
                                          options={productsList
                                            .filter(
                                              (p) =>
                                                p.service_id?.toString() ===
                                                srv.serviceId?.toString(),
                                            )
                                            .map((p) => ({
                                              value: p.id?.toString(),
                                              label: p.product_name,
                                            }))}
                                          value={prod.productId}
                                          onChange={(option) =>
                                            handleNestedFieldChange(
                                              serviceIndex,
                                              floorIndex,
                                              areaIndex,
                                              prodIndex,
                                              "productId",
                                              option ? option.value : "",
                                            )
                                          }
                                          placeholder={
                                            !srv.serviceId
                                              ? "Select Service First"
                                              : "Select Product"
                                          }
                                          isLoading={productsLoading}
                                          isDisabled={
                                            !srv.serviceId || productsLoading
                                          }
                                        />
                                      </div>

                                      {/* Price input */}
                                      <div className="col-span-1 flex items-center gap-1">
                                        <Label className="text-[10px] md:hidden shrink-0">
                                          Rate:
                                        </Label>
                                        <Input
                                          type="number"
                                          value={prod.price}
                                          onChange={(e) =>
                                            handleNestedFieldChange(
                                              serviceIndex,
                                              floorIndex,
                                              areaIndex,
                                              prodIndex,
                                              "price",
                                              e.target.value,
                                            )
                                          }
                                          className="h-8 text-xs bg-transparent border-slate-200 dark:border-slate-800"
                                          placeholder="Price"
                                        />
                                      </div>

                                      {/* Quantity input */}
                                      <div className="col-span-1 flex items-center gap-1">
                                        <Label className="text-[10px] md:hidden shrink-0">
                                          Quantity:
                                        </Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={prod.quantity}
                                          onChange={(e) =>
                                            handleNestedFieldChange(
                                              serviceIndex,
                                              floorIndex,
                                              areaIndex,
                                              prodIndex,
                                              "quantity",
                                              e.target.value,
                                            )
                                          }
                                          className="h-8 text-xs bg-transparent border-slate-200 dark:border-slate-800"
                                          placeholder="Qty"
                                        />
                                      </div>

                                      {/* Amount & Trash */}
                                      <div className="col-span-1 flex items-center justify-between pl-2">
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] md:hidden text-slate-500 font-medium">
                                            Amount:
                                          </span>
                                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            ₹{rowAmount.toLocaleString()}
                                          </span>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            removeProduct(
                                              serviceIndex,
                                              floorIndex,
                                              areaIndex,
                                              prodIndex,
                                              prod.id,
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 h-7 w-7"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Add Product Link */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    addProduct(
                                      serviceIndex,
                                      floorIndex,
                                      areaIndex,
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 mt-2.5 hover:underline"
                                >
                                  + Add Product
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add Area Button */}
                          <button
                            type="button"
                            onClick={() => addArea(serviceIndex, floorIndex)}
                            className="border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 mt-3 transition-all duration-200"
                          >
                            <Plus size={12} /> Add Area
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Floor Button */}
                    <button
                      type="button"
                      onClick={() => addFloor(serviceIndex)}
                      className="w-full py-2 border border-dashed border-blue-300 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 mt-4"
                    >
                      <Plus size={12} /> Add Floor
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Service Button */}
              <button
                type="button"
                onClick={addService}
                className="w-full py-2.5 border border-dashed border-purple-300 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/10 dark:hover:bg-purple-950/20 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 mt-6"
              >
                <Plus size={14} /> Add Service
              </button>

              {/* Summary Row */}
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl font-bold border dark:border-slate-800 mt-6">
                <div className="text-sm text-slate-700 dark:text-slate-300">Total Items Quantity: <span className="text-slate-900 dark:text-slate-100">{totalQty}</span></div>
                <div className="text-base text-slate-800 dark:text-slate-200">
                  Grand Total Amount: <span className="text-green-600 dark:text-green-400">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/quotation-list/revised/${parentId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !!parentFinishWorkDate}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Revised Quotation
              </>
            )}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Revised Line Item"
        description="Are you sure you want to delete this revised line item?"
        confirmText="Delete"
      />
    </div>
  );
};

export default RevQuotationFormPage;
