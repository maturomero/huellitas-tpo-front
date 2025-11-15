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
      .addCase(fetchOrders.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "No se pudieron traer las órdenes";
      })

      // detail
      .addCase(fetchOrderById.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.current = null;
      })
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchOrderById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "No se pudo traer la orden";
      })

      // create
      .addCase(createOrder.fulfilled, (s, a) => {
        s.items = [a.payload, ...s.items];
      })

      // delete
      .addCase(deleteOrder.fulfilled, (s, a) => {
        s.items = s.items.filter((o) => o.id !== a.payload);
        if (s.current?.id === a.payload) s.current = null;
      });
  },
});

export const { clearCurrent } = ordersSlice.actions;

// Selectores
export const selectOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrder = (state) => state.orders.current;

export default ordersSlice; // 👈 exporto el slice (no el reducer) para que puedas usar `.reducer` en el store
