export type Role = 'ADMIN' | 'DRIVER';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
}