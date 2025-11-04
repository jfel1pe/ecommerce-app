import { Router } from "express";
import { addToCart, getCartByUser, removeFromCart, clearCart } from "../controllers/cartController";

const router = Router();

router.post("/add", addToCart);
router.get("/:userId", getCartByUser);
router.delete("/remove/:cartItemId", removeFromCart);
router.delete("/clear/:userId", clearCart);

export default router;