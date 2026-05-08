import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'rentbridge_secret_key_123', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check duplicate
    let snapshot;
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      snapshot = await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }

    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    let userDoc;
    try {
      userDoc = await addDoc(collection(db, 'users'), {
        name,
        email,
        passwordHash,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }

    // Create wallet
    try {
      await setDoc(doc(db, 'wallets', userDoc.id), {
        userId: userDoc.id,
        balance: 1000, // Initial demo balance
        currency: 'PKR',
        status: 'active',
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfersIn: 0,
        totalTransfersOut: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `wallets/${userDoc.id}`);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(userDoc.id, 'user'),
      user: { id: userDoc.id, name, email, role: 'user' }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    try {
      const errorObj = JSON.parse(error.message);
      res.status(500).json({ message: 'Database error', detail: errorObj });
    } catch (e) {
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let snapshot;
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      snapshot = await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
    
    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (userData.status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    res.json({
      token: generateToken(userDoc.id, userData.role),
      user: { id: userDoc.id, name: userData.name, email: userData.email, role: userData.role }
    });
  } catch (error) {
    console.error('Login Error:', error);
    try {
      const errorObj = JSON.parse(error.message);
      res.status(500).json({ message: 'Database error', detail: errorObj });
    } catch (e) {
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

export const getMe = (req, res) => {
  res.json(req.user);
};
