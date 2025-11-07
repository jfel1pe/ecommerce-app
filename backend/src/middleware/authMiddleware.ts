import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

export interface AuthRequest extends Request {
  user?: any;
}

// Middleware para verificar el token JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado o inválido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // 👈 Guardamos la info del usuario en la request
    next();
  } catch (error) {
    console.error(" Error en verifyToken:", error);
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};