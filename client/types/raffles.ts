export interface Raffle {
  id: string;
  name: string;
  description?: string;
  slug: string;
  ticketPrice: string;
  totalTickets: number;
  opportunities: number;
  isActive: boolean;
}
