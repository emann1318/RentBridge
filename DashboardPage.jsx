import { db } from '../config/firebase.js';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  runTransaction, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { evaluateSuspiciousTransaction } from '../utils/suspiciousRules.js';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers.js';

export const getWallet = async (req, res) => {
  try {
    const walletDoc = await getDoc(doc(db, 'wallets', req.user.id));
    if (!walletDoc.exists()) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.json(walletDoc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `wallets/${req.user.id}`);
  }
};

export const deposit = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const walletRef = doc(db, 'wallets', req.user.id);
    
    // Evaluation
    const { isSuspicious, reasons } = await evaluateSuspiciousTransaction({
      amount,
      senderId: req.user.id,
      type: 'deposit'
    });

    try {
      await updateDoc(walletRef, {
        balance: increment(amount),
        totalDeposits: increment(amount),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wallets/${req.user.id}`);
    }

    let txn;
    try {
      txn = await addDoc(collection(db, 'transactions'), {
        transactionId: `TXN-${Date.now()}`,
        receiverId: req.user.id,
        amount,
        type: 'deposit',
        status: isSuspicious ? 'flagged' : 'successful',
        suspiciousFlag: isSuspicious,
        suspiciousReasons: reasons,
        description: 'Demo Deposit',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }

    res.json({ message: 'Deposit successful', transactionId: txn.id });
  } catch (error) {
    console.error('Deposit Error:', error);
    try {
      const errorObj = JSON.parse(error.message);
      res.status(500).json({ message: 'Database error', detail: errorObj });
    } catch (e) {
      res.status(500).json({ message: 'Deposit failed' });
    }
  }
};

export const withdraw = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    try {
      await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, 'wallets', req.user.id);
        const walletDoc = await transaction.get(walletRef);
        
        if (!walletDoc.exists()) throw new Error('Wallet not found');
        if (walletDoc.data().balance < amount) throw new Error('Insufficient balance');

        transaction.update(walletRef, {
          balance: increment(-amount),
          totalWithdrawals: increment(amount),
          updatedAt: new Date().toISOString()
        });

        return { success: true };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `wallets/${req.user.id}`);
    }

    let txn;
    try {
      txn = await addDoc(collection(db, 'transactions'), {
        transactionId: `TXN-${Date.now()}`,
        senderId: req.user.id,
        amount,
        type: 'withdrawal',
        status: 'successful',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }

    res.json({ message: 'Withdrawal successful', transactionId: txn.id });
  } catch (error) {
    console.error('Withdrawal Error:', error);
    try {
      const errorObj = JSON.parse(error.message);
      res.status(400).json({ message: errorObj.error || 'Withdrawal failed', detail: errorObj });
    } catch (e) {
      res.status(400).json({ message: error.message || 'Withdrawal failed' });
    }
  }
};

export const transfer = async (req, res) => {
  const { receiverEmail, amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  if (receiverEmail === req.user.email) return res.status(400).json({ message: 'Cannot transfer to self' });

  try {
    // Find receiver
    let snap;
    try {
      const q = query(collection(db, 'users'), where('email', '==', receiverEmail));
      snap = await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }

    if (snap.empty) return res.status(404).json({ message: 'Receiver not found' });
    
    const receiverId = snap.docs[0].id;
    const receiverData = snap.docs[0].data();
    if (receiverData.status === 'blocked') return res.status(400).json({ message: 'Receiver is blocked' });

    // Suspicious Check
    const { isSuspicious, reasons } = await evaluateSuspiciousTransaction({
      amount,
      senderId: req.user.id,
      type: 'transfer'
    });

    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, 'wallets', req.user.id);
        const receiverRef = doc(db, 'wallets', receiverId);

        const senderDoc = await transaction.get(senderRef);
        if (senderDoc.data().balance < amount) throw new Error('Insufficient balance');

        transaction.update(senderRef, {
          balance: increment(-amount),
          totalTransfersOut: increment(amount),
          updatedAt: new Date().toISOString()
        });

        transaction.update(receiverRef, {
          balance: increment(amount),
          totalTransfersIn: increment(amount),
          updatedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'multi-wallet-transaction');
    }

    let txn;
    try {
      txn = await addDoc(collection(db, 'transactions'), {
        transactionId: `TXN-${Date.now()}`,
        senderId: req.user.id,
        receiverId,
        amount,
        type: 'transfer',
        status: isSuspicious ? 'flagged' : 'successful',
        suspiciousFlag: isSuspicious,
        suspiciousReasons: reasons,
        description: `Transfer to ${receiverEmail}`,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }

    res.json({ message: 'Transfer successful', transactionId: txn.id });
  } catch (error) {
    console.error('Transfer Error:', error);
    try {
      const errorObj = JSON.parse(error.message);
      res.status(400).json({ message: errorObj.error || 'Transfer failed', detail: errorObj });
    } catch (e) {
      res.status(400).json({ message: error.message || 'Transfer failed' });
    }
  }
};
