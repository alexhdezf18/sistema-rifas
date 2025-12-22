export interface Raffle {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  ticketPrice: string;
  totalTickets: number;
  opportunities: number;
  isActive: boolean;
}
