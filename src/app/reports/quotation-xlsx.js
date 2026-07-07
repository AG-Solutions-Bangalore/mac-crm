const BLUE = "3A3EA2";
const TITLE = "EXPERIENCE THE SMART LIVING";

const HEADERS = [
  "Application",
  "Floor",
  "Area",
  "Product",
  "Quantity",
  "Price",
  "Total price",
  "Brand",
  "Warranty",
];

const COL_WIDTHS = [7, 12.44, 12.78, 15, 28.11, 9.66, 8.55, 10.66, 11.44, 9.33];

const xml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const columnName = (index) => {
  let name = "";
  let value = index;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
};

const cellRef = (col, row) => `${columnName(col)}${row}`;

const normalizeText = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const groupItems = (items) => {
  const applications = [];
  const appMap = new Map();

  items.forEach((item) => {
    const appName = normalizeText(item.application, "Application");
    const floorName = normalizeText(item.floor, "-");
    const areaName = normalizeText(item.area, "-");

    if (!appMap.has(appName)) {
      const app = { name: appName, floors: [], floorMap: new Map() };
      appMap.set(appName, app);
      applications.push(app);
    }

    const app = appMap.get(appName);
    if (!app.floorMap.has(floorName)) {
      const floor = { name: floorName, areas: [], areaMap: new Map() };
      app.floorMap.set(floorName, floor);
      app.floors.push(floor);
    }

    const floor = app.floorMap.get(floorName);
    if (!floor.areaMap.has(areaName)) {
      const area = { name: areaName, items: [] };
      floor.areaMap.set(areaName, area);
      floor.areas.push(area);
    }

    floor.areaMap.get(areaName).items.push({
      product: normalizeText(item.product, "-"),
      quantity: normalizeNumber(item.quantity),
      price: normalizeNumber(item.price),
      totalPrice: normalizeNumber(item.totalPrice),
      brand: normalizeText(item.brand, "-"),
      warranty: normalizeText(item.warranty, "-"),
    });
  });

  return applications;
};

const getTotalLabel = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("electrical")) return "Total Automation";
  if (normalized.includes("door")) return "Total Door";
  if (normalized.includes("curtain") || normalized.includes("blind")) return "Total Curtain";
  if (normalized.includes("network")) return "Total Networking";
  if (normalized.includes("security")) return "Total Security";
  return `Total ${name}`;
};

const createCell = ({ row, col, value = "", style = 0, formula, number = false }) => {
  const ref = cellRef(col, row);
  const styleAttr = style ? ` s="${style}"` : "";

  if (formula) {
    return `<c r="${ref}"${styleAttr}><f>${xml(formula)}</f><v>${normalizeNumber(value)}</v></c>`;
  }

  if (number) {
    return `<c r="${ref}"${styleAttr}><v>${normalizeNumber(value)}</v></c>`;
  }

  if (value === "" || value === null || value === undefined) {
    return `<c r="${ref}"${styleAttr}/>`;
  }

  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
};

