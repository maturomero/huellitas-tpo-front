import { useState } from "react";
import { backend } from "../api/backend";
import { useSelector } from "react-redux";

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    imageIds: Array.isArray(p.productImages) ? p.productImages.map(img => img.id) : [],
    stock: p.stock,
    status: p.status,
    priceWithTransferDiscount: p.priceWithTransferDiscount,
    animal: Array.isArray(p.animal) && p.animal.length ? p.animal[0].name : "",
    animals:p.animal,
    category: p.category?.description || "",
    raw: p,
  };
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const {user} = useSelector((state) => state.auth)
  const getProducts = () => {
    const url = user?.profile?.role == "ADMIN" ? "/products?sinStock=1":"/products?sinStock=0"
    backend.get(url).then(res => setProducts(res.data.map(mapProduct)));
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

