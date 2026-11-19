const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tokenize = (term) =>
  (term ?? "").toString().trim().toLowerCase().split(/\s+/).filter(Boolean);

// Match all search tokens against the haystack:
// - Each token must be included in the text (substring match).
// This allows typing partial codes, alphanumeric model numbers (e.g., "alt100" matches "ALT1003"),
// prefixes, or any keyword naturally without strict word boundaries.
export const matchesSearchTokens = (haystack, term) => {
  const tokens = tokenize(term);
  if (tokens.length === 0) return true;

  const text = (haystack ?? "").toString().toLowerCase();
  return tokens.every((token) => text.includes(token));
};

export const productSearchHaystack = (record) =>
  [
    record?.product_module,
    record?.product_name,
    record?.service_name,
    record?.category_name,
    record?.brand_name,
  ]
    .filter(Boolean)
    .join(" ");

export const matchesProductSearch = (record, term) =>
  matchesSearchTokens(productSearchHaystack(record), term);
