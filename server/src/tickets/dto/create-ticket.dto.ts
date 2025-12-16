export class CreateTicketDto {
  raffleId: string;
  numbers: number[]; // Array de números (ej. [5, 10, 25])
  clientName: string;
  clientPhone: string;
  clientState?: string;
}
