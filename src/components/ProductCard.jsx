import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../api/backend";

const FALLBACK = "/placeholder.png";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  if (!product) return null;

  const goDetail = () => navigate(`/productos/${product.id}`);

  // Para evitar reruns innecesarios y carreras, calculo el primero acá
  const firstId = product?.imageIds?.[0] ?? null;

  // Precios
  const priceNum = Number(product?.price);
  const transferNum = Number(
    product?.priceWithTransferDiscount ?? product?.price_with_transfer_discount
  );
  const hasTransfer =
    !Number.isNaN(transferNum) &&
    transferNum > 0 &&
    !Number.isNaN(priceNum) &&
    transferNum !== priceNum;

  const priceText = !Number.isNaN(priceNum)
    ? `$${priceNum.toFixed(2)}`
    : product?.price || "";

  const [src, setSrc] = useState(FALLBACK);

  useEffect(() => {
    // Al cambiar de producto/imagen, reseteo al placeholder
    setSrc(FALLBACK);
    if (!firstId) return;

    const ctrl = new AbortController();
    let alive = true;

    backend
      .get("/products/images", { params: { id: firstId }, signal: ctrl.signal })
      .then((res) => {
        if (!alive) return;
        const base64 = res.data?.file;
        if (base64) {
          // Heurística simple para MIME (png/jpg). Si no matchea, uso jpg.
          const mime = base64.startsWith("iVBORw0K") ? "image/png" : "image/jpeg";
          setSrc(`data:${mime};base64,${base64}`);
        } else {
          setSrc(FALLBACK);
        }
      })
      .catch((err) => {
        // Si la request fue abortada, no hago nada
        if (ctrl.signal.aborted) return;
        setSrc(FALLBACK);
      });

    return () => {
      alive = false;
      ctrl.abort(); // cancelamos la request anterior
    };
  }, [firstId]);

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
        className="relative w-full cursor-pointer overflow-hidden aspect-[4/3] bg-white"
      >
        <img
          src={src}
          alt={product.name || 'Producto'}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setSrc(FALLBACK)}
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        {/* Título estable */}
        <h3
          onClick={goDetail}
          title={product.name}
          className="cursor-pointer px-2 text-base font-semibold leading-snug text-gray-900 min-h-[2.75rem] line-clamp-2"
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

        {/* Precio */}
        {hasTransfer ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ${priceNum.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-emerald-600">
              ${transferNum.toFixed(2)}
            </span>
            <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[11px] font-semibold">
              Transfer
            </span>
          </div>
        ) : (
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