const buildSheetModel = ({ items }) => {
  const rows = new Map();
  const merges = [];
  const categoryTotalRows = [];
  const applications = groupItems(items);
  let currentRow = 1;

  const addCell = (row, col, payload) => {
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(createCell({ row, col, ...payload }));
  };

  const styleRange = (row, startCol, endCol, style) => {
    for (let col = startCol; col <= endCol; col += 1) {
      addCell(row, col, { style });
    }
  };

  addCell(currentRow, 1, { value: TITLE, style: 1 });
  HEADERS.forEach((header, index) => {
    addCell(currentRow, index + 2, { value: header, style: 2 });
  });
  currentRow += 1;

  applications.forEach((application, appIndex) => {
    const appStart = currentRow;

    application.floors.forEach((floor) => {
      const floorStart = currentRow;

      floor.areas.forEach((area) => {
        const areaStart = currentRow;

        area.items.forEach((item, itemIndex) => {
          addCell(currentRow, 2, {
            value: currentRow === appStart ? application.name : "",
            style: 3,
          });
          addCell(currentRow, 3, {
            value: currentRow === floorStart ? floor.name : "",
            style: 3,
          });
          addCell(currentRow, 4, {
            value: itemIndex === 0 ? area.name : "",
            style: 3,
          });
          addCell(currentRow, 5, { value: item.product, style: 4 });
          addCell(currentRow, 6, { value: item.quantity, style: 5, number: true });
          addCell(currentRow, 7, { value: item.price, style: 5, number: true });
          addCell(currentRow, 8, { value: item.totalPrice, style: 5, number: true });
          addCell(currentRow, 9, { value: item.brand, style: 3 });
          addCell(currentRow, 10, { value: item.warranty, style: 3 });
          currentRow += 1;
        });

        const areaEnd = currentRow - 1;
        if (areaEnd > areaStart) merges.push(`D${areaStart}:D${areaEnd}`);
      });

      const floorEnd = currentRow - 1;
      if (floorEnd > floorStart) merges.push(`C${floorStart}:C${floorEnd}`);
    });

    const appEnd = currentRow - 1;
    if (appEnd > appStart) merges.push(`B${appStart}:B${appEnd}`);

    const totalRow = currentRow;
    const appTotal = application.floors
      .flatMap((floor) => floor.areas)
      .flatMap((area) => area.items)
      .reduce((sum, item) => sum + item.totalPrice, 0);

    merges.push(`B${totalRow}:G${totalRow}`);
    styleRange(totalRow, 2, 10, 6);
    addCell(totalRow, 2, { value: getTotalLabel(application.name), style: 6 });
    addCell(totalRow, 8, {
      value: appTotal,
      style: 7,
      formula: `SUM(H${appStart}:H${appEnd})`,
    });
    categoryTotalRows.push(totalRow);
    currentRow += 1;

    if (appIndex < applications.length - 1) {
      merges.push(`B${currentRow}:J${currentRow}`);
      styleRange(currentRow, 2, 10, 11);
      currentRow += 1;
    }
  });

  const grandRow = currentRow;
  const grandFormula = categoryTotalRows.length
    ? `SUM(${categoryTotalRows.map((row) => `H${row}`).join(",")})`
    : "0";
  const grandTotal = applications.reduce(
    (sum, application) =>
      sum +
      application.floors
        .flatMap((floor) => floor.areas)
        .flatMap((area) => area.items)
        .reduce((appSum, item) => appSum + item.totalPrice, 0),
    0,
  );

  merges.push(`B${grandRow}:G${grandRow}`);
  styleRange(grandRow, 2, 10, 8);
  addCell(grandRow, 2, { value: "Total Project", style: 8 });
  addCell(grandRow, 8, { value: grandTotal, style: 9, formula: grandFormula });
  currentRow += 3;

  const paymentStart = currentRow;
  merges.push(`D${currentRow}:F${currentRow}`);
  styleRange(currentRow, 4, 6, 10);
  addCell(currentRow, 4, { value: "Payment Cycle", style: 10 });
  currentRow += 1;

  [
    ["Booking", `${cellRef(8, grandRow)}*30%`, grandTotal * 0.3],
    ["Before Hardware", `${cellRef(8, grandRow)}*60%`, grandTotal * 0.6],
    ["After Installation", `${cellRef(8, grandRow)}*10%`, grandTotal * 0.1],
    ["Total", `SUM(F${paymentStart + 1}:F${paymentStart + 3})`, grandTotal],
  ].forEach(([label, formula, value]) => {
    addCell(currentRow, 4, { style: 11 });
    addCell(currentRow, 5, { value: label, style: label === "Total" ? 12 : 11 });
    addCell(currentRow, 6, { value, style: 13, formula });
    currentRow += 1;
  });

  currentRow += 2;
  const paymentMadeHeader = currentRow;
  merges.push(`D${currentRow}:F${currentRow}`);
  styleRange(currentRow, 4, 6, 10);
  addCell(currentRow, 4, { value: "Payment Made", style: 10 });
  currentRow += 1;

  for (let i = 0; i < 8; i += 1) {
    styleRange(currentRow, 4, 6, 11);
    currentRow += 1;
  }

  addCell(currentRow, 4, { style: 11 });
  addCell(currentRow, 5, { value: "Total", style: 12 });
  addCell(currentRow, 6, {
    value: 0,
    style: 13,
    formula: `SUM(F${paymentMadeHeader + 1}:F${currentRow - 1})`,
  });

  merges.push(`A1:A${Math.max(grandRow, 18)}`);

  return {
    rows,
    merges,
    maxRow: currentRow,
    maxCol: 10,
  };
};

