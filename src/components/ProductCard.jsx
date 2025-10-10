import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../api/backend";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  if (!product) return null;

  const goDetail = () => navigate(`/productos/${product.id}`);

  const priceText =
    typeof product.price === "number"
      ? `$${product.price.toFixed(2)}`
      : product.price || "";

  const [src, setSrc] = useState("/placeholder.png");

  useEffect(() => {
    const firstId = product.imageIds?.[0];
    if (!firstId) return; // no hay imagen -> queda placeholder

    // GET /products/images?id={imageId} -> { file: "<BASE64>" }
    backend
      .get("/products/images", { params: { id: firstId } })
      .then((res) => {
        const base64 = res.data?.file;
        if (base64) {
          // asumimos jpeg; si es png igual funciona
          setSrc(`data:image/jpeg;base64,${base64}`);
        }
      })
      .catch(() => {
        setSrc("/placeholder.png");
      });
  }, [product.imageIds]);

  return (
    <li
      className="
        group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white
        shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
      "
    >
      {/* Imagen */}
      <div
        onClick={goDetail}
        className="relative w-full cursor-pointer overflow-hidden aspect-[4/3] bg-gray-50"
      >
        <img
          src={src}
          alt={product.name || "Producto"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setSrc("/placeholder.png")}
        />
        {/* Degradé sutil abajo al hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        {/* Título centrado y estable (no “tiembla”) */}
        <h3
          onClick={goDetail}
          title={product.name}
          className="
            cursor-pointer px-2 text-base font-semibold leading-snug text-gray-900
            min-h-[2.75rem] line-clamp-2
          "
          style={{
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily:
              "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          }}
        >
          {product.name}
        </h3>

        {priceText && (
          <p className="mt-1 text-lg font-bold text-emerald-600">{priceText}</p>
        )}

        <button
          type="button"
          onClick={() => console.log("ADD_TO_CART:", product)}
          className="
            mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white
            transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300
          "
        >
          Agregar al carrito
        </button>
      </div>
    </li>
  );
};

export default ProductCard;







