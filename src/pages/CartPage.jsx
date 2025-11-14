// src/pages/CartPage.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import cartSlice from "../redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";

const { handleAddProduct, handleDeleteProduct, clearCart } = cartSlice.actions

const moneyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export const CartPage = () => {
  const { items, total, totalWithDiscount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(handleDeleteProduct(id));
  };

  const handleGoToPayment = () => {
    if (!items.length) return;
    navigate("/pago");
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Tu carrito
        </h1>
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Tu carrito está vacío
          </p>
          <p className="text-gray-500 mb-6">
            Agregá productos desde la sección de productos.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600"
          >
            Ir a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        Tu carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const categoryText =
              item.category?.description ||
              item.category?.name ||
              item.categoryName ||
              "";

            const animalsText = Array.isArray(item.animal)
              ? item.animal
                .map((a) => (a?.name ? a.name : a))
                .filter(Boolean)
                .join(", ")
              : item.animal?.name || item.animal || "";

            const lineTotal =
              Number(item.price || 0) * (item.units || 1);

            const itemPrice = moneyFormatter.format(item.price)
            const lineTotalPrice = moneyFormatter.format(lineTotal)

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex-1 flex">
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Producto"}
                    className="max-w-28 object-contain"
                    style={{ aspectRatio: "4/3" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {item.name}
                    </p>
                    {categoryText && (
                      <p className="text-sm text-gray-500">
                        Categoría: {categoryText}
                      </p>
                    )}
                    {animalsText && (
                      <p className="text-sm text-gray-500">
                        Animal: {animalsText}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Cantidad: {item.units}{" "}
                      {item.units === 1 ? "unidad" : "unidades"}
                    </p>
                  </div>

                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm text-gray-500">
                    Precio unitario:
                    {itemPrice}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    Subtotal: {lineTotalPrice}
                  </p>
                  <button
                    type="button"
                    className="text-sm text-red-500 hover:text-red-600"
                    onClick={() => handleRemove(item.id)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="mt-2 text-sm text-gray-500 hover:text-red-500"
            onClick={handleClear}
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-[22px] font-bold text-gray-900 pb-4 border-b border-gray-200">
            Resumen de tu compra
          </h2>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 font-normal text-lg text-gray-900">
            <span>Total con tarjeta</span>
            <span className="font-bold">{moneyFormatter.format(total)}</span>
          </div>

          <div className="flex justify-between items-center pt-4 font-normal text-lg text-gray-900">
            <span>Total con transferencia</span>
            <span className="font-bold">{moneyFormatter.format(totalWithDiscount)}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              className="w-full text-white bg-primary hover:bg-emerald-600 font-bold rounded-lg text-sm px-5 py-3 text-center disabled:opacity-60"
              onClick={handleGoToPayment}
              disabled={!items.length}
            >
              Finalizar compra
            </button>

            <Link
              to="/productos"
              className="w-full text-primary hover:bg-primary/10 font-bold rounded-lg text-sm px-5 py-3 text-center border border-primary"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;


