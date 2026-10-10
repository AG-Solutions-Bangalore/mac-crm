import React, { useState, useEffect, useMemo } from "react";
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

  const serviceMap = {};
  subsList.forEach((item) => {
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

    if (!serviceMap[serviceId]) {
      serviceMap[serviceId] = {
        serviceId,
        serviceName: item.sub_service_name || item.service_name || "",
        floors: {},
      };
    }

    if (!serviceMap[serviceId].floors[floorId]) {
      serviceMap[serviceId].floors[floorId] = {
        floorId,
        floorName: item.floor_name || item.property_floor || "",
        areas: {},
      };
    }

    if (!serviceMap[serviceId].floors[floorId].areas[areaId]) {
      serviceMap[serviceId].floors[floorId].areas[areaId] = {
        areaId,
        areaName: item.area_name || item.property_area || "",
        products: [],
      };
    }

    serviceMap[serviceId].floors[floorId].areas[areaId].products.push({
      id: item.id || null,
      productId,
      productName: item.product_name || "",
      price: Number(item.project_sub_price ?? item.quotation_sub_price ?? item.sub_price ?? item.price) || 0,
      quantity: Number(item.project_sub_quantity ?? item.quotation_sub_quantity ?? item.sub_quantity ?? item.quantity) || 1,
      status: item.project_sub_status || item.quotation_sub_status || item.sub_status || "Pending",
    });
  });

  return Object.values(serviceMap).map((srv) => ({
    serviceId: srv.serviceId,
    serviceName: srv.serviceName,
    floors: Object.values(srv.floors).map((f) => ({
      floorId: f.floorId,
      floorName: f.floorName,
      areas: Object.values(f.areas).map((a) => ({
        areaId: a.areaId,
        areaName: a.areaName,
        products: a.products,
      })),
    })),
  }));
};