const buildRowsXml = (rows) =>
  [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, cells]) => `<row r="${row}">${cells.join("")}</row>`)
    .join("");

const buildWorksheetXml = (model) => {
  const cols = COL_WIDTHS.map(
    (width, index) =>
      `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
  ).join("");
  const merges = model.merges.length
    ? `<mergeCells count="${model.merges.length}">${model.merges
        .map((ref) => `<mergeCell ref="${ref}"/>`)
        .join("")}</mergeCells>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="A1:${cellRef(model.maxCol, model.maxRow)}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${cols}</cols>
  <sheetData>${buildRowsXml(model.rows)}</sheetData>
  ${merges}
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
  <pageSetup orientation="portrait" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>
  <fonts count="5">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Roboto"/></font>
    <font><sz val="11"/><name val="Roboto"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Roboto"/></font>
    <font><b/><sz val="12"/><name val="Roboto"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF${BLUE}"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color indexed="64"/></left>
      <right style="thin"><color indexed="64"/></right>
      <top style="thin"><color indexed="64"/></top>
      <bottom style="thin"><color indexed="64"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="medium"><color indexed="64"/></left>
      <right style="medium"><color indexed="64"/></right>
      <top style="medium"><color indexed="64"/></top>
      <bottom style="thin"><color indexed="64"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="14">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" textRotation="90" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="164" fontId="2" fillId="3" borderId="1" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="164" fontId="3" fillId="2" borderId="1" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="164" fontId="3" fillId="2" borderId="1" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="164" fontId="1" fillId="3" borderId="1" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="HA" sheetId="1" r:id="rId1"/></sheets>
  <calcPr calcId="124519" fullCalcOnLoad="1"/>
</workbook>`;

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const APP_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>MAC CRM</Application>
</Properties>`;

const CORE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>MAC CRM</dc:creator>
  <dc:title>Quotation Report</dc:title>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`;

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (view, offset, value) => view.setUint16(offset, value, true);
const writeUint32 = (view, offset, value) => view.setUint32(offset, value, true);

const encodeText = (text) => new TextEncoder().encode(text);

const concat = (chunks) => {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    out.set(chunk, offset);
    offset += chunk.length;
  });
  return out;
};

const zipDateTime = () => {
  const date = new Date();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
};

const createZipBlob = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = zipDateTime();

  files.forEach(({ name, content }) => {
    const nameBytes = encodeText(name);
    const data = typeof content === "string" ? encodeText(content) : content;
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, dosTime);
    writeUint16(localView, 12, dosDate);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, data.length);
    writeUint32(localView, 22, data.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    local.set(nameBytes, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, dosTime);
    writeUint16(centralView, 14, dosDate);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, data.length);
    writeUint32(centralView, 24, data.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + data.length;
  });

  const centralDirectory = concat(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectory.length);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([concat([...localParts, centralDirectory, end])], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const createStyledQuotationWorkbook = ({ items }) => {
  const model = buildSheetModel({ items });
  const worksheetXml = buildWorksheetXml(model);

  return createZipBlob([
    { name: "[Content_Types].xml", content: CONTENT_TYPES_XML },
    { name: "_rels/.rels", content: ROOT_RELS_XML },
    { name: "docProps/app.xml", content: APP_XML },
    { name: "docProps/core.xml", content: CORE_XML },
    { name: "xl/workbook.xml", content: WORKBOOK_XML },
    { name: "xl/_rels/workbook.xml.rels", content: WORKBOOK_RELS_XML },
    { name: "xl/styles.xml", content: STYLES_XML },
    { name: "xl/worksheets/sheet1.xml", content: worksheetXml },
  ]);
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
