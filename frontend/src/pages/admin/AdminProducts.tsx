import React, { useEffect, useState } from "react";
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
  imageUrl: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    size: "",
    color: "",
    imageUrl: "",
  });

  const token = localStorage.getItem("token");

  // Cargar productos desde el backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error(" Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["price", "stock"].includes(name) ? Number(value) : value,
    });
  };

  // Crear o actualizar producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:3000/products/${editingProduct.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:3000/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchProducts();

      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        size: "",
        color: "",
        imageUrl: "",
      });
      setEditingProduct(null);
    } catch (error) {
      console.error(" Error al guardar producto:", error);
    }
  };

  // Editar producto
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  // Eliminar producto
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // Filtrar productos por nombre
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Gestión de Productos
      </h1>

      {/* Formulario de creación/edición */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-2 gap-4 bg-white p-6 rounded shadow-md"
      >
        {/* --- Campos del formulario --- */}
        {[
          { label: "Nombre", name: "name", placeholder: "Nombre del producto" },
          { label: "Descripción", name: "description", placeholder: "Descripción" },
          { label: "Precio", name: "price", placeholder: "Precio" },
          { label: "Stock", name: "stock", placeholder: "Stock" },
          { label: "Categoría", name: "category", placeholder: "Categoría" },
          { label: "Talla", name: "size", placeholder: "Talla (M, L, XL...)" },
          { label: "Color", name: "color", placeholder: "Color" },
          { label: "URL de la imagen", name: "imageUrl", placeholder: "https://example.com/imagen.jpg" },
        ].map(({ label, name, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              {label}
            </label>
            <input
              name={name}
              placeholder={placeholder}
              value={(formData as any)[name] || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required={name !== "imageUrl"}
            />
          </div>
        ))}

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingProduct ? "Actualizar producto" : "Crear producto"}
        </button>
      </form>

      {/*Buscador de productos */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Buscar producto por nombre
        </label>
        <input
          type="text"
          placeholder="Escribe el nombre del producto..."
          value={searchTerm}
          onChange={handleSearch}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Listado de productos filtrados */}
      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="border rounded p-4 shadow bg-white flex flex-col items-center"
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-32 h-32 object-cover mb-2"
              />
            )}
            <h2 className="font-bold text-gray-800">{p.name}</h2>
            <p className="text-gray-600 text-sm mb-1">{p.description}</p>
            <p className="mt-1">${p.price}</p>
            <p>Stock: {p.stock}</p>
            <p className="text-sm text-gray-500">{p.category}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;