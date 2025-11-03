import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.ts";
import productRoutes from "./routes/productRoutes.ts"
import cartRoutes from "./routes/cartRoutes.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // para leer JSON en las peticiones

//Ruta base para usuarios
app.use("/users", userRoutes);

//Ruta base para productos
app.use("/products", productRoutes);

//Ruta base para carts
app.use("/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Servidor funcionando correctamente en el puerto ${PORT}`);
});