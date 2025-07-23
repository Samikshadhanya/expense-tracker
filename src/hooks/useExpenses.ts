import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Expense, ExpenseSplit, SplitType } from '../types';
import { useAuth } from '../context/AuthContext';

export const useExpenses = (groupId?: string) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !groupId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Query expenses for this group
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenseList: Expense[] = [];
        snapshot.forEach((doc) => {
          expenseList.push({ id: doc.id, ...doc.data() } as Expense);
        });
        
        setExpenses(expenseList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, groupId]);

  const createExpense = async (
    groupId: string,
    title: string,
    amount: number,
    currency: string,
    paidBy: string,
    date: string,
    splits: ExpenseSplit[],
    notes?: string,
    category?: string
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const newExpense = {
        groupId,
        title,
        amount,
        currency,
        paidBy,
        date,
        notes,
        category,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        splits,
      };
      
      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      return { id: docRef.id, ...newExpense };
    } catch (err) {
      console.error('Error creating expense:', err);
      throw new Error('Failed to create expense');
    }
  };

  const updateExpense = async (expenseId: string, data: Partial<Expense>) => {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating expense:', err);
      throw new Error('Failed to update expense');
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw new Error('Failed to delete expense');
    }
  };

  // Calculate splits based on split type
  const calculateSplits = (
    amount: number, 
    memberIds: { userId: string; displayName: string }[], 
    paidById: string,
    splitType: SplitType,
    customValues?: number[] // Can be percentages, unequal amounts, or shares
  ): ExpenseSplit[] => {
    const splits: ExpenseSplit[] = [];
    
    switch (splitType) {
      case 'equal':
        const equalAmount = amount / memberIds.length;
        memberIds.forEach(member => {
          splits.push({
            userId: member.userId,
            displayName: member.displayName,
            amount: parseFloat(equalAmount.toFixed(2)),
            paid: member.userId === paidById,
          });
        });
        break;
        
      case 'unequal':
        if (!customValues || customValues.length !== memberIds.length) {
          throw new Error('Custom values must be provided for unequal split');
        }
        
        memberIds.forEach((member, index) => {
          splits.push({
            userId: member.userId,
            displayName: member.displayName,
            amount: customValues[index],
            paid: member.userId === paidById,
          });
        });
        break;
        
      case 'percentage':
        if (!customValues || customValues.length !== memberIds.length) {
          throw new Error('Percentages must be provided for percentage split');
        }
        
        // Validate percentages sum to 100
        const percentageSum = customValues.reduce((sum, value) => sum + value, 0);
        if (Math.abs(percentageSum - 100) > 0.01) {
          throw new Error('Percentages must sum to 100%');
        }
        
        memberIds.forEach((member, index) => {
          const splitAmount = (amount * customValues[index]) / 100;
          splits.push({
            userId: member.userId,
            displayName: member.displayName,
            amount: parseFloat(splitAmount.toFixed(2)),
            paid: member.userId === paidById,
          });
        });
        break;
        
      case 'shares':
        if (!customValues || customValues.length !== memberIds.length) {
          throw new Error('Shares must be provided for shares split');
        }
        
        const totalShares = customValues.reduce((sum, value) => sum + value, 0);
        
        memberIds.forEach((member, index) => {
          const splitAmount = (amount * customValues[index]) / totalShares;
          splits.push({
            userId: member.userId,
            displayName: member.displayName,
            amount: parseFloat(splitAmount.toFixed(2)),
            paid: member.userId === paidById,
          });
        });
        break;
        
      default:
        throw new Error('Invalid split type');
    }
    
    return splits;
  };

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    calculateSplits,
  };
};