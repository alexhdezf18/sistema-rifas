import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@turifa.com';
  const passwordRaw = '123456';

  // Encriptar la contraseña (10 rondas de sal)
  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  // Crear o actualizar el admin (upsert evita duplicados si corres el script 2 veces)
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
    },
  });

  console.log('🛡️ Admin creado:', admin.email);
  console.log('🔑 Contraseña:', passwordRaw);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
