export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number; // Deposit balance
  borrowedUmbrellaId?: string;
  password?: string; // Encrypted in real app, plain text for mock
}

export interface Umbrella {
  id: string;
  status: 'available' | 'rented' | 'maintenance';
  location: LocationType;
  condition: string;
}

export type LocationType = string;

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  umbrellaId: string;
  action: 'borrow' | 'return';
  timestamp: string;
  location: LocationType;
}

export interface WeatherData {
  summary: string;
  rainChance: number; // 0-100
  isRainy: boolean;
  advice: string;
  temperature: number;
}