import React, { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  id: number;
  user: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/orders/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error(" Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/orders/admin/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 🔄 Actualizamos la lista
      fetchOrders();
    } catch (error) {
      console.error(" Error al actualizar estado:", error);
      alert("Error al actualizar el estado del pedido");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-6">Cargando pedidos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos de Usuarios</h1>

      {orders.length === 0 ? (
        <p>No hay pedidos registrados.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  Pedido #{order.id} — {order.user.name}
                </p>
                <p>{order.user.email}</p>
                <p>Total: ${order.total}</p>
                <p>Estado actual: <strong>{order.status}</strong></p>
                <p>Fecha: {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-x-2">
                <select
                  defaultValue={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="pendiente">pendiente</option>
                  <option value="pagado">pagado</option>
                  <option value="enviado">enviado</option>
                  <option value="entregado">entregado</option>
                  <option value="cancelado">cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}