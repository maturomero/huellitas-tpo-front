// src/pages/OrderDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { backend } from "../api/backend";
import { detectMime } from "../helpers/detectMime";
import {
  fetchOrderById,
  selectOrder,
  selectOrdersLoading,
  clearCurrent,
} from "../redux/orderSlice";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <g fill='#9ca3af'>
        <circle cx='200' cy='180' r='24'/><circle cx='260' cy='150' r='18'/>
        <circle cx='300' cy='180' r='22'/><circle cx='240' cy='210' r='20'/>
        <path d='M310 240c-40 0-70 30-70 60h140c0-30-30-60-70-60z'/>
      </g>
    </svg>`
  );

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const order = useSelector(selectOrder);
  const loading = useSelector(selectOrdersLoading);

  const [imgMap, setImgMap] = useState({});
  const [nameMap, setNameMap] = useState({});

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  // imágenes + nombres de productos
  useEffect(() => {
    if (!order) return;
    const items = Array.isArray(order.orderProducts) ? order.orderProducts : [];
    const pids = [...new Set(items.map((i) => i.productId).filter(Boolean))];

    pids.forEach(async (pid) => {
      if (!imgMap[pid]) {
        try {
          const { data: ids } = await backend.get(`/products/images/${pid}`, {
            params: { ts: Date.now() },
          });
          if (Array.isArray(ids) && ids.length) {
            const { data } = await backend.get(`/products/images`, {
              params: { id: ids[0], ts: Date.now() },
            });
            const b64 = data?.file || "";
            const src = b64.startsWith("data:")
              ? b64
              : `data:${detectMime(b64)};base64,${b64}`;
            setImgMap((prev) => ({ ...prev, [pid]: src }));
          } else {
            setImgMap((prev) => ({ ...prev, [pid]: FALLBACK }));
          }
        } catch {
          setImgMap((prev) => ({ ...prev, [pid]: FALLBACK }));
        }
      }
      if (!nameMap[pid]) {
        try {
          const { data: prod } = await backend.get(`/products/${pid}`);
          setNameMap((prev) => ({ ...prev, [pid]: prod?.name || `Producto #${pid}` }));
        } catch {
          setNameMap((prev) => ({ ...prev, [pid]: `Producto #${pid}` }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (loading) return <div className="p-6">Cargando orden…</div>;
  if (!order) return <div className="p-6">Orden no encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <button onClick={() => navigate(-1)} className="text-sm text-[#64876e] mb-3 cursor-pointer">← Volver</button>

      <h1 className="text-2xl font-bold text-[#111713] mb-1">Orden #{order.id}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-[#f0f4f1] text-sm">{order.status}</span>
        {order.paymentMethod && <span className="px-3 py-1 rounded-full bg-[#f0f4f1] text-sm">{order.paymentMethod}</span>}
        {order.date && <span className="px-3 py-1 rounded-full bg-[#f0f4f1] text-sm">{new Date(order.date).toLocaleString()}</span>}
      </div>

      <div className="rounded-xl bg-white shadow p-4 mb-6">
        <h2 className="font-semibold text-[#111713] mb-3">Productos</h2>
        <div className="space-y-3">
          {(order.orderProducts || []).map((it) => {
            const pid = it.productId;
            const name = nameMap[pid] || `Producto #${pid}`;
            const img = imgMap[pid] || FALLBACK;
            const unit = Number(it.price ?? 0);
            const qty = Number(it.units ?? it.unit ?? 1);
            const subtotal = unit * qty;

            return (
              <div key={it.id} className="flex gap-3 items-center">
                <div className="w-28 h-20 rounded-lg overflow-hidden bg-white">
                  <img src={img} alt={name} className="w-full h-full object-contain" onError={(e)=>e.currentTarget.src=FALLBACK}/>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#111713]">{name}</p>
                  <p className="text-sm text-[#111713]">Cantidad {qty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#64876e]">Precio Unitario</p>
                  <p className="font-medium">${unit.toFixed(2)}</p>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm text-[#64876e]">Subtotal</p>
                  <p className="font-bold">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow p-4 mb-6">
        <h2 className="font-semibold text-[#111713] mb-3">Resumen</h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#111713]">Subtotal</span><span>$ {order.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#111713]">Descuento</span><span>$ {order.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-[#111713] text-base mt-2">
          <span>Total</span><span>${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow p-4">
        <h2 className="font-semibold text-[#111713] mb-2">Comprador</h2>
        <p className="text-sm text-[#111713]">{order?.user?.fullname || "—"}</p>
        <p className="text-sm text-[#111713]">{order?.user?.email || "—"}</p>
      </div>
    </div>
  );
}

export default OrderDetailPage; // 👈 default
