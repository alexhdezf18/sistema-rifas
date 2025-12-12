export class CreateRaffleDto {
  name: string;
  description?: string;
  ticketPrice: number;
  totalTickets: number;
  opportunities?: number;
}
