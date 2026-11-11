import BASE_URL from "@/config/base-url";

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const isAbsoluteUrl = (value) =>
  /^(https?:)?\/\//i.test(value) ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

const findBaseUrl = (imageUrlArray, labels) => {
  if (!Array.isArray(imageUrlArray)) return "";
  const wanted = labels.map((label) => label.toLowerCase());
  const match = imageUrlArray.find((item) =>
    wanted.includes(String(item?.image_for || "").toLowerCase()),
  );
  return clean(match?.image_url);
};

const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return "";
  if (path.startsWith("/")) {
    try {
      return `${new URL(baseUrl).origin}${path}`;
    } catch {
      return path;
    }
  }
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export const resolveProductImageUrl = (product, imageUrlArray) => {
  const candidates = [
    product?.product_image_url,
    product?.product_image,
    product?.productImage,
  ]
    .map(clean)
    .filter(Boolean);

  if (!candidates.length) return "";

  const absolute = candidates.find(isAbsoluteUrl);
  if (absolute) return absolute;

  const raw = candidates[0];
  const base =
    clean(product?.product_image_base_url) ||
    clean(product?.product_url) ||
    findBaseUrl(product?.image_url, ["Product", "Products", "Product Image"]) ||
    findBaseUrl(imageUrlArray, ["Product", "Products", "Product Image"]);

  if (base) return joinUrl(base, raw);

  if (raw.startsWith("/")) {
    try {
      return `${new URL(BASE_URL).origin}${raw}`;
    } catch {
      return raw;
    }
  }

  return "";
};
