import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { backend } from "../api/backend";
import { useAuthContext } from "../contexts/AuthContext";

export default function ConfirmBuyComponent({ product, label = 'Comprar' }) {
    const navigate = useNavigate()
    const { user } = useAuthContext()

    const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")
    const [buying, setBuying] = useState(false)
    

    const handleSelectPaymentMethod = () => {
      setIsModalConfirmationOpen(true)
      setPaymentMethod("")
    }

    const handleBuy = async () => {
        try {
            setBuying(true)
            
            const { data } = await backend.post('/orders', {
              userId: user.userId,
              paymentMethod: paymentMethod.toUpperCase(),
              orderProductRequest: [
                { productId: product.id, units: 1 }
              ]
            })
          
            if (data.id) {
              navigate('/orden')
            } else {
              console.log(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setBuying(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => handleSelectPaymentMethod(product) }
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                {label}
            </button>

            {isModalConfirmationOpen && createPortal(
                <div className="bg-black/20 backdrop-blur-xs fixed left-0 top-0 z-50 w-screen h-screen">
                    <div className="w-fit fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-8 py-6">
                        <h1 className="font-semibold">¿Con qué medio de pago deseas pagar?</h1>

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

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsModalConfirmationOpen(false)
                                }}
                                className={`flex-grow-[2] mt-2 w-full rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 mt-6`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBuy}
                                disabled={paymentMethod.length == 0 || buying}
                                className={`${(paymentMethod.length == 0 || buying) ? 'opacity-50' : 'hover:bg-emerald-600'} flex-grow-[2] mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 mt-6`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}