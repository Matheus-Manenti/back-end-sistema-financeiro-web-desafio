import { NotFoundException } from '@nestjs/common';

export class OrderNotFoundException extends NotFoundException {
  constructor() {
    super('Ordem de serviço não encontrada.', 'ORDER_NOT_FOUND');
  }
}
