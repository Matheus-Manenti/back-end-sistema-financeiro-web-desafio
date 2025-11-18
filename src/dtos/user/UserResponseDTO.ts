import { Role } from "@prisma/client"; 

export class UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: Role;  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}