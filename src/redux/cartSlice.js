// src/redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  total: 0,
  totalWithDiscount: 0
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    handleAddProduct: (state, action) => {
      const { product, units, imageUrl } = action.payload;

      const unitsToAdd = Number(units) || 1;
      const existing = state.items.find((item) => item.id === product.id);

      const stock = Number(
        product.stock ?? existing?.stock ?? unitsToAdd
      );

      if (existing) {
        const newUnits = existing.units + unitsToAdd;
        existing.units = stock ? Math.min(newUnits, stock) : newUnits;
      } else {
        state.items.push({
          ...product,
          imageUrl,
          units: stock ? Math.min(unitsToAdd, stock) : unitsToAdd,
        });
      }

      state.total = state.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.units || 1),
        0
      );

      state.totalWithDiscount = state.items.reduce(
        (sum, item) => sum + Number(item.priceWithTransferDiscount || 0) * (item.units || 1),
        0
      );
    },

    handleDeleteProduct: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);

      state.total = state.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.units || 1),
        0
      );

      state.totalWithDiscount = state.items.reduce(
        (sum, item) => sum + Number(item.priceWithTransferDiscount || 0) * (item.units || 1),
        0
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.totalWithDiscount = 0;
    },
  },
});


export default cartSlice;




