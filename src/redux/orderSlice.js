// src/redux/orderSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { backend } from "../api/backend";

// Normalizador (soporta nombres distintos que viene del back)
const mapOrder = (o) => ({
  id: o.id,
  price: Number(o.price ?? 0),
  discount: Number(o.discount ?? 0),
  totalPrice: Number(o.totalPrice ?? o.total_price ?? 0),
  status: String(o.status ?? "").toUpperCase(),
  paymentMethod: o.paymentMethod ?? o.payment_method ?? null,
  date: o.date ?? o.createdAt ?? null,
  user: o.user ?? null,
  orderProducts: Array.isArray(o.orderProducts)
    ? o.orderProducts.map((it) => ({
        id: it.id,
        productId: it.productId ?? it.product_id,
        price: Number(it.price ?? 0),
        priceDiscount: Number(it.priceDiscount ?? it.price_discount ?? 0),
        units: Number(it.units ?? it.unit ?? 1),
        date: it.date ?? null,
      }))
    : [],
});

// Thunks
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const { data } = await backend.get("/orders");
  return Array.isArray(data) ? data.map(mapOrder) : [];
});

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id) => {
    const { data } = await backend.get(`/orders/${id}`);
    return mapOrder(data);
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (payload) => {
    const { data } = await backend.post("/orders", payload);
    return mapOrder(data);
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id) => {
    await backend.delete(`/orders/${id}`);
    return id;
  }
);

// Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "No se pudieron traer las órdenes";
      })

      // detail
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.current = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "No se pudo traer la orden";
      })

      // create
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })

      // delete
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { clearCurrent } = ordersSlice.actions;

// Selectores
export const selectOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrder = (state) => state.orders.current;

export default ordersSlice; // 👈 exporto el slice (no el reducer) para que puedas usar `.reducer` en el store
