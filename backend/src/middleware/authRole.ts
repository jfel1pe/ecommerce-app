import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  role: string;
}

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "No autorizado" });

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      // Guardar el usuario en la request
      (req as any).user = decoded;
      next();
    } catch (error) {
      console.error(" Error en authorizeRole:", error);
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
};