import { useState } from 'react';
import { Menu, X, Home, Ticket, Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface MobileNavProps {
  ticketCount?: number;
}

const MobileNav = ({ ticketCount }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', action: () => window.location.hash = 'overview' },
    { icon: Ticket, label: `My Tickets${ticketCount ? ` (${ticketCount})` : ''}`, action: () => window.location.hash = 'tickets' },
    { icon: Plus, label: 'New Ticket', action: () => window.location.hash = 'new-ticket' },
    { icon: Search, label: 'Search', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
  ];

  const handleNavClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-foreground">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Access different sections of the TechFix Pro dashboard</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">TechFix Pro</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavClick(item.action)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors text-left"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;