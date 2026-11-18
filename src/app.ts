
import express from "express";
import userRoutes from "./routes/user.routes";
import AppError from "./utils/AppError";
import authRoutes from "./routes/auth.routes";

export const app = express();

app.use(express.json());
app.use(authRoutes);


app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "API eBus funcionando",
  });
});


app.use(userRoutes);


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
