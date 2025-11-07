import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, } from "../controllers/productController";
import { verifyToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authRole";

const router = Router();

// Definimos las rutas y qué función ejecutan

// Públicas
router.get("/", getProducts);
router.get("/:id", getProductById);

// Solo ADMIN
router.post("/", verifyToken, authorizeRole(["ADMIN"]), createProduct);
router.put("/:id", verifyToken, authorizeRole(["ADMIN"]), updateProduct);
router.delete("/:id", verifyToken, authorizeRole(["ADMIN"]), deleteProduct);

export default router;