// src/pages/OrderPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../api/backend";
import OrderCard from "../components/OrderCard";
import { detectMime } from "../helpers/detectMime"

// Placeholder inline (simple)
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

// Fecha/hora EXACTA desde el back (igual que detalle)
function formatDateTimeFromBack(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    year:"numeric", minute:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", hour12:false
  });
}

// Tabs en español -> mapeo al status real del back
const UI_STATUS = ["TODOS", "PENDIENTE", "APROBADO"];
const UI_TO_API = { TODOS: "ALL", PENDIENTE: "PENDING", APROBADO: "APPROVED" };

export const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [q, setQ] = useState("");
  const [imgMap, setImgMap] = useState({}); // productId -> src

  // ------- carga de órdenes -------
  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        const { data } = await backend.get("/orders", { signal: ctrl.signal });
        if (!ignore && Array.isArray(data)) setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, []);

  // ------- helpers para imagen del primer productId -------
  async function loadFirstImageSrc(productId) {
    try {
      // 1) ids de imágenes del producto
      const { data: ids } = await backend.get(`/products/images/${productId}`, {
        params: { ts: Date.now() }, // anti-cache
      });
      const list = Array.isArray(ids) ? ids : [];
      if (list.length === 0) return FALLBACK;

      // 2) base64 (pedimos texto explícito y sin transformar)
      const { data: raw } = await backend.get(`/products/images`, {
        params: { id: list[0], ts: Date.now() },
      });

      const b64 = raw.file
    
      return b64.startsWith("data:")
        ? b64
        : `data:${detectMime(b64)};base64,${b64}`;
    } catch {
      return FALLBACK;
    }
  }

  // ------- computados y filtros -------
  const withComputed = useMemo(() => {
    return orders.map((o) => {
      const items = Array.isArray(o.orderProducts) ? o.orderProducts : [];
      // tu back usa "unit" (no "units")
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

  // Agrupamos por día, label = fecha EXACTA del back
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

  // cargar imágenes del primer producto de cada orden (una sola vez por productId)
  useEffect(() => {
    const uniqueFirstIds = Array.from(
      new Set(filtered.map((o) => o._firstProductId).filter(Boolean))
    );
    uniqueFirstIds.forEach(async (pid) => {
      if (imgMap[pid]) return; // ya la tenemos
      const src = await loadFirstImageSrc(pid);
      setImgMap((prev) => ({ ...prev, [pid]: src }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // ------- UI -------
  if (loading) {
    return (
      <div className="px-6 py-10">
        <p className="text-gray-600">Cargando órdenes…</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 xl:px-24 py-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <div>
          <p className="text-[#111713] text-2xl md:text-3xl font-bold">Mis Ordenes</p>
        </div>
        <button className="flex items-center h-10 px-4 rounded-xl bg-[#1cc44c] text-[#111713] font-bold">
          {filtered.length} Ordenes
        </button>
      </div>

      {/* Buscador */}
      <div className="max-w-xl mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar Orden"
          className="w-full h-12 border border-[#dce5de] rounded-xl px-4 placeholder:text-[#64876e] focus:outline-none"
        />
      </div>

      {/* Tabs de estado (español) */}
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

      {/* Listado agrupado por día */}
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
