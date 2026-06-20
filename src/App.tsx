import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, getDocs, getDoc, setDoc, doc, where } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Shell } from './components/layout/Shell';
import { Overview } from './components/dashboard/Overview';
import { InventoryList } from './components/inventory/InventoryList';
import { EmployeeList } from './components/employees/EmployeeList';
import { Reports } from './components/dashboard/Reports';
import { Settings } from './components/dashboard/Settings';
import { EmployeeProfile } from './components/employees/EmployeeProfile';
import { MaintenanceDashboard } from './components/dashboard/MaintenanceDashboard';
import { Login } from './components/auth/Login';
import { ToastProvider } from './components/ui/Toast';
import type { UserRole } from './types';

interface RoleGuardProps {
  requiredRole: UserRole;
  profile: any;
  children: React.ReactNode;
}

const ADMIN_EMAILS = new Set<string>([
  'shadowarc055@gmail.com',
  'zchii_test@gmail.com',
]);

function RoleGuard({ requiredRole, profile, children }: RoleGuardProps) {
  const role = profile?.role;
  const email = profile?.email;
  const isAdmin = role === 'admin' || role === 'Admin' || (email && ADMIN_EMAILS.has(email));

  if (requiredRole === 'Admin' && !isAdmin) {
    console.warn('[RoleGuard] Access denied for non-Admin user; redirecting to dashboard.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCapacitor = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await SplashScreen.hide();
      } catch (e: unknown) {
        // Running in a browser during development — Capacitor plugins are unavailable; ignore.
      }
    };
    initCapacitor();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync/Fetch user profile
        try {
          const existingProfile = await getDoc(doc(db, 'users', currentUser.uid));
          
          let profile: any;
          if (!existingProfile.exists()) {
            console.log("Creating new user profile...");

            // Check if user is in employee registry to determine role
            let assignedRole = 'user';
            if (currentUser.email && ADMIN_EMAILS.has(currentUser.email)) {
              assignedRole = 'admin';
            } else if (currentUser.email) {
              const empQuery = query(collection(db, 'employees'), where('email', '==', currentUser.email));
              const empSnap = await getDocs(empQuery);
              if (!empSnap.empty) {
                assignedRole = empSnap.docs[0].data().systemRole || 'user';
              }
            }

            profile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              role: assignedRole,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', currentUser.uid), profile);
          } else {
            profile = existingProfile.data();
            // Auto-upgrade: if email is whitelisted admin but stored role isn't, promote and persist.
            if (currentUser.email && ADMIN_EMAILS.has(currentUser.email) && profile.role !== 'admin') {
              profile = { ...profile, role: 'admin' };
              await setDoc(doc(db, 'users', currentUser.uid), profile, { merge: true });
            }
          }
          setUserProfile(profile);

          // Seeding Logic (Admin only)
          if (profile.role === 'admin' || currentUser.email === 'shadowarc055@gmail.com') {
            const { seedDatabase } = await import('./lib/databaseSeed');
            await seedDatabase();
          }
        } catch (err) {
          console.error("Profile sync error:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route
            path="/*"
            element={
              user ? (
                <Shell user={user} profile={userProfile}>
                  <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route
                      path="/inventory"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <InventoryList />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/employees"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <EmployeeList />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/employees/:id"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <EmployeeProfile />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/maintenance"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <MaintenanceDashboard />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <Reports />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <RoleGuard requiredRole="Admin" profile={userProfile}>
                          <Settings />
                        </RoleGuard>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Shell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </ToastProvider>
    </Router>
  );
}
