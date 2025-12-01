// frontend/src/pages/home/ProductDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  size: string;
  color: string;
  imageUrl?: string | null;
  createdAt?: string;
}

const API = "http://localhost:3000";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) Obtener el producto por id
        const res = await axios.get<Product>(`${API}/products/${id}`);
        setProduct(res.data);

        // 2) Cargar todos y filtrar relacionados (misma category, distinto id)
        const all = await axios.get<Product[]>(`${API}/products`);
        const rel = all.data.filter(
          (p) => p.category === res.data.category && p.id !== res.data.id
        );
        setRelated(rel);
      } catch (err) {
        console.error("Error al cargar producto o relacionados:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleAddToCart = async (quantity = 1) => {
    if (!token) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }
    if (!product) return;
    if (product.stock <= 0) {
      alert("No hay stock disponible de este producto.");
      return;
    }

    try {
      setAdding(true);
      await axios.post(
        `${API}/cart/add`,
        { productId: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Producto agregado al carrito");
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert("No se pudo agregar al carrito. Revisa la consola.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">Cargando producto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 min-h-[60vh] flex items-center justify-center">
        <div className="text-red-500">Producto no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#e6e2db" }}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Imagen y galería (col 1) */}
          <div className="md:col-span-1 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full max-w-sm h-80 object-cover rounded-lg shadow"
              />
            ) : (
              <div className="w-full max-w-sm h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Info (col 2-3) */}
          <div className="md:col-span-2 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>

            <div className="mt-4 flex items-center gap-6">
              <div className="text-2xl font-extrabold" style={{color:"#55433e"}}>
                ${product.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Stock: {product.stock}</div>
              <div className="text-sm text-gray-500">Talla: {product.size}</div>
              <div className="text-sm text-gray-500">Color: {product.color}</div>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => handleAddToCart(1)}
                disabled={adding || product.stock <= 0}
                className="text-white px-4 py-2 rounded disabled:opacity-60 hover:bg-blue-700 transition" style={{backgroundColor:"#9e8771"}}
              >
                {adding ? "Agregando..." : "Agregar al carrito"}
              </button>

              <button
                onClick={() => {
                  // navegar al carrito o abrir modal (si lo tienes)
                  window.location.href = "/cart";
                }}
                className="border px-4 py-2 rounded hover:bg-gray-100 transition" style={{backgroundColor:"#e6e2db"}}
              >
                Ir al carrito
              </button>
            </div>

            {/* Meta info */}
            <div className="mt-6 text-sm text-gray-500">
              <div>Categoría: {product.category}</div>
            </div>
          </div>
        </div>

        {/* Related */}
        <h2 className="mt-8 text-xl font-semibold text-gray-800">Productos relacionados</h2>
        {related.length === 0 ? (
          <p className="text-gray-500 mt-2">No hay productos relacionados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/product/${r.id}`}
                className="bg-white border rounded-lg p-3 hover:shadow-md transition flex flex-col items-center text-center"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} className="w-full h-40 object-cover rounded-md mb-2" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="font-medium text-gray-800">{r.name}</div>
                <div className="text-sm text-blue-600 font-semibold" style={{color:"#9e8771"}} >${r.price.toFixed(2)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
