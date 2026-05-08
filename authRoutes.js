import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rentbridge_secret_key_123');
    
    // Check if user exists and is active
    let userDoc;
    try {
      userDoc = await getDoc(doc(db, 'users', decoded.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${decoded.id}`);
    }

    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    if (userData.status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    req.user = { id: userDoc.id, ...userData };
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    try {
      if (error.message.startsWith('{')) {
        const errorObj = JSON.parse(error.message);
        return res.status(500).json({ message: 'Database error during auth', detail: errorObj });
      }
    } catch (e) {}
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
