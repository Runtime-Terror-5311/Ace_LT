
import { User, UserRole, Gender, MatchType, Announcement, InventoryItem, Achievement, Alumni } from './types';

export const INDUCTED_EMAILS = [
  "admin@tennis.com",
  "abc@a.com",
  "b@b.com",
  "player1@tennis.com",
  "player2@tennis.com",
  "alumni@tennis.com",
  "arjun@tennis.com",
  "vikram@tennis.com",
  "ananya@tennis.com"
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', email: 'admin@tennis.com', regNo: '2021UG1001', role: UserRole.ADMIN, gender: Gender.BOYS, isInducted: true, year: 4, currentYear: 4, joinedAt: '2021-08-15', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
  { id: 'u2', name: 'Jane Smith', email: 'abc@a.com', regNo: '2022UG2045', role: UserRole.CAPTAIN, gender: Gender.GIRLS, isInducted: true, year: 3, currentYear: 3, joinedAt: '2022-08-10', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { id: 'u5', name: 'Arjun Mehta', email: 'arjun@tennis.com', regNo: '2022UG1088', role: UserRole.CAPTAIN, gender: Gender.BOYS, isInducted: true, year: 3, currentYear: 3, joinedAt: '2022-08-12', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { id: 'u6', name: 'Vikram Singh', email: 'vikram@tennis.com', regNo: '2023UG1044', role: UserRole.VICE_CAPTAIN, gender: Gender.BOYS, isInducted: true, year: 2, currentYear: 2, joinedAt: '2023-08-15', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300' },
  { id: 'u7', name: 'Ananya Rao', email: 'ananya@tennis.com', regNo: '2023UG2099', role: UserRole.VICE_CAPTAIN, gender: Gender.GIRLS, isInducted: true, year: 2, currentYear: 2, joinedAt: '2023-08-18', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300' },
  { id: 'u3', name: 'Roger Federer', email: 'b@b.com', regNo: '2023UG3012', role: UserRole.MEMBER, gender: Gender.BOYS, isInducted: true, year: 2, currentYear: 2, joinedAt: '2023-08-12', avatar: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=300' },
  { id: 'u4', name: 'Serena Williams', email: 'player2@tennis.com', regNo: '2024UG4088', role: UserRole.MEMBER, gender: Gender.GIRLS, isInducted: true, year: 1, currentYear: 1, joinedAt: '2024-08-20', avatar: 'https://images.unsplash.com/photo-1554068865-24bccd4e3d77?auto=format&fit=crop&q=80&w=300' },
  { id: 'u8', name: 'Mike Ross', email: 'mike@tennis.com', regNo: '2024UG4099', role: UserRole.MEMBER, gender: Gender.BOYS, isInducted: true, year: 1, currentYear: 1, joinedAt: '2024-08-20', avatar: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=300' },
  { id: 'u9', name: 'Alice Wong', email: 'alice@tennis.com', regNo: '2024UG4100', role: UserRole.MEMBER, gender: Gender.GIRLS, isInducted: true, year: 1, currentYear: 1, joinedAt: '2024-08-20', avatar: 'https://images.unsplash.com/photo-1531315630201-bb15b9966a1c?auto=format&fit=crop&q=80&w=300' },
  { id: 'u10', name: 'Harvey Specter', email: 'harvey@tennis.com', regNo: '2023UG3050', role: UserRole.MEMBER, gender: Gender.BOYS, isInducted: true, year: 2, currentYear: 2, joinedAt: '2023-08-12', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300' },
  { id: 'u11', name: 'Rachel Zane', email: 'rachel@tennis.com', regNo: '2024UG4111', role: UserRole.MEMBER, gender: Gender.GIRLS, isInducted: true, year: 1, currentYear: 1, joinedAt: '2024-08-20', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=300' },
  { id: 'u12', name: 'Louis Litt', email: 'louis@tennis.com', regNo: '2023UG3060', role: UserRole.MEMBER, gender: Gender.BOYS, isInducted: true, year: 2, currentYear: 2, joinedAt: '2023-08-12', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Urja Practice Schedule',
    content: 'Practice starts everyday at 5 PM for the upcoming sports fest.',
    author: 'Captain Jane',
    date: '2024-05-15',
    urgent: true
  },
  {
    id: 'a2',
    title: 'New Rackets Arrived',
    content: 'The Wilson Pro Staff series has arrived. Collect them from the equipment room.',
    author: 'Admin John',
    date: '2024-05-18',
    urgent: false
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Wilson Rackets', quantity: 12, unit: 'pcs' },
  { id: 'i2', name: 'Penn Championship Balls', quantity: 240, unit: 'pcs' },
  { id: 'i3', name: 'Tennis Nets', quantity: 4, unit: 'pcs' },
  { id: 'i4', name: 'Training Cones', quantity: 50, unit: 'pcs' },
  { id: 'i5', name: 'Training Discs', quantity: 30, unit: 'pcs' }
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ac1', title: 'Urja 2023 Gold', description: 'Our boys team secured gold in the annual sports fest.', imageUrl: 'https://images.unsplash.com/photo-1595435064212-36267784447c?auto=format&fit=crop&q=80&w=1200', date: '2023-11-20' },
  { id: 'ac2', title: 'Inter-NIT Champions', description: 'Defeated NIT Trichy in a thrilling final match.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200', date: '2024-02-15' },
  { id: 'ac3', title: 'State Open Singles', description: 'Roger Federer secured the first runner-up trophy.', imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=1200', date: '2024-01-10' },
];

export const MOCK_ALUMNI: Alumni[] = [
  { id: 'al1', name: 'Siddharth Sharma', regNo: '2016UG1022', contact: '+91 98765 43210', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', batch: '2020' },
  { id: 'al2', name: 'Riya Kapoor', regNo: '2017UG2044', contact: '+91 87654 32109', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', batch: '2021' },
  { id: 'al3', name: 'Manish Verma', regNo: '2015UG1088', contact: '+91 76543 21098', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', batch: '2019' },
];
