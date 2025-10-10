// src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backend } from "../api/backend";       // <= ojo con esta ruta
import logo from "../assets/images/LOGO.jpg";    // tu logo local como placeholder

export const ProductPage = () => {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // data URL base64
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // 1) Producto
        const { data } = await backend.get(`/products/${productId}`);
        if (ignore) return;
        setProduct(data);

        // 2) IDs de imágenes del producto
        const idsResp = await backend.get(`/products/images/${productId}`);
        if (ignore) return;

        const ids = idsResp.data || [];
        if (ids.length > 0) {
          // 3) Traer la primera imagen (base64)
          const imgResp = await backend.get(`/products/images`, {
            params: { id: ids[0] },
          });
          if (ignore) return;

          // tu endpoint devuelve { file: "<base64>", id: ... }
          const fileBase64 = imgResp.data?.file;
          if (fileBase64) {
            setImageUrl(`data:image/jpeg;base64,${fileBase64}`);
          } else {
            setImageUrl(null);
          }
        } else {
          setImageUrl(null);
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el producto.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [productId]);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!product) return <div className="p-6">Producto no encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Producto Detalle</h1>

      {/* Imagen principal */}
      <div className="w-full rounded-lg overflow-hidden border mb-6">
        <img
          src={imageUrl || logo}
          alt={product.name}
          className="w-full object-cover"
          style={{ aspectRatio: "3/2" }}
        />
      </div>

      {/* Info básica */}
      <h2 className="text-xl font-semibold">{product.name}</h2>
      <p className="text-green-700 font-bold mt-1">${product.price}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-gray-500 text-sm">Categoría</p>
          <p className="text-gray-900">{product.category?.description || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Stock</p>
          <p className="text-gray-900">{product.stock}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Agregar al carrito
        </button>
        <button className="px-4 py-2 bg-gray-100 rounded">
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
