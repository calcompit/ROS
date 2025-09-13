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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header onNotificationClick={handleNotificationClick} ticketCount={ticketCount} />
      <main className="lg:ml-80 max-w-7xl mx-auto p-4 lg:p-6">
        <div className="space-y-6">
          <Dashboard key={dashboardKey} onTicketCountUpdate={handleTicketCountUpdate} />
        </div>
      </main>
    </div>
  );
};

export default Index;
