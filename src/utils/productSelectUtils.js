const clean = (value) => (value ?? "").toString().trim();

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildProductOption = (product, brandName = "", categoryName = "") => {
  const moduleName = clean(product?.product_module);
  const productName = clean(product?.product_name);
  const brand = clean(product?.brand_name) || clean(brandName);
  const category = clean(product?.category_name) || clean(categoryName);

  const nameStartsWithModule =
    Boolean(moduleName) &&
    productName.toLowerCase().startsWith(moduleName.toLowerCase());

  const base =
    [category, nameStartsWithModule ? "" : moduleName, productName]
      .filter(Boolean)
      .join(" - ") || moduleName || productName || "";

  return {
    value: product?.id?.toString(),
    label: brand ? (base ? `${base} - (${brand})` : brand) : base,
    searchText: [moduleName, productName, category, brand]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
};

export const buildProductOptions = (products = [], resolveNames = {}) => {
  const { getBrandName, getCategoryName } = resolveNames;
  const seen = new Set();
  const options = [];

  (products || []).forEach((product) => {
    const brandName =
      clean(product?.brand_name) || clean(getBrandName?.(product));
    const categoryName =
      clean(product?.category_name) || clean(getCategoryName?.(product));
    const option = buildProductOption(product, brandName, categoryName);
    const price = Number(product?.product_price) || 0;

    const dedupeKey = [
      clean(product?.service_id),
      clean(product?.category_id),
      clean(product?.brand_id),
      brandName.toLowerCase(),
      categoryName.toLowerCase(),
      clean(product?.product_module).toLowerCase(),
      clean(product?.product_name).toLowerCase(),
      price,
      clean(product?.product_warranty),
    ].join("|");

    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    options.push({
      ...option,
      subtitle: [
        price > 0 ? `₹${price.toLocaleString()}` : "",
        product?.id ? `ID #${product.id}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    });
  });

  const labelCounts = options.reduce((counts, option) => {
    counts.set(option.label, (counts.get(option.label) || 0) + 1);
    return counts;
  }, new Map());

  return options.map((option) =>
    labelCounts.get(option.label) > 1
      ? option
      : { ...option, subtitle: "" }
  );
};

export const filterProductOption = (option, rawInput) => {
  const query = clean(rawInput).toLowerCase();
  if (!query) return true;

  const haystack = (
    option?.searchText ??
    option?.data?.searchText ??
    clean(option?.label)
  ).toLowerCase();

  return query.split(/\s+/).every((token) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(token)}`).test(haystack)
  );
};
