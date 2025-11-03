import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🟢 Obtener todos los productos
export const getProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// 🟢 Obtener un producto por ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) return res.status(404).json({ message: "Producto no encontrado" });

  res.json(product);
};

// 🟢 Crear producto
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, size, color, stock, imageUrl } = req.body;

    const newProduct = await prisma.product.create({
      data: { name, description, price, category, size, color, stock, imageUrl },
    });

    res.json(newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// 🟡 Actualizar producto
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, category, size, color, stock, imageUrl } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price, category, size, color, stock, imageUrl },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// 🔴 Eliminar producto
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};