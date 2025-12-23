import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Importamos nuestro servicio de BD
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

@Injectable()
export class RafflesService {
  // Inyectamos Prisma en el constructor
  constructor(private prisma: PrismaService) {}

  async create(createRaffleDto: CreateRaffleDto) {
    // Generamos un "slug" simple (URL amigable) basado en el nombre
    // Ej: "Gran Rifa Iphone" -> "gran-rifa-iphone-1234"
    const slug =
      createRaffleDto.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

    return this.prisma.raffle.create({
      data: {
        ...createRaffleDto, // Copiamos todos los datos que vienen del frontend
        slug: slug, // Agregamos el slug generado
      },
    });
  }

  // Buscar una rifa por su URL amigable (Slug)
  async findOneBySlug(slug: string) {
    return this.prisma.raffle.findUnique({
      where: { slug }, // Busca en la columna 'slug'
    });
  }

  async findAll() {
    return this.prisma.raffle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { tickets: true }, //CUENTA LOS BOLETOS VENDIDOS/APARTADOS
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.raffle.findUnique({ where: { id } });
  }

  // ... Dejamos update y remove pendientes por ahora
  update(id: string, updateRaffleDto: UpdateRaffleDto) {
    return `This action updates a #${id} raffle`;
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
