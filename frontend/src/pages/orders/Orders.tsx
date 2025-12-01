import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  subtotal: number;
  product: Product;
}

interface Order {
  id: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver tus pedidos");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:3000/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      setError("No se pudieron obtener los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando pedidos...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  if (orders.length === 0)
    return <p className="text-center mt-10">Aún no has realizado ningún pedido 🧾</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧾 Mis Pedidos</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-300 p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Pedido #{order.id}
              </h2>
              <span className="text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded"
                >
                  <div className="flex items-center space-x-3">
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p>Cantidad: {item.quantity}</p>
                      <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-bold">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-right mt-3 font-semibold text-lg">
              Total: ${order.total.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}