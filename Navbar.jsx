import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { handleFirestoreError, OperationType } from './errorHandlers.js';

export const evaluateSuspiciousTransaction = async (transactionData) => {
  const reasons = [];
  const { amount, senderId, type } = transactionData;

  // Rule 1: High-value transaction (Above 100,000 PKR)
  if (amount > 100000) {
    reasons.push('High-value transaction above 100,000 PKR');
  }

  if (senderId && type === 'transfer') {
    // Rule 2: More than 5 transfers within 10 minutes (Simplified for demo)
    let snapshot;
    try {
      const lastTxnsQuery = query(
        collection(db, 'transactions'),
        where('senderId', '==', senderId),
        where('type', '==', 'transfer'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      snapshot = await getDocs(lastTxnsQuery);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    }

    const recentTxns = snapshot.docs.map(doc => doc.data());
    
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const rapidTransfers = recentTxns.filter(t => new Date(t.createdAt).getTime() > tenMinutesAgo);
    
    if (rapidTransfers.length >= 5) {
      reasons.push('More than 5 transfers within 10 minutes');
    }

    // Rule 3: Same amount transferred repeatedly
    const sameAmountCount = rapidTransfers.filter(t => t.amount === amount).length;
    if (sameAmountCount >= 3) {
      reasons.push('Repeated transfer of the same amount');
    }
  }

  // Rule 4: High deposit above selected limit (e.g., 500,000 for demo)
  if (type === 'deposit' && amount > 500000) {
    reasons.push('Large deposit exceeding monitoring limit');
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};
