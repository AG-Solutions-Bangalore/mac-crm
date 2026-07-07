import { useState, useEffect } from "react";

const ImageCell = ({
  src,
  fallback,
  alt = "image",
  width = 40,
  height = 20,
  className = "",
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <div 
      style={{ width: `${width}px`, height: `${height}px` }} 
      className="shrink-0 overflow-hidden rounded border bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
    >
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onError={() => setImgSrc(fallback)}
        className={`object-cover w-full h-full block ${className}`}
      />
    </div>
  );
};

export default ImageCell;
