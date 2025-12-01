import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartItem {
  id: number;
  quantity: number;
  subtotal: number;
  product: Product;
}

interface Cart {
  id: number;
  total: number;
  items: CartItem[];
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Cargar el carrito
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver tu carrito");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:3000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data);
      setError("");
    } catch (err: any) {
      console.error(" Error al obtener carrito:", err);
      setError("No se pudo obtener el carrito");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const handleRemove = async (cartItemId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/cart/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error(" Error al eliminar producto:", err);
    }
  };

  // Vaciar carrito
  const handleClear = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:3000/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error(" Error al vaciar carrito:", err);
    }
  };

  // Finalizar compra (crear pedido)
  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/orders/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(" Pedido creado exitosamente!");
      console.log(" Pedido creado:", res.data);

      // Recargar carrito (vacío)
      fetchCart();
    } catch (err) {
      console.error(" Error al crear pedido:", err);
      setMessage(" No se pudo crear el pedido");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando carrito...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!cart || cart.items.length === 0)
    return <p className="text-center mt-10">Tu carrito está vacío</p>;

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#e6e2db" }}>
      <h1 className="text-2xl font-bold mb-4"> Tu Carrito</h1>

      {message && (
        <p className="text-center mb-4 text-green-600 font-semibold">{message}</p>
      )}

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow"
          >
            <div className="flex items-center space-x-4">
              {item.product.imageUrl && (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                <p>Cantidad: {item.quantity}</p>
                <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right space-y-3">
        <h2 className="text-xl font-bold">Total: ${cart.total.toFixed(2)}</h2>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Vaciar carrito
          </button>
          <button
            onClick={handleCheckout}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  );
}