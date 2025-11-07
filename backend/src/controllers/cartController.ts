import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * ✅ Agregar producto al carrito del usuario autenticado
 */
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id; // 🔒 se toma del token
    const { productId, quantity } = req.body;

    // ✅ Validación de cantidad
    if (
      !Number.isInteger(quantity) || // No es entero
      quantity <= 0 // Es cero o negativo
    ) {
      return res
        .status(400)
        .json({ error: "La cantidad debe ser un número entero positivo." });
    }

    // ✅ Validar producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    // Buscar carrito existente o crear uno nuevo
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, total: 0 },
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Evitar que quede cantidad negativa o cero
      if (newQuantity <= 0) {
        return res
          .status(400)
          .json({ error: "La cantidad total no puede ser menor o igual a cero." });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          subtotal: newQuantity * product.price,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          subtotal: quantity * product.price,
        },
      });
    }

    // Recalcular total
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: {
          set:
            (
              await prisma.cartItem.aggregate({
                where: { cartId: cart.id },
                _sum: { subtotal: true },
              })
            )._sum.subtotal ?? 0,
        },
      },
      include: { items: { include: { product: true } } },
    });

    res.json({
      message: "Producto agregado correctamente al carrito",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("❌ Error en addToCart:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
};

/**
 * ✅ Obtener carrito del usuario autenticado
 */
export const getCartByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json(cart);
  } catch (error) {
    console.error("❌ Error en getCartByUser:", error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

/**
 * ✅ Eliminar producto del carrito (solo su propio carrito)
 */
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    // Verificar que el item pertenece al usuario autenticado
    const item = await prisma.cartItem.findUnique({
      where: { id: Number(cartItemId) },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId)
      return res.status(403).json({ error: "No tienes permiso para eliminar este producto" });

    await prisma.cartItem.delete({ where: { id: Number(cartItemId) } });

    // Recalcular total
    await prisma.cart.update({
      where: { id: item.cartId },
      data: {
        total: {
          set:
            (
              await prisma.cartItem.aggregate({
                where: { cartId: item.cartId },
                _sum: { subtotal: true },
              })
            )._sum.subtotal ?? 0,
        },
      },
    });

    res.json({ message: "Producto eliminado del carrito correctamente" });
  } catch (error) {
    console.error("❌ Error en removeFromCart:", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
};

/**
 * ✅ Vaciar el carrito del usuario autenticado
 */
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    await prisma.cart.update({
      where: { id: cart.id },
      data: { total: 0 },
    });

    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error("❌ Error en clearCart:", error);
    res.status(500).json({ error: "Error al vaciar el carrito" });
  }
};

/**
 * 🔒 Solo ADMIN: obtener todos los carritos de todos los usuarios
 */
export const getAllCarts = async (req: AuthRequest, res: Response) => {
  try {
    const carts = await prisma.cart.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    res.json(carts);
  } catch (error) {
    console.error("❌ Error en getAllCarts:", error);
    res.status(500).json({ error: "Error al obtener los carritos" });
  }
};