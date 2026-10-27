import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Loader2, Save, ArrowLeft, Plus, Trash2, CalendarDays, FileSpreadsheet, RefreshCw, GripVertical, CreditCard, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
import { useActiveServicesQuery, useCreateServiceMutation } from "../../service/hooks/useService";
import { useActiveCategoriesQuery } from "../../category/hooks/useCategory";
import { useActiveFloorsQuery, useCreateFloorMutation } from "../../floor/hooks/useFloor";
import { useActiveAreasQuery, useCreateAreaMutation } from "../../area/hooks/useArea";
import { useActiveBrandsQuery, useCreateBrandMutation } from "../../brand/hooks/useBrand";
import { useCreateProductMutation } from "../../product/hooks/useProduct";
import MemoizedSelect from "@/components/common/memoized-select";
import SelectWithAdd from "@/components/common/select-with-add";
import ConfirmDialog from "@/components/common/confirm-dialog";
import UnsavedChangesDialog from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import ImportQuotationDialog from "../components/ImportQuotationDialog";
import { QuickNameDialog, ProductQuickAddDialog, ServiceQuickAddDialog } from "../components/MasterQuickAddDialogs";
import { useQueryClient } from "@tanstack/react-query";
import { calculateMilestoneAmounts } from "@/utils/milestoneUtils";
import { buildProductOption, filterProductOption } from "@/utils/productSelectUtils";

let uidSeed = 0;
const createUid = (prefix = "item") =>
  `${prefix}_${Date.now()}_${++uidSeed}_${Math.random().toString(36).substring(2, 7)}`;

