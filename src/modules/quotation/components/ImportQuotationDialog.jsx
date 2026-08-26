import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useGetProductsForQuotationQuery } from "../hooks/useQuotation";

// Enhanced normalize string for robust matching (e.g. "8M - 1 Fan,1Socket, 4 Control" -> "8 m 1 fan 1 socket 4 control")
const normalizeStr = (str) => {
  if (!str) return "";
  let s = str
    .toString()
    .toLowerCase()
    .replace(/(\d+)([a-z]+)/gi, "$1 $2")
    .replace(/([a-z]+)(\d+)/gi, "$1 $2")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize common floor & area typos / synonyms
  s = s
    .replace(/\bfirst\b/g, "1st")
    .replace(/\bsecond\b/g, "2nd")
    .replace(/\bthird\b/g, "3rd")
    .replace(/\blivig\b/g, "living")
    .replace(/\bbalconey\b/g, "balcony");

  return s;
};

// Match string against list using exact, contains, word-set, or fuzzy rules
const findBestMatch = (
  str,
  list,
  nameFields = ["property_floor", "property_area", "service_name", "floor_name", "area_name", "product_name", "product_module", "name", "title"]
) => {
  if (!str || !list || !list.length) return null;
  const clean = normalizeStr(str);
  if (!clean) return null;

  // 1. Exact normalized match
  for (const item of list) {
    for (const field of nameFields) {
      if (item[field] && normalizeStr(item[field]) === clean) {
        return item;
      }
    }
  }

  // 2. Substring match
  for (const item of list) {
    for (const field of nameFields) {
      if (item[field]) {
        const itemClean = normalizeStr(item[field]);
        if (itemClean && (itemClean.includes(clean) || clean.includes(itemClean))) {
          return item;
        }
      }
    }
  }

  // 3. Keyword / Word set match
  const words = clean.split(" ").filter((w) => w.length > 0);
  if (words.length > 0) {
    for (const item of list) {
      for (const field of nameFields) {
        if (item[field]) {
          const itemClean = normalizeStr(item[field]);
          const matchesAll = words.every((w) => itemClean.includes(w));
          if (matchesAll) return item;
        }
      }
    }
  }

  // 4. Partial word overlap match
  if (words.length > 1) {
    let maxMatchCount = 0;
    let bestItem = null;
    for (const item of list) {
      for (const field of nameFields) {
        if (item[field]) {
          const itemClean = normalizeStr(item[field]);
          const matchCount = words.filter((w) => itemClean.includes(w)).length;
          if (matchCount > maxMatchCount && matchCount / words.length >= 0.4) {
            maxMatchCount = matchCount;
            bestItem = item;
          }
        }
      }
    }
    if (bestItem) return bestItem;
  }

  return null;
};

