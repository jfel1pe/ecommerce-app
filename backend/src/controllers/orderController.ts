import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Crear pedido desde el carrito
 */
/**
 * 🧾 Crear un nuevo pedido desde el carrito del usuario
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // 1️⃣ Buscar carrito con items y productos
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío o no existe." });
    }

    // 2️⃣ Ejecutar transacción (para mantener integridad)
    const order = await prisma.$transaction(async (tx) => {
      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: cart.total,
          status: "pendiente",
        },
      });

      // Iterar items del carrito y crear los del pedido
      for (const item of cart.items) {
        // Validar stock disponible
        if (item.product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.product.name}`);
        }

        // Restar stock del producto
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: item.product.stock - item.quantity,
          },
        });

        // Crear OrderItem
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            subtotal: item.subtotal,
          },
        });
      }

      // Vaciar el carrito (eliminar items)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Reiniciar total del carrito
      await tx.cart.update({
        where: { id: cart.id },
        data: { total: 0 },
      });

      return newOrder;
    });

    res.json({
      message: "Pedido creado correctamente",
      order,
    });
  } catch (error) {
    console.error(" Error en createOrder:", error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
};

/**
 * 📋 Obtener pedidos de un usuario
 */
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error en getOrdersByUser:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
};

/**
 * 🔍 Obtener un pedido por ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    res.json(order);
  } catch (error) {
    console.error("❌ Error en getOrderById:", error);
    res.status(500).json({ error: "Error al obtener el pedido" });
  }
};