// Helper: Flatten nested Services structure to subs array with dual mapping
const flattenServicesToSubs = (servicesList) => {
  const flattened = [];
  servicesList.forEach((srv) => {
    srv.floors.forEach((floor) => {
      floor.areas.forEach((area) => {
        area.products.forEach((product) => {
          if (product.productId) {
            const price = Number(product.price);
            const quantity = Number(product.quantity);
            const amount = price * quantity;
            const status = product.status || "Pending";
            flattened.push({
              id: product.id || undefined,
              // Project specific keys
              project_sub_service_id: Number(srv.serviceId),
              project_sub_floor_id: Number(floor.floorId),
              project_sub_area_id: Number(area.areaId),
              project_sub_product_id: Number(product.productId),
              project_sub_price: price,
              project_sub_quantity: quantity,
              project_sub_amount: amount,
              project_sub_status: status,
              // Quotation dual keys for backend safety
              quotation_sub_service_id: Number(srv.serviceId),
              quotation_sub_floor_id: Number(floor.floorId),
              quotation_sub_area_id: Number(area.areaId),
              quotation_sub_product_id: Number(product.productId),
              quotation_sub_price: price,
              quotation_sub_quantity: quantity,
              quotation_sub_amount: amount,
              quotation_sub_status: status,
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
        formData.project_category_id ||
        formData.project_service_id ||
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
  }, [initialSnapshot, snapshotKey, isEdit, formData, servicesState]);

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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.project_buyer_id) newErrors.project_buyer_id = "Buyer is required";
    if (!formData.project_property_id) newErrors.project_property_id = "Property is required";

    if (newErrors.project_buyer_id || newErrors.project_property_id) {
      toast.error("Please select a Buyer and Property at the top of the form.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setErrors(newErrors);
      return false;
    }

    if (!formData.project_category_id) {
      toast.error("Please select at least one Category");
      return false;
    }
    if (!formData.project_service_id) {
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
            `Please select a Floor under Service block #${s + 1}, floor block #${f + 1}`
          );
          return false;
        }
        for (let a = 0; a < floor.areas.length; a++) {
          const area = floor.areas[a];
          if (!area.areaId) {
            toast.error(
              `Please select an Area under Service block #${s + 1}, Floor block #${f + 1}, area block #${a + 1}`
            );
            return false;
          }
          for (let p = 0; p < area.products.length; p++) {
            const prod = area.products[p];
            if (!prod.productId) {
              toast.error(
                `Please complete Product selection under Service #${s + 1} ➔ Floor #${f + 1} ➔ Area #${a + 1}, product #${p + 1}`
              );
              return false;
            }
            hasLineItems = true;
          }
        }
      }
    }

    if (!hasLineItems) {
      toast.error("Please add at least one project line item");
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
      // Dual mappings with Quotation keys for API compatibility
      quotation_date: date,
      quotation_validity_date: validityDate,
      quotation_buyer_id: buyerId,
      quotation_property_id: propertyId,
      quotation_category_id: categoryId,
      quotation_service_id: serviceId,
      quotation_remarks: remarks,
      quotation_status: status,
      // Generic fallbacks
      buyer_id: buyerId,
      property_id: propertyId,
      category_id: categoryId,
      service_id: serviceId,
      remarks: remarks,
      status: status,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveWithoutNavigate();
    if (!result) return;
    if (!isEdit && typeof result === "string") {
      navigate(`/project-list/edit/${result}`, { replace: true });
    }
  };

  const buyers = buyersData?.data || [];
  const properties = propertiesData?.data || [];
  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];
  const brands = brandsData?.data || [];

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

  const getProductOptions = (prod, rowServiceId) => {
    const base = getRowProductOptions(rowServiceId);
    const map = new Map();
    base.forEach((p) => {
      map.set(p.id?.toString(), {
        value: p.id?.toString(),
        label: p.product_name,
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

  const getRowProductOptions = (rowServiceId) => {
    if (!rowServiceId) return [];
    const matched = productsList.filter(
      (p) => p.service_id?.toString() === rowServiceId?.toString()
    );
    let base = matched;
    if (base.length === 0) {
      const catMatched = catProductsList.filter(
        (p) => p.service_id?.toString() === rowServiceId?.toString()
      );
      if (catMatched.length > 0) {
        base = catMatched;
      } else {
        base = catProductsList.filter(
          (p) =>
            checkedCategories.includes(p.category_id?.toString()) &&
            !matched.some((m) => m.id === p.id)
        );
      }
    }
    const seen = new Set(base.map((p) => p.id?.toString()));
    return [
      ...base,
      ...extraProducts.filter((e) => !seen.has(e.id?.toString())),
    ];
  };

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
    const realSvc = matched?.service_id?.toString();
    if (realSvc && srv.serviceId && realSvc !== srv.serviceId?.toString()) {
      const svcName =
        services.find((s) => s.id?.toString() === realSvc)?.service_name ||
        matched?.service_name ||
        realSvc;
      handleNestedFieldChange(serviceIndex, null, null, null, "serviceId", realSvc);
      setFormData((prev) => {
        const cur = prev.project_service_id ? prev.project_service_id.split(",") : [];
        if (cur.includes(realSvc)) return prev;
        return { ...prev, project_service_id: [...cur, realSvc].join(",") };
      });
      toast.info(`Row Service auto-set to '${svcName}'`);
    }
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
        handleProductSelect(
          target.serviceIndex,
          target.floorIndex,
          target.areaIndex,
          target.prodIndex,
          { value: freshProduct.id.toString(), label: freshProduct.product_name },
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
              <div className="space-y-2">
                <Label className="flex">
                  Buyer <RedStar />
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
                  placeholder="Search or Select Buyer"
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
                  addLabel="Add New Buyer"
                  renderAddLabel={(typed) =>
                    typed?.trim() ? `Add "${typed.trim()}" as New Buyer` : "Add New Buyer"
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

            <div className="space-y-6">
              {servicesState.map((srv, srvIdx) => (
                <div
                  key={srvIdx}
                  className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800 relative"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b dark:border-slate-800">
                    <div className="flex items-center gap-3 w-full md:w-1/2">
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
                          <div className="flex items-center gap-3 w-full md:w-1/3">
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
                                <div className="flex items-center gap-3 w-full md:w-1/3">
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
                                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"
                                    >
                                      <div className="flex-1 min-w-[200px]">
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
              Add New Buyer
            </DialogTitle>
            <DialogDescription>
              Quickly register a buyer without leaving the project form. It will be auto-selected
              after saving.
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

export default ProjectFormPage;
