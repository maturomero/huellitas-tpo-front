// src/pages/ProductPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { backend } from "../api/backend";
import ConfirmBuyComponent from "../components/ConfirmBuyComponent";
import { useSelector } from "react-redux"

import logo from "../assets/images/LOGO.jpg"; 

const FALLBACK = logo;

const getAnimalData = (p) => {

  if (Array.isArray(p?.animals) && p.animals.length > 0) {
    const first = p.animals[0];
    if (typeof first === "string") return { name: first };
    if (typeof first === "object") return first;
  }
  if (p?.animal) {
    if (typeof p.animal === "string") return { name: p.animal };
    if (typeof p.animal === "object") return p.animal;
  }
  return null;
};

export const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");

  const priceNum = useMemo(() => Number(product?.price), [product]);
  const transferNum = useMemo(
    () => Number(product?.priceWithTransferDiscount ?? product?.price_with_transfer_discount),
    [product]
  );
  const hasTransfer =
    !Number.isNaN(transferNum) &&
    transferNum > 0 &&
    !Number.isNaN(priceNum) &&
    transferNum !== priceNum;

  const priceText = !Number.isNaN(priceNum) ? `$${priceNum.toFixed(2)}` : product?.price || "";

  const stockLabel = useMemo(() => {
    if (product?.stock == null) return "—";
    if (Number(product.stock) <= 0) return "Sin stock";
    return Number(product.stock) > 10 ? "Alto" : "Bajo";
  }, [product]);

  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const { data } = await backend.get(`/products/${productId}`, {
          signal: ctrl.signal,
        });
        if (ignore) return;

        if (!data || Number(data.stock) === 0) {
          setProduct(null);
          setImageUrl(null);
          setError("Este producto no se encuentra disponible.");
          return;
        }

        setProduct(data);

        const idsResp = await backend.get(`/products/images/${productId}`, {
          signal: ctrl.signal,
        });
        if (ignore) return;
        const ids = idsResp.data || [];

        if (ids.length > 0) {
          const imgResp = await backend.get(`/products/images`, {
            params: { id: ids[0] },
            signal: ctrl.signal,
          });
          if (ignore) return;
          const base64 = imgResp.data?.file;
          if (base64) {
            const mime = base64.startsWith("iVBORw0K") ? "image/png" : "image/jpeg";
            setImageUrl(`data:${mime};base64,${base64}`);
          } else {
            setImageUrl(null);
          }
        } else {
          setImageUrl(null);
        }
      } catch (e) {
        if (!ctrl.signal.aborted) {
          console.error(e);
          setError("No se pudo cargar el producto.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, [productId]);

  if (loading) return <div className="max-w-6xl mx-auto p-6">Cargando…</div>;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="mb-4 text-gray-700">{error}</p>
        <button
          className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
          onClick={() => navigate("/productos")}
        >
          Volver a productos
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="mb-4 text-gray-700">Producto no encontrado.</p>
        <button
          className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
          onClick={() => navigate("/productos")}
        >
          Volver a productos
        </button>
      </div>
    );
  }

  const animalData = getAnimalData(product);

  return (
    <div className="max-w-7xl mx-auto p-10">
      <button onClick={() => navigate(-1)} className="text-sm text-[#64876e] mb-3 cursor-pointer">← Volver</button>
      <div className="grid grid-cols-1 md:grid-cols-13 gap-8">
        
        <div className="md:col-span-7">
          <div className="w-full overflow-hidden rounded-xl bg-white border border-gray-200">
            <img
              src={imageUrl || FALLBACK}
              alt={product.name || "Producto"}
              className="w-full h-full object-contain"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="mt-6 flex flex-col">
            <p className="text-sm text-gray-600 mb-3">Medios de pago aceptados</p>
            <img
              src="/payments/pagos.webp"
              alt="Medios de pago aceptados"
              className="w-auto max-w-[260px] h-auto object-contain rounded-md shadow-sm"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col gap-5">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {hasTransfer ? (
            <div className="mt-1 flex items-center gap-3">
              <span className="text-lg text-gray-500 line-through">
                ${priceNum.toFixed(2)}
              </span>
              <span className="text-3xl font-extrabold text-emerald-600">
                ${transferNum.toFixed(2)}
              </span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 text-[11px] font-semibold">
                Abonando con transferencia
              </span>
            </div>
          ) : (
            <p className="text-3xl font-extrabold text-emerald-600">{priceText}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
            <div>
              <p className="text-gray-500 text-sm">Categoría</p>
              <p className="text-gray-900 text-base">
                {product?.category?.description
                  ? product.category.description.charAt(0).toUpperCase() +
                  product.category.description.slice(1).toLowerCase()
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Animal</p>
              <p className="text-gray-900 text-base">
                {Array.isArray(product?.animal) && product.animal.length > 0
                  ? product.animal
                    .map((a) =>
                      a?.name
                        ? a.name.charAt(0).toUpperCase() + a.name.slice(1).toLowerCase()
                        : ""
                    )
                    .filter(Boolean)
                    .join(", ")
                  : "—"}
              </p>
            </div>
          </div>


          <div className="mt-2">
            <p className="text-gray-500 text-sm">Disponibilidad</p>
            {stockLabel === "Sin stock" ? (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                Sin stock
              </span>
            ) : stockLabel === "Alto" ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                Alto
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                Bajo
              </span>
            )}
          </div>

          <div className="mt-2 flex gap-3">
            {user?.profile?.role === "USER" 
              ? <ConfirmBuyComponent product={product} /> 
              : ""
              }
            
            {user?.profile?.role === 'ADMIN'
              ? (
                <Link 
                  to={`/productos/${product.id}/editar`}
                  className="flex-1 text-center w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Editar
                </Link>
              )
              : user?.profile ? (
                <button
                  type="button"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={stockLabel === "Sin stock"}
                >
                  Finalizar compra
                </button>
              ) : null
            }

            
          </div>

          {product?.description && (
            <div className="mt-4">
              <h2 className="text-base font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
