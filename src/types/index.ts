// User Types
export interface User {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  currency: string;
  photoURL?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // userId
  createdBy: string; // userId
  date: string;
  notes?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
  displayName: string;
}

// Balance Types
export interface Balance {
  userId: string;
  displayName: string;
  photoURL?: string;
  youOwe: number;
  theyOwe: number;
  netBalance: number;
}

// Settlement Types
export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// UI Types
export type SplitType = 'equal' | 'unequal' | 'percentage' | 'shares';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}