const clean = (value) => (value ?? "").toString().trim();

export const buildProductOption = (product, brandName = "", categoryName = "") => {
  const moduleName = clean(product?.product_module);
  const productName = clean(product?.product_name);
  const brand = clean(product?.brand_name) || clean(brandName);
  const category = clean(product?.category_name) || clean(categoryName);

  const nameStartsWithModule =
    Boolean(moduleName) &&
    productName.toLowerCase().startsWith(moduleName.toLowerCase());

  const base =
    [nameStartsWithModule ? "" : moduleName, productName]
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

export const filterProductOption = (option, rawInput) => {
  const query = clean(rawInput).toLowerCase();
  if (!query) return true;

  const haystack = (
    option?.searchText ??
    option?.data?.searchText ??
    clean(option?.label)
  ).toLowerCase();

  return query.split(/\s+/).every((token) => haystack.includes(token));
};
