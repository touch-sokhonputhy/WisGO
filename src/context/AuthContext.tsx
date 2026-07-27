import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (guestName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<NonNullable<UserProfile['preferences']>>) => Promise<void>;
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
  signInWithGoogle: async () => {},
  signInAsGuest: async () => {},
  logout: async () => {},
  updateUserPreferences: async () => {}
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
        };
        await updateDoc(userDocRef, {
          name: updatedProfile.name,
          email: updatedProfile.email,
          avatar: updatedProfile.avatar
        });
        setUserProfile(updatedProfile);
      } else {
        // Create initial profile in users collection
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Khmer Explorer',
          email: user.email || '',
          avatar: user.photoURL || '',
          createdAt: now,
          preferences: defaultPreferences
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback local profile for smooth UX
      setUserProfile({
        uid: user.uid,
        name: user.displayName || 'Khmer Explorer',
        email: user.email || '',
        avatar: user.photoURL || '',
        createdAt: new Date().toISOString(),
        preferences: defaultPreferences
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
        throw new Error('This domain (wis-go.vercel.app) is not authorized in Firebase. Please add "wis-go.vercel.app" to Firebase Console -> Authentication -> Settings -> Authorized domains.');
      }
      if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
        throw new Error('Firebase API key issue detected. You can use "Continue as Guest Explorer" to test all WisGO features!');
      }
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In popup was closed or blocked by browser settings. Try "Continue as Guest Explorer".');
      }
      throw error;
    }
  };

  const signInAsGuest = async (guestName = 'Khmer Explorer') => {
    const fakeUid = 'guest-' + Date.now();
    const guestUser = {
      uid: fakeUid,
      displayName: guestName,
      email: 'guest@wisgo.kh',
      photoURL: '',
    };
    setCurrentUser(guestUser as any);
    setUserProfile({
      uid: fakeUid,
      name: guestName,
      email: guestUser.email,
      avatar: '',
      createdAt: new Date().toISOString(),
      preferences: defaultPreferences
    });
  };

  const logout = async () => {
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

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        preferences: updatedPrefs
      });
    } catch (err) {
      console.error('Failed to update preferences in Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInAsGuest,
        logout,
        updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
