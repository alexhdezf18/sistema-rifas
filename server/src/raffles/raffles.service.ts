import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Importamos nuestro servicio de BD
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

@Injectable()
export class RafflesService {
  // Inyectamos Prisma en el constructor
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // O tu DTO de CreateRaffleDto
    // 1. Generar Slug si no viene
    let slug = data.slug;
    if (!slug || slug.trim() === '') {
      slug = slugify(data.name);
    }

    // 2. Verificar que el slug no exista ya (para evitar errores 500)
    const existing = await this.prisma.raffle.findUnique({
      where: { slug },
    });

    if (existing) {
      // Si ya existe, le agregamos un numero aleatorio al final
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // 3. Crear en base de datos
    return this.prisma.raffle.create({
      data: {
        ...data,
        slug, // <--- Usamos el slug generado
      },
    });
  }

  // Buscar una rifa por su URL amigable (Slug)
  async findOneBySlug(slug: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { slug },
      include: {
        tickets: true, // Incluimos los tickets para saber cuáles están ocupados
      },
    });

    if (!raffle) {
      throw new NotFoundException(`Rifa con slug ${slug} no encontrada`);
    }

    return raffle;
  }

  async findAll() {
    return this.prisma.raffle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            clientState: true,
          },
        },
        _count: {
          select: { tickets: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.raffle.findUnique({ where: { id } });
  }

  async update(id: string, updateRaffleDto: UpdateRaffleDto) {
    // Convertimos fechas si vienen en el DTO
    const data: any = { ...updateRaffleDto };

    // Si vienen fechas como string, las pasamos a Date
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    return this.prisma.raffle.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string) {
    // Intentamos borrar. Si tiene boletos relacionados, Prisma podría quejarse
    // así que usamos una transacción para borrar boletos primero (cascada manual) o dejamos que falle si hay ventas.
    // Para simplificar, usaremos el borrado directo.
    return this.prisma.raffle.delete({
      where: { id },
    });
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '') // Elimina caracteres raros
    .replace(/\-\-+/g, '-'); // Reemplaza múltiples guiones por uno solo
}
