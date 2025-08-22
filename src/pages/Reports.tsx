import { useState, useEffect } from "react";
import { BarChart3, Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllChangeLogs, getMachines, type ChangeLog, type Machine } from "@/lib/mockData";

const Reports = () => {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, machinesData] = await Promise.all([
        getAllChangeLogs(),
        getMachines()
      ]);
      setChangeLogs(logsData);
      setMachines(machinesData);
    } catch (error) {
      toast({
        title: "Error loading reports data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate statistics
  const stats = {
    totalChanges: changeLogs.length,
    todayChanges: changeLogs.filter(log => {
      const today = new Date().toDateString();
      const logDate = new Date(log.changeDate).toDateString();
      return today === logDate;
    }).length,
    changesByType: {
      modified: changeLogs.filter(log => log.changeType === 'modified').length,
      added: changeLogs.filter(log => log.changeType === 'added').length,
      removed: changeLogs.filter(log => log.changeType === 'removed').length,
    },
    topMachines: changeLogs.reduce((acc, log) => {
      acc[log.machineId] = (acc[log.machineId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentChanges: changeLogs
      .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
      .slice(0, 10)
  };

  const topMachinesArray = Object.entries(stats.topMachines)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalMachines: machines.length,
        totalChanges: stats.totalChanges,
        todayChanges: stats.todayChanges,
        changesByType: stats.changesByType
      },
      recentChanges: stats.recentChanges,
      topMachines: topMachinesArray
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `change_report_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report exported",
      description: "Change report has been downloaded successfully",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights from computer changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChanges}</div>
            <p className="text-xs text-muted-foreground">
              All time changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Changes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.todayChanges}</div>
            <p className="text-xs text-muted-foreground">
              Changes today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modifications</CardTitle>
            <BarChart3 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.changesByType.modified}</div>
            <p className="text-xs text-muted-foreground">
              Modified items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Additions</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.changesByType.added}</div>
            <p className="text-xs text-muted-foreground">
              New additions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Change Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Change Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <span className="text-sm font-medium">Modified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.changesByType.modified}
                    </span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning rounded-full"
                        style={{ 
                          width: `${(stats.changesByType.modified / stats.totalChanges) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-sm font-medium">Added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.changesByType.added}
                    </span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full"
                        style={{ 
                          width: `${(stats.changesByType.added / stats.totalChanges) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="text-sm font-medium">Removed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.changesByType.removed}
                    </span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-destructive rounded-full"
                        style={{ 
                          width: `${(stats.changesByType.removed / stats.totalChanges) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Active Machines */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Machines</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topMachinesArray.length > 0 ? (
              <div className="space-y-3">
                {topMachinesArray.map(([machineId, count], index) => (
                  <div key={machineId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{machineId}</span>
                    </div>
                    <Badge variant="secondary">
                      {count} changes
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Changes
            <Badge variant="outline" className="ml-auto">
              Last 10 changes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-16 bg-muted rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats.recentChanges.length > 0 ? (
            <div className="space-y-4">
              {stats.recentChanges.map((log) => (
                <div key={log.changeId} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                  <Badge 
                    variant="outline"
                    className={getChangeTypeColor(log.changeType)}
                  >
                    {log.changeType}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.machineId}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{log.fieldName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.changeDate)}
                    </p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {log.changeId}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent changes found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;