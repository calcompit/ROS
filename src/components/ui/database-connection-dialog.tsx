import React, { useState, useEffect } from 'react';
import { AlertCircle, Database, RefreshCw, TestTube, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { repairOrdersApi } from '@/services/api';

interface DatabaseConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionChange?: (connected: boolean, type: 'sqlserver' | 'demo') => void;
}

interface DatabaseStatus {
  connected: boolean;
  type: 'sqlserver' | 'demo';
  server?: string;
  database?: string;
  user?: string;
}

export function DatabaseConnectionDialog({ 
  open, 
  onOpenChange, 
  onConnectionChange 
}: DatabaseConnectionDialogProps) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const { user } = useAuth();

  // Fetch initial status
  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/database/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        setMessage('');
      } else {
        setMessage('Failed to get database status');
      }
    } catch (error) {
      setMessage('Network error while checking database status');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      setMessage('');
      
      const response = await fetch('http://localhost:3001/api/database/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        setMessage('✅ Database connection successful!');
        onConnectionChange?.(data.data.connected, data.data.type);
      } else {
        setStatus(data.data);
        setMessage('❌ Database connection failed.');
        onConnectionChange?.(data.data.connected, data.data.type);
      }
    } catch (error) {
      setMessage('❌ Network error while testing connection');
    } finally {
      setTesting(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  
  const blurSensitiveData = (text: string) => {
    if (!isAdmin || !showSensitiveData) {
      return '••••••••••••••••';
    }
    return text;
  };

  const reconnect = async () => {
    try {
      setReconnecting(true);
      setMessage('');
      
      const response = await fetch('http://localhost:3001/api/database/reconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        setMessage('✅ Successfully reconnected to database!');
        onConnectionChange?.(data.data.connected, data.data.type);
      } else {
        setStatus(data.data);
        setMessage('⚠️ Failed to reconnect.');
        onConnectionChange?.(data.data.connected, data.data.type);
      }
    } catch (error) {
      setMessage('❌ Network error while reconnecting');
    } finally {
      setReconnecting(false);
    }
  };



  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    
    if (status.connected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (!status) return 'Unknown';
    
    if (status.connected) {
      return 'Connected';
    } else {
      return 'Disconnected';
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    
    if (status.connected) {
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Connected</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Disconnected</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Connection
          </DialogTitle>
          <DialogDescription className="text-sm">
            Manage SQL Server database connection status and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-sm">{getStatusText()}</p>
                {status?.server && (
                  <p className="text-xs text-muted-foreground">
                    {blurSensitiveData(status.server)} / {blurSensitiveData(status.database || '')}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Message */}
          {message && (
            <Alert className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}

          {/* Connection Info */}
          {status?.connected && (
            <div className="text-xs text-muted-foreground space-y-1 p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Connection Details</span>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="h-6 px-2 text-xs"
                  >
                    {showSensitiveData ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p><strong>Server:</strong> {blurSensitiveData(status.server || '')}</p>
              <p><strong>Database:</strong> {blurSensitiveData(status.database || '')}</p>
              <p><strong>User:</strong> {blurSensitiveData(status.user || '')}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={fetchStatus}
              disabled={loading}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              <TestTube className={`h-3 w-3 mr-2 ${testing ? 'animate-spin' : ''}`} />
              Test
            </Button>
          </div>

          <Button
            onClick={reconnect}
            disabled={reconnecting}
            className="w-full"
            size="sm"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${reconnecting ? 'animate-spin' : ''}`} />
            Reconnect Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
