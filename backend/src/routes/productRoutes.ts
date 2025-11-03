import { Router } from "express";
import {getProducts, getProductById, createProduct, updateProduct, deleteProduct, } from "../controllers/productController";

const router = Router();

// Definimos las rutas y qué función ejecutan
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;