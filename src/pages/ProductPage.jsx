
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import productsSlice from "../redux/productsSlice";
import cartSlice from "../redux/cartSlice";

const { handleAddProduct } = cartSlice.actions

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

  const { user } = useSelector((state) => state.auth);
  const { currentProduct, items } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  const [units, setUnits] = useState(1); 

  const priceNum = useMemo(() => Number(product?.price), [product]);
  const transferNum = useMemo(
    () =>
      Number(
        product?.priceWithTransferDiscount ??
          product?.price_with_transfer_discount
      ),
    [product]
  );
  const hasTransfer =
    !Number.isNaN(transferNum) &&
    transferNum > 0 &&
    !Number.isNaN(priceNum) &&
    transferNum !== priceNum;

  const priceText = !Number.isNaN(priceNum)
    ? `$${priceNum.toFixed(2)}`
    : product?.price || "";

  const stockLabel = useMemo(() => {
    if (product?.stock == null) return "—";
    if (Number(product.stock) <= 0) return "Sin stock";
    return Number(product.stock) > 10 ? "Alto" : "Bajo";
  }, [product]);

  
  const maxUnits = useMemo(() => {
    if (!product?.stock) return 1;
    const n = Number(product.stock);
    if (Number.isNaN(n) || n <= 0) return 1;
    return n;
  }, [product]);

  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    if (!items.length) return;

    dispatch(
      productsSlice.actions.getProductById({ id: productId, raw: true })
    );

    async function load() {
        setError("");

        if (ignore) return;

        if (!currentProduct || Number(currentProduct.stock) === 0) {
          setProduct(null);
          setError("Este producto no se encuentra disponible.");
          return;
        }

        setProduct(currentProduct);
    }

    load();
    return () => {
      dispatch(productsSlice.actions.clearCurrentProduct())
      ignore = true;
      ctrl.abort();
    };
  }, [productId, currentProduct, items, dispatch]);

  const handleUnitsChange = (e) => {
    const value = e.target.value;
    
    if (value === "") {
      setUnits("")
      return
    }

    if (!/^\d+$/.test(value)) return
    
    const formattedValue = Number(value)

    if (formattedValue > product.stock) {
      setUnits(product.stock)
      toast.error(`Solo hay ${product.stock} unidades disponibles`)
      return
    }

    if (formattedValue <= 0) {
      setUnits(1)
      return
    }

    setUnits(formattedValue)
  };

  const addToCartBase = () => {
    if (!user?.profile || user.profile.role !== "USER") return;

    
    console.log("handleAddProduct >>>", handleAddProduct);

    if (typeof handleAddProduct !== "function") {
      console.error("handleAddProduct NO es una función, algo está mal en los imports/exports");
      return; 
    }

    const stock = Number(product.stock) || 0;
    if (stock <= 0) return;

    const safeUnits = Math.min(units, stock);

    console.log(product)

    dispatch(
      handleAddProduct({
        product,
        units: safeUnits,
        imageUrl: product.file || product.imageUrl || product.imageSrc
      })
    );
};


  const handleAddToCart = () => {
    addToCartBase();          
  };

  const handleAddToCartAndGo = () => {
    addToCartBase();          
    navigate("/carrito");     
  };

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
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-[#64876e] mb-3 cursor-pointer"
      >
        ← Volver
      </button>
      <div className="grid grid-cols-1 md:grid-cols-13 gap-8">
        
        <div className="md:col-span-7">
          <div className="w-full overflow-hidden rounded-xl bg-white border border-gray-200">
            <img
              src={product.file || FALLBACK}
              alt={product.name || "Producto"}
              className="w-full h-full object-contain"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="mt-6 flex flex-col">
            <p className="text-sm text-gray-600 mb-3">
              Medios de pago aceptados
            </p>
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
            <p className="text-3xl font-extrabold text-emerald-600">
              {priceText}
            </p>
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
                          ? a.name.charAt(0).toUpperCase() +
                            a.name.slice(1).toLowerCase()
                          : ""
                      )
                      .filter(Boolean)
                      .join(", ")
                  : "—"}
              </p>
            </div>
           
            <div className="mt-2">
              <p className="text-gray-500 text-sm">
                Stock:{" "}
                <span className="font-semibold">
                  {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
                </span>
              </p>
              <input 
                type="text"
                className="mt-1 border border-gray-300 rounded-md px-2 py-1 text-sm max-w-[130px]" 
                value={units}
                placeholder="Unidades"
                onChange={handleUnitsChange} 
                disabled={Number(product.stock) <= 0} 
              />
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
          </div>

         
          <div className="mt-2 flex flex-wrap gap-3">
            {user?.profile?.role === "ADMIN" ? (
              <Link
                to={`/productos/${product.id}/editar`}
                className="flex-1 text-center w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Editar
              </Link>
            ) : user?.profile?.role === "USER" ? (
              <>
                <button
                  type="button"
                  className="flex-1 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  disabled={stockLabel === "Sin stock" || units === ""}
                  onClick={handleAddToCart}
                >
                  Agregar al carrito
                </button>

                <button
                  type="button"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={stockLabel === "Sin stock"}
                  onClick={handleAddToCartAndGo}
                >
                  Comprar ahora
                </button>
              </>
            ) : null}
          </div>

       
          {product?.description && (
            <div className="mt-4">
              <h2 className="text-base font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