export const parseQuotationTSV = ({
  rawText,
  services = [],
  floors = [],
  areas = [],
  products = [],
  categories = [],
}) => {
  if (!rawText || !rawText.trim())
    return {
      parsedRows: [],
      summary: null,
      nestedState: [],
      matchedServiceIds: [],
      matchedCategoryIds: [],
    };

  const lines = rawText.split(/\r?\n/).map((l) => l.trimEnd()).filter(Boolean);

  let currentApp = "";
  let currentFloor = "";
  let currentArea = "";

  const parsedRows = [];
  const matchedServiceIds = new Set();
  const matchedCategoryIds = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.trim().toLowerCase();

    // Skip summary / header / metadata lines (trimmed comparison)
    if (
      cleanLine.includes("experience the smart living") ||
      cleanLine.startsWith("total") ||
      cleanLine.includes("consultation") ||
      cleanLine.includes("installation") ||
      cleanLine.includes("payment") ||
      cleanLine.includes("booking") ||
      cleanLine.includes("before hardware") ||
      cleanLine.includes("after installation")
    ) {
      continue;
    }

    const cols = line.split("\t").map((c) => c.trim());

    // Header detection
    if (
      cols.some((c) =>
        ["application", "floor", "area", "product", "quantity", "price", "brand", "warranty"].includes(
          c.toLowerCase()
        )
      )
    ) {
      continue;
    }

    const nonEmptyCols = cols
      .map((val, idx) => ({ val, idx }))
      .filter((item) => item.val !== "");

    if (nonEmptyCols.length === 0) continue;

    let productVal = "";
    let qtyVal = 1;
    let priceVal = 0;

    // Detect Application (Service)
    if (cols[1] && cols[1] !== "") {
      const matched = findBestMatch(cols[1], services, ["service_name", "name", "title"]);
      if (matched || ["electrical automation", "door automation", "curtain/blind automation", "networking", "security"].includes(cols[1].toLowerCase())) {
        currentApp = cols[1];
      }
    } else if (cols[0] && cols[0] !== "") {
      currentApp = cols[0];
    }

    // Detect Floor
    if (cols[2] && cols[2] !== "") {
      currentFloor = cols[2];
    }

    // Detect Area
    if (cols[3] && cols[3] !== "") {
      currentArea = cols[3];
    }

    // Detect Product
    if (cols[4] && cols[4] !== "") {
      productVal = cols[4];
    } else {
      const textCol = nonEmptyCols.find((c) => isNaN(parseFloat(c.val.replace(/,/g, ""))));
      if (textCol) productVal = textCol.val;
    }

    // Detect Quantity
    if (cols[5] && !isNaN(parseInt(cols[5], 10))) {
      qtyVal = parseInt(cols[5], 10) || 1;
    }

    // Detect Price
    if (cols[6] && !isNaN(parseFloat(cols[6].replace(/,/g, "")))) {
      priceVal = parseFloat(cols[6].replace(/,/g, "")) || 0;
    }

    // Guard against column shifts where price is assigned to quantity
    if (qtyVal > 1000) {
      priceVal = qtyVal;
      qtyVal = 1;
    }

    if (!productVal) continue;

    // Match Master Services
    const matchedService = findBestMatch(currentApp, services, ["service_name", "name", "title"]);
    if (matchedService?.id) matchedServiceIds.add(matchedService.id.toString());

    // Match Master Floors (support property_floor field name)
    const matchedFloor = findBestMatch(currentFloor, floors, ["property_floor", "floor_name", "name", "title"]);

    // Match Master Areas (support property_area field name)
    const matchedArea = findBestMatch(currentArea, areas, ["property_area", "area_name", "name", "title"]);

    // Match Master Products against all products
    const matchedProduct = findBestMatch(productVal, products, ["product_name", "name", "title", "product_module", "code"]);
    if (matchedProduct) {
      if (matchedProduct.category_id) matchedCategoryIds.add(matchedProduct.category_id.toString());
      if (matchedProduct.service_id) matchedServiceIds.add(matchedProduct.service_id.toString());
    }

    parsedRows.push({
      rawApp: currentApp,
      rawFloor: currentFloor,
      rawArea: currentArea,
      rawProduct: productVal,
      qty: qtyVal,
      price: priceVal || (matchedProduct ? Number(matchedProduct.product_price) || 0 : 0),
      totalPrice: qtyVal * (priceVal || (matchedProduct ? Number(matchedProduct.product_price) || 0 : 0)),
      matchedService,
      matchedFloor,
      matchedArea,
      matchedProduct,
    });
  }

  // Construct nested servicesState structure: Service -> Floor -> Area -> Product
  const serviceGroupMap = {};

  parsedRows.forEach((row) => {
    const serviceId = row.matchedService?.id?.toString() || (services[0]?.id?.toString() || "");
    const floorId = row.matchedFloor?.id?.toString() || (floors[0]?.id?.toString() || "");
    const areaId = row.matchedArea?.id?.toString() || (areas[0]?.id?.toString() || "");
    const productId = row.matchedProduct?.id?.toString() || "";

    if (!serviceGroupMap[serviceId]) {
      serviceGroupMap[serviceId] = {
        serviceId,
        floors: {},
      };
    }

    if (!serviceGroupMap[serviceId].floors[floorId]) {
      serviceGroupMap[serviceId].floors[floorId] = {
        floorId,
        areas: {},
      };
    }

    if (!serviceGroupMap[serviceId].floors[floorId].areas[areaId]) {
      serviceGroupMap[serviceId].floors[floorId].areas[areaId] = {
        areaId,
        products: [],
      };
    }

    serviceGroupMap[serviceId].floors[floorId].areas[areaId].products.push({
      id: null,
      productId,
      price: row.price,
      quantity: row.qty,
      status: "Pending",
      rawProductName: row.rawProduct,
    });
  });

  const nestedState = Object.values(serviceGroupMap).map((srv) => ({
    serviceId: srv.serviceId,
    floors: Object.values(srv.floors).map((f) => ({
      floorId: f.floorId,
      areas: Object.values(f.areas).map((a) => ({
        areaId: a.areaId,
        products: a.products,
      })),
    })),
  }));

  const totalQuantity = parsedRows.reduce((acc, r) => acc + r.qty, 0);
  const totalAmount = parsedRows.reduce((acc, r) => acc + r.totalPrice, 0);

  return {
    parsedRows,
    summary: {
      totalItems: parsedRows.length,
      matchedProductsCount: parsedRows.filter((r) => r.matchedProduct).length,
      unmatchedProductsCount: parsedRows.filter((r) => !r.matchedProduct).length,
      matchedServicesCount: parsedRows.filter((r) => r.matchedService).length,
      matchedFloorsCount: parsedRows.filter((r) => r.matchedFloor).length,
      matchedAreasCount: parsedRows.filter((r) => r.matchedArea).length,
      totalQuantity,
      totalAmount,
    },
    nestedState,
    matchedServiceIds: Array.from(matchedServiceIds),
    matchedCategoryIds: Array.from(matchedCategoryIds),
  };
};

