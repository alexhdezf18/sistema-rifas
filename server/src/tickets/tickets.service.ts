import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    const { raffleId, numbers, clientName, clientPhone, clientState } =
      createTicketDto;

    // INICIO DE TRANSACCIÓN: Todo esto ocurre "atómico"
    return await this.prisma.$transaction(async (tx) => {
      // Verificar que la rifa existe y está activa
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
      if (!raffle || !raffle.isActive) {
        throw new BadRequestException('La rifa no existe o ya finalizó.');
      }

      // Verificar que los números estén dentro del rango (ej. no pedir el 105 si son 100 boletos)
      const invalidNumbers = numbers.filter(
        (n) => n < 0 || n >= raffle.totalTickets,
      );
      if (invalidNumbers.length > 0) {
        throw new BadRequestException(
          `Números fuera de rango: ${invalidNumbers.join(', ')}`,
        );
      }

      // Verificar que los números NO estén ocupados ya
      const existingTickets = await tx.ticket.findMany({
        where: {
          raffleId,
          ticketNumber: { in: numbers }, // Busca cualquiera de los números pedidos
        },
      });

      if (existingTickets.length > 0) {
        const occupied = existingTickets.map((t) => t.ticketNumber).join(', ');
        throw new BadRequestException(
          `Lo sentimos, los siguientes números ya fueron ganados: ${occupied}`,
        );
      }

      // Gestionar el Cliente (Buscarlo o Crearlo)
      // Usamos "upsert" no, mejor lógica manual para asegurar ID
      let client = await tx.client.findUnique({
        where: { phone: clientPhone },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            name: clientName,
            phone: clientPhone,
            state: clientState,
          },
        });
      } else {
        // Opcional: Actualizar nombre si cambió
      }

      // E) Crear los Tickets
      // Preparamos los datos para insertar en masa
      const ticketsToCreate = numbers.map((num) => ({
        raffleId,
        clientId: client.id,
        ticketNumber: num,
        status: 'RESERVED' as const, // Forzamos el tipo ENUM
      }));

      await tx.ticket.createMany({
        data: ticketsToCreate,
      });

      return {
        message: 'Reserva exitosa',
        tickets: numbers,
        client: client.name,
      };
    });
  }

  findAll() {
    return `This action returns all tickets`;
  }
  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }
  update(id: number, updateTicketDto: any) {
    return `This action updates a #${id} ticket`;
  }
  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
