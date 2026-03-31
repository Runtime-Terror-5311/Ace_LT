
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicHome from '@views/PublicHome';
import Login from '@views/Login';
import DashboardLayout from '@components/DashboardLayout';
import DashboardOverview from '@views/DashboardOverview';
import MatchManager from '@views/MatchManager';
import PlayerStatsView from '@views/PlayerStats';
import Financials from '@views/Financials';
import Inventory from '@views/Inventory';
import Attendance from '@views/Attendance';
import AnnouncementsView from '@views/Announcements';
import Settings from '@views/Settings';
import Registry from '@views/Registry';
import AchievementsManager from '@views/AchievementsManager';
import AlumniManager from '@views/AlumniManager';
import { User, UserRole, EquipmentRequest, InventoryItem, Achievement, Alumni } from './types';
import { MOCK_USERS, MOCK_INVENTORY, MOCK_ACHIEVEMENTS, MOCK_ALUMNI } from './mockData';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [members, setMembers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ace_members');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = localStorage.getItem('ace_token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [usersRes, inventoryRes, requestsRes] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/inventory', { headers }),
          fetch('/api/requests', { headers })
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setMembers(usersData);
        }
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setInventory(inventoryData);
        }
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [user]);

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('ace_achievements');
    return saved ? JSON.parse(saved) : MOCK_ACHIEVEMENTS;
  });

  const [alumni, setAlumni] = useState<Alumni[]>(() => {
    const saved = localStorage.getItem('ace_alumni');
    return saved ? JSON.parse(saved) : MOCK_ALUMNI;
  });

  useEffect(() => {
    localStorage.setItem('ace_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('ace_alumni', JSON.stringify(alumni));
  }, [alumni]);

  useEffect(() => {
    localStorage.setItem('ace_members', JSON.stringify(members));
  }, [members]);

  const handleLogin = async (email: string, password: string, regNo?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, regNo }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const { token, user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      localStorage.setItem('ace_user', JSON.stringify(loggedInUser));
      localStorage.setItem('ace_token', token);
    } catch (err) {
      console.error('Login error:', err);
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
                  <Route path="matches" element={<MatchManager user={user} />} />
                  <Route path="stats" element={<PlayerStatsView user={user} members={members} />} />
                  <Route path="financials" element={<Financials user={user} />} />
                  <Route 
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
                  />
                  <Route path="attendance" element={<Attendance user={user} />} />
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
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
