import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../api/backend";
import { useSelector } from 'react-redux'
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

function formatDateTimeFromBack(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    year:"numeric", minute:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", hour12:false
  });
}

const UI_STATUS = ["TODOS", "PENDIENTE", "APROBADO"];
const UI_TO_API = { TODOS: "ALL", PENDIENTE: "PENDING", APROBADO: "APPROVED" };

export const OrderPage = () => {
  const navigate = useNavigate();
  const { items: orders, loading } = useSelector((state) => state.orders)
  const products = useSelector((state) => state.products.items)
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [q, setQ] = useState("");
  const [imgMap, setImgMap] = useState({});

  const withComputed = useMemo(() => {
    return orders.map((o) => {
      const items = Array.isArray(o.orderProducts) ? o.orderProducts : [];
   
      const qty = items.reduce(
        (acc, it) => acc + Number((it?.units ?? it?.unit) || 0),
        0
      );
      const firstPid = items[0]?.productId ?? null;
      const dateIso = o?.date || o?.createdAt || null;
      return {
        ...o,
        _qty: qty,
        _firstProductId: firstPid,
        _dateIso: dateIso,
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
    if (q.trim() !== "") {
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

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of filtered.toReversed()) {
      const iso = o._dateIso;
      const key = iso ? new Date(iso).toISOString().slice(0, 10) : "unknown";
      if (!map.has(key)) {
        map.set(key, { key, label: formatDateTimeFromBack(iso), items: [] });
      }
      map.get(key).items.push(o);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.key).getTime() - new Date(a.key).getTime()
    );
  }, [filtered]);
  
  useEffect(() => {
    const uniqueFirstIds = Array.from(
      new Set(filtered.map((o) => o._firstProductId).filter(Boolean))
    );
     uniqueFirstIds.forEach(async pid => {
    if (imgMap[pid]) return
    
    const found = products?.find(item => item.id == pid)

    if (found) {
      setImgMap(prev => ({ ...prev, [pid]: found.imageSrc }))
      return
    }

    try {
      const deletedRes = await backend.get(`/products/deleted/${pid}`)
      const imageId = deletedRes?.data?.productImages?.[0]?.id
      
      if (!imageId) {
        setImgMap(prev => ({ ...prev, [pid]: FALLBACK }))
        return
      }

      const imgRes = await backend.get(`/products/images`, { params: { id: imageId } })
      const mime = imgRes.data?.file.startsWith("iVBORw0K") ? "image/png" : "image/jpeg"
      const base64 = `data:${mime};base64,${imgRes.data?.file}`

      setImgMap(prev => ({ ...prev, [pid]: base64 }))
    } catch {
      setImgMap(prev => ({ ...prev, [pid]: FALLBACK }))
    }
  })
    
  }, [filtered]);

  if (loading) {
    return (
      <div className="px-6 py-10">
        <p className="text-gray-600">Cargando órdenes…</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 xl:px-24 py-6">
      
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <div>
          <p className="text-[#111713] text-2xl md:text-3xl font-bold">Mis Ordenes</p>
        </div>
        <button className="flex items-center h-10 px-4 rounded-xl bg-[#1cc44c] text-[#111713] font-bold">
          {filtered.length} Ordenes
        </button>
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

      {groups.length === 0 && (
        <p className="text-[#64876e]">No se encontraron órdenes.</p>
      )}

      {groups.map((g) => (
        <div key={g.key} className="mb-6">
          <h2 className="text-[#111713] text-xl font-bold mb-3">
            {g.label}
          </h2>

          {g.items.map((o) => {
            const firstId = o._firstProductId;
            const imgSrc = imgMap[firstId] || FALLBACK;
            return <OrderCard key={o.id} order={o} firstImgSrc={imgSrc} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default OrderPage;
