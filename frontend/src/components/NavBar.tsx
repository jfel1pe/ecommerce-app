import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      className="text-white px-6 py-4 flex justify-between items-center"
      style={{ backgroundColor: "#634e45" }}
    >
      <h1 className="text-xl font-bold">WILD STYLE</h1>

      <div className="space-x-4">

        {/* Enlace visible para todos */}
        <Link to="/" className="hover:text-gray-300">
          Inicio
        </Link>

        {/* Enlaces visibles solo para usuarios */}
        {token && role === "USER" && (
          <>
            <Link to="/cart" className="hover:text-gray-300">
              Carrito
            </Link>
            <Link to="/orders" className="hover:text-gray-300">
              Pedidos
            </Link>
          </>
        )}

        {/* Enlaces visibles solo para admin */}
        {token && role === "ADMIN" && (
          <>
            <Link to="/admin/products" className="hover:text-gray-300">
              Productos
            </Link>
            <Link to="/admin/orders" className="hover:text-gray-300">
              Pedidos
            </Link>
          </>
        )}

        {/* Enlaces públicos o cerrar sesión */}
        {!token ? (
          <>
            <Link to="/login" className="hover:text-gray-300">
              Iniciar sesión
            </Link>
            <Link to="/register" className="hover:text-gray-300">
              Registrarse
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-white text-[#634e45] px-3 py-1 rounded hover:bg-gray-200"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;