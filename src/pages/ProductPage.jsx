import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import useProducts from '../hooks/useProducts'

export const ProductPage = () => {
  const { productId } = useParams()
  const { getProductById } = useProducts()

  const [product, setProduct] = useState({})

  useEffect(() => {
    getProductById(productId).then((res) => setProduct(res))
  }, [])

  return (
    <div>
        <h1>{product.name}</h1>
        <p>$ {product.price}</p>
    </div>
  )
}
