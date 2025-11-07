import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * ✅ Crear un nuevo pedido desde el carrito del usuario autenticado
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id; // del token

    // Buscar carrito con items y productos
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

    // Ejecutar transacción para mantener consistencia
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: cart.total,
          status: "pendiente",
        },
      });

      for (const item of cart.items) {
        // Validar stock
        if (item.product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.product.name}`);
        }

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: item.product.stock - item.quantity },
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

      // Vaciar carrito
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { total: 0 } });

      return newOrder;
    });

    res.json({ message: "Pedido creado correctamente", order });
  } catch (error) {
    console.error("❌ Error en createOrder:", error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
};

/**
 * ✅ Obtener todos los pedidos del usuario autenticado
 */
export const getOrdersByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error en getOrdersByUser:", error);
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
};

/**
 * ✅ Obtener una orden por ID (solo dueño o ADMIN)
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "ID de orden inválido" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar permisos
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para ver esta orden." });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error en getOrderById:", error);
    res.status(500).json({ error: "Error al obtener la orden" });
  }
};

/**
 * 🔒 Solo ADMIN: actualizar estado del pedido
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: "Estado del pedido actualizado correctamente", order });
  } catch (error) {
    console.error("❌ Error en updateOrderStatus:", error);
    res.status(500).json({ error: "Error al actualizar el estado del pedido" });
  }
};

/**
 * 🔒 Solo ADMIN: obtener todas las órdenes
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error en getAllOrders:", error);
    res.status(500).json({ error: "Error al obtener todas las órdenes" });
  }
};