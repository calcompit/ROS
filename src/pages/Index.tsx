import { useState } from 'react';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [dashboardKey, setDashboardKey] = useState(0);
  const [ticketCount, setTicketCount] = useState<number>(0);

  const handleNotificationClick = (ticketId: string) => {
    // Force re-render Dashboard to trigger notification navigation
    setDashboardKey(prev => prev + 1);
    
    // Set hash to tickets with ticket ID to navigate there and highlight the ticket
    window.location.hash = `tickets?highlight=${ticketId}`;
  };

  const handleTicketCountUpdate = (count: number) => {
    setTicketCount(count);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNotificationClick={handleNotificationClick} ticketCount={ticketCount} />
      <main className="lg:ml-80 max-w-7xl mx-auto">
        <Dashboard key={dashboardKey} onTicketCountUpdate={handleTicketCountUpdate} />
      </main>
    </div>
  );
};

export default Index;
