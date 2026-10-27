import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingBar from "@/components/loader/loading-bar";
import {
  useQuotationQuery,
  useRevQuotationQuery,
  useGetProductsForQuotationQuery,
} from "../hooks/useQuotation";
import { useProjectQuery } from "../../project/hooks/useProject";
import { useActiveFloorsQuery } from "../../floor/hooks/useFloor";
import { useActiveAreasQuery } from "../../area/hooks/useArea";
import { useActiveServicesQuery } from "../../service/hooks/useService";
import { useActiveBrandsQuery } from "../../brand/hooks/useBrand";
import { useBuyerQuery } from "../../buyer/hooks/useBuyer";
import { useActivePropertiesQuery } from "../../property/hooks/useProperty";
import { useActiveCategoriesQuery } from "../../category/hooks/useCategory";
import { useActiveSalesTeamQuery } from "../../sales-team/hooks/useSalesTeam";
import { getSalesTeamMemberId } from "../../sales-team/api/salesTeamApi";

import ReportHeaderActions from "../components/report/ReportHeaderActions";
import CoverPage, { HERO_BG_URL } from "../components/report/CoverPage";
import AboutWhyPage from "../components/report/AboutWhyPage";
import DynamicProposalDocument from "../components/report/DynamicProposalDocument";
import CompactTableView from "../components/report/CompactTableView";
import { createStyledQuotationWorkbook, downloadBlob } from "@/app/reports/quotation-xlsx";
import { calculateMilestoneAmounts } from "@/utils/milestoneUtils";


const headers = [
  "Application",
  "Floor",
  "Area",
  "Product",
  "Quantity",
  "Total Price",
  "Finish",
  "Brand",
  "Warranty",
  "Remarks",
];

