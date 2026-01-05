import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

      // Verificamos si la rifa existe Y si la fecha actual está dentro del rango permitido
      if (!raffle) {
        throw new NotFoundException('La rifa no existe');
      }

      // Verificamos que las fechas existan
      if (!raffle.startDate || !raffle.endDate) {
        throw new BadRequestException(
          'La rifa no tiene fechas configuradas correctamente',
        );
      }

      // Ahora sí, validamos el rango de tiempo
      const now = new Date();
      if (now < raffle.startDate || now > raffle.endDate) {
        throw new BadRequestException(
          'Esta rifa no está activa en este momento',
        );
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

  // Obtener solo los números ocupados de una rifa
  async getOccupiedTickets(raffleId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        raffleId: raffleId,
        status: { in: ['RESERVED', 'PAID'] }, // Buscamos apartados o pagados
      },
      select: { ticketNumber: true }, // Solo traeme el numerito, no necesito más datos
    });

    // Convertimos la respuesta compleja [{ticketNumber: 5}, {ticketNumber: 8}]
    // A un array simple: [5, 8]
    return tickets.map((t) => t.ticketNumber);
  }

  // Obtener todos los tickets de una rifa con datos del cliente
  async findAllByRaffle(raffleId: string) {
    return this.prisma.ticket.findMany({
      where: { raffleId },
      include: { client: true }, // Esto trae los datos del cliente asociado
      orderBy: { ticketNumber: 'asc' }, // Ordenados del 0 al 100...
    });
  }

  // Marcar como pagado
  async markAsPaid(id: string) {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(), // Guardamos la fecha exacta del pago
      },
    });
  }

  async findByPhone(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');

    return this.prisma.ticket.findMany({
      where: {
        client: {
          phone: {
            contains: cleanPhone,
          },
        },
      },
      include: {
        raffle: true,
        client: true,
      },
      orderBy: {
        ticketNumber: 'asc',
      },
    });
  }

  async createMany(data: {
    raffleId: string;
    clientName: string;
    clientPhone: string;
    clientState?: string;
    ticketNumbers: number[];
  }) {
    // 1. Verificar si alguno ya está ocupado
    const existingTickets = await this.prisma.ticket.findMany({
      where: {
        raffleId: data.raffleId,
        ticketNumber: { in: data.ticketNumbers },
      },
    });

    if (existingTickets.length > 0) {
      const occupied = existingTickets.map((t) => t.ticketNumber).join(', ');
      throw new Error(
        `Los boletos ${occupied} ya fueron ganados por alguien más.`,
      );
    }

    // 2. Buscar o crear el cliente
    let client = await this.prisma.client.findFirst({
      where: { phone: data.clientPhone },
    });

    if (!client) {
      // Si solo lo agregaste al modelo Ticket, déjalo así.
      client = await this.prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
        },
      });
    }

    // 3. Crear los boletos en transacción
    const result = await this.prisma.$transaction(
      data.ticketNumbers.map((num) =>
        this.prisma.ticket.create({
          data: {
            ticketNumber: num,
            status: 'RESERVED',
            raffleId: data.raffleId,
            clientId: client.id,
            clientState: data.clientState || 'Desconocido',
          },
        }),
      ),
    );

    return result;
  }

  async getDailySales() {
    // 1. Calcular fecha de hace 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Ajustar al inicio del día (00:00:00) para ser más precisos
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 2. Buscar boletos creados en ese periodo
    const tickets = await this.prisma.ticket.findMany({
      where: {
        createdAt: {
          // Ahora sí debe reconocer este campo tras el 'npx prisma generate'
          gte: sevenDaysAgo,
        },
        // Opcional: Si solo quieres contar boletos pagados, descomenta esto:
        // status: 'PAID',
      },
      include: {
        raffle: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 3. Agrupar por día
    const salesByDate: Record<string, number> = {};

    // Inicializar los últimos 7 días en 0
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
      }); // Ej: "22/12"
      salesByDate[dateStr] = 0;
    }

    // Sumar el dinero
    tickets.forEach((ticket) => {
      const dateStr = new Date(ticket.createdAt).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
      });
      if (salesByDate[dateStr] !== undefined) {
        salesByDate[dateStr] += Number(ticket.raffle.ticketPrice);
      }
    });

    // Convertir a formato para la gráfica
    const result = Object.entries(salesByDate)
      .map(([name, total]) => ({ name, total }))
      // Invertir para que el día más viejo esté a la izquierda y hoy a la derecha
      .reverse();

    return result;
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
