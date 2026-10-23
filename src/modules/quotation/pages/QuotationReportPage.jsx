import React, { useState } from "react";
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

import ReportHeaderActions from "../components/report/ReportHeaderActions";
import CoverPage, { HERO_BG_URL } from "../components/report/CoverPage";
import AboutWhyPage from "../components/report/AboutWhyPage";
import DynamicProposalDocument from "../components/report/DynamicProposalDocument";
import CompactTableView from "../components/report/CompactTableView";
import { createStyledQuotationWorkbook, downloadBlob } from "@/app/reports/quotation-xlsx";


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

// Prepared-by directory (selectable from report header)
export const PREPARED_BY_OPTIONS = [
  { id: "abhay", name: "Mr. Abhay Kumar Agarwal", phone: "9324226077" },
  { id: "manan", name: "Mr. Manan Abhay Kumar", phone: "8197783287" },
  { id: "bikash", name: "Mr. Bikash Pradhan Newar", phone: "8197785095" },
  { id: "vinod", name: "Mr. Vinod Kumar", phone: "7338504441" },
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
  // Price column toggle for compact table — hidden by default, applies to print/PDF too
  const [showPrice, setShowPrice] = useState(false);
  // Consultancy & Design % and Installation % — both editable from header bar,
  // each applied on the grand total. No % is shown in the printed proposal.
  const [consultancyPct, setConsultancyPct] = useState(5);
  const [installPct, setInstallPct] = useState(5);
  // Prepared-by selection (defaults to Vinod Kumar, overridable from header)
  const [preparedById, setPreparedById] = useState("vinod");

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

  // Logged-in user (fallback for "Prepared By")
  const authUser = useSelector((state) => state.auth?.user);

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

  const subs = quotationDetail.subs || [];
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
  // Prepared-by — selectable from header (defaults to Vinod Kumar),
  // falling back to quotation / logged-in user when no match.
  const selectedPreparer = PREPARED_BY_OPTIONS.find((p) => p.id === preparedById);
  const contactPerson =
    selectedPreparer?.name ||
    quotationDetail.sales_person ||
    quotationDetail.prepared_by ||
    quotationDetail.created_by_name ||
    quotationDetail.user_name ||
    quotationDetail.employee_name ||
    authUser?.name ||
    "Mr. Vinod Kumar";
  const contactPhone =
    selectedPreparer?.phone ||
    quotationDetail.contact_no ||
    quotationDetail.mobile ||
    quotationDetail.phone ||
    authUser?.mobile ||
    authUser?.phone ||
    "7338504441";

  // Milestones sum to the Net Project Value (inclusive of installation).
  const paymentRows = [
    { section: "Payment Cycle", label: "Booking Confirmation", amount: netTotal * 0.3, percentage: "30%" },
    { section: "Payment Cycle", label: "Hardware Ordering & Dispatch", amount: netTotal * 0.6, percentage: "60%" },
    { section: "Payment Cycle", label: "Installation & Pre-Commissioning", amount: netTotal * 0.1, percentage: "10%" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const workbook = createStyledQuotationWorkbook({ items });
    downloadBlob(workbook, `MAKc_${docLabel}_${quotationNo}.xlsx`);
  };

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
        preparedById={preparedById}
        onPreparedByChange={setPreparedById}
        preparedByOptions={PREPARED_BY_OPTIONS}
        showPrice={showPrice}
        onTogglePrice={() => setShowPrice((prev) => !prev)}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <div className="makc-pdf-container">
        {viewMode === "table" ? (
          <CompactTableView
            headers={
              showPrice
                ? [
                    ...headers.slice(0, 5),
                    "Price",
                    ...headers.slice(5),
                  ]
                : headers
            }
            showPrice={showPrice}
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
            />

            {/* Last Page: About MAKc & Awards Overview */}
            <AboutWhyPage
              heroImage={MOCK_IMAGES.page2Hero}
              clientName={clientName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
