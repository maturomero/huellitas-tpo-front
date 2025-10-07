import { useEffect, useState } from 'react'
import useProducts from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'

export const ProductsPage = () => {
    const { products, getProductsByName, getProducts } = useProducts()
    const [search, setSearch] = useState("")

    useEffect(() => {
        if (search.length === 0) {
            getProducts()
            return
        }
        
        getProductsByName(search)
    }, [search])

    const productCards = products.map(product => <ProductCard product={product} />)

    return (
        <div>
            <input placeholder="Buscador de productos" type="text" value={search} onChange={(e) => setSearch(e.target.value)} />

            <ul>
                {productCards}
            </ul>
        </div>
    )
}
