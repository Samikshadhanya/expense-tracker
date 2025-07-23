import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from './useExpenses';
import { Balance } from '../types';

export const useBalances = (groupId: string) => {
  const { currentUser } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses(groupId);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || expensesLoading) {
      setLoading(true);
      return;
    }

    // Calculate balances based on expenses
    const calculateBalances = () => {
      // Initialize a map to track who owes whom
      const balanceMap: Record<string, Record<string, number>> = {};
      
      // Process each expense
      expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        
        // Process each split
        expense.splits.forEach(split => {
          const userId = split.userId;
          
          if (userId === paidBy) return; // Skip if user paid for themselves
          
          // Initialize user entries in the balance map if they don't exist
          if (!balanceMap[userId]) balanceMap[userId] = {};
          if (!balanceMap[paidBy]) balanceMap[paidBy] = {};
          
          // User owes the payer
          balanceMap[userId][paidBy] = (balanceMap[userId][paidBy] || 0) + split.amount;
          
          // Payer is owed by the user (negative value means being owed)
          balanceMap[paidBy][userId] = (balanceMap[paidBy][userId] || 0) - split.amount;
        });
      });
      
      // Simplify the balances (cancel out mutual debts)
      const simplifiedBalances: Record<string, Record<string, number>> = {};
      
      Object.keys(balanceMap).forEach(userId1 => {
        Object.keys(balanceMap[userId1]).forEach(userId2 => {
          if (userId1 === userId2) return;
          
          const user1OwesUser2 = balanceMap[userId1][userId2] || 0;
          const user2OwesUser1 = balanceMap[userId2][userId1] || 0;
          
          const netAmount = user1OwesUser2 - user2OwesUser1;
          
          if (Math.abs(netAmount) > 0.01) { // Only consider significant amounts
            if (!simplifiedBalances[userId1]) simplifiedBalances[userId1] = {};
            
            if (netAmount > 0) {
              // User1 owes User2
              simplifiedBalances[userId1][userId2] = netAmount;
            } else {
              // User2 owes User1 (we'll handle this in the other iteration)
              // But we need to ensure we don't double count
              delete balanceMap[userId2][userId1];
            }
          }
        });
      });
      
      // Convert to the Balance array format for the current user
      const userBalances: Balance[] = [];
      
      // Find who the current user owes
      const currentUserOwes = simplifiedBalances[currentUser.uid] || {};
      
      // Find who owes the current user
      const owesToCurrentUser: Record<string, number> = {};
      Object.keys(simplifiedBalances).forEach(userId => {
        if (simplifiedBalances[userId][currentUser.uid]) {
          owesToCurrentUser[userId] = simplifiedBalances[userId][currentUser.uid];
        }
      });
      
      // Combine the information
      const allUsers = new Set([
        ...Object.keys(currentUserOwes),
        ...Object.keys(owesToCurrentUser)
      ]);
      
      allUsers.forEach(userId => {
        const youOwe = currentUserOwes[userId] || 0;
        const theyOwe = owesToCurrentUser[userId] || 0;
        const netBalance = theyOwe - youOwe;
        
        // Find the user info from expenses
        const userInfo = expenses.flatMap(e => e.splits).find(s => s.userId === userId);
        
        if (userInfo) {
          userBalances.push({
            userId,
            displayName: userInfo.displayName,
            photoURL: undefined, // We don't have this in our data model
            youOwe,
            theyOwe,
            netBalance,
          });
        }
      });
      
      return userBalances;
    };

    const result = calculateBalances();
    setBalances(result);
    setLoading(false);
  }, [currentUser, expenses, expensesLoading]);

  return {
    balances,
    loading,
  };
};