const createDefaultServices = () => [
  {
    _uid: createUid("srv"),
    serviceId: "",
    floors: [
      {
        _uid: createUid("flr"),
        floorId: "",
        areas: [
          {
            _uid: createUid("area"),
            areaId: "",
            products: [
              {
                _uid: createUid("prod"),
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

// Helper: Group flat subs to nested Services structure (Service -> Floor -> Area -> Product)
const groupSubsToServices = (subsList) => {
  if (!subsList || subsList.length === 0) {
    return createDefaultServices();
  }

  // NOTE: Map() used (not {}) — plain objects auto-sort integer-like keys,
  // which broke API order. Map keeps insertion order.
  const serviceMap = new Map();
  // Backend returns quotation_sub_sort. Sort ascending by quotation_sub_sort, fallback to id
  const orderedSubs = [...subsList].sort((a, b) => {
    const sA =
      a.quotation_sub_sort !== null &&
      a.quotation_sub_sort !== undefined &&
      a.quotation_sub_sort !== ""
        ? Number(a.quotation_sub_sort)
        : null;
    const sB =
      b.quotation_sub_sort !== null &&
      b.quotation_sub_sort !== undefined &&
      b.quotation_sub_sort !== ""
        ? Number(b.quotation_sub_sort)
        : null;

    if (sA !== null && sB !== null) return sA - sB;
    if (sA !== null) return -1;
    if (sB !== null) return 1;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  orderedSubs.forEach((item) => {
    const serviceId = item.quotation_sub_service_id?.toString() || "";
    const floorId = item.quotation_sub_floor_id?.toString() || "";
    const areaId = item.quotation_sub_area_id?.toString() || "";

    if (!serviceMap.has(serviceId)) {
      serviceMap.set(serviceId, {
        _uid: createUid("srv"),
        serviceId,
        floors: new Map(),
      });
    }
    const svc = serviceMap.get(serviceId);

    if (!svc.floors.has(floorId)) {
      svc.floors.set(floorId, {
        _uid: createUid("flr"),
        floorId,
        areas: new Map(),
      });
    }
    const flr = svc.floors.get(floorId);

    if (!flr.areas.has(areaId)) {
      flr.areas.set(areaId, {
        _uid: createUid("area"),
        areaId,
        products: [],
      });
    }

    flr.areas.get(areaId).products.push({
      _uid: createUid("prod"),
      id: item.id || null,
      quotation_sub_sort: item.quotation_sub_sort,
      productId: item.quotation_sub_product_id?.toString() || "",
      price: Number(item.quotation_sub_price) || 0,
      quantity: Number(item.quotation_sub_quantity) || 1,
      status: item.quotation_sub_status || "Pending",
      notes: item.quotation_sub_notes ?? item.project_sub_notes ?? "",
    });
  });

  return [...serviceMap.values()].map((srv) => ({
    _uid: srv._uid,
    serviceId: srv.serviceId,
    floors: [...srv.floors.values()].map((f) => ({
      _uid: f._uid,
      floorId: f.floorId,
      areas: [...f.areas.values()].map((a) => ({
        _uid: a._uid,
        areaId: a.areaId,
        products: a.products,
      })),
    })),
  }));
};

// Helper: Flatten nested Services structure to subs array with sequential quotation_sub_sort
const flattenServicesToSubs = (servicesList) => {
  const flattened = [];
  let sortIndex = 1;
  servicesList.forEach((srv) => {
    srv.floors.forEach((floor) => {
      floor.areas.forEach((area) => {
        area.products.forEach((product) => {
          if (product.productId) {
            flattened.push({
              id: product.id || undefined,
              quotation_sub_sort: sortIndex,
              project_sub_sort: sortIndex,
              sub_sort: sortIndex,
              sort: sortIndex++,
              quotation_sub_service_id: Number(srv.serviceId),
              quotation_sub_floor_id: Number(floor.floorId),
              quotation_sub_area_id: Number(area.areaId),
              quotation_sub_product_id: Number(product.productId),
              quotation_sub_price: Number(product.price),
              quotation_sub_quantity: Number(product.quantity),
              quotation_sub_amount: Number(product.price) * Number(product.quantity),
              quotation_sub_status: product.status || "Pending",
              quotation_sub_notes: product.notes || "",
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
    quotation_booing_confirmation: 30,
    quotation_hardware: 60,
    quotation_installation: 10,
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
                  notes: "",
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
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  // Create mode: Services + Categories sab default selected rahenge
  const revDefaultsAppliedRef = useRef(false);

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
  const { data: propertiesData, isLoading: propertiesLoading } = useActivePropertiesQuery();
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } = useActiveServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useActiveCategoriesQuery();
  const { data: floorsData, isLoading: floorsLoading, refetch: refetchFloors } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading, refetch: refetchAreas } = useActiveAreasQuery();
  const { data: brandsData, isLoading: brandsLoading, refetch: refetchBrands } = useActiveBrandsQuery();

  // Fetch parent quotation for prefilling revised quote details on CREATE mode, and checking finish work date
  const { data: parentQuotationData, isLoading: parentLoading } = useQuotationQuery(parentId);
  const parentFinishWorkDate = parentQuotationData?.data?.quotation_finish_work_date;
  const parentStatus = parentQuotationData?.data?.quotation_status;
  // After parent Approved/Project -> view-only, block create/edit (direct URL guard included)
  const isParentApprovedLocked = parentStatus === "Approved" || parentStatus === "Project";
  const isLocked = Boolean(parentFinishWorkDate) || isParentApprovedLocked;

  // Fetch revised quotation on EDIT mode
  const { data: revQuotationData, isLoading: revLoading, isError, refetch } = useRevQuotationQuery(revId, isEdit);

  // Fetch products matching selected categories and services
  const { data: productsData, isLoading: productsLoading, refetch: refetchQuotationProducts } = useGetProductsForQuotationQuery(
    formData.quotation_category_id,
    formData.quotation_service_id,
    Boolean(formData.quotation_category_id && formData.quotation_service_id)
  );

  const productsList = productsData?.data || [];
  const queryClient = useQueryClient();

  // TanStack Mutations
  const createRevQuotationMutation = useCreateRevQuotationMutation();
  const updateRevQuotationMutation = useUpdateRevQuotationMutation();
  const deleteRevSubMutation = useDeleteRevQuotationSubMutation();
  // Master quick-add mutations (Floor / Area / Brand / Product / Service — inline)
  const createFloorMutation = useCreateFloorMutation();
  const createAreaMutation = useCreateAreaMutation();
  const createBrandMutation = useCreateBrandMutation();
  const createProductMutation = useCreateProductMutation();
  const createServiceMutation = useCreateServiceMutation();

  const isSubmitting = createRevQuotationMutation.isPending || updateRevQuotationMutation.isPending;

  // Master quick-add state (Floor / Area / Product / Service)
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
        const newSvc = found.service_id?.toString() || "";
        if (newSvc && srv?.serviceId && newSvc !== srv.serviceId?.toString()) {
          const svcName =
            services.find((s) => s.id?.toString() === newSvc)?.service_name ||
            found.service_name ||
            newSvc;
          handleNestedFieldChange(
            target.serviceIndex,
            null,
            null,
            null,
            "serviceId",
            newSvc
          );
          setFormData((prev) => {
            const cur = prev.quotation_service_id
              ? prev.quotation_service_id.split(",")
              : [];
            if (cur.includes(newSvc)) return prev;
            return { ...prev, quotation_service_id: [...cur, newSvc].join(",") };
          });
          toast.info(`New product is under '${svcName}' — row switched to it`);
        }
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

  // 1. Prefill from parent quotation on CREATE mode
  useEffect(() => {
    if (isEdit || revDefaultsAppliedRef.current) return;
    if (!parentQuotationData?.data) return;

    const parent = parentQuotationData.data;
    const categoriesReady = Array.isArray(categoriesData?.data);
    const servicesReady = Array.isArray(servicesData?.data);
    const allCategoryIds = categoriesReady
      ? categoriesData.data
          .map((c) => c.id?.toString())
          .filter(Boolean)
          .join(",")
      : "";
    const allServiceIds = servicesReady
      ? servicesData.data
          .map((s) => s.id?.toString())
          .filter(Boolean)
          .join(",")
      : "";

    const nextForm = {
      quotation_id: parent.id?.toString() || parentId,
      quotation_date_rev: new Date().toISOString().split("T")[0],
      quotation_buyer_id: parent.quotation_buyer_id?.toString() || "",
      quotation_property_id: parent.quotation_property_id?.toString() || "",
      // Create mode: sab Categories + Services default selected
      quotation_category_id: allCategoryIds || parent.quotation_category_id || "",
      quotation_service_id: allServiceIds || parent.quotation_service_id || "",
      quotation_remarks: parent.quotation_remarks || "",
      quotation_status: "Pending",
      quotation_booing_confirmation:
        parent.quotation_booing_confirmation ??
        parent.quotation_booking_confirmation ??
        30,
      quotation_hardware: parent.quotation_hardware ?? 60,
      quotation_installation: parent.quotation_installation ?? 10,
    };
    setFormData(nextForm);

    let nextServices = null;
    if (parent.subs && Array.isArray(parent.subs) && parent.subs.length > 0) {
      nextServices = groupSubsToServices(parent.subs);
      setServicesState(nextServices);
    }
    setInitialSnapshot(
      JSON.stringify({
        formData: nextForm,
        servicesState:
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
          ],
      })
    );

    // Masters load hone ke baad ek hi baar apply karo (refetch par user edits na ude)
    if (categoriesReady && servicesReady) {
      revDefaultsAppliedRef.current = true;
    }
  }, [isEdit, parentQuotationData, parentId, categoriesData, servicesData]);

  // 2. Populate from revised quotation on EDIT mode
  useEffect(() => {
    if (isEdit && revQuotationData?.data) {
      const rev = revQuotationData.data;
      const nextForm = {
        quotation_id: rev.quotation_id?.toString() || parentId,
        quotation_date_rev: rev.quotation_date_rev || "",
        quotation_buyer_id: rev.quotation_buyer_id?.toString() || "",
        quotation_property_id: rev.quotation_property_id?.toString() || "",
        quotation_category_id: rev.quotation_category_id || "",
        quotation_service_id: rev.quotation_service_id || "",
        quotation_remarks: rev.quotation_remarks || "",
        quotation_status: rev.quotation_status || "Pending",
        quotation_booing_confirmation:
          rev.quotation_booing_confirmation ??
          rev.quotation_booking_confirmation ??
          30,
        quotation_hardware: rev.quotation_hardware ?? 60,
        quotation_installation: rev.quotation_installation ?? 10,
      };
      setFormData(nextForm);

      let nextServices = null;
      if (rev.subs && Array.isArray(rev.subs) && rev.subs.length > 0) {
        nextServices = groupSubsToServices(rev.subs);
        setServicesState(nextServices);
      }
      setInitialSnapshot(
        JSON.stringify({
          formData: nextForm,
          servicesState:
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
            ],
        })
      );
    }
  }, [isEdit, revQuotationData, parentId]);

  const snapshotKey = useMemo(
    () => JSON.stringify({ formData, servicesState }),
    [formData, servicesState]
  );
  const isDirty = useMemo(
    () => Boolean(initialSnapshot && snapshotKey !== initialSnapshot),
    [initialSnapshot, snapshotKey]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      quotation_booing_confirmation: "",
    }));
  };

  // Nested State Actions
  const addService = () => {
    setServicesState((prev) => [
      ...prev,
      {
        _uid: createUid("srv"),
        serviceId: "",
        floors: [
          {
            _uid: createUid("flr"),
            floorId: "",
            areas: [
              {
                _uid: createUid("area"),
                areaId: "",
                products: [
                  {
                    _uid: createUid("prod"),
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
    srv.floors.forEach((floor) => {
      floor.areas.forEach((area) => {
        area.products.forEach((p) => {
          if (p.id) ids.push(p.id);
        });
      });
    });

    if (ids.length > 0) {
      setPendingDelete({
        type: "service",
        ids,
        indices: { serviceIndex },
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
        _uid: createUid("flr"),
        floorId: "",
        areas: [
          {
            _uid: createUid("area"),
            areaId: "",
            products: [
              {
                _uid: createUid("prod"),
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
    floor.areas.forEach((area) => {
      area.products.forEach((p) => {
        if (p.id) ids.push(p.id);
      });
    });

    if (ids.length > 0) {
      setPendingDelete({
        type: "floor",
        ids,
        indices: { serviceIndex, floorIndex },
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors = updated[serviceIndex].floors.filter(
          (_, i) => i !== floorIndex,
        );
        return updated;
      });
    }
  };

  const addArea = (serviceIndex, floorIndex) => {
    setServicesState((prev) => {
      const updated = [...prev];
      updated[serviceIndex].floors[floorIndex].areas.push({
        _uid: createUid("area"),
        areaId: "",
        products: [
          {
            _uid: createUid("prod"),
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
    const area =
      servicesState[serviceIndex].floors[floorIndex].areas[areaIndex];
    const ids = area.products.map((p) => p.id).filter(Boolean);

    if (ids.length > 0) {
      setPendingDelete({
        type: "area",
        ids,
        indices: { serviceIndex, floorIndex, areaIndex },
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors[floorIndex].areas = updated[
          serviceIndex
        ].floors[floorIndex].areas.filter((_, i) => i !== areaIndex);
        return updated;
      });
    }
  };

  const addProduct = (serviceIndex, floorIndex, areaIndex) => {
    setServicesState((prev) => {
      const updated = [...prev];
      updated[serviceIndex].floors[floorIndex].areas[areaIndex].products.push({
        _uid: createUid("prod"),
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
        indices: { serviceIndex, floorIndex, areaIndex, productIndex },
      });
      setConfirmOpen(true);
    } else {
      setServicesState((prev) => {
        const updated = [...prev];
        updated[serviceIndex].floors[floorIndex].areas[
          areaIndex
        ].products = updated[serviceIndex].floors[floorIndex].areas[
          areaIndex
        ].products.filter((_, i) => i !== productIndex);
        return updated;
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { type, ids, indices } = pendingDelete;
    try {
      if (ids && ids.length > 0) {
        await Promise.all(ids.map((id) => deleteRevSubMutation.mutateAsync(id)));
        toast.success("Revised items deleted successfully");
      }

      setServicesState((prev) => {
        const updated = [...prev];
        if (type === "product") {
          const { serviceIndex, floorIndex, areaIndex, productIndex } = indices;
          updated[serviceIndex].floors[floorIndex].areas[
            areaIndex
          ].products = updated[serviceIndex].floors[floorIndex].areas[
            areaIndex
          ].products.filter((_, i) => i !== productIndex);
        } else if (type === "area") {
          const { serviceIndex, floorIndex, areaIndex } = indices;
          updated[serviceIndex].floors[floorIndex].areas = updated[
            serviceIndex
          ].floors[floorIndex].areas.filter((_, i) => i !== areaIndex);
        } else if (type === "floor") {
          const { serviceIndex, floorIndex } = indices;
          updated[serviceIndex].floors = updated[
            serviceIndex
          ].floors.filter((_, i) => i !== floorIndex);
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

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setServicesState((prev) => {
      const updated = [...prev];

      if (type === "service") {
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        return updated;
      }

      if (type === "floor") {
        const sIdx = Number(source.droppableId.replace("floors-", ""));
        const destSIdx = Number(destination.droppableId.replace("floors-", ""));
        if (sIdx !== destSIdx) return prev;
        const floors = [...updated[sIdx].floors];
        const [moved] = floors.splice(source.index, 1);
        floors.splice(destination.index, 0, moved);
        updated[sIdx] = { ...updated[sIdx], floors };
        return updated;
      }

      if (type === "area") {
        const [, sIdxStr, fIdxStr] = source.droppableId.split("-");
        const [, destSIdxStr, destFIdxStr] = destination.droppableId.split("-");
        const sIdx = Number(sIdxStr);
        const fIdx = Number(fIdxStr);
        const destSIdx = Number(destSIdxStr);
        const destFIdx = Number(destFIdxStr);
        if (sIdx !== destSIdx || fIdx !== destFIdx) return prev;
        const areas = [...updated[sIdx].floors[fIdx].areas];
        const [moved] = areas.splice(source.index, 1);
        areas.splice(destination.index, 0, moved);
        const floors = [...updated[sIdx].floors];
        floors[fIdx] = { ...floors[fIdx], areas };
        updated[sIdx] = { ...updated[sIdx], floors };
        return updated;
      }

      if (type === "product") {
        const [, sIdxStr, fIdxStr, aIdxStr] = source.droppableId.split("-");
        const [, destSIdxStr, destFIdxStr, destAIdxStr] = destination.droppableId.split("-");
        const sIdx = Number(sIdxStr);
        const fIdx = Number(fIdxStr);
        const aIdx = Number(aIdxStr);
        const destSIdx = Number(destSIdxStr);
        const destFIdx = Number(destFIdxStr);
        const destAIdx = Number(destAIdxStr);

        // Within same area
        if (sIdx === destSIdx && fIdx === destFIdx && aIdx === destAIdx) {
          const prods = [...updated[sIdx].floors[fIdx].areas[aIdx].products];
          const [moved] = prods.splice(source.index, 1);
          prods.splice(destination.index, 0, moved);

          const areas = [...updated[sIdx].floors[fIdx].areas];
          areas[aIdx] = { ...areas[aIdx], products: prods };
          const floors = [...updated[sIdx].floors];
          floors[fIdx] = { ...floors[fIdx], areas };
          updated[sIdx] = { ...updated[sIdx], floors };
          return updated;
        }

        // Cross-area product move
        const sourceProds = [...updated[sIdx].floors[fIdx].areas[aIdx].products];
        const destProds = [...updated[destSIdx].floors[destFIdx].areas[destAIdx].products];
        const [moved] = sourceProds.splice(source.index, 1);
        destProds.splice(destination.index, 0, moved);

        const srcAreas = [...updated[sIdx].floors[fIdx].areas];
        srcAreas[aIdx] = { ...srcAreas[aIdx], products: sourceProds };
        const srcFloors = [...updated[sIdx].floors];
        srcFloors[fIdx] = { ...srcFloors[fIdx], areas: srcAreas };
        updated[sIdx] = { ...updated[sIdx], floors: srcFloors };

        const dstAreas = [...updated[destSIdx].floors[destFIdx].areas];
        dstAreas[destAIdx] = { ...dstAreas[destAIdx], products: destProds };
        const dstFloors = [...updated[destSIdx].floors];
        dstFloors[destFIdx] = { ...dstFloors[destFIdx], areas: dstAreas };
        updated[destSIdx] = { ...updated[destSIdx], floors: dstFloors };

        return updated;
      }

      return prev;
    });
  };

  const findProductById = (pid) =>
    [...productsList, ...catProductsList, ...(extraProducts || [])].find(
      (p) => p.id?.toString() === pid?.toString(),
    );

  const handleNestedFieldChange = (
    serviceIndex,
    floorIndex,
    areaIndex,
    productIndex,
    field,
    value,
    matchedProduct = null,
  ) => {
    setServicesState((prev) => {
      const updated = [...prev];
      if (productIndex !== null) {
        // Product change
        const product = updated[serviceIndex].floors[floorIndex].areas[areaIndex].products[productIndex];
        product[field] = value;

        if (field === "productId") {
          const matchedProd =
            matchedProduct ||
            findProductById(value);
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

  // Error wale field par scroll + focus, taaki user ko dhoondhna na pade
  const focusErrorField = (field) => {
    if (!field) return;
    const target = document.querySelector(`[data-error-field="${field}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    const isDirectControl = target.matches("button, select, textarea, input");
    const innerInput = isDirectControl
      ? target
      : target.querySelector(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

    // react-select ka asli control dhoondo (jispar 1px border hai) —
    // wrapper par alag ring lagane ki zaroorat nahi.
    let control = null;
    if (isDirectControl) {
      control = target;
    } else if (innerInput && innerInput.type !== "checkbox") {
      let el = innerInput;
      while (el && el !== target) {
        if (parseFloat(window.getComputedStyle(el).borderTopWidth) > 0) {
          control = el;
          break;
        }
        el = el.parentElement;
      }
    }

    // Extra ring nahi — control ka apna border hi red ho jaye
    if (control) {
      const prevBorder = control.style.borderColor;
      const prevShadow = control.style.boxShadow;
      control.style.borderColor = "rgb(239, 68, 68)";
      control.style.boxShadow = "0 0 0 1px rgb(239, 68, 68)";
      const clearError = () => {
        control.style.borderColor = prevBorder;
        control.style.boxShadow = prevShadow;
        target.removeEventListener("focusout", clearError);
      };
      target.addEventListener("focusout", clearError, { once: true });
    }

    if (innerInput) {
      window.setTimeout(() => {
        try {
          innerInput.focus({ preventScroll: true });
        } catch {
          innerInput.focus();
        }
      }, 350);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.quotation_buyer_id)
      newErrors.quotation_buyer_id = "Lead is required";
    if (!formData.quotation_property_id)
      newErrors.quotation_property_id = "Property is required";

    if (newErrors.quotation_buyer_id || newErrors.quotation_property_id) {
      toast.error("Please select a Lead and Property at the top of the form.");
      setErrors(newErrors);
      focusErrorField(
        newErrors.quotation_buyer_id ? "buyer" : "property"
      );
      return false;
    }

    if (!formData.quotation_category_id) {
      toast.error("Please select at least one Category");
      focusErrorField("categories");
      return false;
    }
    if (!formData.quotation_service_id) {
      toast.error("Please select at least one Service");
      focusErrorField("services");
      return false;
    }

    let hasLineItems = false;
    for (let s = 0; s < servicesState.length; s++) {
      const srv = servicesState[s];
      if (!srv.serviceId) {
        toast.error(`Please select a Service in Service block #${s + 1}`);
        focusErrorField(`service-${s}`);
        return false;
      }
      for (let f = 0; f < srv.floors.length; f++) {
        const floor = srv.floors[f];
        if (!floor.floorId) {
          toast.error(`Please select a Floor under Service block #${s + 1}, floor block #${f + 1}`);
          focusErrorField(`floor-${s}-${f}`);
          return false;
        }
        for (let a = 0; a < floor.areas.length; a++) {
          const area = floor.areas[a];
          if (!area.areaId) {
            toast.error(`Please select an Area under Service block #${s + 1}, Floor block #${f + 1}, area block #${a + 1}`);
            focusErrorField(`area-${s}-${f}-${a}`);
            return false;
          }
          for (let p = 0; p < area.products.length; p++) {
            const prod = area.products[p];
            if (!prod.productId) {
              toast.error(`Please complete Product selection under Service #${s + 1} ➔ Floor #${f + 1} ➔ Area #${a + 1}, product #${p + 1}`);
              focusErrorField(`product-${s}-${f}-${a}-${p}`);
              return false;
            }
            hasLineItems = true;
          }
        }
      }
    }

    if (!hasLineItems) {
      toast.error("Please add at least one line item");
      focusErrorField("line-items");
      return false;
    }

    const totalMilestones =
      (Number(formData.quotation_booing_confirmation) || 0) +
      (Number(formData.quotation_hardware) || 0) +
      (Number(formData.quotation_installation) || 0);
    if (totalMilestones !== 100) {
      toast.error(`Payment milestones must total 100% (Current: ${totalMilestones}%)`);
      newErrors.quotation_booing_confirmation = `Total must be 100% (Current: ${totalMilestones}%)`;
      setErrors(newErrors);
      focusErrorField("quotation_booing_confirmation");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildRevPayload = () => {
    const flattenedSubs = flattenServicesToSubs(servicesState);
    const bookingPct = Number(formData.quotation_booing_confirmation ?? 30);
    const hardwarePct = Number(formData.quotation_hardware ?? 60);
    const installationPct = Number(formData.quotation_installation ?? 10);
    return {
      ...formData,
      quotation_id: Number(formData.quotation_id),
      quotation_buyer_id: Number(formData.quotation_buyer_id),
      quotation_property_id: Number(formData.quotation_property_id),
      quotation_booing_confirmation: bookingPct,
      quotation_booking_confirmation: bookingPct,
      quotation_hardware: hardwarePct,
      quotation_installation: installationPct,
      subs: flattenedSubs,
    };
  };

  const saveRevWithoutNavigate = async () => {
    if (!validateForm()) return false;
    const payload = buildRevPayload();
    try {
      if (isEdit) {
        await updateRevQuotationMutation.mutateAsync({ id: revId, data: payload });
        toast.success("Revised quotation updated successfully");
        setInitialSnapshot(snapshotKey);
        refetch?.();
        return true;
      } else {
        const res = await createRevQuotationMutation.mutateAsync(payload);
        const created = res?.data?.data || res?.data || res;
        const newRevId =
          created?.id?.toString() ||
          res?.data?.id?.toString() ||
          res?.id?.toString() ||
          "";
        toast.success("Revised quotation created successfully");
        setInitialSnapshot(snapshotKey);
        return newRevId || true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save revised quotation");
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
  } = useUnsavedChangesGuard({ isDirty, onSave: saveRevWithoutNavigate });

  // Save ke baad hamesha previous screen (revisions list) par wapas jao.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(
        isParentApprovedLocked
          ? "Parent quotation is approved. Revised quotations cannot be created or edited."
          : "Parent quotation is finalized. Revisions cannot be created or edited."
      );
      return;
    }
    const result = await saveRevWithoutNavigate();
    if (!result) return;
    const destinationParentId = parentId || formData.quotation_id;
    navigate(
      destinationParentId
        ? `/quotation-list/revised/${destinationParentId}`
        : "/quotation-list",
      { replace: true }
    );
  };

  const buyers = buyersData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];
  const brands = brandsData?.data || [];

  const checkedCategories = formData.quotation_category_id ? formData.quotation_category_id.split(",") : [];
  const checkedServices = formData.quotation_service_id ? formData.quotation_service_id.split(",") : [];

  // Empty-dropdown hint: selected categories ke products asli me KIS service
  // ke neeche hai (e.g. Frame → Smart Switches, not Electrical Automation).
  // Sirf guidance text hai — filter logic bilkul untouched.
  const allServiceIds = services.map((s) => s.id).join(",");
  const { data: catProductsData } = useGetProductsForQuotationQuery(
    formData.quotation_category_id,
    allServiceIds,
    Boolean(formData.quotation_category_id && allServiceIds)
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

  const getProductOption = (p) => {
    const brandName =
      brands.find((b) => b.id?.toString() === p?.brand_id?.toString())
        ?.brand_name || "";
    const catName =
      categories.find((c) => c.id?.toString() === p?.category_id?.toString())
        ?.category_name || "";
    return buildProductOption(p, brandName, catName);
  };

  // API can return the same product row more than once (multiple category /
  // service matches). Keep one option per product id.
  const dedupeProducts = (list = []) => {
    const seenIds = new Set();
    return list.filter((p) => {
      const id = p?.id?.toString();
      if (!id) return true;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  };

  // Row product options: STRICT — only products of this row's Service.
  // Dusri service ka product dikhega hi nahi; khaali ho to hint bolega.
  // Auto-switch nahi hoga.
  const getRevRowProductOptions = (rowServiceId) => {
    if (!rowServiceId) return [];
    const sid = rowServiceId?.toString();
    const matched = dedupeProducts(
      productsList.filter((p) => p.service_id?.toString() === sid)
    );
    const pool = matched.length > 0 ? matched : dedupeProducts(
      catProductsList.filter((p) => p.service_id?.toString() === sid)
    );
    const merged = [...pool];
    const seen = new Set(pool.map((p) => p.id?.toString()));
    (extraProducts || []).forEach((e) => {
      if (
        e?.service_id?.toString() === sid &&
        !seen.has(e.id?.toString())
      ) {
        merged.push(e);
        seen.add(e.id?.toString());
      }
    });
    return dedupeProducts(merged);
  };

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

  const isFormLoading =
    buyersLoading ||
    propertiesLoading ||
    servicesLoading ||
    categoriesLoading ||
    floorsLoading ||
    areasLoading ||
    brandsLoading ||
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

  const milestoneTotal =
    (Number(formData.quotation_booing_confirmation) || 0) +
    (Number(formData.quotation_hardware) || 0) +
    (Number(formData.quotation_installation) || 0);

  const milestoneAmounts = calculateMilestoneAmounts(totalAmount, [
    formData.quotation_booing_confirmation ?? 30,
    formData.quotation_hardware ?? 60,
    formData.quotation_installation ?? 10,
  ]);

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
          <Button variant="outline" onClick={() => requestNavigate(`/quotation-list/revised/${parentId}`)}>
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

      {!parentFinishWorkDate && isParentApprovedLocked && (
        <div className="mt-4 bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-300 p-4 rounded-xl flex items-center gap-3">
          <FileText className="h-5 w-5 text-slate-500" />
          <div>
            <p className="font-semibold text-sm">Parent Quotation Approved — View Only</p>
            <p className="text-xs opacity-90">This quotation is approved. You can check details, but revisions cannot be created or edited.</p>
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
              <div className="space-y-2" data-error-field="buyer">
                <Label>Lead</Label>
                <select
                  name="quotation_buyer_id"
                  value={formData.quotation_buyer_id}
                  disabled
                  className="w-full border rounded-md h-10 px-3 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 text-sm"
                >
                  <option value="">Select Lead</option>
                  {buyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.buyer_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property (Read-only reference) */}
              <div className="space-y-2" data-error-field="property">
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
                <div
                  className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg max-h-[160px] overflow-y-auto"
                  data-error-field="categories"
                >
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
                <div
                  className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg max-h-[160px] overflow-y-auto"
                  data-error-field="services"
                >
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
                    <option value="Project">Project</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Milestones Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Milestones (%)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set milestone percentage distribution as per requirement (must total 100%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    milestoneTotal === 100
                      ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {milestoneTotal === 100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  Total: {milestoneTotal}%
                </span>
                {(Number(formData.quotation_booing_confirmation) !== 30 ||
                  Number(formData.quotation_hardware) !== 60 ||
                  Number(formData.quotation_installation) !== 10) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        quotation_booing_confirmation: 30,
                        quotation_hardware: 60,
                        quotation_installation: 10,
                      }));
                    }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset (30 / 60 / 10)
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Milestone 1 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    1. Booking Confirmation
                  </Label>
                  <span className="text-xs font-bold text-primary">
                    {formData.quotation_booing_confirmation ?? 30}%
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    name="quotation_booing_confirmation"
                    data-error-field="quotation_booing_confirmation"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.quotation_booing_confirmation ?? ""}
                    onChange={handleInputChange}
                    className={`pr-8 bg-white dark:bg-slate-900 ${
                      errors.quotation_booing_confirmation
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                    placeholder="30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  Upon booking confirmation
                </p>
                {totalAmount > 0 && (
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 border-t dark:border-slate-800/80">
                    ≈ ₹{milestoneAmounts[0].toLocaleString()}
                  </div>
                )}
              </div>

              {/* Milestone 2 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    2. Hardware Dispatch
                  </Label>
                  <span className="text-xs font-bold text-primary">
                    {formData.quotation_hardware ?? 60}%
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    name="quotation_hardware"
                    data-error-field="quotation_hardware"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.quotation_hardware ?? ""}
                    onChange={handleInputChange}
                    className={`pr-8 bg-white dark:bg-slate-900 ${
                      errors.quotation_booing_confirmation
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                    placeholder="60"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  Upon hardware ordering & dispatch
                </p>
                {totalAmount > 0 && (
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 border-t dark:border-slate-800/80">
                    ≈ ₹{milestoneAmounts[1].toLocaleString()}
                  </div>
                )}
              </div>

              {/* Milestone 3 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    3. Installation & Handover
                  </Label>
                  <span className="text-xs font-bold text-primary">
                    {formData.quotation_installation ?? 10}%
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    name="quotation_installation"
                    data-error-field="quotation_installation"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.quotation_installation ?? ""}
                    onChange={handleInputChange}
                    className={`pr-8 bg-white dark:bg-slate-900 ${
                      errors.quotation_booing_confirmation
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  Upon installation & pre-commissioning
                </p>
                {totalAmount > 0 && (
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 border-t dark:border-slate-800/80">
                    ≈ ₹{milestoneAmounts[2].toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {errors.quotation_booing_confirmation && (
              <p className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.quotation_booing_confirmation}
              </p>
            )}
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
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                Import from Excel / TSV
              </Button> */}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="services-root" type="service">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-8"
                  >
                    {servicesState.map((srv, serviceIndex) => (
                      <Draggable
                        key={srv._uid || `srv-${serviceIndex}`}
                        draggableId={srv._uid || `srv-${serviceIndex}`}
                        index={serviceIndex}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={dragProvided.draggableProps.style}
                            className={`p-5 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 shadow-sm space-y-4 transition-all duration-150 ${
                              dragSnapshot.isDragging
                                ? "shadow-2xl ring-2 ring-primary/50 bg-white dark:bg-slate-900 z-50 opacity-95"
                                : ""
                            }`}
                          >
                            {/* Service Header */}
                            <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-3">
                              <div
                                className="flex items-center gap-3 w-full md:w-1/3"
                                data-error-field={`service-${serviceIndex}`}
                              >
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
                                    openServiceQA({ serviceIndex }, typed)
                                  }
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                <div
                                  {...dragProvided.dragHandleProps}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                                  title="Drag to reorder Service"
                                >
                                  <GripVertical size={18} />
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
                            </div>

                            {/* Timeline Floors List */}
                            <Droppable
                              droppableId={`floors-${serviceIndex}`}
                              type="floor"
                            >
                              {(floorProvided) => (
                                <div
                                  ref={floorProvided.innerRef}
                                  {...floorProvided.droppableProps}
                                  className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6"
                                >
                                  {srv.floors.map((floor, floorIndex) => (
                                    <Draggable
                                      key={floor._uid || `flr-${serviceIndex}-${floorIndex}`}
                                      draggableId={floor._uid || `flr-${serviceIndex}-${floorIndex}`}
                                      index={floorIndex}
                                    >
                                      {(flrDragProvided, flrDragSnapshot) => (
                                        <div
                                          ref={flrDragProvided.innerRef}
                                          {...flrDragProvided.draggableProps}
                                          style={flrDragProvided.draggableProps.style}
                                          className={`relative space-y-4 rounded-lg transition-all duration-150 ${
                                            flrDragSnapshot.isDragging
                                              ? "p-3 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-blue-500/50 z-40 opacity-95"
                                              : ""
                                          }`}
                                        >
                                          {/* Bullet for Floor */}
                                          <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-blue-600 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                          </div>

                                          {/* Floor Header */}
                                          <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-2">
                                            <div
                                              className="flex items-center gap-3 w-full md:w-1/3"
                                              data-error-field={`floor-${serviceIndex}-${floorIndex}`}
                                            >
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

                                            <div className="flex items-center gap-1">
                                              <div
                                                {...flrDragProvided.dragHandleProps}
                                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                                                title="Drag to reorder Floor"
                                              >
                                                <GripVertical size={16} />
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
                                          </div>

                                          {/* Timeline Areas List */}
                                          <Droppable
                                            droppableId={`areas-${serviceIndex}-${floorIndex}`}
                                            type="area"
                                          >
                                            {(areaProvided) => (
                                              <div
                                                ref={areaProvided.innerRef}
                                                {...areaProvided.droppableProps}
                                                className="relative pl-6 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-4 space-y-6"
                                              >
                                                {floor.areas.map((area, areaIndex) => (
                                                  <Draggable
                                                    key={area._uid || `area-${serviceIndex}-${floorIndex}-${areaIndex}`}
                                                    draggableId={area._uid || `area-${serviceIndex}-${floorIndex}-${areaIndex}`}
                                                    index={areaIndex}
                                                  >
                                                    {(areaDragProvided, areaDragSnapshot) => (
                                                      <div
                                                        ref={areaDragProvided.innerRef}
                                                        {...areaDragProvided.draggableProps}
                                                        style={areaDragProvided.draggableProps.style}
                                                        className={`relative space-y-3 pt-1 rounded-lg transition-all duration-150 ${
                                                          areaDragSnapshot.isDragging
                                                            ? "p-2 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-amber-500/50 z-30 opacity-95"
                                                            : ""
                                                        }`}
                                                      >
                                                        {/* Bullet for Area */}
                                                        <div className="absolute -left-[31px] top-3.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-amber-600 flex items-center justify-center">
                                                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                        </div>

                                                        {/* Area Header */}
                                                        <div className="flex items-center justify-between gap-4">
                                                          <div
                                                            className="flex items-center gap-3 w-full md:w-1/3"
                                                            data-error-field={`area-${serviceIndex}-${floorIndex}-${areaIndex}`}
                                                          >
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
                                                                  {
                                                                    serviceIndex,
                                                                    floorIndex,
                                                                    areaIndex,
                                                                  },
                                                                  typed,
                                                                )
                                                              }
                                                            />
                                                          </div>

                                                          <div className="flex items-center gap-1">
                                                            <div
                                                              {...areaDragProvided.dragHandleProps}
                                                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                                                              title="Drag to reorder Area"
                                                            >
                                                              <GripVertical size={16} />
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

                                                          <Droppable
                                                            droppableId={`products-${serviceIndex}-${floorIndex}-${areaIndex}`}
                                                            type="product"
                                                          >
                                                            {(prodDroppableProvided) => (
                                                              <div
                                                                ref={prodDroppableProvided.innerRef}
                                                                {...prodDroppableProvided.droppableProps}
                                                                className="space-y-2"
                                                              >
                                                                {area.products.map((prod, prodIndex) => {
                                                                  const rowAmount =
                                                                    (Number(prod.price) || 0) *
                                                                    (Number(prod.quantity) || 0);

                                                                  return (
                                                                    <Draggable
                                                                      key={prod._uid || `prod-${serviceIndex}-${floorIndex}-${areaIndex}-${prodIndex}`}
                                                                      draggableId={prod._uid || `prod-${serviceIndex}-${floorIndex}-${areaIndex}-${prodIndex}`}
                                                                      index={prodIndex}
                                                                    >
                                                                      {(prodDragProvided, prodDragSnapshot) => (
                                                                        <div
                                                                          ref={prodDragProvided.innerRef}
                                                                          {...prodDragProvided.draggableProps}
                                                                          style={prodDragProvided.draggableProps.style}
                                                                          className={`grid grid-cols-1 md:grid-cols-6 gap-3 items-center border-b dark:border-slate-800/60 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0 rounded p-1 transition-all duration-150 ${
                                                                            prodDragSnapshot.isDragging
                                                                              ? "bg-white dark:bg-slate-900 shadow-xl ring-2 ring-primary/50 z-20 opacity-95"
                                                                              : "bg-transparent"
                                                                          }`}
                                                                        >
                                                                          {/* Product select */}
                                                                          <div
                                                                            className="col-span-3"
                                                                            data-error-field={`product-${serviceIndex}-${floorIndex}-${areaIndex}-${prodIndex}`}
                                                                          >
                                                                            <SelectWithAdd
                                                                              options={getRevRowProductOptions(
                                                                                srv.serviceId,
                                                                              ).map(getProductOption)}
                                                                              filterOption={filterProductOption}
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
                                                                            <div className="flex items-center gap-0.5">
                                                                              <div
                                                                                {...prodDragProvided.dragHandleProps}
                                                                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                                title="Drag to reorder Product"
                                                                              >
                                                                                <GripVertical size={16} />
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

                                                                          {/* Remark / Notes (per item) */}
                                                                          <div className="col-span-full">
                                                                            <Input
                                                                              value={prod.notes || ""}
                                                                              onChange={(e) =>
                                                                                handleNestedFieldChange(
                                                                                  serviceIndex,
                                                                                  floorIndex,
                                                                                  areaIndex,
                                                                                  prodIndex,
                                                                                  "notes",
                                                                                  e.target.value,
                                                                                )
                                                                              }
                                                                              className="h-8 text-xs bg-transparent border-slate-200 dark:border-slate-800"
                                                                              placeholder="Remark / Notes (optional) — shown in the report"
                                                                            />
                                                                          </div>
                                                                        </div>
                                                                      )}
                                                                    </Draggable>
                                                                  );
                                                                })}
                                                                {prodDroppableProvided.placeholder}
                                                              </div>
                                                            )}
                                                          </Droppable>

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
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {areaProvided.placeholder}
                                              </div>
                                            )}
                                          </Droppable>

                                          {/* Add Area Button */}
                                          <button
                                            type="button"
                                            onClick={() => addArea(serviceIndex, floorIndex)}
                                            className="border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 mt-3 transition-all duration-200"
                                          >
                                            <Plus size={12} /> Add Area
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {floorProvided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {/* Add Floor Button */}
                            <button
                              type="button"
                              onClick={() => addFloor(serviceIndex)}
                              className="w-full py-2 border border-dashed border-blue-300 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 mt-4"
                            >
                              <Plus size={12} /> Add Floor
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

              {/* Add Service Button */}
              <button
                type="button"
                onClick={addService}
                data-error-field="line-items"
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => requestNavigate(`/quotation-list/revised/${parentId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLocked}>
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
        title="Delete Revised Line Item"
        description="Are you sure you want to delete this revised line item?"
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
    </div>
  );
};

export default RevQuotationFormPage;
