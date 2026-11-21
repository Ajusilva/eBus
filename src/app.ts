
import express from "express";
import userRoutes from "./routes/user.routes";
import AppError from "./utils/AppError";
import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import adminRoutes from "./routes/admin.routes";
import busRoutes from "./routes/bus.routes";
import driverRoutes from "./routes/driver.routes";

export const app = express();

// Permite que a API receba dados JSON
app.use(express.json());

// Rota para verificar se a API está funcionando
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "API eBus funcionando",
  });
});

// Registro das rotas
app.use(authRoutes);
app.use(userRoutes);
app.use(organizationRoutes);
app.use(adminRoutes);
app.use(busRoutes);
app.use(driverRoutes);

// Tratamento global de erros
app.use((
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Erro interno do servidor.",
  });
});
