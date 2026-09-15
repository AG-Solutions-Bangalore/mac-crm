import React, { useState } from "react";
// Load Inter font for PDF
if (typeof document !== 'undefined' && !document.getElementById('makc-inter-font')) {
  const l = document.createElement('link');
  l.id = 'makc-inter-font';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
  document.head.appendChild(l);
}
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
import { useActiveFloorsQuery } from "../../floor/hooks/useFloor";
import { useActiveAreasQuery } from "../../area/hooks/useArea";
import { useActiveServicesQuery } from "../../service/hooks/useService";
import { useActiveBrandsQuery } from "../../brand/hooks/useBrand";
import { useBuyerQuery } from "../../buyer/hooks/useBuyer";

import ReportHeaderActions from "../components/report/ReportHeaderActions";
import CoverPage from "../components/report/CoverPage";
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
  "Price",
  "Total Price",
  "Brand",
  "Warranty",
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

// High resolution dark luxury architecture mockup images
const MOCK_IMAGES = {
  coverBg:
    "https://makcautomations.com/images/hero_bg.webp",
  page2Hero:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
};

export default function QuotationReportPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRevised = searchParams.get("type") === "rev";
  const [viewMode, setViewMode] = useState("presentation"); // 'presentation' | 'table'
  // Dynamic Transportation & Installation charge % (editable from header bar)
  const [installPct, setInstallPct] = useState(5);

  // Queries
  const { data: parentData, isLoading: parentLoading } = useQuotationQuery(
    id,
    !isRevised
  );
  const { data: revData, isLoading: revLoading } = useRevQuotationQuery(
    id,
    isRevised
  );
  const { data: floorsData, isLoading: floorsLoading } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading } = useActiveAreasQuery();
  const { data: servicesData, isLoading: servicesLoading } =
    useActiveServicesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useActiveBrandsQuery();

  const quotationDetail = isRevised ? revData?.data : parentData?.data;

  // Logged-in user (fallback for "Prepared By")
  const authUser = useSelector((state) => state.auth?.user);

  // Buyer lookup — the quotation list/detail API exposes `buyer_name`,
  // but fetch the buyer record too so name / mobile / address are correct
  // even when the detail payload only carries `quotation_buyer_id`.
  const buyerId = quotationDetail?.quotation_buyer_id;
  const needsBuyerFetch =
    Boolean(buyerId) && !quotationDetail?.buyer_name;
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
    (!isRevised && parentLoading) ||
    (isRevised && revLoading) ||
    floorsLoading ||
    areasLoading ||
    servicesLoading ||
    brandsLoading ||
    productsLoading ||
    (needsBuyerFetch && buyerLoading);

  if (isLoading) return <LoadingBar />;

  if (!quotationDetail) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Quotation not found.</p>
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
  const items = subs.map((sub) => {
    const prodDetails = getProductDetails(sub.quotation_sub_product_id);
    const brandName =
      brands.find((b) => b.id?.toString() === prodDetails?.brand_id?.toString())
        ?.brand_name || "-";
    const warranty = prodDetails?.product_warranty || "-";
    const appName = getServiceName(sub.quotation_sub_service_id);
    const floorName = getFloorName(sub.quotation_sub_floor_id);
    const areaName = getAreaName(sub.quotation_sub_area_id);
    const productName =
      prodDetails?.product_name || "Product ID: " + sub.quotation_sub_product_id;

    return {
      type: "item",
      application: appName,
      floor: floorName,
      area: areaName,
      product: productName,
      quantity: Number(sub.quotation_sub_quantity) || 0,
      price: Number(sub.quotation_sub_price) || 0,
      totalPrice: Number(sub.quotation_sub_amount) || 0,
      brand: brandName,
      warranty: warranty,
      notes: sub.quotation_sub_notes || `${floorName} - ${areaName}`,
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

  // Totals — taxes are inclusive, so Net = Hardware + Installation only.
  // No separate GST line item is shown anywhere in the proposal.
  const installationFee = Math.round(grandTotal * (installPct / 100));
  const netTotal = grandTotal + installationFee;

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
  // Prepared-by — prefer whoever created the quotation, then the logged-in user.
  const contactPerson =
    quotationDetail.sales_person ||
    quotationDetail.prepared_by ||
    quotationDetail.created_by_name ||
    quotationDetail.user_name ||
    quotationDetail.employee_name ||
    authUser?.name ||
    "Vinod Kumar";
  const contactPhone =
    quotationDetail.contact_no ||
    quotationDetail.mobile ||
    quotationDetail.phone ||
    authUser?.mobile ||
    authUser?.phone ||
    "+91-7338504441";

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
    downloadBlob(workbook, `MAKc_Quotation_${quotationNo}.xlsx`);
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

            html, body, #root, .quotation-report-root, .makc-pdf-container, .makc-print-wrapper, main, [class*="Sidebar"] {
              background: ${printBgColor} !important;
              color: ${printFgColor} !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
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
              margin: 0 !important;
              width: 210mm !important;
              box-sizing: border-box !important;
              position: relative !important;
            }
            .makc-cover-page {
              height: 297mm !important;
              max-height: 297mm !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
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
            h1, h2, h3, h4, [class*="SectionHeading"] {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
            thead {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
          }

          /* Web PDF preview styling (light only) */
          .makc-page {
            width: 210mm;
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

      {/* Header Actions Component (navigation + view + install % + export/print) */}
      <ReportHeaderActions
        quotationNo={quotationNo}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNavigateBack={() => navigate(-1)}
        installPct={installPct}
        onInstallPctChange={setInstallPct}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <div className="makc-pdf-container">
        {viewMode === "table" ? (
          <CompactTableView
            headers={headers}
            tableRows={tableRows}
            items={items}
            grandTotal={grandTotal}
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
              projectAddress={projectAddress}
              quotationNo={quotationNo}
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
