import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Definir los datos del Super Admin
  const email = 'admin@admin.com';
  const password = 'password123'; // <--- Contraseña inicial
  const name = 'Super Admin';

  // 2. Verificar si ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    // 3. Encriptar la contraseña (10 rondas de sal)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    console.log(`✅ Usuario Admin creado: ${email} / ${password}`);
  } else {
    console.log('ℹ️ El usuario Admin ya existe. No se hizo nada.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
