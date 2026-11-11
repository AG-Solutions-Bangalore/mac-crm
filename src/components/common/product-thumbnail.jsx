import React from "react";

const ProductThumbnail = ({ src, alt = "Product", size = 32, className = "" }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded border border-slate-200 bg-white object-cover shrink-0 dark:border-slate-700 ${className}`}
      style={{ width: size, height: size }}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
};

export default ProductThumbnail;
