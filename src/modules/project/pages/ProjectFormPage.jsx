import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FolderKanban,
  Loader2,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  FileSpreadsheet,
  UserPlus,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
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
  useProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectSubMutation,
} from "../hooks/useProject";
import { useGetProductsForQuotationQuery } from "../../quotation/hooks/useQuotation";
import { useActiveBuyersQuery, useCreateBuyerMutation } from "../../buyer/hooks/useBuyer";
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
import ImportQuotationDialog from "../../quotation/components/ImportQuotationDialog";
import {
  QuickNameDialog,
  ProductQuickAddDialog,
  ServiceQuickAddDialog,
} from "../../quotation/components/MasterQuickAddDialogs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { calculateMilestoneAmounts } from "@/utils/milestoneUtils";

// Helper: Group flat subs to nested Services structure (Service -> Floor -> Area -> Product)
const groupSubsToServices = (subsList) => {
  if (!subsList || subsList.length === 0) {
    return [
      {
        serviceId: "",
        serviceName: "",
        floors: [
          {
            floorId: "",
            floorName: "",
            areas: [
              {
                areaId: "",
                areaName: "",
                products: [
                  {
                    id: null,
                    productId: "",
                    productName: "",
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

  // NOTE: Map() used (not {}) — plain objects auto-sort integer-like keys,
  // which broke API order. Map keeps insertion order.
  // Sort ascending by quotation_sub_sort / project_sub_sort if present, fallback to id
  const orderedSubs = [...subsList].sort((a, b) => {
    const sortA =
      a.quotation_sub_sort !== null &&
      a.quotation_sub_sort !== undefined &&
      a.quotation_sub_sort !== ""
        ? Number(a.quotation_sub_sort)
        : a.project_sub_sort !== null &&
          a.project_sub_sort !== undefined &&
          a.project_sub_sort !== ""
        ? Number(a.project_sub_sort)
        : null;
    const sortB =
      b.quotation_sub_sort !== null &&
      b.quotation_sub_sort !== undefined &&
      b.quotation_sub_sort !== ""
        ? Number(b.quotation_sub_sort)
        : b.project_sub_sort !== null &&
          b.project_sub_sort !== undefined &&
          b.project_sub_sort !== ""
        ? Number(b.project_sub_sort)
        : null;

    if (sortA !== null && sortB !== null && !isNaN(sortA) && !isNaN(sortB)) {
      return sortA - sortB;
    }
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  const serviceMap = new Map();
  orderedSubs.forEach((item) => {
    const serviceId = (
      item.project_sub_service_id ??
      item.quotation_sub_service_id ??
      item.sub_service_id ??
      item.service_id
    )?.toString() || "";

    const floorId = (
      item.project_sub_floor_id ??
      item.quotation_sub_floor_id ??
      item.sub_floor_id ??
      item.floor_id
    )?.toString() || "";

    const areaId = (
      item.project_sub_area_id ??
      item.quotation_sub_area_id ??
      item.sub_area_id ??
      item.area_id
    )?.toString() || "";

    const productId = (
      item.project_sub_product_id ??
      item.quotation_sub_product_id ??
      item.sub_product_id ??
      item.product_id
    )?.toString() || "";

    if (!serviceMap.has(serviceId)) {
      serviceMap.set(serviceId, {
        serviceId,
        serviceName: item.sub_service_name || item.service_name || "",
        floors: new Map(),
      });
    }
    const svc = serviceMap.get(serviceId);

    if (!svc.floors.has(floorId)) {
      svc.floors.set(floorId, {
        floorId,
        floorName: item.floor_name || item.property_floor || "",
        areas: new Map(),
      });
    }
    const flr = svc.floors.get(floorId);

    if (!flr.areas.has(areaId)) {
      flr.areas.set(areaId, {
        areaId,
        areaName: item.area_name || item.property_area || "",
        products: [],
      });
    }

    flr.areas.get(areaId).products.push({
      id: item.id || null,
      productId,
      productName: item.product_name || "",
      price: Number(item.project_sub_price ?? item.quotation_sub_price ?? item.sub_price ?? item.price) || 0,
      quantity: Number(item.project_sub_quantity ?? item.quotation_sub_quantity ?? item.sub_quantity ?? item.quantity) || 1,
      status: item.project_sub_status || item.quotation_sub_status || item.sub_status || "Pending",
      notes: item.project_sub_notes ?? item.quotation_sub_notes ?? item.sub_notes ?? item.notes ?? "",
    });
  });

  return [...serviceMap.values()].map((srv) => ({
    serviceId: srv.serviceId,
    serviceName: srv.serviceName,
    floors: [...srv.floors.values()].map((f) => ({
      floorId: f.floorId,
      floorName: f.floorName,
      areas: [...f.areas.values()].map((a) => ({
        areaId: a.areaId,
        areaName: a.areaName,
        products: a.products,
      })),
    })),
  }));
};

// Helper: Flatten nested Services structure to subs array with dual mapping and sequential sorting
const flattenServicesToSubs = (servicesList) => {
  const flattened = [];
  let sortIndex = 1;
  servicesList.forEach((srv) => {
    srv.floors.forEach((floor) => {
      floor.areas.forEach((area) => {
        area.products.forEach((product) => {
          if (product.productId) {
            const price = Number(product.price);
            const quantity = Number(product.quantity);
            const amount = price * quantity;
            const status = product.status || "Pending";
            const currentSort = sortIndex++;
            flattened.push({
              id: product.id || undefined,
              project_sub_sort: currentSort,
              quotation_sub_sort: currentSort,
              // Project specific keys
              project_sub_service_id: Number(srv.serviceId),
              project_sub_floor_id: Number(floor.floorId),
              project_sub_area_id: Number(area.areaId),
              project_sub_product_id: Number(product.productId),
              project_sub_price: price,
              project_sub_quantity: quantity,
              project_sub_amount: amount,
              project_sub_status: status,
              project_sub_notes: product.notes || "",
              // Quotation dual keys for backend safety
              quotation_sub_service_id: Number(srv.serviceId),
              quotation_sub_floor_id: Number(floor.floorId),
              quotation_sub_area_id: Number(area.areaId),
              quotation_sub_product_id: Number(product.productId),
              quotation_sub_price: price,
              quotation_sub_quantity: quantity,
              quotation_sub_amount: amount,
              quotation_sub_status: status,
              quotation_sub_notes: product.notes || "",
            });
          }
        });
      });
    });
  });
  return flattened;
};

const ProjectFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_date: new Date().toISOString().split("T")[0],
    price_validity_date: "",
    project_buyer_id: "",
    project_property_id: "",
    project_category_id: "",
    project_service_id: "",
    project_remarks: "",
    project_status: "Project",
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
  const [defaultSelection, setDefaultSelection] = useState({
    categories: "",
    services: "",
  });
  const defaultsAppliedRef = useRef(false);

  // Buyer quick-add
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
    const currentServices = formData.project_service_id
      ? formData.project_service_id.split(",")
      : [];
    let finalServiceIds = serviceIds;
    if (!finalServiceIds || finalServiceIds.length === 0) {
      finalServiceIds = services.map((s) => s.id?.toString()).filter(Boolean);
    }
    const mergedServices = Array.from(
      new Set([...currentServices, ...finalServiceIds].filter(Boolean))
    );

    const currentCategories = formData.project_category_id
      ? formData.project_category_id.split(",")
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
      project_service_id: mergedServices.join(","),
      project_category_id: mergedCategories.join(","),
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
  const queryClient = useQueryClient();

  // Fetch products matching selected categories and services
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProjectProducts,
  } = useGetProductsForQuotationQuery(
    formData.project_category_id,
    formData.project_service_id,
    Boolean(formData.project_category_id && formData.project_service_id)
  );

  const productsList = productsData?.data || [];

  // Project Queries & Mutations
  const {
    data: fetchedData,
    isLoading: isFetching,
    isError,
    refetch,
  } = useProjectQuery(id, isEdit);

  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectSubMutation = useDeleteProjectSubMutation();

  // Master quick-add mutations
  const createFloorMutation = useCreateFloorMutation();
  const createAreaMutation = useCreateAreaMutation();
  const createBrandMutation = useCreateBrandMutation();
  const createProductMutation = useCreateProductMutation();
  const createServiceMutation = useCreateServiceMutation();

  const isSubmitting = createProjectMutation.isPending || updateProjectMutation.isPending;

  useEffect(() => {
    const raw = fetchedData?.data?.data || fetchedData?.data || fetchedData;
    if (isEdit && raw && (raw.id || raw.quotation_buyer_id || raw.project_buyer_id)) {
      const data = raw;
      const nextForm = {
        project_date: data.project_date || data.quotation_date || "",
        price_validity_date:
          data.price_validity_date ||
          data.project_validity_date ||
          data.quotation_validity_date ||
          "",
        project_buyer_id:
          (data.project_buyer_id ?? data.quotation_buyer_id ?? data.buyer_id)?.toString() || "",
        project_property_id:
          (data.project_property_id ?? data.quotation_property_id ?? data.property_id)?.toString() ||
          "",
        project_category_id:
          data.project_category_id || data.quotation_category_id || data.category_id || "",
        project_service_id:
          data.project_service_id || data.quotation_service_id || data.service_id || "",
        project_remarks:
          data.project_remarks || data.quotation_remarks || data.remarks || "",
        project_status:
          data.project_status || data.status || data.quotation_status || "Project",
        quotation_booing_confirmation:
          data.quotation_booing_confirmation ??
          data.quotation_booking_confirmation ??
          data.project_booing_confirmation ??
          data.project_booking_confirmation ??
          30,
        quotation_hardware:
          data.quotation_hardware ??
          data.project_hardware ??
          60,
        quotation_installation:
          data.quotation_installation ??
          data.project_installation ??
          10,
      };
      setFormData(nextForm);

      let nextServices = null;
      if (data.subs && Array.isArray(data.subs) && data.subs.length > 0) {
        nextServices = groupSubsToServices(data.subs);
        setServicesState(nextServices);
      }
      const snapshotServices =
        nextServices || [
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

  // Create mode snapshot
  useEffect(() => {
    if (!isEdit && initialSnapshot === null) {
      setInitialSnapshot(
        JSON.stringify({
          project_date: new Date().toISOString().split("T")[0],
          price_validity_date: "",
          project_buyer_id: "",
          project_property_id: "",
          project_category_id: "",
          project_service_id: "",
          project_remarks: "",
          project_status: "Project",
          quotation_booing_confirmation: 30,
          quotation_hardware: 60,
          quotation_installation: 10,
        })
      );
    }
  }, [isEdit]);

  const snapshotKey = useMemo(
    () => JSON.stringify({ formData, servicesState }),
    [formData, servicesState]
  );

  const isDirty = useMemo(() => {
    if (initialSnapshot === null) return false;
    if (isEdit) return snapshotKey !== initialSnapshot;
    const todayStr = new Date().toISOString().split("T")[0];
    const hasBasic = Boolean(
      formData.project_buyer_id ||
        formData.project_property_id ||
        (formData.project_category_id || "") !== defaultSelection.categories ||
        (formData.project_service_id || "") !== defaultSelection.services ||
        formData.project_remarks ||
        formData.price_validity_date ||
        (formData.project_date && formData.project_date !== todayStr)
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
  }, [initialSnapshot, snapshotKey, isEdit, formData, servicesState, defaultSelection]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryCheckboxChange = (catId, checked) => {
    let currentIds = formData.project_category_id
      ? formData.project_category_id.split(",")
      : [];
    if (checked) {
      currentIds.push(catId.toString());
    } else {
      currentIds = currentIds.filter((id) => id !== catId.toString());
    }
    setFormData((prev) => ({
      ...prev,
      project_category_id: currentIds.join(","),
    }));
  };

  const handleServiceCheckboxChange = (srvId, checked) => {
    let currentIds = formData.project_service_id
      ? formData.project_service_id.split(",")
      : [];
    if (checked) {
      currentIds.push(srvId.toString());
    } else {
      currentIds = currentIds.filter((id) => id !== srvId.toString());
    }
    setFormData((prev) => ({
      ...prev,
      project_service_id: currentIds.join(","),
    }));
  };

  // Line item helpers
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

  const removeProduct = (serviceIndex, floorIndex, areaIndex, productIndex) => {
    const product =
      servicesState[serviceIndex].floors[floorIndex].areas[areaIndex].products[
        productIndex
      ];
    if (product.id) {
      setPendingDelete({
        type: "product",
        ids: [product.id],
        indices: { serviceIndex, floorIndex, areaIndex, productIndex },
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
    const ids = [];
    area.products.forEach((p) => {
      if (p.id) ids.push(p.id);
    });

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
          (_, i) => i !== floorIndex
        );
        return updated;
      });
    }
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

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { type, ids, indices } = pendingDelete;
    try {
      if (ids && ids.length > 0) {
        await Promise.all(ids.map((id) => deleteProjectSubMutation.mutateAsync(id)));
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
          updated[serviceIndex].floors = updated[serviceIndex].floors.filter(
            (_, i) => i !== floorIndex
          );
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
    knownProduct = null
  ) => {
    setServicesState((prev) => {
      const updated = [...prev];
      if (productIndex !== null) {
        const product =
          updated[serviceIndex].floors[floorIndex].areas[areaIndex].products[productIndex];
        product[field] = value;

        if (field === "productId") {
          const matchedProd = knownProduct || findProductById(value);
          if (matchedProd) {
            product.price = matchedProd.product_price || 0;
          }
        }
      } else if (areaIndex !== null) {
        updated[serviceIndex].floors[floorIndex].areas[areaIndex].areaId = value;
      } else if (floorIndex !== null) {
        updated[serviceIndex].floors[floorIndex].floorId = value;
      } else {
        updated[serviceIndex].serviceId = value;
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

    // react-select ka asli control dhoondo (jispar 1px border hai)
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
      if (!control) control = innerInput;
    } else {
      control = target;
    }

    if (control) {
      const prevBorder = control.style.borderColor;
      const prevShadow = control.style.boxShadow;
      control.style.borderColor = "rgb(239, 68, 68)";
      control.style.boxShadow = "0 0 0 2px rgba(239, 68, 68, 0.25)";
      const clearError = () => {
        control.style.borderColor = prevBorder;
        control.style.boxShadow = prevShadow;
        target.removeEventListener("focusout", clearError);
      };
      target.addEventListener("focusout", clearError, { once: true });
      setTimeout(clearError, 3000);
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
    if (!formData.project_buyer_id) newErrors.project_buyer_id = "Lead is required";
    if (!formData.project_property_id) newErrors.project_property_id = "Property is required";

    if (newErrors.project_buyer_id || newErrors.project_property_id) {
      toast.error("Please select a Lead and Property at the top of the form.");
      setErrors(newErrors);
      focusErrorField(newErrors.project_buyer_id ? "buyer" : "property");
      return false;
    }

    if (!formData.project_category_id) {
      toast.error("Please select at least one Category");
      focusErrorField("categories");
      return false;
    }
    if (!formData.project_service_id) {
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
          toast.error(
            `Please select a Floor under Service block #${s + 1}, floor block #${f + 1}`
          );
          focusErrorField(`floor-${s}-${f}`);
          return false;
        }
        for (let a = 0; a < floor.areas.length; a++) {
          const area = floor.areas[a];
          if (!area.areaId) {
            toast.error(
              `Please select an Area under Service block #${s + 1}, Floor block #${f + 1}, area block #${a + 1}`
            );
            focusErrorField(`area-${s}-${f}-${a}`);
            return false;
          }
          for (let p = 0; p < area.products.length; p++) {
            const prod = area.products[p];
            if (!prod.productId) {
              toast.error(
                `Please complete Product selection under Service #${s + 1} ➔ Floor #${f + 1} ➔ Area #${a + 1}, product #${p + 1}`
              );
              focusErrorField(`product-${s}-${f}-${a}-${p}`);
              return false;
            }
            hasLineItems = true;
          }
        }
      }
    }

    if (!hasLineItems) {
      toast.error("Please add at least one project line item");
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

  const buildPayload = (overrides = {}) => {
    const flattenedSubs = flattenServicesToSubs(servicesState);
    const buyerId = Number(formData.project_buyer_id);
    const propertyId = Number(formData.project_property_id);
    const date = formData.project_date;
    const validityDate = formData.price_validity_date;
    const categoryId = formData.project_category_id;
    const serviceId = formData.project_service_id;
    const remarks = formData.project_remarks;
    const status = formData.project_status || "Project";
    const bookingPct = Number(formData.quotation_booing_confirmation) || 30;
    const hardwarePct = Number(formData.quotation_hardware) || 60;
    const installationPct = Number(formData.quotation_installation) || 10;

    return {
      // Primary Project keys
      project_date: date,
      price_validity_date: validityDate,
      project_buyer_id: buyerId,
      project_property_id: propertyId,
      project_category_id: categoryId,
      project_service_id: serviceId,
      project_remarks: remarks,
      project_status: status,
      // Payment Milestones
      quotation_booing_confirmation: bookingPct,
      quotation_hardware: hardwarePct,
      quotation_installation: installationPct,
      project_booing_confirmation: bookingPct,
      project_hardware: hardwarePct,
      project_installation: installationPct,
      // Dual mappings with Quotation keys for API compatibility
      quotation_date: date,
      quotation_validity_date: validityDate,
      quotation_buyer_id: buyerId,
      quotation_property_id: propertyId,
      quotation_category_id: categoryId,
      quotation_service_id: serviceId,
      quotation_remarks: remarks,
      quotation_status: status,
      subs: flattenedSubs,
      ...overrides,
    };
  };

  const saveWithoutNavigate = async () => {
    if (!validateForm()) return false;
    const payload = buildPayload();
    try {
      if (isEdit) {
        await updateProjectMutation.mutateAsync({ id, data: payload });
        toast.success("Project updated successfully");
        setInitialSnapshot(snapshotKey);
        refetch?.();
        return true;
      } else {
        const res = await createProjectMutation.mutateAsync(payload);
        const created = res?.data?.data || res?.data || res;
        const newId =
          created?.id?.toString() ||
          res?.data?.id?.toString() ||
          res?.id?.toString() ||
          "";
        toast.success("Project created successfully");
        setInitialSnapshot(snapshotKey);
        return newId || true;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save project"
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

  // Save ke baad previous screen (project list) par wapas jao (create aur edit dono me)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveWithoutNavigate();
    if (!result) return;
    navigate("/project-list", { replace: true });
  };

  // Option to Save and stay/continue in edit mode
  const [isSavingContinue, setIsSavingContinue] = useState(false);
  const handleSaveAndContinue = async () => {
    setIsSavingContinue(true);
    try {
      const result = await saveWithoutNavigate();
      if (!result) return;
      if (!isEdit && typeof result === "string") {
        navigate(`/project-list/edit/${result}`, { replace: true });
      }
    } finally {
      setIsSavingContinue(false);
    }
  };

  const buyers = buyersData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];
  const brands = brandsData?.data || [];

  // Create mode: masters load hone par Services + Categories sab tick ho jaye
  useEffect(() => {
    if (isEdit || defaultsAppliedRef.current) return;
    if (!categories.length || !services.length) return;
    defaultsAppliedRef.current = true;
    const categoryIds = categories
      .map((c) => c.id?.toString())
      .filter(Boolean)
      .join(",");
    const serviceIds = services
      .map((s) => s.id?.toString())
      .filter(Boolean)
      .join(",");
    setDefaultSelection({ categories: categoryIds, services: serviceIds });
    setFormData((prev) => ({
      ...prev,
      project_category_id: prev.project_category_id || categoryIds,
      project_service_id: prev.project_service_id || serviceIds,
    }));
  }, [isEdit, categories, services]);

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
    if (!newBuyer.buyer_name.trim()) errs.buyer_name = "Lead Name is required";
    if (!newBuyer.buyer_mobile) {
      errs.buyer_mobile = "Mobile number is required";
    } else if (newBuyer.buyer_mobile.length !== 10) {
      errs.buyer_mobile = "Mobile must be a 10-digit number";
    }
    if (newBuyer.buyer_email?.trim() && !/\S+@\S+\.\S+/.test(newBuyer.buyer_email.trim())) {
      errs.buyer_email = "Invalid email format";
    }
    setBuyerFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await createBuyerMutation.mutateAsync({
        buyer_name: newBuyer.buyer_name.trim(),
        buyer_mobile: newBuyer.buyer_mobile.trim(),
        buyer_email: newBuyer.buyer_email?.trim() || "",
        buyer_address: newBuyer.buyer_address?.trim() || "",
      });
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
        setFormData((prev) => ({ ...prev, project_buyer_id: newId }));
        setErrors((prev) => ({ ...prev, project_buyer_id: "" }));
      }
      toast.success("Lead added successfully");
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

  const checkedCategories = useMemo(() => {
    const raw = formData.project_category_id || "";
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, [formData.project_category_id]);

  const checkedServices = useMemo(() => {
    const raw = formData.project_service_id || "";
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.project_service_id]);

  const allServiceOptions = useMemo(() => {
    const map = new Map();
    (services || []).forEach((s) => {
      map.set(s.id?.toString(), {
        value: s.id?.toString(),
        label: s.service_name,
      });
    });
    (servicesState || []).forEach((srv) => {
      if (srv.serviceId && !map.has(srv.serviceId)) {
        map.set(srv.serviceId, {
          value: srv.serviceId,
          label: srv.serviceName || `Service #${srv.serviceId}`,
        });
      }
    });
    return Array.from(map.values());
  }, [services, servicesState]);

  const getFloorOptions = (flr) => {
    const map = new Map();
    (floors || []).forEach((f) => {
      map.set(f.id?.toString(), {
        value: f.id?.toString(),
        label: f.property_floor,
      });
    });
    if (flr?.floorId && !map.has(flr.floorId)) {
      map.set(flr.floorId, {
        value: flr.floorId,
        label: flr.floorName || `Floor #${flr.floorId}`,
      });
    }
    return Array.from(map.values());
  };

  const getAreaOptions = (area) => {
    const map = new Map();
    (areas || []).forEach((a) => {
      map.set(a.id?.toString(), {
        value: a.id?.toString(),
        label: a.property_area,
      });
    });
    if (area?.areaId && !map.has(area.areaId)) {
      map.set(area.areaId, {
        value: area.areaId,
        label: area.areaName || `Area #${area.areaId}`,
      });
    }
    return Array.from(map.values());
  };

  // Product label with category prefix so same-name products under different
  // categories (e.g. "2M - 4 Control" under Frameless vs Brass) look distinct.
  const getProductLabel = (p) => {
    const catName =
      p?.category_name ||
      categories.find((c) => c.id?.toString() === p?.category_id?.toString())
        ?.category_name ||
      "";
    return catName ? `${catName} - ${p?.product_name}` : p?.product_name;
  };

  const getProductOptions = (prod, rowServiceId) => {
    const base = getRowProductOptions(rowServiceId);
    const map = new Map();
    base.forEach((p) => {
      map.set(p.id?.toString(), {
        value: p.id?.toString(),
        label: getProductLabel(p),
      });
    });
    if (prod?.productId && !map.has(prod.productId)) {
      map.set(prod.productId, {
        value: prod.productId,
        label: prod.productName || `Product #${prod.productId}`,
      });
    }
    return Array.from(map.values());
  };

  const allServiceIds = services.map((s) => s.id).join(",");
  const { data: catProductsData } = useGetProductsForQuotationQuery(
    formData.project_category_id,
    allServiceIds,
    Boolean(formData.project_category_id && allServiceIds)
  );
  const catProductsList = catProductsData?.data || [];

  const getProductEmptyHint = (rowServiceId) => {
    const rowSvcName =
      services.find((s) => s.id?.toString() === rowServiceId?.toString())?.service_name ||
      "this service";
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
          services.find((s) => s.id?.toString() === sid)?.service_name || "another service";
        return `${n} under '${nm}'`;
      });
    if (!others.length) return `No '${catNames}' products under '${rowSvcName}'.`;
    return `No '${catNames}' products under '${rowSvcName}'. Found ${others.join(
      ", "
    )} — tick that Service above.`;
  };

  const findProductById = (pid) =>
    [...extraProducts, ...productsList, ...catProductsList].find(
      (p) => p.id?.toString() === pid?.toString()
    );

  // Row product options: STRICT — only products of this row's Service.
  // Dusri service ka product dikhega hi nahi; khaali ho to hint bolega.
  // Auto-switch nahi hoga.
  const getRowProductOptions = (rowServiceId) => {
    if (!rowServiceId) return [];
    const sid = rowServiceId?.toString();
    const matched = productsList.filter(
      (p) => p.service_id?.toString() === sid
    );
    const catMatched = catProductsList.filter(
      (p) => p.service_id?.toString() === sid
    );
    const merged = [...matched];
    const seen = new Set(matched.map((p) => p.id?.toString()));
    catMatched.forEach((p) => {
      if (!seen.has(p.id?.toString())) {
        merged.push(p);
        seen.add(p.id?.toString());
      }
    });
    extraProducts.forEach((e) => {
      if (
        e.service_id?.toString() === sid &&
        !seen.has(e.id?.toString())
      ) {
        merged.push(e);
        seen.add(e.id?.toString());
      }
    });
    return merged;
  };

  // Product select: NO auto-set. Row Service kabhi khud nahi badlega.
  const handleProductSelect = (
    serviceIndex,
    floorIndex,
    areaIndex,
    prodIndex,
    option,
    srv,
    knownProduct = null
  ) => {
    const val = option ? option.value : "";
    if (!option) {
      handleNestedFieldChange(
        serviceIndex,
        floorIndex,
        areaIndex,
        prodIndex,
        "productId",
        ""
      );
      return;
    }
    const matched = knownProduct || findProductById(val);
    // No service auto-switch: jo Service row me select hai wahi rahega.
    handleNestedFieldChange(
      serviceIndex,
      floorIndex,
      areaIndex,
      prodIndex,
      "productId",
      val,
      matched
    );
  };

  // Master quick-add states
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
      (x) => (x[key] || "").toLowerCase() === (name || "").toLowerCase()
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
          handleNestedFieldChange(
            target.serviceIndex,
            target.floorIndex,
            null,
            null,
            "floorId",
            found.id.toString()
          );
      } else {
        await createAreaMutation.mutateAsync({ property_area: name });
        const r = await refetchAreas();
        const found = matchByName(r.data?.data, name, "property_area");
        if (found)
          handleNestedFieldChange(
            target.serviceIndex,
            target.floorIndex,
            target.areaIndex,
            null,
            "areaId",
            found.id.toString()
          );
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
          const cur = prev.project_service_id ? prev.project_service_id.split(",") : [];
          if (cur.includes(sid)) return prev;
          return { ...prev, project_service_id: [...cur, sid].join(",") };
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
      const r = await refetchProjectProducts();
      const created = res?.data?.data || res?.data || res;
      let found =
        (r.data?.data || []).find(
          (x) =>
            x.id?.toString() === created?.id?.toString() ||
            (x.product_name || "").toLowerCase() === (payload.product_name || "").toLowerCase()
        ) || (created?.id ? created : null);

      if (found) {
        const freshProduct = {
          ...found,
          product_price:
            Number(found.product_price ?? payload.product_price) || 0,
        };
        setExtraProducts((prev) => [
          ...prev.filter((p) => p.id?.toString() !== freshProduct.id?.toString()),
          freshProduct,
        ]);
        const sid = freshProduct.service_id?.toString();
        const cid = freshProduct.category_id?.toString();
        setFormData((prev) => {
          let updated = { ...prev };
          if (sid) {
            const curS = updated.project_service_id ? updated.project_service_id.split(",") : [];
            if (!curS.includes(sid)) {
              updated.project_service_id = [...curS, sid].join(",");
            }
          }
          if (cid) {
            const curC = updated.project_category_id ? updated.project_category_id.split(",") : [];
            if (!curC.includes(cid)) {
              updated.project_category_id = [...curC, cid].join(",");
            }
          }
          return updated;
        });

        const srv = servicesState[target.serviceIndex];
        // Quick-add explicit case: naya product aur service par bana to row switch
        if (sid && srv?.serviceId && sid !== srv.serviceId?.toString()) {
          const svcName =
            services.find((s) => s.id?.toString() === sid)?.service_name ||
            freshProduct.service_name ||
            sid;
          handleNestedFieldChange(
            target.serviceIndex,
            null,
            null,
            null,
            "serviceId",
            sid
          );
          toast.info(`New product is under '${svcName}' — row switched to it`);
        }
        handleProductSelect(
          target.serviceIndex,
          target.floorIndex,
          target.areaIndex,
          target.prodIndex,
          { value: freshProduct.id.toString(), label: getProductLabel(freshProduct) },
          srv,
          freshProduct
        );
      }
      toast.success("Product added successfully");
      setProductQA({
        open: false,
        target: null,
        serviceId: "",
        categoryId: "",
        name: "",
        saving: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
      setProductQA((p) => ({ ...p, saving: false }));
    }
  };

  const handleRefreshProducts = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["products-for-quotation"] });
      await refetchProjectProducts();
      toast.success("Products list refreshed");
    } catch {
      toast.error("Failed to refresh products");
    }
  };

  // Grand Total calculation
  const grandTotal = servicesState.reduce((total, s) => {
    return (
      total +
      s.floors.reduce((fSum, f) => {
        return (
          fSum +
          f.areas.reduce((aSum, a) => {
            return (
              aSum +
              a.products.reduce(
                (pSum, p) => pSum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
                0
              )
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const milestoneTotal =
    (Number(formData.quotation_booing_confirmation) || 0) +
    (Number(formData.quotation_hardware) || 0) +
    (Number(formData.quotation_installation) || 0);

  const milestoneAmounts = calculateMilestoneAmounts(grandTotal, [
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
        icon={FolderKanban}
        title={isEdit ? "Edit Project" : "Add Project"}
        description={
          isEdit
            ? "Update project details and line items"
            : "Create a new project scope of work"
        }
        rightContent={
          <Button variant="outline" onClick={() => requestNavigate("/project-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Project Date */}
              <div className="space-y-2">
                <Label className="flex">
                  Project Date <RedStar />
                </Label>
                <Input
                  type="date"
                  name="project_date"
                  value={formData.project_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Price Validity Date (Project extra field) */}
              <div className="space-y-2">
                <Label className="flex font-medium text-slate-700 dark:text-slate-300">
                  Price Validity Date
                </Label>
                <Input
                  type="date"
                  name="price_validity_date"
                  value={formData.price_validity_date || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Buyer Select */}
              <div className="space-y-2" data-error-field="buyer">
                <Label className="flex">
                  Lead <RedStar />
                </Label>
                <SelectWithAdd
                  value={formData.project_buyer_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      project_buyer_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, project_buyer_id: "" }));
                  }}
                  options={buyerOptions}
                  placeholder="Search or Select Lead"
                  isLoading={buyersLoading}
                  hasError={Boolean(errors.project_buyer_id)}
                  filterOption={filterBuyer}
                  getSubtitle={(o) =>
                    o?.buyer?.buyer_mobile || o?.buyer?.buyer_email
                      ? `${o?.buyer?.buyer_mobile || ""}${
                          o?.buyer?.buyer_mobile && o?.buyer?.buyer_email ? " • " : ""
                        }${o?.buyer?.buyer_email || ""}`
                      : ""
                  }
                  placement="bottom-left"
                  menuPosition="absolute"
                  addLabel="Add New Lead"
                  renderAddLabel={(typed) =>
                    typed?.trim() ? `Add "${typed.trim()}" as New Lead` : "Add New Lead"
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
              <div className="space-y-2" data-error-field="property">
                <Label className="flex">
                  Property <RedStar />
                </Label>
                <MemoizedSelect
                  options={properties.map((prop) => ({
                    value: prop.id?.toString(),
                    label: prop.property,
                  }))}
                  value={formData.project_property_id}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      project_property_id: option ? option.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, project_property_id: "" }));
                  }}
                  placeholder="Select Property"
                  hasError={Boolean(errors.project_property_id)}
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
                <div
                  className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-[160px] overflow-y-auto border dark:border-slate-800"
                  data-error-field="categories"
                >
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
                <div
                  className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-[160px] overflow-y-auto border dark:border-slate-800"
                  data-error-field="services"
                >
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

            {/* Remarks and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t dark:border-slate-800">
              <div className="md:col-span-2 space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  name="project_remarks"
                  value={formData.project_remarks}
                  onChange={handleInputChange}
                  placeholder="Additional remarks or notes..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="project_status"
                  value={formData.project_status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Project">Project</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </div>
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
                {grandTotal > 0 && (
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
                {grandTotal > 0 && (
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
                {grandTotal > 0 && (
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

        {/* Project Items (Nested Line Items) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Project Items
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Organized hierarchically by Service → Floor → Area → Products
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshProducts}
                  disabled={productsLoading}
                  title="Refresh products list from master"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1.5 ${productsLoading ? "animate-spin" : ""}`}
                  />
                  Refresh Products
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Import Excel
                </Button>
                <Button type="button" size="sm" onClick={addService}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Service
                </Button>
              </div>
            </div>

            <div className="space-y-6" data-error-field="line-items">
              {servicesState.map((srv, srvIdx) => (
                <div
                  key={srvIdx}
                  className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800 relative"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b dark:border-slate-800">
                    <div
                      className="flex items-center gap-3 w-full md:w-1/2"
                      data-error-field={`service-${srvIdx}`}
                    >
                      <span className="font-semibold text-sm bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-md shrink-0">
                        Service #{srvIdx + 1}
                      </span>
                      <div className="w-full">
                        <SelectWithAdd
                          value={srv.serviceId}
                          onChange={(opt) =>
                            handleNestedFieldChange(
                              srvIdx,
                              null,
                              null,
                              null,
                              "serviceId",
                              opt ? opt.value : ""
                            )
                          }
                          options={allServiceOptions}
                          placeholder="Select Service"
                          addLabel="+ Add Service"
                          renderAddLabel={(typed) =>
                            typed?.trim()
                              ? `+ Add "${typed.trim()}" as Service`
                              : "+ Add Service"
                          }
                          onAdd={(typed) => openServiceQA({ serviceIndex: srvIdx }, typed)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFloor(srvIdx)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Floor
                      </Button>
                      {servicesState.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          onClick={() => removeService(srvIdx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Floors under Service */}
                  <div className="mt-4 space-y-4 pl-0 md:pl-4">
                    {srv.floors.map((flr, flrIdx) => (
                      <div
                        key={flrIdx}
                        className="border rounded-lg p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800">
                          <div
                            className="flex items-center gap-3 w-full md:w-1/3"
                            data-error-field={`floor-${srvIdx}-${flrIdx}`}
                          >
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded shrink-0">
                              Floor #{flrIdx + 1}
                            </span>
                            <div className="w-full">
                              <SelectWithAdd
                                value={flr.floorId}
                                onChange={(opt) =>
                                  handleNestedFieldChange(
                                    srvIdx,
                                    flrIdx,
                                    null,
                                    null,
                                    "floorId",
                                    opt ? opt.value : ""
                                  )
                                }
                                options={getFloorOptions(flr)}
                                placeholder="Select Floor"
                                addLabel="+ Add Floor"
                                renderAddLabel={(typed) =>
                                  typed?.trim()
                                    ? `+ Add "${typed.trim()}" as Floor`
                                    : "+ Add Floor"
                                }
                                onAdd={(typed) =>
                                  openQuickName(
                                    "floor",
                                    { serviceIndex: srvIdx, floorIndex: flrIdx },
                                    typed
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => addArea(srvIdx, flrIdx)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Area
                            </Button>
                            {srv.floors.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                onClick={() => removeFloor(srvIdx, flrIdx)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Areas under Floor */}
                        <div className="mt-3 space-y-3 pl-0 md:pl-4">
                          {flr.areas.map((area, areaIdx) => (
                            <div
                              key={areaIdx}
                              className="border rounded-md p-3 bg-slate-50/70 dark:bg-slate-900/60 dark:border-slate-800/80"
                            >
                              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b dark:border-slate-800">
                                <div
                                  className="flex items-center gap-3 w-full md:w-1/3"
                                  data-error-field={`area-${srvIdx}-${flrIdx}-${areaIdx}`}
                                >
                                  <span className="text-[11px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 px-1.5 py-0.5 rounded shrink-0">
                                    Area #{areaIdx + 1}
                                  </span>
                                  <div className="w-full">
                                    <SelectWithAdd
                                      value={area.areaId}
                                      onChange={(opt) =>
                                        handleNestedFieldChange(
                                          srvIdx,
                                          flrIdx,
                                          areaIdx,
                                          null,
                                          "areaId",
                                          opt ? opt.value : ""
                                        )
                                      }
                                      options={getAreaOptions(area)}
                                      placeholder="Select Area"
                                      addLabel="+ Add Area"
                                      renderAddLabel={(typed) =>
                                        typed?.trim()
                                          ? `+ Add "${typed.trim()}" as Area`
                                          : "+ Add Area"
                                      }
                                      onAdd={(typed) =>
                                        openQuickName(
                                          "area",
                                          {
                                            serviceIndex: srvIdx,
                                            floorIndex: flrIdx,
                                            areaIndex,
                                          },
                                          typed
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-auto">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => addProduct(srvIdx, flrIdx, areaIdx)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> Add Product
                                  </Button>
                                  {flr.areas.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                      onClick={() => removeArea(srvIdx, flrIdx, areaIdx)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Products under Area */}
                              <div className="mt-2 space-y-2">
                                {area.products.map((prod, prodIdx) => {
                                  const rowProductOptions = getRowProductOptions(srv.serviceId);
                                  const emptyHint = getProductEmptyHint(srv.serviceId);

                                  return (
                                    <div
                                      key={prodIdx}
                                      className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 space-y-2"
                                    >
                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                      <div
                                        className="flex-1 min-w-[200px]"
                                        data-error-field={`product-${srvIdx}-${flrIdx}-${areaIdx}-${prodIdx}`}
                                      >
                                        <SelectWithAdd
                                          value={prod.productId}
                                          onChange={(opt) =>
                                            handleProductSelect(
                                              srvIdx,
                                              flrIdx,
                                              areaIdx,
                                              prodIdx,
                                              opt,
                                              srv
                                            )
                                          }
                                          options={getProductOptions(prod, srv.serviceId)}
                                          placeholder={
                                            srv.serviceId
                                              ? "Select Product"
                                              : "Select Service above first"
                                          }
                                          noOptionsMessage={() => emptyHint}
                                          addLabel="+ Add Product"
                                          renderAddLabel={(typed) =>
                                            typed?.trim()
                                              ? `+ Add "${typed.trim()}" as Product`
                                              : "+ Add Product"
                                          }
                                          onAdd={(typed) =>
                                            openProductQA(
                                              {
                                                serviceIndex: srvIdx,
                                                floorIndex: flrIdx,
                                                areaIndex,
                                                prodIndex,
                                              },
                                              typed,
                                              srv.serviceId
                                            )
                                          }
                                        />
                                      </div>

                                      <div className="w-full sm:w-28">
                                        <Input
                                          type="number"
                                          placeholder="Price"
                                          value={prod.price}
                                          onChange={(e) =>
                                            handleNestedFieldChange(
                                              srvIdx,
                                              flrIdx,
                                              areaIdx,
                                              prodIdx,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                          className="h-9 text-right"
                                          min="0"
                                        />
                                      </div>

                                      <div className="w-full sm:w-20">
                                        <Input
                                          type="number"
                                          placeholder="Qty"
                                          value={prod.quantity}
                                          onChange={(e) =>
                                            handleNestedFieldChange(
                                              srvIdx,
                                              flrIdx,
                                              areaIdx,
                                              prodIdx,
                                              "quantity",
                                              e.target.value
                                            )
                                          }
                                          className="h-9 text-center"
                                          min="1"
                                        />
                                      </div>

                                      <div className="w-full sm:w-28 text-right font-semibold text-sm px-2 text-slate-700 dark:text-slate-300">
                                        ₹
                                        {(
                                          (Number(prod.price) || 0) *
                                          (Number(prod.quantity) || 0)
                                        ).toLocaleString()}
                                      </div>

                                      <div className="self-end sm:self-center">
                                        {area.products.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                            onClick={() =>
                                              removeProduct(srvIdx, flrIdx, areaIdx, prodIdx)
                                            }
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        )}
                                      </div>
                                      </div>

                                      <Input
                                        value={prod.notes || ""}
                                        onChange={(e) =>
                                          handleNestedFieldChange(
                                            srvIdx,
                                            flrIdx,
                                            areaIdx,
                                            prodIdx,
                                            "notes",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Remark / Notes (optional) — shown in the report"
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total Summary */}
            <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-end">
              <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 rounded-lg border dark:border-slate-800 text-right">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Grand Total
                </span>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ₹{grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => requestNavigate("/project-list")}
            disabled={isSubmitting || isSavingContinue}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAndContinue}
            disabled={isSubmitting || isSavingContinue}
            title={isEdit ? "Save changes and stay on this page" : "Save project and continue in edit mode"}
          >
            {isSavingContinue ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              isEdit ? "Save & Stay" : "Save & Edit"
            )}
          </Button>
          <Button type="submit" disabled={isSubmitting || isSavingContinue}>
            {isSubmitting && !isSavingContinue ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? "Save Changes" : "Save Project"}
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
        placeholder={quickName.type === "floor" ? "e.g. Second Floor" : "e.g. Living Room"}
        initialName={quickName.name}
      />
      <ProductQuickAddDialog
        open={productQA.open}
        onClose={() =>
          !productQA.saving &&
          setProductQA({
            open: false,
            target: null,
            serviceId: "",
            categoryId: "",
            name: "",
            saving: false,
          })
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
              Add New Lead
            </DialogTitle>
            <DialogDescription>
              Quickly register a lead without leaving the project form. It will be auto-selected
              after saving.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBuyer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Lead Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newBuyer.buyer_name}
                onChange={(e) =>
                  setNewBuyer((p) => ({ ...p, buyer_name: e.target.value }))
                }
                placeholder="Enter lead name"
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
                      buyer_mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                />
                {buyerFormErrors.buyer_mobile && (
                  <p className="text-xs text-red-500">{buyerFormErrors.buyer_mobile}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={newBuyer.buyer_email}
                  onChange={(e) =>
                    setNewBuyer((p) => ({ ...p, buyer_email: e.target.value }))
                  }
                  placeholder="Enter email (optional)"
                />
                {buyerFormErrors.buyer_email && (
                  <p className="text-xs text-red-500">{buyerFormErrors.buyer_email}</p>
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
                    <Plus className="w-4 h-4 mr-2" /> Add Lead
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

export default ProjectFormPage;
