import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.ts";

const router = Router();

// 📚 Rutas CRUD
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;