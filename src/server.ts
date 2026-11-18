
import "dotenv/config";
import { app } from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();

    const users = await prisma.user.findMany();
    console.log("Conexão com o banco estabelecida!");
    console.log("Usuários encontrados:", users.length);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
