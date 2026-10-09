import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Loader2, Save, ArrowLeft, Plus, Trash2, CalendarDays, FileSpreadsheet, UserPlus, Copy, RefreshCw } from "lucide-react";
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
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useGetProductsForQuotationQuery,
  useDeleteQuotationSubMutation,
  useUpdateQuotationFinishWorkDateMutation,
} from "../hooks/useQuotation";
import { useActiveBuyersQuery } from "../../buyer/hooks/useBuyer";
import { useActivePropertiesQuery } from "../../property/hooks/useProperty";
import { useActiveServicesQuery, useCreateServiceMutation } from "../../service/hooks/useService";
import { useActiveCategoriesQuery } from "../../category/hooks/useCategory";
import { useActiveFloorsQuery, useCreateFloorMutation } from "../../floor/hooks/useFloor";
import { useActiveAreasQuery, useCreateAreaMutation } from "../../area/hooks/useArea";
import { useActiveBrandsQuery, useCreateBrandMutation } from "../../brand/hooks/useBrand";
import { useCreateProductMutation } from "../../product/hooks/useProduct";
import { useQueryClient } from "@tanstack/react-query";
import MemoizedSelect from "@/components/common/memoized-select";
import SelectWithAdd from "@/components/common/select-with-add";
import ConfirmDialog from "@/components/common/confirm-dialog";
import UnsavedChangesDialog from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import ImportQuotationDialog from "../components/ImportQuotationDialog";
import { QuickNameDialog, ProductQuickAddDialog, ServiceQuickAddDialog } from "../components/MasterQuickAddDialogs";
import { useCreateBuyerMutation } from "../../buyer/hooks/useBuyer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
              quotation_sub_amount:
                Number(product.price) * Number(product.quantity),
              quotation_sub_status: product.status || "Pending",
            });
          }
        });
      });
    });
  });
  return flattened;
};

const QuotationFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    quotation_date: new Date().toISOString().split("T")[0],
    quotation_buyer_id: "",
    quotation_property_id: "",
    quotation_category_id: "", // Comma-separated category IDs
    quotation_service_id: "", // Comma-separated service IDs
    quotation_remarks: "",
    quotation_status: "Pending",
    quotation_finish_work_date: "",
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  // Unsaved-changes guard: pristine snapshot vs current form
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  // Buyer quick-add (single reusable SelectWithAdd + inline dialog)
  const [buyerDialogOpen, setBuyerDialogOpen] = useState(false);
  const [buyerMenuOpen, setBuyerMenuOpen] = useState(false);
  const [buyerSearchText, setBuyerSearchText] = useState("");
  const [extraBuyers, setExtraBuyers] = useState([]);
  const [newBuyer, setNewBuyer] = useState({
    buyer_name: "",
    buyer_mobile: "",
    buyer_email: "",
    buyer_address: "",
  });
  const [buyerFormErrors, setBuyerFormErrors] = useState({});
  const createBuyerMutation = useCreateBuyerMutation();

  const handleApplyImport = ({ nestedState, serviceIds, categoryIds }) => {
    const currentServices = formData.quotation_service_id
      ? formData.quotation_service_id.split(",")
      : [];
    let finalServiceIds = serviceIds;
    if (!finalServiceIds || finalServiceIds.length === 0) {
      finalServiceIds = services.map((s) => s.id?.toString()).filter(Boolean);
    }
    const mergedServices = Array.from(
      new Set([...currentServices, ...finalServiceIds].filter(Boolean))
    );

    const currentCategories = formData.quotation_category_id
      ? formData.quotation_category_id.split(",")
      : [];
    let finalCategoryIds = categoryIds;
    if (!finalCategoryIds || finalCategoryIds.length === 0) {
      finalCategoryIds = categories.map((c) => c.id?.toString()).filter(Boolean);
    }
    const mergedCategories = Array.from(
      new Set([...currentCategories, ...finalCategoryIds].filter(Boolean))
    );

    setFormData((prev) => ({
      ...prev,
      quotation_service_id: mergedServices.join(","),
      quotation_category_id: mergedCategories.join(","),
    }));

    if (nestedState && nestedState.length > 0) {
      setServicesState(nestedState);
    }
  };

  // Active Masters Queries
  const { data: buyersData, isLoading: buyersLoading } = useActiveBuyersQuery();
  const { data: propertiesData, isLoading: propertiesLoading } =
    useActivePropertiesQuery();
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } =
    useActiveServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useActiveCategoriesQuery();
  const { data: floorsData, isLoading: floorsLoading, refetch: refetchFloors } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading, refetch: refetchAreas } = useActiveAreasQuery();
  const { data: brandsData, isLoading: brandsLoading, refetch: refetchBrands } = useActiveBrandsQuery();
  const queryClient = useQueryClient();

  // Fetch products matching selected categories and services
  const { data: productsData, isLoading: productsLoading, refetch: refetchQuotationProducts } =
    useGetProductsForQuotationQuery(
      formData.quotation_category_id,
      formData.quotation_service_id,
      Boolean(formData.quotation_category_id && formData.quotation_service_id),
    );

  const productsList = productsData?.data || [];

  // TanStack Queries & Mutations
  const {
    data: fetchedData,
    isLoading: isFetching,
    isError,
    refetch,
  } = useQuotationQuery(id, isEdit);
  const createQuotationMutation = useCreateQuotationMutation();
  const updateQuotationMutation = useUpdateQuotationMutation();
  const deleteQuotationSubMutation = useDeleteQuotationSubMutation();
  const updateQuotationFinishWorkDateMutation = useUpdateQuotationFinishWorkDateMutation();
  // Master quick-add mutations (Floor / Area / Brand / Product — inline, Buyer pattern)
  const createFloorMutation = useCreateFloorMutation();
  const createAreaMutation = useCreateAreaMutation();
  const createBrandMutation = useCreateBrandMutation();
  const createProductMutation = useCreateProductMutation();
  const createServiceMutation = useCreateServiceMutation();

  const isSubmitting =
    createQuotationMutation.isPending ||
    updateQuotationMutation.isPending ||
    updateQuotationFinishWorkDateMutation.isPending;

  const hasFinishWorkDate = Boolean(isEdit && fetchedData?.data?.quotation_finish_work_date);

  useEffect(() => {
    if (isEdit && fetchedData?.data) {
      const data = fetchedData.data;
      const nextForm = {
        quotation_date: data.quotation_date || "",
        quotation_buyer_id: data.quotation_buyer_id?.toString() || "",
        quotation_property_id: data.quotation_property_id?.toString() || "",
        quotation_category_id: data.quotation_category_id || "",
        quotation_service_id: data.quotation_service_id || "",
        quotation_remarks: data.quotation_remarks || "",
        quotation_status: data.quotation_status || "Pending",
        quotation_finish_work_date: data.quotation_finish_work_date || "",
      };
      setFormData(nextForm);

      let nextServices = null;
      if (data.subs && Array.isArray(data.subs) && data.subs.length > 0) {
        nextServices = groupSubsToServices(data.subs);
        setServicesState(nextServices);
      }
      // pristine snapshot taaki bina change ke bahar jane par popup na aaye
      const snapshotServices =
        nextServices ||
        [
          {
            serviceId: "",
            floors: [
              {
                floorId: "",
                areas: [
                  {
                    areaId: "",
                    products: [
                      { id: null, productId: "", price: 0, quantity: 1, status: "Pending" },
                    ],
                  },
                ],
              },
            ],
          },
        ];
      setInitialSnapshot(JSON.stringify({ formData: nextForm, servicesState: snapshotServices }));
    }
  }, [isEdit, fetchedData]);

  // Create mode: mount par pristine snapshot lock karo
  useEffect(() => {
    if (!isEdit && initialSnapshot === null) {
      setInitialSnapshot(
        JSON.stringify({
          quotation_date: new Date().toISOString().split("T")[0],
          quotation_buyer_id: "",
          quotation_property_id: "",
          quotation_category_id: "",
          quotation_service_id: "",
          quotation_remarks: "",
          quotation_status: "Pending",
          quotation_finish_work_date: "",
        })
      );
      // Note: servicesState ka empty default bhi dirty-check me shamil hai;
      // neeche isDirty memo formData+servicesState dono dekhta hai, isliye
      // create mode me pehla snapshot formData-default se set karke
      // servicesState ko alag se compare karenge.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const snapshotKey = useMemo(
    () => JSON.stringify({ formData, servicesState }),
    [formData, servicesState]
  );

  const isDirty = useMemo(() => {
    if (initialSnapshot === null) return false;
    if (isEdit) return snapshotKey !== initialSnapshot;
    // Create mode: buyer/property/category/service/remarks/date ya line-items me kuch bhi bhara ho to dirty
    const todayStr = new Date().toISOString().split("T")[0];
    const hasBasic = Boolean(
      formData.quotation_buyer_id ||
        formData.quotation_property_id ||
        formData.quotation_category_id ||
        formData.quotation_service_id ||
        formData.quotation_remarks ||
        (formData.quotation_date && formData.quotation_date !== todayStr)
    );
    const hasItems = servicesState.some(
      (srv) =>
        srv.serviceId ||
        srv.floors.some(
          (flr) =>
            flr.floorId ||
            flr.areas.some((a) => a.areaId || a.products.some((p) => p.productId))
        )
    );
    return hasBasic || hasItems;
  }, [initialSnapshot, snapshotKey, isEdit, formData, servicesState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Category Checkbox Handlers
  const handleCategoryCheckboxChange = (catId, checked) => {
    let currentIds = formData.quotation_category_id
      ? formData.quotation_category_id.split(",")
      : [];
    if (checked) {
      currentIds.push(catId.toString());
    } else {
      currentIds = currentIds.filter((id) => id !== catId.toString());
    }
    setFormData((prev) => ({
      ...prev,
      quotation_category_id: currentIds.join(","),
    }));
  };

  // Service Checkbox Handlers
  const handleServiceCheckboxChange = (srvId, checked) => {
    let currentIds = formData.quotation_service_id
      ? formData.quotation_service_id.split(",")
      : [];
    if (checked) {
      currentIds.push(srvId.toString());
    } else {
      currentIds = currentIds.filter((id) => id !== srvId.toString());
    }
    setFormData((prev) => ({
      ...prev,
      quotation_service_id: currentIds.join(","),
    }));
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

  const removeProduct = (
    serviceIndex,
    floorIndex,
    areaIndex,
    productIndex,
    subId,
  ) => {
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
        updated[serviceIndex].floors[floorIndex].areas[areaIndex].products =
          updated[serviceIndex].floors[floorIndex].areas[
            areaIndex
          ].products.filter((_, i) => i !== productIndex);
        return updated;
      });
    }
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

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { type, ids, indices } = pendingDelete;
    try {
      if (ids && ids.length > 0) {
        await Promise.all(ids.map(id => deleteQuotationSubMutation.mutateAsync(id)));
        toast.success("Items deleted successfully");
      }

      setServicesState((prev) => {
        const updated = [...prev];
        if (type === "product") {
          const { serviceIndex, floorIndex, areaIndex, productIndex } = indices;
          updated[serviceIndex].floors[floorIndex].areas[areaIndex].products =
            updated[serviceIndex].floors[floorIndex].areas[
              areaIndex
            ].products.filter((_, i) => i !== productIndex);
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
      toast.error(error.message || "Failed to delete items");
    } finally {
      setPendingDelete(null);
    }
  };

  const handleNestedFieldChange = (
    serviceIndex,
    floorIndex,
    areaIndex,
    productIndex,
    field,
    value,
    knownProduct = null,
  ) => {
    setServicesState((prev) => {
      const updated = [...prev];
      if (productIndex !== null) {
        // Product change
        const product =
          updated[serviceIndex].floors[floorIndex].areas[areaIndex].products[
            productIndex
          ];
        product[field] = value;

        if (field === "productId") {
          // knownProduct = quick-add wala fresh object (stale list bypass);
          // warna current lists me lookup.
          const matchedProd = knownProduct || findProductById(value);
          if (matchedProd) {
            product.price = matchedProd.product_price || 0;
          }
        }
      } else if (areaIndex !== null) {
        // Area change
        updated[serviceIndex].floors[floorIndex].areas[areaIndex].areaId =
          value;
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
    if (!formData.quotation_buyer_id)
      newErrors.quotation_buyer_id = "Buyer is required";
    if (!formData.quotation_property_id)
      newErrors.quotation_property_id = "Property is required";

    if (newErrors.quotation_buyer_id || newErrors.quotation_property_id) {
      toast.error("Please select a Buyer and Property at the top of the form.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setErrors(newErrors);
      return false;
    }

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
          toast.error(
            `Please select a Floor under Service block #${s + 1}, floor block #${f + 1}`,
          );
          return false;
        }
        for (let a = 0; a < floor.areas.length; a++) {
          const area = floor.areas[a];
          if (!area.areaId) {
            toast.error(
              `Please select an Area under Service block #${s + 1}, Floor block #${f + 1}, area block #${a + 1}`,
            );
            return false;
          }
          for (let p = 0; p < area.products.length; p++) {
            const prod = area.products[p];
            if (!prod.productId) {
              toast.error(
                `Please complete Product selection under Service #${s + 1} ➔ Floor #${f + 1} ➔ Area #${a + 1}, product #${p + 1}`,
              );
              return false;
            }
            hasLineItems = true;
          }
        }
      }
    }

    if (!hasLineItems) {
      toast.error("Please add at least one quotation item");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Shared payload builder (create + overwrite + save-as-new sab yahi use karte hai)
  const buildPayload = (overrides = {}) => {
    const flattenedSubs = flattenServicesToSubs(servicesState);
    return {
      ...formData,
      ...overrides,
      quotation_buyer_id: Number(formData.quotation_buyer_id),
      quotation_property_id: Number(formData.quotation_property_id),
      subs: flattenedSubs,
    };
  };

  // Popup ke "Save & Leave" ke liye: bina navigate kiye save, success par true/id
  const saveWithoutNavigate = async () => {
    if (!validateForm()) return false;
    const payload = buildPayload();
    try {
      if (isEdit) {
        await updateQuotationMutation.mutateAsync({ id, data: payload });
        if (formData.quotation_finish_work_date) {
          await updateQuotationFinishWorkDateMutation.mutateAsync({
            id,
            finishWorkDate: formData.quotation_finish_work_date,
          });
        }
        toast.success("Quotation updated successfully");
        setInitialSnapshot(snapshotKey);
        refetch?.();
        return true;
      } else {
        const res = await createQuotationMutation.mutateAsync(payload);
        const created = res?.data?.data || res?.data || res;
        const newId =
          created?.id?.toString() ||
          res?.data?.id?.toString() ||
          res?.id?.toString() ||
          "";
        toast.success("Quotation created successfully");
        setInitialSnapshot(snapshotKey);
        return newId || true;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save quotation"
      );
      return false;
    }
  };

  const {
    dialogOpen: unsavedDialogOpen,
    isSavingAndLeaving,
    requestNavigate,
    handleStay,
    handleLeaveWithoutSaving,
    handleSaveAndLeave,
  } = useUnsavedChangesGuard({ isDirty, onSave: saveWithoutNavigate });

  // Save button ab working file me hi rehta hai — list par redirect nahi hota.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveWithoutNavigate();
    if (!result) return;
    if (!isEdit && typeof result === "string") {
      // Create ke baad naye quotation ke edit page par (working file me hi raho)
      navigate(`/quotation-list/edit/${result}`, { replace: true });
    }
    // Edit mode me yahi raho — refetch upar ho chuka hai, toast dikh chuka hai.
  };

  // Edit mode: same quotation ko naye quotation ke roop me, aaj ki date ke saath save karo.
  // Purana quotation untouched rehta hai; naya banne ke baad uske edit page par le jao.
  const [isSavingNew, setIsSavingNew] = useState(false);
  const handleSaveAsNew = async () => {
    if (!validateForm()) return;
    setIsSavingNew(true);
    try {
      const payload = buildPayload({
        quotation_date: new Date().toISOString().split("T")[0],
        quotation_status: "Pending",
        quotation_finish_work_date: "",
      });
      const res = await createQuotationMutation.mutateAsync(payload);
      const created = res?.data?.data || res?.data || res;
      const newId =
        created?.id?.toString() ||
        res?.data?.id?.toString() ||
        res?.id?.toString() ||
        "";
      toast.success("Saved as new quotation with today's date");
      setInitialSnapshot(snapshotKey);
      navigate(newId ? `/quotation-list/edit/${newId}` : "/quotation-list");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save as new quotation",
      );
    } finally {
      setIsSavingNew(false);
    }
  };

  const buyers = buyersData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];

  // Buyer options for the single reusable SelectWithAdd
  // (extraBuyers = abhi-abhi banaya hua buyer, refetch se pehle turant dikhe)
  const buyerOptions = [
    ...(buyers || []).map((b) => ({
      value: b.id?.toString(),
      label: b.buyer_name,
      buyer: b,
    })),
    ...extraBuyers.filter(
      (e) => !(buyers || []).some((b) => b.id?.toString() === e.value)
    ),
  ];

  const filterBuyer = (option, input) => {
    if (!input) return true;
    const q = input.toLowerCase();
    const b = option.data?.buyer || {};
    return (
      option.data.label?.toLowerCase().includes(q) ||
      b.buyer_mobile?.toLowerCase().includes(q) ||
      b.buyer_email?.toLowerCase().includes(q)
    );
  };

  const handleBuyerAdd = (typed = "") => {
    setBuyerFormErrors({});
    setNewBuyer({
      buyer_name: (typed || buyerSearchText || "").trim(),
      buyer_mobile: "",
      buyer_email: "",
      buyer_address: "",
    });
    setBuyerMenuOpen(false);
    setBuyerDialogOpen(true);
  };

  const handleCreateBuyer = async (e) => {
    e?.preventDefault?.();
    const errs = {};
    if (!newBuyer.buyer_name.trim()) errs.buyer_name = "Buyer Name is required";
    if (!newBuyer.buyer_mobile) {
      errs.buyer_mobile = "Mobile number is required";
    } else if (newBuyer.buyer_mobile.length !== 10) {
      errs.buyer_mobile = "Mobile must be a 10-digit number";
    }
    if (!newBuyer.buyer_email.trim()) {
      errs.buyer_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newBuyer.buyer_email.trim())) {
      errs.buyer_email = "Invalid email format";
    }
    setBuyerFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await createBuyerMutation.mutateAsync({
        buyer_name: newBuyer.buyer_name.trim(),
        buyer_mobile: newBuyer.buyer_mobile.trim(),
        buyer_email: newBuyer.buyer_email.trim(),
        buyer_address: newBuyer.buyer_address?.trim() || "",
      });
      // Backend shape varies — handle {data:{id}}, {data:{data:{id}}}, {id}
      const created = res?.data?.data || res?.data || res;
      const newId =
        created?.id?.toString() ||
        res?.data?.id?.toString() ||
        res?.id?.toString() ||
        "";
      const newName = created?.buyer_name || newBuyer.buyer_name.trim();
      if (newId) {
        setExtraBuyers((prev) => [
          ...prev,
          { value: newId, label: newName, buyer: created },
        ]);
        setFormData((prev) => ({ ...prev, quotation_buyer_id: newId }));
        setErrors((prev) => ({ ...prev, quotation_buyer_id: "" }));
      }
      toast.success("Buyer added successfully");
      setBuyerDialogOpen(false);
      setNewBuyer({
        buyer_name: "",
        buyer_mobile: "",
        buyer_email: "",
        buyer_address: "",
      });
      setBuyerSearchText("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to add buyer"
      );
    }
  };

  const checkedCategories = formData.quotation_category_id
    ? formData.quotation_category_id.split(",")
    : [];
  const checkedServices = formData.quotation_service_id
    ? formData.quotation_service_id.split(",")
    : [];

  // Empty-dropdown hint: selected categories ke products asli me KIS service
  // ke neeche hai (e.g. Frame → Smart Switches, not Electrical Automation).
  // Sirf guidance text hai — filter logic bilkul untouched.
  const allServiceIds = services.map((s) => s.id).join(",");
  const { data: catProductsData } = useGetProductsForQuotationQuery(
    formData.quotation_category_id,
    allServiceIds,
    Boolean(formData.quotation_category_id && allServiceIds),
  );
  const catProductsList = catProductsData?.data || [];

  const getProductEmptyHint = (rowServiceId) => {
    const rowSvcName =
      services.find((s) => s.id?.toString() === rowServiceId?.toString())
        ?.service_name || "this service";
    const catNames =
      categories
        .filter((c) => checkedCategories.includes(c.id?.toString()))
        .map((c) => c.category_name)
        .slice(0, 2)
        .join(", ") || "selected categories";
    if (!catProductsList.length)
      return `No products found for '${catNames}'. Add products in Product master first.`;
    const byService = {};
    catProductsList.forEach((p) => {
      const sid = p.service_id?.toString();
      if (!sid || sid === rowServiceId?.toString()) return;
      byService[sid] = (byService[sid] || 0) + 1;
    });
    const others = Object.entries(byService)
      .slice(0, 2)
      .map(([sid, n]) => {
        const nm =
          services.find((s) => s.id?.toString() === sid)?.service_name ||
          "another service";
        return `${n} under '${nm}'`;
      });
    if (!others.length)
      return `No '${catNames}' products under '${rowSvcName}'.`;
    return `No '${catNames}' products under '${rowSvcName}'. Found ${others.join(", ")} — tick that Service above.`;
  };

  // Combined product lookup (just-created + checked-services + all-services lists).
  const findProductById = (pid) =>
    [...extraProducts, ...productsList, ...catProductsList].find(
      (p) => p.id?.toString() === pid?.toString(),
    );

  // Row product options: pehle row-service match (checked list), phir
  // all-services list me row-service match, phir category ke saare products
  // (+ just-created) — data hai to dikhega, khaali nahi rahega.
  const getRowProductOptions = (rowServiceId) => {
    if (!rowServiceId) return [];
    const matched = productsList.filter(
      (p) => p.service_id?.toString() === rowServiceId?.toString(),
    );
    let base = matched;
    if (base.length === 0) {
      // Master me abhi-abhi add hua product (stale checked-list bypass):
      // all-services wali list me isi row-service ka product dhoondo.
      const catMatched = catProductsList.filter(
        (p) => p.service_id?.toString() === rowServiceId?.toString(),
      );
      if (catMatched.length > 0) {
        base = catMatched;
      } else {
        base = catProductsList.filter(
          (p) =>
            checkedCategories.includes(p.category_id?.toString()) &&
            !matched.some((m) => m.id === p.id),
        );
      }
    }
    const seen = new Set(base.map((p) => p.id?.toString()));
    return [
      ...base,
      ...extraProducts.filter((e) => !seen.has(e.id?.toString())),
    ];
  };

  // Product select: agar product kisi AUR service ka hai to row ka Service
  // uske asli service par auto-set + service tick (galat service me save nahi hoga).
  const handleProductSelect = (
    serviceIndex,
    floorIndex,
    areaIndex,
    prodIndex,
    option,
    srv,
    knownProduct = null,
  ) => {
    const val = option ? option.value : "";
    if (!option) {
      handleNestedFieldChange(
        serviceIndex,
        floorIndex,
        areaIndex,
        prodIndex,
        "productId",
        "",
      );
      return;
    }
    const matched = knownProduct || findProductById(val);
    const realSvc = matched?.service_id?.toString();
    if (realSvc && srv.serviceId && realSvc !== srv.serviceId?.toString()) {
      const svcName =
        services.find((s) => s.id?.toString() === realSvc)?.service_name ||
        matched?.service_name ||
        realSvc;
      // 1. row service asli service par (pehle — ye block reset karta hai)
      handleNestedFieldChange(serviceIndex, null, null, null, "serviceId", realSvc);
      // 2. service tick taaki row dropdown me bana rahe
      setFormData((prev) => {
        const cur = prev.quotation_service_id
          ? prev.quotation_service_id.split(",")
          : [];
        if (cur.includes(realSvc)) return prev;
        return { ...prev, quotation_service_id: [...cur, realSvc].join(",") };
      });
      toast.info(`Row Service auto-set to '${svcName}'`);
    }
    // 3. product + rate (knownProduct = fresh object, stale lookup bypass)
    handleNestedFieldChange(
      serviceIndex,
      floorIndex,
      areaIndex,
      prodIndex,
      "productId",
      val,
      matched,
    );
  };

  // ── Master quick-add state (Floor / Area / Product) ──
  const [quickName, setQuickName] = useState({
    open: false,
    type: "floor",
    target: null,
    name: "",
    saving: false,
  });
  const [productQA, setProductQA] = useState({
    open: false,
    target: null,
    serviceId: "",
    categoryId: "",
    name: "",
    saving: false,
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [serviceQA, setServiceQA] = useState({
    open: false,
    target: null,
    name: "",
    saving: false,
  });
  const [extraProducts, setExtraProducts] = useState([]);

  const openQuickName = (type, target, typed) =>
    setQuickName({ open: true, type, target, name: (typed || "").trim(), saving: false });

  const matchByName = (list, name, key) =>
    (list || []).find(
      (x) => (x[key] || "").toLowerCase() === (name || "").toLowerCase(),
    );

  const saveQuickName = async (name) => {
    // Floor / Area only (same payload as master create pages).
    const { type, target } = quickName;
    if (!target) return;
    setQuickName((p) => ({ ...p, saving: true }));
    try {
      if (type === "floor") {
        await createFloorMutation.mutateAsync({ property_floor: name });
        const r = await refetchFloors();
        const found = matchByName(r.data?.data, name, "property_floor");
        if (found)
          handleNestedFieldChange(target.serviceIndex, target.floorIndex, null, null, "floorId", found.id.toString());
      } else {
        await createAreaMutation.mutateAsync({ property_area: name });
        const r = await refetchAreas();
        const found = matchByName(r.data?.data, name, "property_area");
        if (found)
          handleNestedFieldChange(target.serviceIndex, target.floorIndex, target.areaIndex, null, "areaId", found.id.toString());
      }
      toast.success(`${type === "floor" ? "Floor" : "Area"} added successfully`);
      setQuickName({ open: false, type: "floor", target: null, name: "", saving: false });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add");
      setQuickName((p) => ({ ...p, saving: false }));
    }
  };

  const openServiceQA = (target, typed) =>
    setServiceQA({ open: true, target, name: (typed || "").trim(), saving: false });

  // Service quick-add save — dialog master-mirror FormData bhejta hai.
  const saveServiceQA = async (formDataObj) => {
    const { target } = serviceQA;
    if (!target) return;
    setServiceQA((p) => ({ ...p, saving: true }));
    try {
      await createServiceMutation.mutateAsync(formDataObj);
      const r = await refetchServices();
      const sentName = formDataObj.get("service_name");
      const found = matchByName(r.data?.data, sentName, "service_name");
      if (found) {
        const sid = found.id.toString();
        setFormData((prev) => {
          const cur = prev.quotation_service_id ? prev.quotation_service_id.split(",") : [];
          if (cur.includes(sid)) return prev;
          return { ...prev, quotation_service_id: [...cur, sid].join(",") };
        });
        handleNestedFieldChange(target.serviceIndex, null, null, null, "serviceId", sid);
      }
      toast.success("Service added successfully");
      setServiceQA({ open: false, target: null, name: "", saving: false });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add service");
      setServiceQA((p) => ({ ...p, saving: false }));
    }
  };

  // Brand add (product dialog ke andar) — id wapas deta hai, dialog khud select karta hai.
  const handleAddBrand = async (name) => {
    setBrandSaving(true);
    try {
      await createBrandMutation.mutateAsync(name);
      const r = await refetchBrands();
      const found = matchByName(r.data?.data, name, "brand_name");
      if (found) toast.success("Brand added successfully");
      return found ? found.id.toString() : null;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add brand");
      return null;
    } finally {
      setBrandSaving(false);
    }
  };

  const openProductQA = (target, typed, rowServiceId) =>
    setProductQA({
      open: true,
      target,
      name: (typed || "").trim(),
      serviceId: rowServiceId || "",
      categoryId: checkedCategories[0] || "",
      saving: false,
    });

  const saveProductQA = async (payload) => {
    const { target } = productQA;
    if (!target) return;
    setProductQA((p) => ({ ...p, saving: true }));
    try {
      const res = await createProductMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ["products-for-quotation"] });
      const r = await refetchQuotationProducts();
      // Prefer create-response (fresh object — stale list bypass), else refetch-find.
      const created = res?.data?.data || res?.data || res;
      let found =
        (r.data?.data || []).find(
          (p) => (p.product_name || "").toLowerCase() === payload.product_name.toLowerCase(),
        ) ||
        (created?.id
          ? {
              id: created.id,
              product_name: created.product_name || payload.product_name,
              product_price:
                created.product_price ?? payload.product_price ?? 0,
              service_id: created.service_id ?? payload.service_id ?? "",
              service_name: created.service_name || "",
              category_id: created.category_id ?? payload.category_id ?? "",
            }
          : null);
      if (found?.id) {
        setExtraProducts((prev) =>
          prev.some((e) => e.id?.toString() === found.id?.toString())
            ? prev
            : [...prev, found],
        );
        // Naye product ki category tick karo taaki refetch-list me bana rahe
        // (warna category filter se bahar ho jayega aur dropdown se gayab lagega).
        const newCatId =
          found.category_id?.toString() || payload.category_id?.toString() || "";
        if (newCatId) {
          setFormData((prev) => {
            const cur = prev.quotation_category_id
              ? prev.quotation_category_id.split(",")
              : [];
            if (cur.includes(newCatId)) return prev;
            return { ...prev, quotation_category_id: [...cur, newCatId].join(",") };
          });
        }
        const srv = servicesState[target.serviceIndex];
        handleProductSelect(
          target.serviceIndex,
          target.floorIndex,
          target.areaIndex,
          target.prodIndex,
          { value: found.id.toString() },
          { serviceId: srv?.serviceId },
          found,
        );
      }
      toast.success("Product added successfully");
      setProductQA({ open: false, target: null, serviceId: "", categoryId: "", name: "", saving: false });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
      setProductQA((p) => ({ ...p, saving: false }));
    }
  };

  const brands = brandsData?.data || [];

  const isFormLoading =
    buyersLoading ||
    propertiesLoading ||
    servicesLoading ||
    categoriesLoading ||
    floorsLoading ||
    areasLoading ||
    brandsLoading ||
    (isEdit && isFetching);

  if (isFormLoading) return <LoadingBar />;

  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">
          Failed to load quotation details.
        </p>
        <Button onClick={() => navigate("/quotation-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalQty = servicesState.reduce((sum, s) => {
    return (
      sum +
      s.floors.reduce((fSum, f) => {
        return (
          fSum +
          f.areas.reduce((aSum, a) => {
            return (
              aSum +
              a.products.reduce((pSum, p) => pSum + (Number(p.quantity) || 0), 0)
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const totalAmount = servicesState.reduce((sum, s) => {
    return (
      sum +
      s.floors.reduce((fSum, f) => {
        return (
          fSum +
          f.areas.reduce((aSum, a) => {
            return (
              aSum +
              a.products.reduce(
                (pSum, p) =>
                  pSum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
                0,
              )
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const activeServicesForRows = services.filter((srv) =>
    checkedServices.includes(srv.id?.toString()),
  );

  return (
    <div className="max-w-full mx-auto px-5 pb-10">
      <PageHeader
        icon={FileText}
        title={isEdit ? "Edit Quotation" : "Add Quotation"}
        description={
          isEdit
            ? "Update quotation details and line items"
            : "Create a new buyer quotation"
        }
        rightContent={
          <Button variant="outline" onClick={() => requestNavigate("/quotation-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      {hasFinishWorkDate && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="font-semibold text-sm">Quotation Finalized</p>
            <p className="text-xs opacity-90">This quotation has a finish work date and cannot be edited.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quotation Date */}
              <div className="space-y-2">
                <Label className="flex">
                  Quotation Date <RedStar />
                </Label>
                <Input
                  type="date"
                  name="quotation_date"
                  value={formData.quotation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Buyer Select */}
              <div className="space-y-2">
                <Label className="flex">
                  Buyer <RedStar />
                </Label>
                <SelectWithAdd
                  value={formData.quotation_buyer_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      quotation_buyer_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, quotation_buyer_id: "" }));
                  }}
                  options={buyerOptions}
                  placeholder="Search or Select Buyer"
                  isLoading={buyersLoading}
                  hasError={Boolean(errors.quotation_buyer_id)}
                  filterOption={filterBuyer}
                  getSubtitle={(o) =>
                    o?.buyer?.buyer_mobile || o?.buyer?.buyer_email
                      ? `${o?.buyer?.buyer_mobile || ""}${o?.buyer?.buyer_mobile && o?.buyer?.buyer_email ? " • " : ""}${o?.buyer?.buyer_email || ""}`
                      : ""
                  }
                  // ── Dropdown placement ──
                  // placement: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "bottom" | "top"
                  // menuPosition: "absolute" = box KE ANDAR | "fixed" = box KE BAHAR (Dialog/overflow ke liye)
                  // Bahar chahiye to: menuPosition="fixed" menuPortalTarget={document.body}
                  placement="bottom-left"
                  menuPosition="absolute"
                  addLabel="Add New Buyer"
                  renderAddLabel={(typed) =>
                    typed?.trim()
                      ? `Add "${typed.trim()}" as New Buyer`
                      : "Add New Buyer"
                  }
                  onAdd={handleBuyerAdd}
                  menuIsOpen={buyerDialogOpen ? false : buyerMenuOpen}
                  onMenuOpen={() => setBuyerMenuOpen(true)}
                  onMenuClose={() => setBuyerMenuOpen(false)}
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") setBuyerSearchText(v);
                    return v;
                  }}
                />
              </div>

              {/* Property Select */}
              <div className="space-y-2">
                <Label className="flex">
                  Property <RedStar />
                </Label>
                <MemoizedSelect
                  options={properties.map((prop) => ({
                    value: prop.id?.toString(),
                    label: prop.property,
                  }))}
                  value={formData.quotation_property_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      quotation_property_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, quotation_property_id: "" }));
                  }}
                  placeholder="Select Property"
                  hasError={Boolean(errors.quotation_property_id)}
                />
              </div>
            </div>

            {/* Checkbox Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t dark:border-slate-800">
              {/* Categories Checkboxes */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                  Categories <RedStar />
                </Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-[160px] overflow-y-auto border dark:border-slate-800">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedCategories.includes(cat.id?.toString())}
                        onChange={(e) =>
                          handleCategoryCheckboxChange(cat.id, e.target.checked)
                        }
                        className="rounded border-slate-300 dark:border-slate-700 h-4 w-4 bg-transparent"
                      />
                      <span>{cat.category_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services Checkboxes */}
              <div>
                <Label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                  Services <RedStar />
                </Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-[160px] overflow-y-auto border dark:border-slate-800">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedServices.includes(srv.id?.toString())}
                        onChange={(e) =>
                          handleServiceCheckboxChange(srv.id, e.target.checked)
                        }
                        className="rounded border-slate-300 dark:border-slate-700 h-4 w-4 bg-transparent"
                      />
                      <span>{srv.service_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Remarks & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t dark:border-slate-800">
              <div className={isEdit ? "md:col-span-1 space-y-2" : "md:col-span-2 space-y-2"}>
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
                <>
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

                  <div className="space-y-2">
                    <Label>Finish Work Date</Label>
                    <Input
                      type="date"
                      name="quotation_finish_work_date"
                      value={formData.quotation_finish_work_date}
                      onChange={handleInputChange}
                      className="bg-transparent border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nested Timeline Tree Line Items Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Quotation Items (Hierarchical Setup)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await queryClient.invalidateQueries({ queryKey: ["products-for-quotation"] });
                  await refetchQuotationProducts();
                  toast.success("Product list refreshed");
                }}
                disabled={productsLoading}
                className="shrink-0"
                title="Product master me naya product add kiya ho to list refresh karo"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${productsLoading ? "animate-spin" : ""}`} />
                Refresh Products
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                disabled={hasFinishWorkDate}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                Import from Excel / TSV
              </Button> */}
            </div>

            {!formData.quotation_category_id ||
            !formData.quotation_service_id ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400">
                Please select Categories and Services above to enable line item
                entry.
              </div>
            ) : (
              <div className="space-y-8">
                {servicesState.map((srv, serviceIndex) => (
                  <div
                    key={serviceIndex}
                    className="p-5 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 shadow-sm space-y-4"
                  >
                    {/* Service Header */}
                    <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3 w-full md:w-1/2">
                        <Label className="text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
                          Service
                        </Label>
                        <SelectWithAdd
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
                          isLoading={servicesLoading}
                          addLabel="Add New Service"
                          renderAddLabel={(typed) =>
                            typed?.trim()
                              ? `Add "${typed.trim()}" as New Service`
                              : "Add New Service"
                          }
                          onAdd={(typed) =>
                            openServiceQA(
                              { serviceIndex },
                              typed,
                            )
                          }
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
                            <div className="flex items-center gap-3 w-full md:w-1/2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                Floor
                              </Label>
                              <SelectWithAdd
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
                                isLoading={floorsLoading}
                                addLabel="Add New Floor"
                                renderAddLabel={(typed) =>
                                  typed?.trim()
                                    ? `Add "${typed.trim()}" as New Floor`
                                    : "Add New Floor"
                                }
                                onAdd={(typed) =>
                                  openQuickName(
                                    "floor",
                                    { serviceIndex, floorIndex },
                                    typed,
                                  )
                                }
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
                                  <div className="flex items-center gap-3 w-full md:w-2/3">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                      Area
                                    </Label>
                                    <SelectWithAdd
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
                                      isLoading={areasLoading}
                                      addLabel="Add New Area"
                                      renderAddLabel={(typed) =>
                                        typed?.trim()
                                          ? `Add "${typed.trim()}" as New Area`
                                          : "Add New Area"
                                      }
                                      onAdd={(typed) =>
                                        openQuickName(
                                          "area",
                                          { serviceIndex, floorIndex, areaIndex },
                                          typed,
                                        )
                                      }
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
                                          <SelectWithAdd
                                            options={getRowProductOptions(
                                              srv.serviceId,
                                            ).map((p) => ({
                                              value: p.id?.toString(),
                                              label: p.product_name,
                                            }))}
                                            value={prod.productId}
                                            onChange={(option) =>
                                              handleProductSelect(
                                                serviceIndex,
                                                floorIndex,
                                                areaIndex,
                                                prodIndex,
                                                option,
                                                srv,
                                              )
                                            }
                                            placeholder={
                                              !srv.serviceId
                                                ? "Select Service First"
                                                : "Select Product"
                                            }
                                            noOptionsMessage={getProductEmptyHint(
                                              srv.serviceId,
                                            )}
                                            isLoading={productsLoading}
                                            isDisabled={
                                              !srv.serviceId || productsLoading
                                            }
                                            addLabel="Add New Product"
                                            renderAddLabel={(typed) =>
                                              typed?.trim()
                                                ? `Add "${typed.trim()}" as New Product`
                                                : "Add New Product"
                                            }
                                            onAdd={(typed) =>
                                              openProductQA(
                                                {
                                                  serviceIndex,
                                                  floorIndex,
                                                  areaIndex,
                                                  prodIndex,
                                                },
                                                typed,
                                                srv.serviceId,
                                              )
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
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Total Items Quantity:{" "}
                    <span className="text-slate-900 dark:text-slate-100">
                      {totalQty}
                    </span>
                  </div>
                  <div className="text-base text-slate-800 dark:text-slate-200">
                    Grand Total Amount:{" "}
                    <span className="text-green-600 dark:text-green-400">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => requestNavigate("/quotation-list")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsNew}
              disabled={isSubmitting || isSavingNew}
              title="Keep current quotation as-is, save a copy as new quotation with today's date"
            >
              {isSavingNew ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Save as New
                </>
              )}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || hasFinishWorkDate}>
            {isSubmitting && !isSavingNew ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? "Save Changes" : "Save Quotation"}
              </>
            )}
          </Button>
        </div>
      </form>
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onStay={handleStay}
        onLeaveWithoutSaving={handleLeaveWithoutSaving}
        onSaveAndLeave={handleSaveAndLeave}
        isSaving={isSavingAndLeaving}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Line Item"
        description="Are you sure you want to delete this line item?"
        confirmText="Delete"
      />
      <ImportQuotationDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onApply={handleApplyImport}
        services={services}
        floors={floors}
        areas={areas}
        products={productsList}
        categories={categories}
      />
      {/* Floor / Area quick-add (dropdown footer "+ Add" ise kholta hai) */}
      <QuickNameDialog
        open={quickName.open}
        onClose={() =>
          !quickName.saving &&
          setQuickName({ open: false, type: "floor", target: null, name: "", saving: false })
        }
        onSave={saveQuickName}
        saving={quickName.saving}
        title={quickName.type === "floor" ? "Add New Floor" : "Add New Area"}
        label={quickName.type === "floor" ? "Floor Name" : "Area Name"}
        placeholder={
          quickName.type === "floor" ? "e.g. Second Floor" : "e.g. Living Room"
        }
        initialName={quickName.name}
      />
      {/* Product quick-add (product dropdown footer "+ Add Product" ise kholta hai) */}
      <ProductQuickAddDialog
        open={productQA.open}
        onClose={() =>
          !productQA.saving &&
          setProductQA({ open: false, target: null, serviceId: "", categoryId: "", name: "", saving: false })
        }
        onSave={saveProductQA}
        saving={productQA.saving}
        services={services}
        categories={categories}
        brands={brands}
        initialName={productQA.name}
        initialServiceId={productQA.serviceId}
        initialCategoryId={productQA.categoryId}
        brandSaving={brandSaving}
        onAddBrand={handleAddBrand}
      />
      {/* Service quick-add (service dropdown footer "+ Add Service" ise kholta hai) */}
      <ServiceQuickAddDialog
        open={serviceQA.open}
        onClose={() =>
          !serviceQA.saving &&
          setServiceQA({ open: false, target: null, name: "", saving: false })
        }
        onSave={saveServiceQA}
        saving={serviceQA.saving}
        initialName={serviceQA.name}
      />
      {/* Buyer quick-add dialog (single reusable SelectWithAdd ka Add button ise kholta hai) */}
      <Dialog
        open={buyerDialogOpen}
        onOpenChange={(open) => {
          if (!open && !createBuyerMutation.isPending) setBuyerDialogOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add New Buyer
            </DialogTitle>
            <DialogDescription>
              Quickly register a buyer without leaving the quotation form. It
              will be auto-selected after saving.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBuyer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Buyer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newBuyer.buyer_name}
                onChange={(e) =>
                  setNewBuyer((p) => ({ ...p, buyer_name: e.target.value }))
                }
                placeholder="Enter buyer name"
                autoFocus
              />
              {buyerFormErrors.buyer_name && (
                <p className="text-xs text-red-500">{buyerFormErrors.buyer_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newBuyer.buyer_mobile}
                  onChange={(e) =>
                    setNewBuyer((p) => ({
                      ...p,
                      buyer_mobile: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                />
                {buyerFormErrors.buyer_mobile && (
                  <p className="text-xs text-red-500">
                    {buyerFormErrors.buyer_mobile}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={newBuyer.buyer_email}
                  onChange={(e) =>
                    setNewBuyer((p) => ({ ...p, buyer_email: e.target.value }))
                  }
                  placeholder="Enter email"
                />
                {buyerFormErrors.buyer_email && (
                  <p className="text-xs text-red-500">
                    {buyerFormErrors.buyer_email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea
                value={newBuyer.buyer_address}
                onChange={(e) =>
                  setNewBuyer((p) => ({ ...p, buyer_address: e.target.value }))
                }
                placeholder="Enter address (optional)"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBuyerDialogOpen(false)}
                disabled={createBuyerMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBuyerMutation.isPending}>
                {createBuyerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Add Buyer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationFormPage;
