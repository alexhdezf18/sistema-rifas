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

  findAll() {
    return this.prisma.raffle.findMany(); // Devuelve todas las rifas
  }

  findOne(id: string) {
    return this.prisma.raffle.findUnique({ where: { id } });
  }

  // ... Dejamos update y remove pendientes por ahora
  update(id: string, updateRaffleDto: UpdateRaffleDto) {
    return `This action updates a #${id} raffle`;
  }

  remove(id: string) {
    return `This action removes a #${id} raffle`;
  }
}
