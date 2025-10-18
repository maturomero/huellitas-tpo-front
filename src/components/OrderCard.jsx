// src/components/OrderCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

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

const TITLE_BY_STATUS = {
  PENDING: "Pago Pendiente",
  APPROVED: "Pago Aprobado",
  DELETED: "Orden Cancelada",
};

export default function OrderCard({ order, firstImgSrc }) {
  const navigate = useNavigate();

  const items = Array.isArray(order.orderProducts) ? order.orderProducts : [];
  const firstId = order._firstProductId;
  const extra = Math.max(items.length - 1, 0);
  const status = String(order.status || "").toUpperCase();
  const title = TITLE_BY_STATUS[status] ?? "Orden";

  const line = [
    firstId ? `productId #${firstId}` : null,
    `Cantidad: ${order._qty}`,
    `Precio: $${Number(order.totalPrice ?? order.price ?? 0).toFixed(2)}`,
    extra > 0 ? `+ ${extra} producto${extra > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="p-4 mb-4 rounded-xl bg-white shadow flex gap-4 items-stretch">
      <div className="flex-[2] flex flex-col gap-2">
        <p className="text-[#64876e] text-sm">{status}</p>
        <p className="text-[#111713] font-bold">{title}</p>
        <p className="text-[#64876e] text-sm">{line}</p>

        <button
          type="button"
          className="w-fit h-8 px-4 rounded-xl bg-[#f0f4f1] text-sm text-[#111713] flex items-center gap-1"
          onClick={() => navigate(`/orden/${order.id}`)}
          title="Ver detalle de la Orden"
        >
          <span>Ver detalle de la Orden</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
          </svg>
        </button>
      </div>


      {/* Footer con user por item */}
      <p className="text-[#64876e] text-sm px-1 mb-2">
        {order?.user?.fullname ?? ""} • {order?.user?.email ?? ""}
      </p>


      <div className="flex-1">
        <div className="aspect-video rounded-xl overflow-hidden bg-white">
          <img
            src={firstImgSrc || FALLBACK}
            alt={firstId ? `Product ${firstId}` : "Product image"}
            className="w-full h-full object-contain"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
