'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { useAuth, useFirebaseApp } from '@/firebase/provider';
import { doc, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';

// Extend the Firebase User type to include our custom fields
interface AppUser extends FirebaseUser {
  name: string;
  role?: 'admin' | 'user';
  isBlacklisted?: boolean;
}

export const useUser = () => {
  const auth = useAuth();
  const app = useFirebaseApp();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const db = getFirestore(app);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time updates to user role
        const unsubDoc = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ 
                    ...firebaseUser, 
                    id: firebaseUser.uid,
                    name: userData.name || firebaseUser.displayName || 'Anonymous',
                    email: userData.email || firebaseUser.email,
                    role: userData.role || 'user',
                    isBlacklisted: userData.isBlacklisted || false
                } as AppUser);
            } else {
                // This could happen if user signs up but doc creation fails.
                setUser({ 
                    ...firebaseUser,
                    id: firebaseUser.uid, 
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email,
                    role: 'user',
                    isBlacklisted: false
                } as AppUser);
            }
            setLoading(false);
        });
        
        // Return the unsubscribe function for the document listener
        return () => unsubDoc();

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, app]);

  return { user, loading, isAdmin: user?.role === 'admin' };
};
