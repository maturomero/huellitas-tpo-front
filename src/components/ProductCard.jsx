import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { backend } from "../api/backend";
import { useSelector, useDispatch } from 'react-redux'
import { deleteProduct } from "../redux/productsSlice";
import ConfirmBuyComponent from "./ConfirmBuyComponent";
import { detectMime } from "../helpers/detectMime";
import toast from "react-hot-toast"; 
import { ShoppingCart } from 'lucide-react'
import cartSlice from "../redux/cartSlice";

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

export default function ProductCard({ product }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if (!product) return null;

  const goDetail = () => navigate(`/productos/${product.id}`);

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

  const firstIdFromList =
    product?.imageIds?.[0] ?? product?.productImages?.[0]?.id ?? null;

  const [src, setSrc] = useState(FALLBACK);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    async function fetchFirstImageId(productId) {
      for (let i = 0; i < 10; i++) {
        try {
          const { data } = await backend.get(`/products/images/${productId}`, {
            signal: ctrl.signal,
            params: { ts: Date.now() },
          });
          if (ignore) return null;
          const ids = Array.isArray(data) ? data : [];
          if (ids.length) return ids[0];
        } catch {}
        await sleep(500 + i * 300);
      }
      return null;
    }

    async function fetchBase64ById(id) {
      for (let i = 0; i < 10; i++) {
        try {
          const { data } = await backend.get(`/products/images`, {
            signal: ctrl.signal,
            params: { id, ts: Date.now() },
          });
          if (ignore) return null;
          const b64 = data?.file;
          if (b64) return b64;
        } catch {}
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
        if (!imageId) return;

        const base64 = await fetchBase64ById(imageId);
        if (!base64) return;

        if (base64.startsWith("data:")) {
          setSrc(base64);
        } else {
          const mime = detectMime(base64) || "image/jpeg";
          setSrc(`data:${mime};base64,${base64}`);
        }
      } catch {}
    }

    load();

    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, [product?.id, firstIdFromList]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    try {
      setDeleting(true);
      dispatch(deleteProduct(product.id));
      toast.success("Producto eliminado correctamente");
    } catch (e) {
      const msg = e?.response?.data?.message || "Error eliminando producto.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(
      cartSlice.actions.handleAddProduct({
        product,
        units: 1,
        imageUrl: src,
      })
    );
  };

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      
      {user?.profile?.role === "ADMIN" && (
        <div className="w-full flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-400 size-8 rounded-full flex items-center justify-center m-4 mb-2 hover:opacity-90 disabled:opacity-60"
            title={deleting ? "Eliminando..." : "Eliminar"}
          >
            <span className="text-white font-medium">
              {deleting ? "…" : "x"}
            </span>
          </button>
        </div>
      )}

      <div onClick={goDetail} className="cursor-pointer">

        <div className="relative w-full overflow-hidden aspect-[4/3] bg-white">
          <img
            src={src}
            alt={product.name || "Producto"}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setSrc(FALLBACK)}
            loading="lazy"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        <div className="p-4 pb-0">
          <h3
            className="text-base font-medium leading-snug text-gray-900 line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>
      </div>

      <div className="p-4 pt-2 flex flex-col gap-2">
        {hasTransfer ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[22px]">
              ${priceNum.toFixed(2)}
            </span>
            <span className="font-bold text-sm text-emerald-600">
              ${transferNum.toFixed(2)}{" "}
              <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[11px] font-semibold">
                Abonando con transferencia
              </span>
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-emerald-600">{priceText}</p>
        )}

        <div className="flex items-center gap-2 w-full mt-2">
          {user?.profile?.role === "USER" && (
            <>
              <button
                onClick={handleAddToCart}
                className="cursor-pointer flex-1 w-full text-white hover:bg-primary/90 font-bold rounded-lg text-sm px-4 py-2 bg-primary flex items-center gap-2 justify-center"
              >
                <ShoppingCart className="size-4 text-white stroke-2" /> Añadir
              </button>
            </>
          )}

          {user?.profile?.role === "ADMIN" && (
            <Link
              to={`/productos/${product.id}/editar`}
              className="flex-[2] mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-center text-white transition-colors hover:bg-emerald-600"
            >
              Editar
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};
