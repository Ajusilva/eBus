
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos no .env."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Administrador Geral",
      email,
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Administrador geral configurado: ${admin.email}`);


  const roles = [
    {
      name: "SUPER_ADMIN",
      description: "Administrador geral do eBus",
    },
    {
      name: "ADMIN",
      description: "Administrador de uma prefeitura",
    },
    {
      name: "DRIVER",
      description: "Motorista do transporte escolar",
    },
    {
      name: "GUARDIAN",
      description: "Responsável por estudante",
    },
    {
      name: "STUDENT",
      description: "Estudante que utiliza o transporte escolar",
    },
  ];

  for (const role of roles) {
    await prisma.accessRole.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log("Papéis do eBus cadastrados com sucesso!");


  const permissions = [
    {
      name: "organization.approve",
      description: "Aprovar ou rejeitar prefeituras",
    },
    {
      name: "organization.manage",
      description: "Gerenciar dados da própria prefeitura",
    },
    {
      name: "bus.create",
      description: "Cadastrar ônibus",
    },
    {
      name: "bus.update",
      description: "Atualizar dados dos ônibus",
    },
    {
      name: "bus.delete",
      description: "Excluir ônibus",
    },
    {
      name: "trip.create",
      description: "Criar viagens",
    },
    {
      name: "trip.manage",
      description: "Gerenciar viagens",
    },
    {
      name: "trip.enroll",
      description: "Inscrever-se em viagens",
    },
    {
      name: "location.update",
      description: "Atualizar localização durante viagens",
    },
    {
      name: "incident.create",
      description: "Registrar ocorrências",
    },
    {
      name: "trip.view",
      description: "Consultar viagens disponíveis",
    },
    {
      name: "student.follow",
      description: "Acompanhar viagens de estudantes vinculados",
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log("Permissões do eBus cadastradas com sucesso!");


  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: [
      "organization.approve",
      "trip.view",
    ],

    ADMIN: [
      "organization.manage",
      "bus.create",
      "bus.update",
      "bus.delete",
      "trip.create",
      "trip.manage",
      "trip.view",
    ],

    DRIVER: [
      "location.update",
      "incident.create",
      "trip.view",
    ],

    GUARDIAN: [
      "student.follow",
      "trip.view",
    ],

    STUDENT: [
      "trip.enroll",
      "trip.view",
    ],
  };

  for (const [roleName, permissionNames] of Object.entries(
    rolePermissions
  )) {
    const role = await prisma.accessRole.findUniqueOrThrow({
      where: {
        name: roleName,
      },
    });

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: {
          name: permissionName,
        },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Permissões associadas aos papéis com sucesso!");
  console.log("Configuração inicial do eBus concluída!");
}

main()
  .catch((error) => {
    console.error("Erro ao executar o seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
