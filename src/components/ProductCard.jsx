import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { backend } from "../api/backend";
import { useAuthContext } from "../contexts/AuthContext";
import ConfirmBuyComponent from "./ConfirmBuyComponent";
import { detectMime } from "../helpers/detectMime"

// Placeholder inline (no depende de /public)
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <g fill="#9ca3af">
        <circle cx="200" cy="180" r="24"/><circle cx="260" cy="150" r="18"/>
        <circle cx="300" cy="180" r="22"/><circle cx="240" cy="210" r="20"/>
        <path d="M310 240c-40 0-70 30-70 60h140c0-30-30-60-70-60z"/>
      </g>
    </svg>`
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const ProductCard = ({ product, getProducts }) => {
  const { user } = useAuthContext();

  const navigate = useNavigate();
  if (!product) return null;

  const goDetail = () => navigate(`/productos/${product.id}`);

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

  // id que pueda venir en el listado, en cualquiera de las formas
  const firstIdFromList =
    product?.imageIds?.[0] ?? product?.productImages?.[0]?.id ?? null;

  const [src, setSrc] = useState(FALLBACK);

  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    async function fetchFirstImageId(productId) {
      // hasta 10 intentos con backoff (≈8–10s total)
      for (let i = 0; i < 10; i++) {
        try {
          const { data } = await backend.get(`/products/images/${productId}`, {
            signal: ctrl.signal,
            params: { ts: Date.now() }, // anti-cache
          });
          if (ignore) return null;
          const ids = Array.isArray(data) ? data : [];
          if (ids.length) return ids[0];
        } catch {
          // seguimos intentando
        }
        await sleep(500 + i * 300);
      }
      return null;
    }

    async function fetchBase64ById(id) {
      for (let i = 0; i < 10; i++) {
        try {
          const { data } = await backend.get(`/products/images`, {
            signal: ctrl.signal,
            params: { id, ts: Date.now() }, // anti-cache
          });
          if (ignore) return null;
          const b64 = data?.file;
          if (b64) return b64;
        } catch {
          // seguimos intentando
        }
        await sleep(500 + i * 300);
      }
      return null;
    }

    async function load() {
      try {
        setSrc(FALLBACK);

        let imageId = firstIdFromList;
        if (!imageId && product?.id) {
          imageId = await fetchFirstImageId(product.id);
        }
        if (!imageId) return; // no hay imagen asociada todavía

        const base64 = await fetchBase64ById(imageId);
        if (!base64) return;

        if (base64.startsWith("data:")) {
          setSrc(base64);
        } else {
          const mime = detectMime(base64) || "image/jpeg";
          setSrc(`data:${mime};base64,${base64}`);
        }
      } catch {
        // usamos fallback
      }
    }

    load();

    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, [product?.id, firstIdFromList]);

const handleDelete = async()=> { 
  await backend.delete(`/products/${product.id}`)
  await getProducts()
}

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {user?.profile?.role === "ADMIN"
      ?(<div className="w-full flex justify-end">
        <button onClick={handleDelete} className="bg-red-400 size-8 rounded-full flex items-center justify-center m-4 mb-2 cursor-pointer hover:opacity-90">
          <span className="text-white font-medium">x</span>
        </button>
      </div>)
      :null
      }

      
      {/* Imagen */}
      <div
        onClick={goDetail}
        className="relative w-full cursor-pointer overflow-hidden aspect-[4/3] bg-white"
      >
        <img
          src={src}
          alt={product.name || "Producto"}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setSrc(FALLBACK)}
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col items-center gap-2 p-4 text-center">
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

        {hasTransfer ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ${priceNum.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-emerald-600">
              ${transferNum.toFixed(2)}
            </span>
            <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[11px] font-semibold">
              Transferencia
            </span>
          </div>
        ) : (
          <p className="mt-1 text-lg font-bold text-emerald-600">{priceText}</p>
        )}

        <div className="flex items-center gap-2 w-full mt-2">
          {user?.profile?.role === "USER" ? <ConfirmBuyComponent product={product} /> : null}
          {user?.profile?.role === "ADMIN" 
            ? (
              <Link 
                to={`/productos/${product.id}/editar`}
                className="flex-[2] mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Editar
              </Link>
            )
            : null
          }
        </div>
      </div>
    </li>
  );
};

export default ProductCard;
