import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Calendar, FileText, Plus, Minus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getMachineChangeLogs, mockMachines, type ChangeLog, type Machine } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const MachineDetail = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<Machine | null>(null);

  const loadChangeLogs = async () => {
    if (!machineId) return;
    
    setLoading(true);
    try {
      const data = await getMachineChangeLogs(machineId);
      setChangeLogs(data);
      toast({
        title: "Change logs loaded",
        description: `Found ${data.length} changes for ${machineId}`,
      });
    } catch (error) {
      toast({
        title: "Error loading change logs",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (machineId) {
      const foundMachine = mockMachines.find(m => m.id === machineId);
      setMachine(foundMachine || null);
      loadChangeLogs();
    }
  }, [machineId]);

  const getChangeTypeIcon = (type: ChangeLog['changeType']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4" />;
      case 'removed':
        return <Minus className="h-4 w-4" />;
      case 'modified':
        return <Edit className="h-4 w-4" />;
    }
  };

  const getChangeTypeColor = (type: ChangeLog['changeType']) => {
    switch (type) {
      case 'added':
        return 'text-success bg-success-light border-success/20';
      case 'removed':
        return 'text-destructive bg-destructive-light border-destructive/20';
      case 'modified':
        return 'text-warning bg-warning-light border-warning/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!machine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium">Machine not found</h3>
            <p className="text-muted-foreground">
              The machine with ID "{machineId}" could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{machine.id}</h1>
            <p className="text-muted-foreground">{machine.computerName}</p>
          </div>
        </div>
        <Button onClick={loadChangeLogs} disabled={loading} className="w-fit">
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Machine Info */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Computer Name</p>
                <p className="text-sm text-muted-foreground">{machine.computerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">IP Address</p>
                <p className="text-sm text-muted-foreground">{machine.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Operating System</p>
                <p className="text-sm text-muted-foreground">{machine.operatingSystem}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{machine.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={machine.status === 'online' ? 'default' : 'secondary'}>
                  {machine.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Last Seen</p>
                <p className="text-sm text-muted-foreground">{machine.lastSeen}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Change History
            <Badge variant="outline" className="ml-auto">
              {changeLogs.length} changes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : changeLogs.length > 0 ? (
            <div className="space-y-4">
              {changeLogs.map((log) => (
                <div key={log.changeId} className="flex gap-4 p-4 rounded-lg border border-border">
                  <div className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg border",
                    getChangeTypeColor(log.changeType)
                  )}>
                    {getChangeTypeIcon(log.changeType)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{log.fieldName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.changeDate)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {log.changeType === 'modified' && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">From:</span>
                          <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                            {log.oldValue || '(empty)'}
                          </span>
                        </div>
                      )}
                      
                      {log.changeType !== 'removed' && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {log.changeType === 'added' ? 'Added:' : 'To:'}
                          </span>
                          <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                            {log.newValue}
                          </span>
                        </div>
                      )}
                      
                      {log.changeType === 'removed' && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Removed:</span>
                          <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                            {log.oldValue}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {log.description && (
                      <p className="text-sm text-muted-foreground">
                        {log.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={cn("text-xs", getChangeTypeColor(log.changeType))}
                      >
                        {log.changeType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Change ID: {log.changeId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No change history</h3>
              <p className="text-muted-foreground">
                No changes have been recorded for this machine yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineDetail;