import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, SubscriptionInfo, TransactionRecord } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithGoogleAccount: (email: string, displayName?: string, photoURL?: string) => Promise<void>;
  signInAsGuest: (guestName?: string, guestEmail?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<NonNullable<UserProfile['preferences']>>) => Promise<void>;
  topUpWallet: (amount: number, method: 'bakong_khqr' | 'credit_card' | 'aba_pay', referenceId?: string) => Promise<TransactionRecord>;
  chargeSubscription: (plan: 'trip-pass' | 'wisgo-plus', amount: number, paymentMethod: 'bakong_khqr' | 'credit_card' | 'wallet_balance' | 'aba_pay') => Promise<{ subscription: SubscriptionInfo; transaction: TransactionRecord }>;
  cancelSubscription: () => Promise<void>;
}

const defaultPreferences = {
  preferredLanguage: 'English',
  preferredCurrency: 'USD ($)',
  interests: ['Temples & Culture', 'Local Street Food', 'Nature & Rivers', 'Markets & Crafts'],
  dietaryRestrictions: []
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInWithGoogleRedirect: async () => {},
  signInWithGoogleAccount: async () => {},
  signInAsGuest: async () => {},
  logout: async () => {},
  updateUserPreferences: async () => {},
  topUpWallet: async () => ({} as any),
  chargeSubscription: async () => ({} as any),
  cancelSubscription: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile with Firestore upon Google Sign-In
  const syncUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      const now = new Date().toISOString();

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          name: user.displayName || existingData.name || 'Khmer Explorer',
          email: user.email || existingData.email,
          avatar: user.photoURL || existingData.avatar || '',
          walletBalance: existingData.walletBalance ?? 0,
          subscription: existingData.subscription || { plan: 'free', status: 'active', startDate: now },
          transactions: existingData.transactions || []
        };
        try {
          await updateDoc(userDocRef, {
            name: updatedProfile.name,
            email: updatedProfile.email,
            avatar: updatedProfile.avatar
          });
        } catch (updateErr) {
          console.warn('Could not update profile doc in Firestore:', updateErr);
        }
        setUserProfile(updatedProfile);
        try {
          if (updatedProfile.email) {
            localStorage.setItem('wisgo_last_account', JSON.stringify({
              email: updatedProfile.email,
              name: updatedProfile.name,
              avatar: updatedProfile.avatar,
              lastUsed: new Date().toISOString()
            }));
          }
        } catch (e) {}
        return updatedProfile;
      } else {
        // Create initial profile in users collection
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Khmer Explorer',
          email: user.email || '',
          avatar: user.photoURL || '',
          createdAt: now,
          walletBalance: 0,
          subscription: { plan: 'free', status: 'active', startDate: now },
          transactions: [],
          preferences: defaultPreferences
        };
        try {
          await setDoc(userDocRef, newProfile);
        } catch (setErr) {
          console.warn('Could not create profile doc in Firestore:', setErr);
        }
        setUserProfile(newProfile);
        try {
          if (newProfile.email) {
            localStorage.setItem('wisgo_last_account', JSON.stringify({
              email: newProfile.email,
              name: newProfile.name,
              avatar: newProfile.avatar,
              lastUsed: new Date().toISOString()
            }));
          }
        } catch (e) {}
        return newProfile;
      }
    } catch (err) {
      console.warn('Error syncing user profile from Firestore:', err);
      // Fallback local profile for smooth UX
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Khmer Explorer',
        email: user.email || '',
        avatar: user.photoURL || '',
        createdAt: new Date().toISOString(),
        walletBalance: 0,
        subscription: { plan: 'free', status: 'active', startDate: new Date().toISOString() },
        transactions: [],
        preferences: defaultPreferences
      };
      setUserProfile(fallbackProfile);
      try {
        if (fallbackProfile.email) {
          localStorage.setItem('wisgo_last_account', JSON.stringify({
            email: fallbackProfile.email,
            name: fallbackProfile.name,
            avatar: fallbackProfile.avatar,
            lastUsed: new Date().toISOString()
          }));
        }
      } catch (e) {}
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const savedGuest = localStorage.getItem('wisgo_guest_user');
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        setCurrentUser(parsed.user);
        setUserProfile(parsed.profile);
      } catch (e) {
        localStorage.removeItem('wisgo_guest_user');
      }
    }

    // Safely check redirect result if available
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          localStorage.removeItem('wisgo_guest_user');
          setCurrentUser(result.user);
          await syncUserProfile(result.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result check:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('wisgo_guest_user');
        setCurrentUser(user);
        await syncUserProfile(user);
      } else {
        if (!localStorage.getItem('wisgo_guest_user')) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        localStorage.removeItem('wisgo_guest_user');
        setCurrentUser(result.user);
        await syncUserProfile(result.user);
        return result.user;
      }
      return null;
    } catch (error: any) {
      console.warn('Firebase Google Sign-In Popup notice:', error?.message || error);
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Firebase Google Sign-In Redirect Error:', error);
      throw error;
    }
  };

  const signInWithGoogleAccount = async (email: string, displayName?: string, photoURL?: string) => {
    const formattedName = displayName || (email.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Khmer Explorer');
    const uid = 'google-user-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const avatar = photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0B7A5C&color=fff&bold=true`;
    
    const googleUser = {
      uid,
      displayName: formattedName,
      email,
      photoURL: avatar,
    };
    
    const profile: UserProfile = {
      uid,
      name: formattedName,
      email,
      avatar,
      createdAt: new Date().toISOString(),
      preferences: defaultPreferences
    };

    // Try saving to Firestore if connected
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        profile.preferences = data.preferences || defaultPreferences;
      } else {
        await setDoc(userDocRef, profile);
      }
    } catch (err) {
      console.warn('Could not sync user profile to Firestore, using local storage:', err);
    }

    localStorage.setItem('wisgo_guest_user', JSON.stringify({ user: googleUser, profile }));
    try {
      localStorage.setItem('wisgo_last_account', JSON.stringify({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        lastUsed: new Date().toISOString()
      }));
    } catch (e) {}
    setCurrentUser(googleUser as any);
    setUserProfile(profile);
  };

  const signInAsGuest = async (guestName = 'Khmer Explorer', guestEmail = 'explorer@wisgo.kh') => {
    const fakeUid = 'explorer-' + Date.now().toString(36);
    const guestUser = {
      uid: fakeUid,
      displayName: guestName,
      email: guestEmail,
      photoURL: '',
    };
    const profile: UserProfile = {
      uid: fakeUid,
      name: guestName,
      email: guestEmail,
      avatar: '',
      createdAt: new Date().toISOString(),
      preferences: defaultPreferences
    };

    // Try saving to Firestore if connected
    try {
      const userDocRef = doc(db, 'users', fakeUid);
      await setDoc(userDocRef, profile);
    } catch (err) {
      console.warn('Could not sync local explorer profile to Firestore, using local storage:', err);
    }

    localStorage.setItem('wisgo_guest_user', JSON.stringify({ user: guestUser, profile }));
    setCurrentUser(guestUser as any);
    setUserProfile(profile);
  };

  const logout = async () => {
    localStorage.removeItem('wisgo_guest_user');
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateUserPreferences = async (newPrefs: Partial<NonNullable<UserProfile['preferences']>>) => {
    if (!currentUser || !userProfile) return;

    const currentPrefs = userProfile.preferences || defaultPreferences;
    const updatedPrefs = {
      ...currentPrefs,
      ...newPrefs
    };

    const updatedProfile: UserProfile = {
      ...userProfile,
      preferences: updatedPrefs
    };

    setUserProfile(updatedProfile);

    // Save to local storage if guest/fallback
    const savedGuest = localStorage.getItem('wisgo_guest_user');
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        localStorage.setItem('wisgo_guest_user', JSON.stringify({ ...parsed, profile: updatedProfile }));
      } catch (e) {
        // ignore
      }
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        preferences: updatedPrefs
      });
    } catch (err) {
      console.error('Failed to update preferences in Firestore:', err);
    }
  };

  const topUpWallet = async (
    amount: number, 
    method: 'bakong_khqr' | 'credit_card' | 'aba_pay',
    referenceId = 'KHQR-' + Math.floor(100000 + Math.random() * 900000)
  ): Promise<TransactionRecord> => {
    if (!currentUser || !userProfile) {
      throw new Error('User must be signed in to top up wallet');
    }

    const currentBalance = userProfile.walletBalance ?? 0;
    const newBalance = parseFloat((currentBalance + amount).toFixed(2));
    const newTx: TransactionRecord = {
      id: 'txn-' + Date.now().toString(36),
      type: 'top_up',
      amount,
      currency: 'USD',
      paymentMethod: method,
      status: 'completed',
      date: new Date().toISOString(),
      referenceId
    };

    const updatedTransactions = [newTx, ...(userProfile.transactions || [])];
    const updatedProfile: UserProfile = {
      ...userProfile,
      walletBalance: newBalance,
      transactions: updatedTransactions
    };

    setUserProfile(updatedProfile);

    // Persist to local storage
    const savedGuest = localStorage.getItem('wisgo_guest_user');
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        localStorage.setItem('wisgo_guest_user', JSON.stringify({ ...parsed, profile: updatedProfile }));
      } catch (e) {}
    }

    // Persist to Firestore
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        walletBalance: newBalance,
        transactions: updatedTransactions
      });
    } catch (err) {
      console.warn('Could not sync top up to Firestore:', err);
    }

    return newTx;
  };

  const chargeSubscription = async (
    plan: 'trip-pass' | 'wisgo-plus',
    amount: number,
    paymentMethod: 'bakong_khqr' | 'credit_card' | 'wallet_balance' | 'aba_pay'
  ): Promise<{ subscription: SubscriptionInfo; transaction: TransactionRecord }> => {
    if (!currentUser || !userProfile) {
      throw new Error('User must be signed in to subscribe');
    }

    const now = new Date();
    const expiry = new Date();
    if (plan === 'trip-pass') {
      expiry.setDate(now.getDate() + 30); // 30 days coverage for single trip
    } else {
      expiry.setMonth(now.getMonth() + 1); // 1 month recurrent
    }

    const refId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const newTx: TransactionRecord = {
      id: 'txn-' + Date.now().toString(36),
      type: 'subscription_purchase',
      amount,
      currency: 'USD',
      planName: plan === 'trip-pass' ? 'Trip Pass' : 'WisGo Plus',
      paymentMethod,
      status: 'completed',
      date: now.toISOString(),
      referenceId: refId
    };

    let currentBalance = userProfile.walletBalance ?? 0;
    if (paymentMethod === 'wallet_balance') {
      if (currentBalance < amount) {
        throw new Error('Insufficient wallet balance');
      }
      currentBalance = parseFloat((currentBalance - amount).toFixed(2));
    }

    const newSubscription: SubscriptionInfo = {
      plan,
      status: 'active',
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      transactionId: refId,
      autoRenew: plan === 'wisgo-plus',
      amountPaid: amount,
      currency: 'USD'
    };

    const updatedTransactions = [newTx, ...(userProfile.transactions || [])];
    const updatedProfile: UserProfile = {
      ...userProfile,
      walletBalance: currentBalance,
      subscription: newSubscription,
      transactions: updatedTransactions
    };

    setUserProfile(updatedProfile);

    // Save to local storage
    const savedGuest = localStorage.getItem('wisgo_guest_user');
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        localStorage.setItem('wisgo_guest_user', JSON.stringify({ ...parsed, profile: updatedProfile }));
      } catch (e) {}
    }

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        walletBalance: currentBalance,
        subscription: newSubscription,
        transactions: updatedTransactions
      });
    } catch (err) {
      console.warn('Could not sync subscription to Firestore:', err);
    }

    return { subscription: newSubscription, transaction: newTx };
  };

  const cancelSubscription = async () => {
    if (!currentUser || !userProfile || !userProfile.subscription) return;

    const canceledSub: SubscriptionInfo = {
      ...userProfile.subscription,
      status: 'canceled',
      autoRenew: false
    };

    const updatedProfile: UserProfile = {
      ...userProfile,
      subscription: canceledSub
    };

    setUserProfile(updatedProfile);

    const savedGuest = localStorage.getItem('wisgo_guest_user');
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        localStorage.setItem('wisgo_guest_user', JSON.stringify({ ...parsed, profile: updatedProfile }));
      } catch (e) {}
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        subscription: canceledSub
      });
    } catch (err) {
      console.warn('Could not cancel subscription in Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInWithGoogleAccount,
        signInAsGuest,
        logout,
        updateUserPreferences,
        topUpWallet,
        chargeSubscription,
        cancelSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