const formatMoney = (value) => {
  if (value === "" || value === null || value === undefined) return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  const hasDecimals = Math.abs(number % 1) > 0.001;
  return `₹ ${number.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

// Bright white villa hero (covers ~72% of the cover page background)
const MOCK_IMAGES = {
  coverBg: HERO_BG_URL,
  page2Hero:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
};

export default function QuotationReportPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRevised = searchParams.get("type") === "rev";
  // Project mode: Projects list "View Report" bhejta hai (?type=project) taaki
  // PROJECT id se project record khule — warna same numeric id wala QUOTATION
  // khul jata hai (ids alag sequences hai, e.g. project 5 = XYZ, quotation 5 = Manjunath).
  const isProject = searchParams.get("type") === "project";
  const docLabel = isProject ? "Project" : "Quotation";
  const [viewMode, setViewMode] = useState("presentation"); // 'presentation' | 'table'
  // Transient mode for the "PDF (No Price)" action — hides every monetary value
  // (rates, totals, net project cost, milestone amounts) only while printing.
  const [hidePricing, setHidePricing] = useState(false);
  // Cover photo white veil strength (0–100 %) — preview and PDF/print are
  // independent so the exported document can differ from the on-screen view.
  const [coverPreviewOverlay, setCoverPreviewOverlay] = useState(95);
  const [coverPdfOverlay, setCoverPdfOverlay] = useState(80);
  // Consultancy & Design % and Installation % — both editable from header bar,
  // each applied on the grand total. No % is shown in the printed proposal.
  const [consultancyPct, setConsultancyPct] = useState(5);
  const [installPct, setInstallPct] = useState(5);
  // Prepared-by selection (defaults to the logged-in member, else first active member)
  const [preparedById, setPreparedById] = useState("");
  // Logged-in user (fallback for "Prepared By")
  const authUser = useSelector((state) => state.auth?.user);

  // Sales team members for the Prepared By dropdown — GET /panel-fetch-sales-team
  // (endpoint already returns active members, so no extra status filter).
  const { data: salesTeamData } = useActiveSalesTeamQuery();
  const activeMembers = (() => {
    const payload = salesTeamData?.data ?? salesTeamData;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    const keys = ["members", "sales_team", "salesTeam", "list", "records"];
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    return [];
  })();
  const preparedByOptions = activeMembers.map((m) => {
    const apiId = getSalesTeamMemberId(m);
    const fallbackId = m.mobile || m.phone || m.email || m.name || "";
    return {
      id: String(apiId || fallbackId),
      name: m.name || "Sales Team Member",
      phone: m.mobile || m.phone || "",
      email: m.email || "",
      mobile: m.mobile || m.phone || "",
      status: m.status || "Active",
      isApiMember: Boolean(apiId),
    };
  });

  // Keep the dropdown valid once members load. Default to the logged-in member
  // when they exist in the sales team, else the first active member.
  useEffect(() => {
    if (!preparedByOptions.length) return;
    setPreparedById((prev) => {
      if (preparedByOptions.some((p) => String(p.id) === String(prev))) {
        return prev;
      }
      const authEmail = (authUser?.email || "").toLowerCase();
      const authPhone = String(
        authUser?.mobile || authUser?.phone || ""
      ).replace(/\D/g, "");
      const loggedInMember = preparedByOptions.find((p) => {
        const memberEmail = (p.email || "").toLowerCase();
        const memberPhone = (p.phone || "").replace(/\D/g, "");
        return (
          (authEmail && memberEmail === authEmail) ||
          (authPhone &&
            memberPhone &&
            memberPhone.slice(-10) === authPhone.slice(-10))
        );
      });
      return loggedInMember?.id || preparedByOptions[0].id;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesTeamData, authUser]);

  // Queries
  const { data: parentData, isLoading: parentLoading } = useQuotationQuery(
    id,
    !isRevised && !isProject
  );
  const { data: revData, isLoading: revLoading } = useRevQuotationQuery(
    id,
    isRevised
  );
  const { data: projectData, isLoading: projectLoading } = useProjectQuery(
    id,
    isProject
  );
  const { data: floorsData, isLoading: floorsLoading } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading } = useActiveAreasQuery();
  const { data: servicesData, isLoading: servicesLoading } =
    useActiveServicesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useActiveBrandsQuery();
  const { data: propertiesData, isLoading: propertiesLoading } =
    useActivePropertiesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useActiveCategoriesQuery();

  const quotationDetail = isProject
    ? projectData?.data
    : isRevised
      ? revData?.data
      : parentData?.data;

  // Buyer lookup — fetch the buyer record so name / mobile / address are available
  const buyerId = quotationDetail?.quotation_buyer_id;
  const needsBuyerFetch = Boolean(buyerId);
  const { data: buyerData, isLoading: buyerLoading } = useBuyerQuery(
    buyerId,
    needsBuyerFetch
  );
  const buyer = buyerData?.data || {};

  const { data: productsData, isLoading: productsLoading } =
    useGetProductsForQuotationQuery(
      quotationDetail?.quotation_category_id,
      quotationDetail?.quotation_service_id,
      Boolean(
        quotationDetail?.quotation_category_id &&
        quotationDetail?.quotation_service_id
      )
    );

  const isLoading =
    (!isRevised && !isProject && parentLoading) ||
    (isRevised && revLoading) ||
    (isProject && projectLoading) ||
    floorsLoading ||
    areasLoading ||
    servicesLoading ||
    brandsLoading ||
    productsLoading ||
    propertiesLoading ||
    categoriesLoading ||
    (needsBuyerFetch && buyerLoading);

  if (isLoading) return <LoadingBar />;

  if (!quotationDetail) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">{docLabel} not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const rawSubs = quotationDetail.subs || [];
  const subs = [...rawSubs].sort((a, b) => {
    const sA =
      a.quotation_sub_sort !== null &&
      a.quotation_sub_sort !== undefined &&
      a.quotation_sub_sort !== ""
        ? Number(a.quotation_sub_sort)
        : a.project_sub_sort !== null &&
          a.project_sub_sort !== undefined &&
          a.project_sub_sort !== ""
        ? Number(a.project_sub_sort)
        : null;
    const sB =
      b.quotation_sub_sort !== null &&
      b.quotation_sub_sort !== undefined &&
      b.quotation_sub_sort !== ""
        ? Number(b.quotation_sub_sort)
        : b.project_sub_sort !== null &&
          b.project_sub_sort !== undefined &&
          b.project_sub_sort !== ""
        ? Number(b.project_sub_sort)
        : null;

    if (sA !== null && sB !== null) return sA - sB;
    if (sA !== null) return -1;
    if (sB !== null) return 1;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
  const floors = floorsData?.data || [];
  const areas = areasData?.data || [];
  const services = servicesData?.data || [];
  const products = productsData?.data || [];
  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

  // Helper mappings
  const getFloorName = (fid) =>
    floors.find((f) => f.id?.toString() === fid?.toString())?.property_floor ||
    "-";
  const getAreaName = (aid) =>
    areas.find((a) => a.id?.toString() === aid?.toString())?.property_area ||
    "-";
  const getServiceName = (sid) =>
    services.find((s) => s.id?.toString() === sid?.toString())?.service_name ||
    "-";
  const getProductDetails = (pid) =>
    products.find((p) => p.id?.toString() === pid?.toString());

  // Build items array
  // Sub key normalization: project subs me project_sub_* keys hoti hai
  // (converted me dono sets hoti hai) — quotation_sub_* par fallback.
  const subVal = (sub, base) =>
    sub[`project_sub_${base}`] ?? sub[`quotation_sub_${base}`];
  const items = subs.map((sub, idx) => {
    const prodDetails = getProductDetails(subVal(sub, "product_id"));
    const brandName =
      brands.find((b) => b.id?.toString() === prodDetails?.brand_id?.toString())
        ?.brand_name || "-";
    const warranty = prodDetails?.product_warranty || "-";
    const appName = getServiceName(subVal(sub, "service_id"));
    const floorName = getFloorName(subVal(sub, "floor_id"));
    const areaName = getAreaName(subVal(sub, "area_id"));
    const productName =
      prodDetails?.product_name || "Product ID: " + subVal(sub, "product_id");

    // Resolve category/finish selected under categories
    const categoryObj = categories.find(
      (c) =>
        c.id?.toString() === prodDetails?.category_id?.toString() ||
        c.id?.toString() === sub.quotation_category_id?.toString() ||
        c.id?.toString() === sub.project_category_id?.toString()
    );
    const finishName =
      categoryObj?.category_name ||
      prodDetails?.category_name ||
      sub.category_name ||
      quotationDetail.quotation_category_name ||
      "-";

    return {
      __idx: idx,
      type: "item",
      application: appName,
      floor: floorName,
      area: areaName,
      product: productName,
      quantity: Number(subVal(sub, "quantity")) || 0,
      price: Number(subVal(sub, "price")) || 0,
      totalPrice: Number(subVal(sub, "amount")) || 0,
      finish: finishName,
      brand: brandName,
      warranty: warranty,
      remarks:
        subVal(sub, "notes") ||
        quotationDetail?.quotation_remarks ||
        quotationDetail?.project_remarks ||
        "",
      notes: subVal(sub, "notes") || `${floorName} - ${areaName}`,
    };
  });

  // Table rows with section summaries
  const tableRows = [];
  const groupedByApp = {};
  items.forEach((item) => {
    if (!groupedByApp[item.application]) {
      groupedByApp[item.application] = [];
    }
    groupedByApp[item.application].push(item);
  });

  let grandTotal = 0;
  Object.keys(groupedByApp).forEach((appName) => {
    const appItems = groupedByApp[appName];
    appItems.forEach((item) => {
      tableRows.push(item);
    });

    const appTotal = appItems.reduce((sum, item) => sum + item.totalPrice, 0);
    grandTotal += appTotal;

    tableRows.push({
      type: "summary",
      label: `Total ${appName}`,
      totalPrice: appTotal,
    });
  });

  // Totals — taxes are inclusive, so Net = Grand + Consultancy + Installation.
  // No separate GST line item is shown anywhere in the proposal, and no %
  // figures are printed — only the computed values.
  const consultancyFee = Math.round(grandTotal * (consultancyPct / 100));
  const installationFee = Math.round(grandTotal * (installPct / 100));
  const netTotal = grandTotal + consultancyFee + installationFee;

  // Client name — the API exposes `buyer_name` (see QuotationListPage),
  // not `client_name`, which is why the old lookup always hit the fallback.
  const clientName =
    quotationDetail.buyer_name ||
    buyer.buyer_name ||
    quotationDetail.buyer?.buyer_name ||
    quotationDetail.client_name ||
    quotationDetail.lead_name ||
    quotationDetail.customer_name ||
    "Valued Client";
  // Location — prefer the property, then the buyer's address.
  const projectAddress =
    quotationDetail.property_address ||
    quotationDetail.property_name ||
    quotationDetail.property?.property_address ||
    buyer.buyer_address ||
    quotationDetail.buyer?.buyer_address ||
    quotationDetail.address ||
    "Bangalore, India";

  // Property Type
  const properties = propertiesData?.data || [];
  const propertyObj = properties.find(
    (p) => p.id?.toString() === quotationDetail.quotation_property_id?.toString()
  );
  const propertyType =
    propertyObj?.property ||
    quotationDetail.property_name ||
    quotationDetail.property?.property ||
    quotationDetail.property ||
    quotationDetail.property_type ||
    "-";

  // Client contact number
  const clientPhone =
    quotationDetail.buyer_mobile ||
    quotationDetail.client_phone ||
    quotationDetail.client_mobile ||
    quotationDetail.customer_mobile ||
    quotationDetail.buyer?.buyer_mobile ||
    buyer.buyer_mobile ||
    "-";
  const quotationNo = quotationDetail.quotation_no || quotationDetail.id || "2894";
  const quotationDateRaw =
    quotationDetail.quotation_date || quotationDetail.created_at;
  const quotationDate = quotationDateRaw
    ? new Date(quotationDateRaw).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "August 7, 2026";
  // Prepared-by — follows the header selection, falling back to quotation /
  // logged-in user when no sales-team member matches.
  const selectedPreparer = preparedByOptions.find(
    (p) => String(p.id) === String(preparedById)
  );
  const contactPerson =
    selectedPreparer?.name ||
    quotationDetail.sales_person ||
    quotationDetail.prepared_by ||
    quotationDetail.created_by_name ||
    quotationDetail.user_name ||
    quotationDetail.employee_name ||
    authUser?.name ||
    "MAKc Automation and Solutions LLP";
  const contactPhone =
    selectedPreparer?.phone ||
    quotationDetail.contact_no ||
    quotationDetail.mobile ||
    quotationDetail.phone ||
    authUser?.mobile ||
    authUser?.phone ||
    "";
  const contactEmail =
    selectedPreparer?.email ||
    quotationDetail.contact_email ||
    quotationDetail.email ||
    quotationDetail.created_by_email ||
    quotationDetail.user_email ||
    authUser?.email ||
    "";

  // Milestones sum to the Net Project Value (inclusive of installation).
  const bookingPct =
    Number(
      quotationDetail.quotation_booing_confirmation ??
      quotationDetail.quotation_booking_confirmation ??
      quotationDetail.project_booing_confirmation ??
      quotationDetail.project_booking_confirmation ??
      30
    ) || 30;
  const hardwarePct =
    Number(
      quotationDetail.quotation_hardware ??
      quotationDetail.project_hardware ??
      60
    ) || 60;
  const installationPct =
    Number(
      quotationDetail.quotation_installation ??
      quotationDetail.project_installation ??
      10
    ) || 10;

  const milestoneAmounts = calculateMilestoneAmounts(netTotal, [
    bookingPct,
    hardwarePct,
    installationPct,
  ]);

  const paymentRows = [
    { section: "Payment Cycle", label: "Booking Confirmation", amount: milestoneAmounts[0], percentage: `${bookingPct}%` },
    { section: "Payment Cycle", label: "Hardware Ordering & Dispatch", amount: milestoneAmounts[1], percentage: `${hardwarePct}%` },
    { section: "Payment Cycle", label: "Installation & Pre-Commissioning", amount: milestoneAmounts[2], percentage: `${installationPct}%` },
  ];

  // Hero PNG bada hai — print/PDF se pehle ensure karo ki cover image load/decode ho chuki hai
  // (4s timeout, taaki slow network par print block na ho).
  const waitForHeroImage = async () => {
    try {
      const img = new Image();
      img.src = HERO_BG_URL;
      const load = img.decode
        ? img.decode()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
      await Promise.race([
        load.catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch {
      // image load fail ho to bhi print chale
    }
  };

  const handlePrint = async () => {
    await waitForHeroImage();
    window.print();
  };

  // Print/save a scope-only PDF: rates, totals, net project cost and payment
  // amounts are hidden just for this print job, then restored.
  const handlePrintNoPrice = async () => {
    await waitForHeroImage();
    flushSync(() => setHidePricing(true));

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      window.removeEventListener("afterprint", restore);
      flushSync(() => setHidePricing(false));
    };
    window.addEventListener("afterprint", restore);

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    try {
      window.print();
    } finally {
      setTimeout(restore, 1000);
    }
  };

  const handleExportExcel = () => {
    const workbook = createStyledQuotationWorkbook({ items });
    downloadBlob(workbook, `MAKc_${docLabel}_${quotationNo}.xlsx`);
  };

  // No-price PDF drops the total price column from the compact table.
  const reportHeaders = hidePricing
    ? headers.filter((header) => header !== "Total Price")
    : headers;

  // Light-only theme (theme switcher removed)
  const printBgColor = "#ffffff";
  const printFgColor = "#0f172a";
  const previewCardBg = "#ffffff";

  return (
    <div className="quotation-report-root flex-1 space-y-4 p-2 md:p-6 bg-background text-foreground min-h-screen">
      {/* Global CSS for Print & Dynamic Multi-page Pagination */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0mm;
            }

            /* Hide all CRM layout wrappers, sidebars, headers, footers, buttons */
            header,
            footer,
            nav,
            aside,
            [data-sidebar],
            .quotation-no-print {
              display: none !important;
            }

            html, body, #root,
            [class*="sidebar"], [data-sidebar], [data-sidebar="inset"], [class*="SidebarInset"],
            main, main > div,
            .quotation-report-root, .makc-pdf-container, .makc-print-wrapper {
              background: ${printBgColor} !important;
              color: ${printFgColor} !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              transform: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .makc-print-wrapper > * {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }
            .makc-page {
              background: ${printBgColor} !important;
              box-shadow: none !important;
              margin: 0 auto !important;
              width: 210mm !important;
              max-width: 210mm !important;
              box-sizing: border-box !important;
              position: relative !important;
              border: 1px solid rgba(0, 0, 0, 0.1) !important;
            }
            .makc-cover-page {
              width: 210mm !important;
              max-width: 210mm !important;
              height: 296mm !important;
              max-height: 296mm !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
              border: 1px solid rgba(0, 0, 0, 0.1) !important;
            }
            .makc-cover-page * {
              box-shadow: none !important;
              text-shadow: none !important;
            }
            .makc-about-why-page {
              width: 210mm !important;
              max-width: 210mm !important;
              height: 296mm !important;
              max-height: 296mm !important;
              box-sizing: border-box !important;
              page-break-before: always !important;
              break-before: page !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
              border: 1px solid rgba(0, 0, 0, 0.1) !important;
            }
            .makc-about-why-page * {
              box-shadow: none !important;
              text-shadow: none !important;
            }
            .makc-print-wrapper > *:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin-bottom: 0 !important;
            }
            .makc-page-dynamic {
              min-height: 0 !important;
              height: auto !important;
              page-break-after: auto !important;
              break-after: auto !important;
              overflow: visible !important;
            }
            /* Compact data table: full-width fluid, never A4-constrained */
            .makc-compact-view {
              width: 100% !important;
              max-width: 100% !important;
              overflow: visible !important;
            }
            .break-inside-avoid, tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            /* Print-safe flats: no translucency / blur compositing in PDF export */
            .makc-caption-card {
              background: #ffffff !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
            h1, h2, h3, h4, [class*="SectionHeading"] {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
            thead {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
          }

          /* Consistent font stack for entire quotation page */
          .quotation-report-root {
            font-family: ui-sans-serif, system-ui, sans-serif;
          }

          /* Web PDF preview styling (light only) */
          .makc-page {
            width: 100%;
            max-width: 210mm;
            background: ${previewCardBg};
            position: relative;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
            margin: 0 auto 2rem auto;
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
            overflow: hidden;
          }
          .makc-cover-page {
            height: 297mm;
            overflow: hidden;
          }
          .makc-page-dynamic {
            min-height: 297mm;
            height: auto;
            overflow: visible;
          }
          /* Compact data table: full-width fluid on screen (not A4 width) */
          .makc-compact-view {
            width: 100%;
            max-width: 100%;
            margin: 0;
            overflow: visible;
          }
          .makc-compact-view table {
            width: 100%;
          }
        `}
      </style>

      {/* Header Actions Component (navigation + view + charges % + prepared-by + export/print) */}
      <ReportHeaderActions
        quotationNo={quotationNo}
        docLabel={docLabel}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNavigateBack={() => navigate(-1)}
        consultancyPct={consultancyPct}
        onConsultancyPctChange={setConsultancyPct}
        installPct={installPct}
        onInstallPctChange={setInstallPct}
        coverPreviewOverlay={coverPreviewOverlay}
        onCoverPreviewOverlayChange={setCoverPreviewOverlay}
        coverPdfOverlay={coverPdfOverlay}
        onCoverPdfOverlayChange={setCoverPdfOverlay}
        preparedById={preparedById}
        onPreparedByChange={setPreparedById}
        preparedByOptions={preparedByOptions}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onPrintNoPrice={handlePrintNoPrice}
      />

      {/* Main Content Area */}
      <div className="makc-pdf-container">
        {viewMode === "table" ? (
          <CompactTableView
            headers={reportHeaders}
            hidePricing={hidePricing}
            tableRows={tableRows}
            items={items}
            grandTotal={grandTotal}
            consultancyFee={consultancyFee}
            installationFee={installationFee}
            installPct={installPct}
            netTotal={netTotal}
            formatMoney={formatMoney}
          />
        ) : (
          <div className="makc-print-wrapper py-4 space-y-8">
            {/* Page 1: Executive Cover Page */}
            <CoverPage
              clientName={clientName}
              clientPhone={clientPhone}
              propertyType={propertyType}
              projectAddress={projectAddress}
              quotationNo={quotationNo}
              docLabel={docLabel}
              quotationDate={quotationDate}
              contactPerson={contactPerson}
              contactPhone={contactPhone}
              bgImage={MOCK_IMAGES.coverBg}
              previewOverlay={coverPreviewOverlay}
              pdfOverlay={coverPdfOverlay}
            />

            {/* Dynamic Continuous Proposal Document (Scope, Pricing, Milestones, Terms & Approval) */}
            <DynamicProposalDocument
              items={items}
              quotationNo={quotationNo}
              clientName={clientName}
              formatMoney={formatMoney}
              grandTotal={grandTotal}
              consultancyPct={consultancyPct}
              consultancyFee={consultancyFee}
              installationFee={installationFee}
              installPct={installPct}
              netTotal={netTotal}
              paymentRows={paymentRows}
              hidePricing={hidePricing}
            />

            {/* Last Page: About MAKc & Awards Overview */}
            <AboutWhyPage
              heroImage={MOCK_IMAGES.page2Hero}
              clientName={clientName}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
            />
          </div>
        )}
      </div>
    </div>
  );
}
