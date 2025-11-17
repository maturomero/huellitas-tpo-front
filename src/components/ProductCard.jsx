import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ConfirmBuyComponent from "./ConfirmBuyComponent";
import { ShoppingCart } from "lucide-react";
import cartSlice from "../redux/cartSlice";
import ConfirmDeleteProduct from "./ConfirmDeleteProduct";

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

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

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
    
      <div onClick={goDetail} className="cursor-pointer">
        <div className="relative w-full overflow-hidden aspect-[4/3] bg-white">
          <img
            src={product.file || product.imageSrc}
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
              {moneyFormatter.format(priceNum)}
            </span>
            <span className="font-bold text-sm text-emerald-600">
              {moneyFormatter.format(transferNum)}
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
            <button
              onClick={handleAddToCart}
              className="cursor-pointer flex-1 w-full text-white hover:bg-primary/90 font-bold rounded-lg text-sm px-4 py-2 bg-primary flex items-center gap-2 justify-center"
            >
              <ShoppingCart className="size-4 text-white stroke-2" /> Añadir
            </button>
          )}

          {user?.profile?.role === "ADMIN" && (
            <div className="flex w-full gap-2">
              <Link
                to={`/productos/${product.id}/editar`}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-center text-white transition-colors hover:bg-emerald-600"
              >
                Editar
              </Link>

              <ConfirmDeleteProduct product={product} label="Eliminar" />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
