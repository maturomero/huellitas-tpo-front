import { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { deleteProduct } from "../redux/productsSlice";
import toast from "react-hot-toast";

export default function ConfirmDeleteProduct({
  product,
  label = "Eliminar",
  disabled = false,
}) {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    if (deleting) return;
    setIsModalOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;

    try {
      setDeleting(true);
      await dispatch(deleteProduct(product.id));
      toast.success("Producto eliminado correctamente");
      setIsModalOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Error eliminando producto.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openModal}
        className="flex-1 cursor-pointer rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300"
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
                ¿Seguro que querés eliminar este producto?
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={closeModal}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white ${
                    deleting
                      ? "bg-red-700 opacity-60 cursor-not-allowed"
                      : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
