import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todos los carritos
export const getCarts = async (req: Request, res: Response) => {
  try {
    const carts = await prisma.cart.findMany();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los carritos" });
  }
};

// Crear un nuevo carrito
export const createCart = async (req: Request, res: Response) => {
  const { product, quantity, totalPrice } = req.body;
  try {
    const cart = await prisma.cart.create({
      data: { product, quantity, totalPrice },
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
};

// Actualizar carrito
export const updateCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { product, quantity, totalPrice } = req.body;

  try {
    const cart = await prisma.cart.update({
      where: { id: Number(id) },
      data: { product, quantity, totalPrice },
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
};

// Eliminar carrito
export const deleteCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.cart.delete({ where: { id: Number(id) } });
    res.json({ message: "Carrito eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el carrito" });
  }
};