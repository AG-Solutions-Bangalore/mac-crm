import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Download, Eye, FileDown, FileSpreadsheet, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingBar from "@/components/loader/loading-bar";
import { useQuotationQuery, useRevQuotationQuery, useGetProductsForQuotationQuery } from "../../modules/quotation/hooks/useQuotation";
import { useActiveFloorsQuery } from "../../modules/floor/hooks/useFloor";
import { useActiveAreasQuery } from "../../modules/area/hooks/useArea";
import { useActiveServicesQuery } from "../../modules/service/hooks/useService";
import { useActiveBrandsQuery } from "../../modules/brand/hooks/useBrand";
import { createStyledQuotationWorkbook, downloadBlob } from "./quotation-xlsx";

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
  return `INR ${number.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function Quotation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRevised = searchParams.get("type") === "rev";

  // Queries
  const { data: parentData, isLoading: parentLoading } = useQuotationQuery(id, !isRevised);
  const { data: revData, isLoading: revLoading } = useRevQuotationQuery(id, isRevised);
  const { data: floorsData, isLoading: floorsLoading } = useActiveFloorsQuery();
  const { data: areasData, isLoading: areasLoading } = useActiveAreasQuery();
  const { data: servicesData, isLoading: servicesLoading } = useActiveServicesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useActiveBrandsQuery();

  const quotationDetail = isRevised ? revData?.data : parentData?.data;

  const { data: productsData, isLoading: productsLoading } = useGetProductsForQuotationQuery(
    quotationDetail?.quotation_category_id,
    quotationDetail?.quotation_service_id,
    Boolean(quotationDetail?.quotation_category_id && quotationDetail?.quotation_service_id)
  );

  const isLoading =
    (!isRevised && parentLoading) ||
    (isRevised && revLoading) ||
    floorsLoading ||
    areasLoading ||
    servicesLoading ||
    brandsLoading ||
    productsLoading;

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
  const getFloorName = (fid) => floors.find((f) => f.id?.toString() === fid?.toString())?.property_floor || "-";
  const getAreaName = (aid) => areas.find((a) => a.id?.toString() === aid?.toString())?.property_area || "-";
  const getServiceName = (sid) => services.find((s) => s.id?.toString() === sid?.toString())?.service_name || "-";
  const getProductDetails = (pid) => products.find((p) => p.id?.toString() === pid?.toString());

  // Build tableRows dynamically
  const tableRows = [];
  const items = subs.map((sub) => {
    const prodDetails = getProductDetails(sub.quotation_sub_product_id);
    const brandName = brands.find((b) => b.id?.toString() === prodDetails?.brand_id?.toString())?.brand_name || "-";
    const warranty = prodDetails?.product_warranty || "-";
    const appName = getServiceName(sub.quotation_sub_service_id);
    const floorName = getFloorName(sub.quotation_sub_floor_id);
    const areaName = getAreaName(sub.quotation_sub_area_id);
    const productName = prodDetails?.product_name || "Product ID: " + sub.quotation_sub_product_id;

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
    };
  });

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

  tableRows.push({
    type: "grandTotal",
    label: "Total Project",
    totalPrice: grandTotal,
  });

  const paymentRows = [
    { section: "Payment Cycle", label: "Booking", amount: grandTotal * 0.3 },
    { section: "Payment Cycle", label: "Before Hardware", amount: grandTotal * 0.6 },
    { section: "Payment Cycle", label: "After Installation", amount: grandTotal * 0.1 },
    { section: "Payment Cycle", label: "Total", amount: grandTotal },
    { section: "Payment Made", label: "Total", amount: 0 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const buildDownloadHtml = () => {
    const tableHtml = tableRows
      .map((row) => {
        if (row.type !== "item") {
          return `
            <tr class="${row.type === "grandTotal" ? "grand-total" : "summary"}">
              <td colspan="6">${escapeHtml(row.label)}</td>
              <td>${escapeHtml(formatMoney(row.totalPrice))}</td>
              <td colspan="2"></td>
            </tr>
          `;
        }

        return `
          <tr>
            <td>${escapeHtml(row.application || "-")}</td>
            <td>${escapeHtml(row.floor || "-")}</td>
            <td>${escapeHtml(row.area || "-")}</td>
            <td>${escapeHtml(row.product)}</td>
            <td>${escapeHtml(row.quantity || "-")}</td>
            <td>${escapeHtml(formatMoney(row.price))}</td>
            <td>${escapeHtml(formatMoney(row.totalPrice))}</td>
            <td>${escapeHtml(row.brand || "-")}</td>
            <td>${escapeHtml(row.warranty || "-")}</td>
          </tr>
        `;
      })
      .join("");

    const paymentHtml = ["Payment Cycle", "Payment Made"]
      .map((section) => {
        const rows = paymentRows
          .filter((row) => row.section === section && row.label !== "Total")
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.label)}</td>
                <td>${escapeHtml(formatMoney(row.amount))}</td>
              </tr>
            `,
          )
          .join("");

        return `
          <section>
            <h2>${escapeHtml(section)}</h2>
            <table>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      })
      .join("");

    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Quotation Report</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { margin: 24px 0 8px; font-size: 16px; }
        .meta { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
        .total { font-weight: 700; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 12px; vertical-align: top; }
        th { background: #f3f4f6; text-align: left; }
        .summary { background: #f9fafb; font-weight: 700; }
        .grand-total { background: #e0f2fe; font-weight: 800; }
        @media print { @page { size: A4 landscape; margin: 10mm; } body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="meta">
        <div>
          <h1>Experience The Smart Living</h1>
          <div>Home automation project estimate</div>
        </div>
        <div class="total">
          <div>Total Project</div>
          <div>${escapeHtml(formatMoney(grandTotal))}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableHtml}</tbody>
      </table>
      ${paymentHtml}
    </body>
  </html>`;
  };

  const handleDownload = () => {
    const blob = new Blob([buildDownloadHtml()], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Quotation_Report_${id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const workbook = createStyledQuotationWorkbook({ items });
    downloadBlob(workbook, `Quotation_Report_${id}.xlsx`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body * { visibility: hidden; }
            .quotation-print-area, .quotation-print-area * { visibility: visible; }
            .quotation-print-area { position: absolute; inset: 0; width: 100%; padding: 0; }
            .quotation-no-print { display: none !important; }
            .quotation-print-card { border: 0 !important; box-shadow: none !important; }
            .quotation-table th, .quotation-table td { font-size: 10px !important; padding: 4px 6px !important; }
          }
        `}
      </style>

      <div className="quotation-no-print flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" />
              Quotation View {isRevised ? "(Revised)" : "(Parent)"}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Experience The Smart Living</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <FileDown className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <div className="quotation-print-area space-y-4">
        <div className="grid gap-3 md:grid-cols-4 quotation-no-print">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Project Total</CardDescription>
              <CardTitle>{formatMoney(grandTotal)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Automation</CardDescription>
              <CardTitle>{formatMoney(grandTotal)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Line Items</CardDescription>
              <CardTitle>{items.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Payment Made</CardDescription>
              <CardTitle>{formatMoney(0)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="quotation-print-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  Quotation
                </div>
                <CardTitle className="mt-1 text-2xl">Experience The Smart Living</CardTitle>
                <CardDescription>Home automation project estimate</CardDescription>
              </div>
              <div className="text-left text-sm md:text-right">
                <div className="font-semibold">Total Project</div>
                <div>{formatMoney(grandTotal)}</div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table className="quotation-table min-w-[1100px]">
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row, index) =>
                    row.type === "item" ? (
                      <TableRow key={`${row.product}-${index}`}>
                        <TableCell className="font-medium">{row.application || "-"}</TableCell>
                        <TableCell>{row.floor || "-"}</TableCell>
                        <TableCell>{row.area || "-"}</TableCell>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.quantity || "-"}</TableCell>
                        <TableCell>{formatMoney(row.price)}</TableCell>
                        <TableCell className="font-medium">{formatMoney(row.totalPrice)}</TableCell>
                        <TableCell>{row.brand || "-"}</TableCell>
                        <TableCell>{row.warranty || "-"}</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow
                        key={`${row.label}-${index}`}
                        className={row.type === "grandTotal" ? "bg-primary/10 font-bold" : "bg-muted/50 font-semibold"}
                      >
                        <TableCell colSpan={6}>{row.label}</TableCell>
                        <TableCell>{formatMoney(row.totalPrice)}</TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="quotation-print-card">
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {["Payment Cycle", "Payment Made"].map((section) => (
                <div key={section} className="rounded-md border">
                  <div className="border-b bg-muted/50 px-4 py-2 font-semibold">{section}</div>
                  <div className="divide-y">
                    {paymentRows
                      .filter((row) => row.section === section)
                      .map((row) => (
                        <div key={`${section}-${row.label}`} className="flex items-center justify-between px-4 py-2 text-sm">
                          <span>{row.label}</span>
                          <span className="font-medium">{formatMoney(row.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Quotation;
