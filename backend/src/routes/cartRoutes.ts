import { Router } from "express";
import { addToCart, getCartByUser, removeFromCart, clearCart, getAllCarts, } from "../controllers/cartController";
import { verifyToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authRole";

/**
 *  Rutas del carrito protegidas con token
 */

const router = Router();

// Rutas de usuario autenticado
router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCartByUser);
router.delete("/remove/:cartItemId", verifyToken, removeFromCart);
router.delete("/clear", verifyToken, clearCart);

// Ruta exclusiva para ADMIN
router.get("/admin/all", verifyToken, authorizeRole(["ADMIN"]), getAllCarts);

export default router;