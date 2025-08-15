import { useState } from 'react';
import { Menu, X, Home, Ticket, Plus, Search, Settings, Users, BarChart3, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MobileNavProps {
  ticketCount?: number;
}

const MobileNav = ({ ticketCount }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  const navItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      description: 'Overview and statistics',
      action: () => window.location.hash = 'overview',
      badge: null
    },
    { 
      icon: Ticket, 
      label: 'My Tickets', 
      description: 'View and manage tickets',
      action: () => window.location.hash = 'tickets',
      badge: ticketCount ? `${ticketCount}` : null
    },
    { 
      icon: Plus, 
      label: 'New Ticket', 
      description: 'Create repair request',
      action: () => window.location.hash = 'new-ticket',
      badge: null
    },
    { 
      icon: Search, 
      label: 'Search', 
      description: 'Find tickets and equipment',
      action: () => {},
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      description: 'System configuration',
      action: () => {},
      badge: null
    },
  ];

  const handleNavClick = (action: () => void, label: string) => {
    setActiveItem(label);
    action();
    setIsOpen(false);
  };

  return (
    <div>
      {/* Mobile: Sheet (popup) */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent transition-colors">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access different sections of the IT ROS dashboard</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <div className="p-4 border-b border-border/50">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-lg hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <div key={item.label}>
                      <button
                        onClick={() => handleNavClick(item.action, item.label)}
                        className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left border ${
                          activeItem === item.label
                            ? 'text-foreground bg-primary/10 border-primary/20 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent hover:border-border/50'
                        }`}
                      >
                        <div className="relative">
                          <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                          {item.badge && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 text-white"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">{item.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>


              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>IT ROS v1.0</span>
                  <span>© 2024</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed Sidebar */}
      <div className="hidden lg:block">
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-gradient-to-b from-background to-background/95 backdrop-blur-xl border-r border-border/50 z-40 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Menu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                  <p className="text-xs text-muted-foreground">Navigation options</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <button
                      onClick={() => handleNavClick(item.action, item.label)}
                      className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left border ${
                        activeItem === item.label
                          ? 'text-foreground bg-primary/10 border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border-transparent hover:border-border/50'
                      }`}
                    >
                      <div className="relative">
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        {item.badge && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 text-white"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>IT ROS v1.0</span>
                <span>© 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;