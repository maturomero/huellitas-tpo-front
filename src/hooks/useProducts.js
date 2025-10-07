import { useState } from "react";
import { backend } from "../api/backend";

export default function useProducts(){
    const [products, setProducts] = useState([])

    const getProducts = () => {
        backend.get("/products").then((res) => {
            setProducts(res.data)
        })
    }
    return {
        getProducts, products
    }
}