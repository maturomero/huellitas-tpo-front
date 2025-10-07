import React from 'react'
import { useNavigate } from 'react-router'

export const ProductCard = ({product}) => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate(`/productos/${product.id}`)
  }

  return (
    <li>
      {product.name}
      <button onClick={handleNavigate}>Ver detalle</button>
    </li>
  )
}
