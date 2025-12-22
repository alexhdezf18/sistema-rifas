import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Obtener lista completa de tickets de una rifa
  @UseGuards(AuthGuard('jwt'))
  @Get('raffle/:raffleId')
  findAllByRaffle(@Param('raffleId') raffleId: string) {
    return this.ticketsService.findAllByRaffle(raffleId);
  }

  // Marcar un ticket específico como pagado
  @UseGuards(AuthGuard('jwt')) // <--- ¡ESTO ES EL CANDADO!
  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.ticketsService.markAsPaid(id);
  }

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get('search/:phone')
  findByPhone(@Param('phone') phone: string) {
    return this.ticketsService.findByPhone(phone);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('occupied/:raffleId')
  getOccupied(@Param('raffleId') raffleId: string) {
    return this.ticketsService.getOccupiedTickets(raffleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
