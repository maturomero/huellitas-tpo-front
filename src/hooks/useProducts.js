import { useState } from "react";
import { backend } from "../api/backend";

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    imageIds: Array.isArray(p.productImages) ? p.productImages.map(img => img.id) : [],
    // extras si te sirven:
    stock: p.stock,
    status: p.status,
    priceWithTransferDiscount: p.priceWithTransferDiscount,
    animal: Array.isArray(p.animal) && p.animal.length ? p.animal[0].name : "",
    category: p.category?.description || "",
    raw: p,
  };
}

export default function useProducts() {
  const [products, setProducts] = useState([]);

  const getProducts = () => {
    backend.get("/products").then(res => setProducts(res.data.map(mapProduct)));
  };

  const getProductsByName = (search) => {
    if (!search) return;
    backend
      .get(`/products/name/${search}`)
      .then(res => setProducts(res.data.map(mapProduct)))
      .catch(() => setProducts([]));
  };

  const getProductById = async (productId) => {
    const res = await backend.get(`/products/${productId}`);
    return mapProduct(res.data);
  };

  return { products, getProducts, getProductsByName, getProductById };
}

