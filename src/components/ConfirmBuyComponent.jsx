import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createPortal } from "react-dom";
import { backend } from "../api/backend";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../redux/productsSlice";
import cartSlice from "../redux/cartSlice";
import toast from "react-hot-toast";

export default function ConfirmBuyComponent({
  onClick = () => {},
  label = "Comprar",
  disabled = false,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [buying, setBuying] = useState(false);

  const openModal = (e) => {
    e.stopPropagation(); // <-- ANTI BURBUJA
    onClick(e)
    setPaymentMethod("");
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleBuy = async (e) => {
    e.stopPropagation();

    if (paymentMethod === "card") {
      setIsModalOpen(false);
      navigate("/pago");
      return;
    }

    try {
      setBuying(true);

      const { data } = await backend.post("/orders", {
        userId: user.userId,
        paymentMethod: "TRANSFER",
        orderProductRequest: items.map((item) => ({
          productId: item.id,
          units: item.units,
        })),
      });

      if (data.id) {
        toast.success("Pago realizado correctamente");
        navigate("/orden", { replace: true });

        dispatch(fetchProducts({ isAdmin: user?.profile?.role === "ADMIN" }));
        dispatch(cartSlice.actions.clearCart());
      }
    } catch (err) {
      console.log(err);
      toast.error("Hubo un problema realizando el pago");
    } finally {
      setBuying(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openModal}
        className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        {label}
      </button>

      {isModalOpen &&
        createPortal(
          <div
            className="bg-black/20 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <div
              className="bg-white px-8 py-6 rounded-xl shadow w-[90%] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h1 className="font-semibold text-lg">
                ¿Con qué medio de pago deseas pagar?
              </h1>

              <div className="flex flex-col gap-2 mt-4">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2 accent-emerald-600"
                  />
                  Transferencia
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2 accent-emerald-600"
                  />
                  Tarjeta de crédito
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleBuy}
                  disabled={paymentMethod === "" || buying}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white 
                    ${
                      paymentMethod === "" || buying
                        ? "bg-primary opacity-50 cursor-not-allowed"
                        : "bg-primary hover:bg-emerald-600"
                    }`}
                >
                  {buying ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
