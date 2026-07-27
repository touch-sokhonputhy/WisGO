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
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (guestName?: string, guestEmail?: string) => Promise<void>;
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
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        localStorage.removeItem('wisgo_guest_user');
        setCurrentUser(result.user);
        await syncUserProfile(result.user);
      }
    }).catch(() => {
      // Ignored: expected when OAuth domain restriction is active in preview container
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

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const errStr = (String(error?.code || '') + ' ' + String(error?.message || '')).toLowerCase();

      if (errStr.includes('popup-blocked') || errStr.includes('popup-closed')) {
        throw new Error('Google Sign-In popup was blocked by browser settings or preview sandbox. Please click "Continue as Guest Local Explorer" or "Sign in with Custom Name & Email" below!');
      }
      
      if (errStr.includes('unauthorized-domain')) {
        throw new Error('Firebase Authorized Domain restriction detected. Please click "Continue as Guest Local Explorer" or "Sign in with Custom Name & Email" below!');
      }

      if (errStr.includes('api-key') || errStr.includes('apikey')) {
        throw new Error('Firebase API Key domain policy restriction detected. Please click "Continue as Guest Local Explorer" or "Sign in with Custom Name & Email" below!');
      }
      
      throw new Error('Google Sign-In is unavailable in this popup preview. Please use "Continue as Guest Local Explorer" or "Sign in with Custom Name & Email" below!');
    }
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
