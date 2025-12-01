import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  size: string;
  color: string;
  imageUrl: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const parentRef = useRef<HTMLDivElement | null>(null);

  // Número de columnas
  const columns = 3;
  const itemHeight = 450;

  // Obtener productos
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrar productos
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  };

  // Convertimos los productos a filas de grid
  const rows = Math.ceil(filteredProducts.length / columns);

  // Virtualizador por filas
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 3,
  });

  // Agregar al carrito
  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/cart/add",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Producto agregado al carrito");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("No se pudo agregar al carrito.");
    }
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#e6e2db" }}>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Catálogo de Productos
      </h1>

      {/* Buscador */}
      <div className="max-w-xl mx-auto mb-8">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Buscar productos
        </label>
        <input
          type="text"
          placeholder="Busca una prenda por nombre..."
          value={searchTerm}
          onChange={handleSearch}
          className="border p-3 rounded w-full shadow-sm"
        />
      </div>

      {/* LISTA VIRTUALIZADA --- GRID */}
      <div
        ref={parentRef}
        style={{
          height: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowIndex = virtualRow.index;

            return (
              <div
                key={virtualRow.key}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: "20px",
                  padding: "20px",
                }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const productIndex = rowIndex * columns + colIndex;
                  const p = filteredProducts[productIndex];
                  if (!p) return <div key={colIndex}></div>;

                  return (
                    <div
                      key={p.id}
                      className="bg-white border rounded-lg shadow hover:shadow-lg transition p-5 flex flex-col items-center"
                      style={{ backgroundColor: "#f5f4f1" }}
                    >
                      <Link
                        to={`/product/${p.id}`}
                        className="flex flex-col items-center"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-40 h-40 object-cover mb-4 rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-gray-300 rounded mb-4" />
                        )}

                        <h2 className="font-bold text-xl text-gray-800 text-center">
                          {p.name}
                        </h2>

                        <p className="text-gray-600 text-sm mb-2 text-center">
                          {p.description}
                        </p>

                        <p
                          className="text-2xl font-semibold mt-1"
                          style={{ color: "#55433e" }}
                        >
                          ${p.price}
                        </p>

                        <p className="text-sm mt-1 text-gray-500">
                          Categoría: {p.category}
                        </p>

                        <p className="text-sm text-gray-500">
                          Talla: {p.size} • Color: {p.color}
                        </p>
                      </Link>

                      <button
                        className="mt-4 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        style={{ backgroundColor: "#9e8771" }}
                        onClick={() => handleAddToCart(p.id)}
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
