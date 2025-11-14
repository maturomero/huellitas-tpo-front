// src/pages/PaymentPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import cartSlice from "../redux/cartSlice";
import cardValidator from "card-validator";
import { backend } from "../api/backend";
import toast from "react-hot-toast"; 
import { fetchProducts } from '../redux/productsSlice'

const moneyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export default function PaymentPage() {
  const { items, total } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate();

  //Estados 
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (value) =>
    value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/\s/g, "");
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);

    const v = cardValidator.number(raw);
    setCardType(v.card ? v.card.type : null);
    setIsValid(v.isValid ?? null);
  };

  const expiryValid = (mmYY) => {
    const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const mm = +m[1],
      yy = +m[2];
    if (mm < 1 || mm > 12) return false;
    const year = 2000 + yy;
    const now = new Date();
    const lastOfMonth = new Date(year, mm, 0);
    return lastOfMonth >= new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const valid =
    isValid === true &&
    expiryValid(expiry) &&
    /^[0-9]{3}$/.test(cvc) &&
    name.trim().length > 2;

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);

    try {
      const { data } = await backend.post("/orders", {
        userId: user.userId,
        paymentMethod: "CARD",
        orderProductRequest: items.map(item => ({ productId: item.id, units: item.units }))
      });

      if (data?.id) {
        toast.success("Pago realizado correctamente");
        navigate("/orden", { replace: true });

        dispatch(fetchProducts({ isAdmin: user?.profile?.role === 'ADMIN' }))
        dispatch(cartSlice.actions.clearCart())
      } else {
        toast.error("Error al procesar el pago");
        console.log("Respuesta inesperada:", data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en el pago.");

      if (err.response.data.message) {
        toast.error(err.response.data.message)
      }
    } finally {
      setLoading(false);
    }
  };

  const cardIcons = {
    visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
    mastercard:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png",
    amex:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg",
  };


  return (
    <section className="bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-[-0.03em]">
            Proceso de Pago
          </h1>
          <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">
            Completa tu compra de forma segura.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {}
          <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-sm p-6 sm:p-8 overflow-hidden">
            <h2 className="text-2xl font-bold mb-6">Resumen del pago</h2>

            <div className="space-y-4">
              {items.map(item => {
                const priceUnit = item.price
                const priceSubtotal = item.price * item.units

                return (
                <div className="flex items-center justify-between" key={item.id}>
                  <div className="flex items-center gap-3">
                    <img src={item?.imageUrl} className="max-w-8" />
                    <div>
                      <span className="font-medium">{item?.name}</span>
                      <p className="text-gray-500 text-xs">{item?.category.description}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">{moneyFormatter.format(priceSubtotal)}</span>
                    <p className="text-[10px] text-right">{item?.units} x {moneyFormatter.format(priceUnit)}</p>
                  </div>
                </div>
                )
              })}
            </div>

            <hr className="my-4 border-border-light dark:border-border-dark" />

            <div className="flex items-center justify-between mb-24">
              <p className="text-base font-bold text-text-light-secondary dark:text-text-dark-secondary">
                Total
              </p>
              <p className="text-xl font-extrabold">{ moneyFormatter.format(total) }</p>
            </div>

      
            <div className="absolute left-0 bottom-0 w-full text-white overflow-hidden">
              <div className="relative flex flex-col items-center justify-center text-center h-24 
                    bg-gradient-to-r from-primary to-emerald-600 
                    rounded-t-[2rem] shadow-inner select-none">
                <h3 className="text-2xl font-extrabold tracking-wide">
                  Huellitas PetShop
                </h3>
                <p className="text-sm sm:text-base font-medium mt-1 opacity-90">
                  Gracias por tu compra
                </p>
              </div>
            </div>
          </div>

          
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Formulario de tarjeta</h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
            
              <div className="relative">
                <label className="block text-sm font-medium mb-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleNumberChange}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className={`w-full rounded-lg border bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm h-11 px-3 pr-12 ${
                    isValid === false ? "border-red-500" : "border-border-light"
                  }`}
                />
                {cardType && cardIcons[cardType] && (
                  <img
                    src={cardIcons[cardType]}
                    alt={cardType}
                    className="absolute right-3 top-9 h-5"
                  />
                )}
              </div>

       
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 4) val = val.slice(0, 4);
                      if (val.length > 2)
                        val = val.slice(0, 2) + "/" + val.slice(2);
                      setExpiry(val);
                    }}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full rounded-lg border border-border-light bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm h-11 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) =>
                      setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="123"
                    maxLength={3}
                    className="w-full rounded-lg border border-border-light bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm h-11 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border border-border-light bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm h-11 px-3"
                />
              </div>

              <button
                type="submit"
                disabled={!valid || loading}
                className="flex w-full items-center justify-center h-12 rounded-lg px-4 text-white text-base font-bold
                           bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Procesando..." : `Pagar ${moneyFormatter.format(total)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}









