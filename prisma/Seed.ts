import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';
import 'dotenv/config'; 

const prisma = new PrismaClient();

async function main() {

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error(
      'As variáveis de ambiente SUPER_ADMIN_EMAIL e SUPER_ADMIN_PASSWORD precisam estar definidas no arquivo .env',
    );
  }

  const saltRounds = 10;
  const passwordHash = await hash(SUPER_ADMIN_PASSWORD, saltRounds);

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existingSuperAdmin) {
    console.log('O usuário SUPER_ADMIN já existe. Nenhuma ação foi tomada.');
  } else {
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrador',
        email: SUPER_ADMIN_EMAIL,
        passwordHash: passwordHash,
        role: Role.SUPER_ADMIN,
        isActive: true, 
      },
    });
    console.log(`Usuário SUPER_ADMIN criado com sucesso: ${superAdmin.email}`);
  }

  console.log('Seed finalizado.');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
