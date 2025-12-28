
import React, { useState, useEffect, useRef } from 'react';
import { AppState, User, VitalRecord, Medication, Meal, Prescription } from './types';
import Dashboard from './components/Dashboard';
import Monitoring from './components/Monitoring';
import Medications from './components/Medications';
import Dietary from './components/Dietary';
import AIInsights from './components/AIInsights';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Layout from './components/Layout';

const REGISTRY_KEY = 'renal_care_users_registry';

const App: React.FC = () => {
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('renal_care_active_session');
  });

  const [registry, setRegistry] = useState<{ [key: string]: AppState }>(() => {
    const saved = localStorage.getItem(REGISTRY_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const state = activeUserEmail && registry[activeUserEmail] 
    ? registry[activeUserEmail] 
    : { user: null, vitals: [], medications: [], meals: [], prescriptions: [] };

  const lastCheckedMinute = useRef<string>("");

  useEffect(() => {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }, [registry]);

  useEffect(() => {
    if (!state.user) return;
    const checkReminders = () => {
      const now = new Date();
      const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentMinute === lastCheckedMinute.current) return;
      lastCheckedMinute.current = currentMinute;
      state.medications.forEach(med => {
        if (med.reminders.includes(currentMinute)) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("用药提醒", { body: `该吃药了：${med.name} (${med.dosage})` });
          } else {
            alert(`【用药提醒】${med.name} (${med.dosage})`);
          }
        }
      });
    };
    const timer = setInterval(checkReminders, 10000);
    return () => clearInterval(timer);
  }, [state.medications, state.user]);

  const updateActiveData = (newData: Partial<AppState>) => {
    if (!activeUserEmail) return;
    setRegistry(prev => ({
      ...prev,
      [activeUserEmail]: { ...prev[activeUserEmail], ...newData }
    }));
  };

  const handleLogin = (user: User) => {
    if (!registry[user.email]) {
      setRegistry(prev => ({
        ...prev,
        [user.email]: { user, vitals: [], medications: [], meals: [], prescriptions: [] }
      }));
    }
    setActiveUserEmail(user.email);
    localStorage.setItem('renal_care_active_session', user.email);
  };

  const handleLogout = () => {
    setActiveUserEmail(null);
    localStorage.removeItem('renal_care_active_session');
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'monitoring' | 'meds' | 'diet' | 'ai' | 'profile'>('dashboard');

  if (!activeUserEmail || !state.user) {
    const savedUsers = Object.values(registry).map((s: AppState) => s.user).filter((u): u is User => u !== null);
    return <Auth onLogin={handleLogin} savedUsers={savedUsers} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'monitoring': return <Monitoring vitals={state.vitals} onAdd={(v) => updateActiveData({ vitals: [...state.vitals, v] })} />;
      case 'meds': return (
        <Medications 
          meds={state.medications} 
          prescriptions={state.prescriptions || []}
          onAddMed={(m) => updateActiveData({ medications: [...state.medications, m] })}
          onDeleteMed={(id) => updateActiveData({ medications: state.medications.filter(m => m.id !== id) })}
          onAddPrescription={(p) => updateActiveData({ prescriptions: [...(state.prescriptions || []), p] })}
          onDeletePrescription={(id) => updateActiveData({ prescriptions: (state.prescriptions || []).filter(p => p.id !== id) })}
        />
      );
      case 'diet': return <Dietary meals={state.meals} onAdd={(m) => updateActiveData({ meals: [...state.meals, m] })} />;
      case 'ai': return <AIInsights state={state} />;
      case 'profile': return <Profile user={state.user} onUpdate={(u) => updateActiveData({ user: u })} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={state.user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
