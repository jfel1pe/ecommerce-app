import express from "express";
import { createOrder, getOrdersByUser, getOrderById, } from "../controllers/orderController";

const router = express.Router();

router.post("/create", createOrder);
router.get("/user/:userId", getOrdersByUser);
router.get("/:id", getOrderById);

export default router;