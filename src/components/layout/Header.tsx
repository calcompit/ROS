import { User, LogOut, Shield, Settings, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import MobileNav from './MobileNav';
import { useState, useEffect } from 'react';
import { repairOrdersApi } from '@/services/api';

interface HeaderProps {
  onNotificationClick?: (ticketId: string) => void;
  ticketCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, ticketCount }) => {
  const { user, logout, isAdmin } = useAuth();
  const [dbStatus, setDbStatus] = useState<'connected' | 'demo' | 'error' | 'checking'>('checking');
  
  const handleAdminLogin = () => {
    window.location.href = '/login';
  };

  // Check database status
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await repairOrdersApi.getAll();
        if (response.success) {
          setDbStatus(response.demo ? 'demo' : 'connected');
        } else {
          setDbStatus('error');
        }
      } catch (error) {
        setDbStatus('error');
      }
    };

    checkDbStatus();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        <div className="flex items-center gap-4">
          <MobileNav ticketCount={ticketCount} />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">TechFix Pro</h1>
            <p className="hidden lg:block text-sm text-muted-foreground">Equipment Management Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Database Status Indicator */}
          {dbStatus === 'checking' && (
            <Badge variant="outline" className="hidden sm:flex">
              <Database className="h-3 w-3 mr-1 animate-spin" />
              Checking DB...
            </Badge>
          )}
          {dbStatus === 'connected' && (
            <Badge variant="default" className="hidden sm:flex">
              <Database className="h-3 w-3 mr-1" />
              DB Connected
            </Badge>
          )}
          {dbStatus === 'demo' && (
            <Badge variant="destructive" className="hidden sm:flex">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
          {dbStatus === 'error' && (
            <Badge variant="destructive" className="hidden sm:flex">
              <AlertTriangle className="h-3 w-3 mr-1" />
              DB Error
            </Badge>
          )}
          
          <NotificationDropdown onNotificationClick={onNotificationClick} />
          
          {!user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAdminLogin}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin Login
            </Button>
          )}
          
          {user && (
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <Badge variant="secondary" className="hidden sm:flex">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant={isAdmin() ? "default" : "secondary"} className="text-xs">
                          {isAdmin() ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              User
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;