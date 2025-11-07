import { Router } from "express";
import { createOrder, getOrdersByUser, getOrderById, updateOrderStatus, getAllOrders, } from "../controllers/orderController";
import { verifyToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authRole";

/**
 *  Rutas de pedidos protegidas con token
 */

const router = Router();

// Rutas para usuarios autenticados
router.post("/create", verifyToken, createOrder); // Crear pedido desde carrito
router.get("/", verifyToken, getOrdersByUser); // Ver todos sus pedidos
router.get("/:id", verifyToken, getOrderById); // Ver un pedido específico

// Rutas exclusivas para ADMIN
router.get("/admin/all", verifyToken, authorizeRole(["ADMIN"]), getAllOrders); // Ver todos los pedidos
router.patch("/admin/:id/status", verifyToken, authorizeRole(["ADMIN"]), updateOrderStatus); // Cambiar estado

export default router;