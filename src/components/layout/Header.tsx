import { User, LogOut, Shield, Settings, Database, AlertTriangle, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
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
  const { isConnected: wsConnected } = useWebSocket();
  const [dbStatus, setDbStatus] = useState<'connected' | 'demo' | 'error' | 'checking'>('checking');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        {/* Left Section - Logo, Search Bar, and Mobile Nav */}
        <div className="flex items-center gap-4">
          <MobileNav ticketCount={ticketCount} />
          <div className="hidden md:flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              IT ROS
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground">Equipment Management Dashboard</p>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex max-w-md mx-12 ">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Search Bar - Mobile (Full Width) */}
          <div className="md:hidden flex-1 max-w-none ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 w-full"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Status and User */}
        <div className="flex items-center gap-3">

          {/* Status Indicators */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Database Status */}
            {dbStatus === 'checking' && (
              <Badge variant="outline" className="animate-pulse">
                <Database className="h-3 w-3 mr-1 animate-spin" />
                DB...
              </Badge>
            )}
            {dbStatus === 'connected' && (
              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Database className="h-3 w-3 mr-1" />
                DB
              </Badge>
            )}
            {dbStatus === 'demo' && (
              <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Demo
              </Badge>
            )}
            {dbStatus === 'error' && (
              <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                DB Error
              </Badge>
            )}
            
            {/* WebSocket Status */}
            {wsConnected ? (
              <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
          
          <NotificationDropdown onNotificationClick={onNotificationClick} />
          
          {!user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAdminLogin}
              className="flex items-center gap-2 hover:bg-primary/5 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Login</span>
            </Button>
          )}
          
          {user && (
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <Badge variant="secondary" className="hidden sm:flex bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 border-purple-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={isAdmin() ? "default" : "secondary"} className="text-xs">
                          {isAdmin() ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Administrator
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Standard User
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
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