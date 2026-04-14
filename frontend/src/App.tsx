
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicHome from '@views/PublicHome';
import Login from '@views/Login';
import DashboardLayout from '@components/DashboardLayout';
import DashboardOverview from '@views/DashboardOverview';
import MatchManager from '@views/MatchManager';
import PlayerStatsView from '@views/PlayerStats';
// import Financials from '@views/Financials';
// import Inventory from '@views/Inventory';
import AdminPanel from '@views/AdminPanel';
import Attendance from '@views/Attendance';
import AnnouncementsView from '@views/Announcements';
import Settings from '@views/Settings';
import Registry from '@views/Registry';
import AchievementsManager from '@views/AchievementsManager';
import AlumniManager from '@views/AlumniManager';
import { User, UserRole, EquipmentRequest, InventoryItem, Achievement, Alumni } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('ace_token');
      const storedUser = localStorage.getItem('ace_user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.warn('Failed to restore session from localStorage');
          localStorage.removeItem('ace_token');
          localStorage.removeItem('ace_user');
        }
      }
    };

    restoreSession();
  }, []);

  const [members, setMembers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = localStorage.getItem('ace_token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [usersRes, inventoryRes, requestsRes, achievementsRes, alumniRes] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/inventory', { headers }),
          fetch('/api/requests', { headers }),
          fetch('/api/achievements', { headers }),
          fetch('/api/alumni', { headers })
          
        ]);

        const authFailed = [usersRes, inventoryRes, requestsRes].some(res => res.status === 401 || res.status === 403);
        if (authFailed) {
          console.warn('Authorization failed, clearing session and redirecting to login.');
          setUser(null);
          localStorage.removeItem('ace_user');
          localStorage.removeItem('ace_token');
          return;
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setMembers(usersData);
          
          const currentUserData = usersData.find((u: User) => (u._id && u._id === user._id) || (u.id && u.id === user.id));
          if (currentUserData) {
            setUser(currentUserData);
            localStorage.setItem('ace_user', JSON.stringify(currentUserData));
          }
        }
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setInventory(inventoryData);
        }
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData);
        }
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievements(achievementsData);
        }
        if (alumniRes.ok) {
          const alumniData = await alumniRes.json();
          setAlumni(alumniData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [user]);

  const handleLogin = async (email: string, password: string, regNo: string, otp?: string) => {
    try {
      let endpoint = '/api/auth/login';
      let body: Record<string, string> = { email, password, regNo };

      if (otp) {
        endpoint = '/api/auth/verify-otp';
        body = { email, otp };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Authentication failed');
      }

      if (!otp) {
        // OTP sent successfully, don't set user yet
        return;
      }

      // OTP verified, login successful
      const { token, user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      localStorage.setItem('ace_user', JSON.stringify(loggedInUser));
      localStorage.setItem('ace_token', token);
    } catch (err) {
      console.error('Authentication error:', err);
      throw err;
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('ace_user', JSON.stringify(updatedUser));
    
    // Also update in the global members list for the Home Page
    setMembers(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ace_user');
    localStorage.removeItem('ace_token');
    window.location.href = '/#/login';
    window.location.reload();
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicHome achievements={achievements} alumni={alumni} members={members} />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <DashboardLayout user={user} onLogout={handleLogout} pendingCount={pendingCount}>
                <Routes>
                  <Route index element={<DashboardOverview user={user} />} />
                  <Route path="matches" element={<MatchManager user={user} members={members} />} />
                  <Route path="stats" element={<PlayerStatsView user={user} members={members} />} />
                  {/* <Route path="financials" element={<Financials user={user} members={members} />} /> */}
                  {/* <Route 
                    path="inventory" 
                    element={
                      <Inventory 
                        user={user} 
                        requests={requests} 
                        setRequests={setRequests} 
                        inventory={inventory}
                        setInventory={setInventory}
                      />
                    } 
                  /> */}
                  <Route 
                    path="admin" 
                    element={
                      user.role === 'admin' ? (
                        <AdminPanel user={user} onUserUpdate={handleUserUpdate} />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    } 
                  />
                  <Route path="attendance" element={<Attendance user={user} members={members} />} />
                  <Route path="announcements" element={<AnnouncementsView user={user} />} />
                  <Route 
                    path="registry" 
                    element={<Registry user={user} members={members} setMembers={setMembers} onUserUpdate={handleUserUpdate} />} 
                  />
                  <Route 
                    path="achievements" 
                    element={
                      <AchievementsManager 
                        user={user} 
                        achievements={achievements} 
                        setAchievements={setAchievements} 
                      />
                    } 
                  />
                  <Route 
                    path="alumni" 
                    element={
                      <AlumniManager 
                        user={user} 
                        alumni={alumni} 
                        setAlumni={setAlumni} 
                      />
                    } 
                  />
                  <Route path="settings" element={<Settings user={user} onUserUpdate={handleUserUpdate} />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
