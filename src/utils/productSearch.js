const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tokenize = (term) =>
  (term ?? "").toString().trim().toLowerCase().split(/\s+/).filter(Boolean);

// Hybrid search:
// - Text tokens match anywhere, so "fle" finds "Flexible" and "Reflex".
// - Tokens containing digits must start on a word boundary, so "2m" does not
//   find "12m", while "120" still finds "120W" (unit suffix) and "120" does
//   not find "1200".
export const matchesSearchTokens = (haystack, term) => {
  const tokens = tokenize(term);
  if (tokens.length === 0) return true;

  const text = (haystack ?? "").toString().toLowerCase();
  return tokens.every((token) => {
    if (!/\d/.test(token)) return text.includes(token);
    const re = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(token)}[a-z]*([^a-z0-9]|$)`
    );
    return re.test(text);
  });
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
