import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Monitor, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getMachines, type Machine } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const Machines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadMachines = async () => {
    setLoading(true);
    try {
      const data = await getMachines();
      setMachines(data);
      setFilteredMachines(data);
    } catch (error) {
      toast({
        title: "Error loading machines",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    const filtered = machines.filter(machine =>
      machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, [searchTerm, machines]);

  const getStatusVariant = (status: Machine['status']) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'secondary';
      case 'maintenance':
        return 'outline';
    }
  };

  const exportToCSV = () => {
    const headers = ['Machine ID', 'Computer Name', 'IP Address', 'Status', 'Location', 'Operating System', 'Last Seen'];
    const csvContent = [
      headers.join(','),
      ...filteredMachines.map(machine => [
        machine.id,
        machine.computerName,
        machine.ipAddress,
        machine.status,
        `"${machine.location}"`,
        `"${machine.operatingSystem}"`,
        machine.lastSeen
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `machines_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredMachines.length} machines to CSV`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
          <p className="text-muted-foreground">
            Complete list of all registered computers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Machine ID, Computer Name, Location, or OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Machines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Machines List
            <Badge variant="outline" className="ml-auto">
              {filteredMachines.length} of {machines.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredMachines.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine ID</TableHead>
                    <TableHead>Computer Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden lg:table-cell">Operating System</TableHead>
                    <TableHead className="hidden xl:table-cell">Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMachines.map((machine) => (
                    <TableRow key={machine.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{machine.id}</TableCell>
                      <TableCell>{machine.computerName}</TableCell>
                      <TableCell className="font-mono text-sm">{machine.ipAddress}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(machine.status)}>
                          {machine.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {machine.location}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {machine.operatingSystem}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {machine.lastSeen}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/machines/${machine.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No machines found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'No machines are currently registered'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Machines;