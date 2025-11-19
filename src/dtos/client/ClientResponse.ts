import { FinancialStatus } from './FinancialStatus';

export class ClientResponseDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  financialStatus: FinancialStatus;

  constructor(partial: Partial<ClientResponseDTO>) {
    Object.assign(this, partial);
  }
}