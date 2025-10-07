import { useEffect } from 'react'
import useProducts from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'

export const ProductsPage = () => {

  const {products, getProducts} = useProducts()

  useEffect(()=> {
    getProducts()
  }, [])

  return (
    <ul>
      {products.map(product => {
        return (
          <ProductCard product={product}/>
        )
      })}
    </ul>
  )
}
