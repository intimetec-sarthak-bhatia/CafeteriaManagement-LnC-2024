export interface User {
    id?: number;
    email: string;
    name: string;
    password?: string;
    roleId: number;
    role?: string;
  }