export default function ImportQuotationDialog({
  isOpen,
  onClose,
  onApply,
  services = [],
  floors = [],
  areas = [],
  products = [],
  categories = [],
}) {
  const [rawText, setRawText] = useState("");
  const [step, setStep] = useState("input"); // 'input' | 'preview'

  // Fetch all products across all categories and services for full master coverage
  const allCategoryIds = categories.map((c) => c.id).join(",");
  const allServiceIds = services.map((s) => s.id).join(",");

  const { data: allProductsResp } = useGetProductsForQuotationQuery(
    allCategoryIds,
    allServiceIds,
    Boolean(isOpen && allCategoryIds && allServiceIds)
  );

  const masterProductsList = allProductsResp?.data && allProductsResp.data.length > 0 ? allProductsResp.data : products;

  const parsedResult = parseQuotationTSV({
    rawText,
    services,
    floors,
    areas,
    products: masterProductsList,
    categories,
  });

  const handleApply = () => {
    if (!parsedResult.nestedState || parsedResult.nestedState.length === 0) {
      toast.error("No valid line items parsed from text");
      return;
    }

    onApply({
      nestedState: parsedResult.nestedState,
      serviceIds: parsedResult.matchedServiceIds,
      categoryIds: parsedResult.matchedCategoryIds,
      totalItems: parsedResult.summary.totalItems,
      unmatchedCount: parsedResult.summary.unmatchedProductsCount,
    });

    if (parsedResult.summary.unmatchedProductsCount > 0) {
      toast.warning(
        `Imported ${parsedResult.summary.totalItems} items. Note: ${parsedResult.summary.unmatchedProductsCount} product(s) could not be matched automatically and require product selection in the dropdown.`
      );
    } else {
      toast.success(`Successfully imported all ${parsedResult.summary.totalItems} line items!`);
    }

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRawText("");
    setStep("input");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Import Quotation Items from Excel / TSV
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Paste your raw tabular data copied from Excel or TSV files. The parser automatically groups items into
            Services ➔ Floors ➔ Areas ➔ Products.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {step === "input" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paste Tabular Data Below:
                </span>
                <span className="text-xs text-slate-400">
                  Expected format: Application | Floor | Area | Product | Qty | Price | Brand
                </span>
              </div>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste your copied Excel table here...\n\nExample:\nElectrical Automation\tGround Floor\tCommon\tBLE Bridge\t1\t14200\t14200\tMAK\t5 Year\n\t\tParking\t4M - 8 Control\t2\t17036\t34072\tMAK\t5 Year`}
                className="h-72 font-mono text-xs p-3 leading-relaxed border-slate-200 dark:border-slate-800"
              />
              {rawText.trim() && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>
                      Detected {parsedResult.summary?.totalItems || 0} line items ({parsedResult.summary?.matchedProductsCount || 0} matched products out of {masterProductsList.length} in master)
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setStep("preview")}>
                    Preview Parsed Data
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs text-slate-500">Total Line Items</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{parsedResult.summary?.totalItems}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs text-slate-500">Matched Products</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {parsedResult.summary?.matchedProductsCount} / {parsedResult.summary?.totalItems}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs text-slate-500">Total Quantity</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{parsedResult.summary?.totalQuantity}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs text-slate-500">Total Amount</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ₹{parsedResult.summary?.totalAmount?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {parsedResult.summary?.unmatchedProductsCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{parsedResult.summary.unmatchedProductsCount} product(s)</strong> could not be automatically matched with the database. They will be created with an empty selection so you can select the product from the dropdown.
                  </span>
                </div>
              )}

              {/* Table Preview */}
              <div className="border rounded-lg max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                    <TableRow>
                      <TableHead className="text-xs">Service (Application)</TableHead>
                      <TableHead className="text-xs">Floor</TableHead>
                      <TableHead className="text-xs">Area</TableHead>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Price</TableHead>
                      <TableHead className="text-xs text-right">Total Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedResult.parsedRows.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 text-xs">
                        <TableCell className="font-medium">
                          {row.matchedService ? (
                            <span className="text-emerald-700 dark:text-emerald-400">{row.matchedService.service_name}</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">{row.rawApp || "Default Service"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.matchedFloor ? (
                            <span className="text-emerald-700 dark:text-emerald-400">{row.matchedFloor.property_floor || row.matchedFloor.floor_name}</span>
                          ) : (
                            <span className="text-slate-500">{row.rawFloor || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.matchedArea ? (
                            <span className="text-emerald-700 dark:text-emerald-400">{row.matchedArea.property_area || row.matchedArea.area_name}</span>
                          ) : (
                            <span className="text-slate-500">{row.rawArea || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.matchedProduct ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 font-normal">
                              {row.matchedProduct.product_name}
                            </Badge>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-mono">
                              <AlertCircle className="h-3 w-3 shrink-0 text-amber-500" />
                              {row.rawProduct} (Unmatched)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{row.qty}</TableCell>
                        <TableCell className="text-right">₹{row.price.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-semibold">₹{row.totalPrice.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            {step === "preview" && (
              <Button variant="outline" size="sm" onClick={() => setStep("input")}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Edit Text
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {step === "input" ? (
              <Button size="sm" disabled={!rawText.trim()} onClick={() => setStep("preview")}>
                Preview ({parsedResult.summary?.totalItems || 0} items)
              </Button>
            ) : (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApply}>
                <Upload className="h-4 w-4 mr-1.5" /> Apply {parsedResult.summary?.totalItems} Items to Quotation
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
