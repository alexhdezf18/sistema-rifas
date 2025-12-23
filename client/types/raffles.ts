export interface Raffle {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  ticketPrice: number;
  totalTickets: number;
  opportunities: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  _count?: {
    tickets: number;
  };
}
