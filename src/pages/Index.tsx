import { useState } from 'react';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [dashboardKey, setDashboardKey] = useState(0);

  const handleNotificationClick = (ticketId: string) => {
    // Force re-render Dashboard to trigger notification navigation
    setDashboardKey(prev => prev + 1);
    
    // Set hash to tickets with ticket ID to navigate there and highlight the ticket
    window.location.hash = `tickets?highlight=${ticketId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNotificationClick={handleNotificationClick} />
      <main className="max-w-7xl mx-auto">
        <Dashboard key={dashboardKey} />
      </main>
    </div>
  );
};

export default Index;
