import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🛒 Agregar producto al carrito
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity } = req.body;

    // 1️⃣ Verificar si el usuario existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2️⃣ Verificar si el producto existe
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    // 3️⃣ Buscar si el usuario ya tiene un carrito
    let cart = await prisma.cart.findFirst({ where: { userId } });

    // Si no tiene, crearlo
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, total: 0 },
      });
    }

    // 4️⃣ Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    let updatedItem;

    if (existingItem) {
      // 🔁 Si el producto ya está, actualizamos cantidad y subtotal
      updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          subtotal: (existingItem.quantity + quantity) * product.price,
        },
      });
    } else {
      // ➕ Si no está, lo agregamos como nuevo
      updatedItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
          subtotal: quantity * product.price,
        },
      });
    }

    // 5️⃣ Recalcular el total del carrito
    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      select: { subtotal: true },
    });

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    // 6️⃣ Actualizar el total en el carrito
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { total },
      include: {
        items: {
          include: { product: true },
        },
      },
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

// ✅ Obtener carrito de un usuario
export const getCartByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: Number(userId) },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    res.json({ ...cart, total });
  } catch (error) {
    console.error("❌ Error en getCartByUser:", error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

// ✅ Eliminar un producto del carrito
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: Number(cartItemId) },
    });

    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("❌ Error en removeFromCart:", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
};

// ✅ Vaciar carrito
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: Number(userId) },
    });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error("❌ Error en clearCart:", error);
    res.status(500).json({ error: "Error al vaciar el carrito" });
  }
};