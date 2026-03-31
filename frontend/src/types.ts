
export enum UserRole {
  ADMIN = 'admin',
  CAPTAIN = 'captain',
  VICE_CAPTAIN = 'viceCaptain',
  MEMBER = 'member'
}

export enum Gender {
  BOYS = 'boys',
  GIRLS = 'girls'
}

export enum MatchType {
  URJA = 'Under Urja (Sports Fest)',
  INTER_HOSTEL = 'Inter Hostel',
  INTER_NIT = 'Inter NIT',
  RANDOM = 'Random Match'
}

export interface GameScore {
  gameNumber: number;
  serverInitials: string;
  score: string; // e.g., "40-15"
}

export interface Match {
  id: string;
  _id?: string;
  type: MatchType;
  court?: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  score1: string; 
  score2: string;
  winnerId?: string;
  tossWinner?: string;
  tossChoice?: 'serve' | 'side';
  gameHistory: GameScore[];
  scheduledAt: string;
  completed: boolean;
  isLive?: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  regNo: string; 
  phone?: string;
  designation?: string;
  role: UserRole;
  gender: Gender | string;
  isInducted: boolean;
  currentYear?: number; 
  year?: number;
  joinedAt: string; 
  avatar?: string;
}

export interface Contribution {
  userId: string;
  month: string;
  year: number;
  paid: boolean;
  paidAt?: string;
  transactionId?: string;
}

export interface FinancialLog {
  id: string;
  authorId: string;
  authorName: string;
  type: 'credit' | 'debit';
  source: 'Alumni' | 'College' | 'Member' | 'Other';
  amount: number;
  reason: string;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface EquipmentRequest {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  itemId: string;
  itemDescription: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  urgent: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export interface Alumni {
  id: string;
  name: string;
  regNo: string;
  contact: string;
  imageUrl: string;
  batch: string;
}
