// src/pages/OrderPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend } from "../api/backend";
import { detectMime } from "../helpers/detectMime";
import {
  fetchOrders,
  selectOrders,
  selectOrdersLoading,
} from "../redux/orderSlice";
import OrderCard from "../components/OrderCard";

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

const UI_STATUS = ["TODOS", "PENDIENTE", "APROBADO"];
const UI_TO_API = { TODOS: "ALL", PENDIENTE: "PENDING", APROBADO: "APPROVED" };

export function OrderPage() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);

  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [q, setQ] = useState("");
  const [imgMap, setImgMap] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const withComputed = useMemo(() => {
    return orders.map((o) => {
      const items = Array.isArray(o.orderProducts) ? o.orderProducts : [];
      const qty = items.reduce(
        (acc, it) => acc + Number(it?.units ?? it?.unit ?? 0),
        0
      );
      return {
        ...o,
        _qty: qty,
        _firstProductId: items[0]?.productId ?? null,
        _dateIso: o.date ?? null,
      };
    });
  }, [orders]);

  const filtered = useMemo(() => {
    let list = withComputed;
    const apiStatus = UI_TO_API[statusFilter] || "ALL";
    if (apiStatus !== "ALL") {
      list = list.filter(
        (o) => String(o.status).toUpperCase() === apiStatus
      );
    }
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((o) => {
        const idText = String(o.id ?? "").toLowerCase();
        const name = o?.user?.fullName?.toLowerCase?.() || "";
        const mail = o?.user?.email?.toLowerCase?.() || "";
        return idText.includes(term) || name.includes(term) || mail.includes(term);
      });
    }
    return list;
  }, [withComputed, statusFilter, q]);

  // cargar imágenes del primer producto de cada orden (lazy)
  useEffect(() => {
    const ids = [
      ...new Set(filtered.map((o) => o._firstProductId).filter(Boolean)),
    ];
    ids.forEach(async (pid) => {
      if (imgMap[pid]) return;
      try {
        const { data: list } = await backend.get(`/products/images/${pid}`, {
          params: { ts: Date.now() },
        });
        if (Array.isArray(list) && list.length) {
          const { data } = await backend.get(`/products/images`, {
            params: { id: list[0], ts: Date.now() },
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  return (
    <div className="px-6 md:px-10 lg:px-16 xl:px-24 py-6">
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <p className="text-[#111713] text-2xl md:text-3xl font-bold">Mis Ordenes</p>
        <button className="flex items-center h-10 px-4 rounded-xl bg-[#1cc44c] text-[#111713] font-bold">
          {filtered.length} Ordenes
        </button>
      </div>

      <div className="max-w-xl mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar Orden"
          className="w-full h-12 border border-[#dce5de] rounded-xl px-4 placeholder:text-[#64876e] focus:outline-none"
        />
      </div>

      <div className="flex h-10 items-center rounded-xl bg-[#f0f4f1] p-1 max-w-xl mb-6">
        {UI_STATUS.map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 h-full rounded-xl text-sm font-medium ${
                active
                  ? "bg-white shadow text-[#111713]"
                  : "text-[#64876e] hover:text-[#111713]"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {loading && <p className="text-gray-600">Cargando órdenes…</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-[#64876e]">No se encontraron órdenes.</p>
      )}

      {filtered.map((o) => {
        const imgSrc = imgMap[o._firstProductId] || FALLBACK;
        return <OrderCard key={o.id} order={o} firstImgSrc={imgSrc} />;
      })}
    </div>
  );
}

export default OrderPage; // 👈 default
