import { useState } from "react";
import { backend } from "../api/backend";

export default function useProducts() {
    const [products, setProducts] = useState([])

    const getProducts = () => {
        backend.get(`/products`).then((res) => {
            setProducts(res.data)
        })
    }

    const getProductsByName = (search) => {
        if (search.length === 0) return
        
        backend
            .get(`/products/name/${search}`)
            .then((res) => {
                setProducts(res.data)
            })
            .catch((error) => {
                setProducts([])
            })
    }

    const getProductById = async (productId) => {
        const product = await backend.get(`/products/${productId}`)
        return product.data
    }

    return {
        getProductsByName,
        getProducts,
        getProductById,
        products
    }
}