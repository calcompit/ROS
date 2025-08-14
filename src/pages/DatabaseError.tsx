import { Database, AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { repairOrdersApi } from '@/services/api';

const DatabaseError = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await repairOrdersApi.getAll();
      if (response.success && !response.demo) {
        // Database is connected, redirect to dashboard
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Database check failed:', error);
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Check connection on component mount
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Database className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            Database Connection Failed
          </CardTitle>
          <CardDescription className="text-lg text-red-700">
            Unable to connect to the database server
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Server Status</p>
                  <p className="text-sm text-red-700">Backend server is running in demo mode</p>
                </div>
              </div>
              <Badge variant="destructive">Demo Mode</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Database Server</h4>
                <p className="text-sm text-gray-600">10.53.64.205:1433</p>
                <p className="text-sm text-gray-600">Database: mes</p>
                <p className="text-sm text-gray-600">User: ccet</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Last Check</h4>
                <p className="text-sm text-gray-600">
                  {lastCheck.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {isChecking ? 'Checking...' : 'Failed'}
                </p>
              </div>
            </div>
          </div>

          {/* Troubleshooting Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Troubleshooting Steps:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">1.</span>
                <span>Check if the database server (10.53.64.205) is running and accessible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">2.</span>
                <span>Verify network connectivity to the database server</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">3.</span>
                <span>Confirm database credentials are correct</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">4.</span>
                <span>Check if SQL Server service is running on the target machine</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={checkConnection}
              disabled={isChecking}
              className="flex-1"
              variant="outline"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking Connection...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Demo Mode Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The application is currently running in demo mode. 
              All data operations are simulated and will not persist to the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseError;
