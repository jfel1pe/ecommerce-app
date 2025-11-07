import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.ts";
import { verifyToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authRole";

const router = Router();

// Rutas CRUD

// Solo ADMIN puede ver o eliminar usuarios
router.get("/", verifyToken, authorizeRole(["ADMIN"]), getUsers);
router.post("/", verifyToken, authorizeRole(["ADMIN"]), createUser);
router.put("/:id", verifyToken, authorizeRole(["ADMIN"]), updateUser);
router.delete("/:id", verifyToken, authorizeRole(["ADMIN"]), deleteUser);

export default router;