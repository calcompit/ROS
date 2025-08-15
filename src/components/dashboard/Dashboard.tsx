import { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, TrendingUp, Search, Filter, Plus, CalendarDays, Sun, Moon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, List, Loader2, CheckCircle, XCircle, BarChart3, PieChart, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import TicketCard, { Ticket as TicketType } from '../tickets/TicketCard';
import NewRepairOrderForm from '../tickets/NewRepairOrderForm';
import { repairOrdersApi, RepairOrder } from '@/services/api';
import { useDatabase } from '@/contexts/DatabaseContext';

interface DashboardProps {
  initialTab?: 'overview' | 'tickets' | 'new-ticket';
  onTicketCountUpdate?: (count: number) => void;
}

const Dashboard = ({ initialTab = 'overview', onTicketCountUpdate }: DashboardProps = {}) => {
  // Parse hash from URL to determine active tab and highlight ticket
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('tickets')) {
      return 'tickets';
    }
    switch (hash) {
      case 'new-ticket':
        return 'new-ticket';
      case 'overview':
      default:
        return 'overview';
    }
  };

  const getHighlightedTicketId = () => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash.split('?')[1] || '');
    return params.get('highlight') || '';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'new-ticket'>(getInitialTab());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Default active
  const [highlightedTicketId, setHighlightedTicketId] = useState(getHighlightedTicketId());
  const [tickets, setTickets] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byDepartment: Array<{ dept: string; count: number }>;
    byDeviceType: Array<{ device_type: string; count: number }>;
    monthlyTrends: Array<{ month: string; count: number }>;
    recentOrders: RepairOrder[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    today.setDate(1); // Set to first day of current month
    return today.toISOString().split('T')[0];
  });
  const [periodFilter, setPeriodFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const { addNotification } = useNotifications();
  const { isConnected: wsConnected } = useWebSocket();
  const { isConnected, isDemoMode, forceRedirectToError } = useDatabase();

  // Fetch dashboard statistics from API
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await repairOrdersApi.getStats();
      
      if (response.success) {
        console.log('📊 Dashboard stats received:', response.data);
        console.log('📊 Status counts:', {
          total: response.data.total,
          pending: response.data.pending,
          inProgress: response.data.inProgress,
          completed: response.data.completed,
          cancelled: response.data.cancelled
        });
        console.log('📊 Monthly trends:', response.data.monthlyTrends);
        console.log('📊 Department data:', response.data.byDepartment);
        console.log('📊 Device type data:', response.data.byDeviceType);
        setDashboardStats(response.data);
      } else {
        console.error('Failed to fetch dashboard stats:', response.message);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await repairOrdersApi.getAll();
      
      if (response.success) {
        if (response.demo) {
          setError('Database connection failed - Demo mode');
          setTickets([]);
          if (!isConnected && !isDemoMode) {
            forceRedirectToError();
          }
        } else {
          setTickets(response.data);
          setError(null);
        }
      } else {
        setError('Failed to fetch tickets');
        if (response.error) {
          forceRedirectToError();
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
      forceRedirectToError();
    } finally {
      setLoading(false);
    }
  };

  // Load tickets and stats on component mount
  useEffect(() => {
    fetchTickets();
    fetchDashboardStats();
  }, []);

  // Update ticket count when tickets change
  useEffect(() => {
    if (onTicketCountUpdate) {
      const activeTicketCount = tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
      onTicketCountUpdate(activeTicketCount);
    }
  }, [tickets, onTicketCountUpdate]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.order_no.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.emp.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter tickets by date and period
  const getFilteredTickets = () => {
    const selectedDate = new Date(dateFilter);
    const today = new Date();
    
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.insert_date);
      
      switch (periodFilter) {
        case 'daily':
          return ticketDate.toDateString() === selectedDate.toDateString();
        case 'monthly':
          return ticketDate.getMonth() === selectedDate.getMonth() && 
                 ticketDate.getFullYear() === selectedDate.getFullYear();
        case 'yearly':
          return ticketDate.getFullYear() === selectedDate.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredTicketsForStats = getFilteredTickets();
  
  // Use dashboard stats if available, otherwise fall back to filtered tickets
  const stats = dashboardStats ? {
    total: dashboardStats.total,
    pending: dashboardStats.pending,
    inProgress: dashboardStats.inProgress,
    completed: dashboardStats.completed,
    cancelled: dashboardStats.cancelled
  } : {
    total: filteredTicketsForStats.length,
    pending: filteredTicketsForStats.filter(t => t.status === 'pending').length,
    inProgress: filteredTicketsForStats.filter(t => t.status === 'in-progress').length,
    completed: filteredTicketsForStats.filter(t => t.status === 'completed').length,
    cancelled: filteredTicketsForStats.filter(t => t.status === 'cancelled').length
  };

  const handleNewTicket = (newTicket: TicketType) => {
    setTickets(prev => [...prev, newTicket]); // เพิ่มท้ายสุด
    setActiveTab('tickets');
    window.location.hash = 'tickets';
    
    // Refresh dashboard stats when new ticket is created
    fetchDashboardStats();
    
    // Add notification for new ticket
    addNotification({
      type: 'success',
              title: 'Equipment Order Created',
        message: `Your equipment order ${newTicket.order_no} has been created and is pending review.`,
      ticketId: String(newTicket.order_no)
    });
  };

  const handleTicketUpdate = async (updatedTicket: TicketType) => {
    const oldTicket = tickets.find(t => t.order_no === updatedTicket.order_no);
    setTickets(prev => prev.map(ticket => 
      ticket.order_no === updatedTicket.order_no ? updatedTicket : ticket
    ));
    
    // Refresh dashboard stats when ticket is updated
    fetchDashboardStats();
    
    // Add notification for ticket update
    if (oldTicket && oldTicket.status !== updatedTicket.status) {
      const statusMessages = {
        'pending': 'is now pending review',
        'in-progress': 'is now being worked on',
        'completed': 'has been completed successfully',
        'cancelled': 'has been cancelled'
      };
      
      addNotification({
        type: updatedTicket.status === 'completed' ? 'success' : 'info',
        title: 'Repair Order Status Updated',
        message: `Your repair order ${updatedTicket.order_no} ${statusMessages[updatedTicket.status]}.`,
        ticketId: String(updatedTicket.order_no)
      });
    }
  };

  const handleTicketDelete = async (orderNo: string | number) => {
    try {
      const response = await repairOrdersApi.delete(orderNo);
      if (response.success) {
        setTickets(prev => prev.filter(ticket => ticket.order_no !== orderNo));
        // Refresh dashboard stats when ticket is deleted
        fetchDashboardStats();
        addNotification({
          type: 'success',
          title: 'Repair Order Deleted',
          message: `Repair order ${orderNo} has been deleted successfully.`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: response.message || 'Failed to delete repair order.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: 'An error occurred while deleting the repair order.',
      });
    }
  };



  const handleNotificationClick = (ticketId: string) => {
    // Switch to tickets tab
    setActiveTab('tickets');
    window.location.hash = 'tickets';
    
    // Find and open the ticket detail (simulate clicking on the ticket)
    // In a real app, you might want to implement a more direct navigation
    // For now, the user will see the ticket in the tickets list
  };

  const handleTabChange = (tab: 'overview' | 'tickets' | 'new-ticket') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Listen for hash changes
  useState(() => {
    const handleHashChange = () => {
      setActiveTab(getInitialTab());
      setHighlightedTicketId(getHighlightedTicketId());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Navigation Tabs - Hidden on Mobile */}
      <div className="hidden sm:flex flex-row gap-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => handleTabChange('overview')}
          className="flex-none"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'tickets' ? 'default' : 'outline'}
          onClick={() => handleTabChange('tickets')}
          className="flex-none"
        >
          My Tickets ({tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length})
        </Button>
        <Button
          variant={activeTab === 'new-ticket' ? 'default' : 'outline'}
          onClick={() => handleTabChange('new-ticket')}
          className="flex-none"
        >
          New Order
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">Here's an overview of your repair tickets and system status.</p>
          </div>

          {/* Date and Period Filter */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Filter by Period:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-background rounded-md p-1">
                  <Button
                    variant={periodFilter === 'daily' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriodFilter('daily')}
                    className="text-xs px-3 h-8"
                  >
                    <Sun className="h-3 w-3 mr-1" />
                    รายวัน
                  </Button>
                  <Button
                    variant={periodFilter === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriodFilter('monthly')}
                    className="text-xs px-3 h-8"
                  >
                    <Moon className="h-3 w-3 mr-1" />
                    รายเดือน
                  </Button>
                  <Button
                    variant={periodFilter === 'yearly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriodFilter('yearly')}
                    className="text-xs px-3 h-8"
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    รายปี
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentDate = new Date(dateFilter);
                        switch (periodFilter) {
                          case 'daily':
                            currentDate.setDate(currentDate.getDate() - 1);
                            break;
                          case 'monthly':
                            currentDate.setMonth(currentDate.getMonth() - 1);
                            break;
                          case 'yearly':
                            currentDate.setFullYear(currentDate.getFullYear() - 1);
                            break;
                        }
                        setDateFilter(currentDate.toISOString().split('T')[0]);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full sm:w-48 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentDate = new Date(dateFilter);
                        switch (periodFilter) {
                          case 'daily':
                            currentDate.setDate(currentDate.getDate() + 1);
                            break;
                          case 'monthly':
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            break;
                          case 'yearly':
                            currentDate.setFullYear(currentDate.getFullYear() + 1);
                            break;
                        }
                        setDateFilter(currentDate.toISOString().split('T')[0]);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setStatusFilter('all')}
            >
              <StatsCard
                title="Total Orders"
                value={statsLoading ? '...' : stats.total}
                description={`${periodFilter === 'daily' ? 'Daily' : 
                            periodFilter === 'monthly' ? 'Monthly' : 'Yearly'} orders`}
                icon={Ticket}
                variant="primary"
                className={statusFilter === 'all' ? 'ring-2 ring-primary/20 shadow-lg' : ''}
              />
            </div>
            <div 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setStatusFilter('pending')}
            >
              <StatsCard
                title="Pending Review"
                value={statsLoading ? '...' : stats.pending}
                description="Awaiting technician"
                icon={Clock}
                variant="warning"
                className={statusFilter === 'pending' ? 'ring-2 ring-warning/20 shadow-lg' : ''}
              />
            </div>
            <div 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setStatusFilter('in-progress')}
            >
              <StatsCard
                title="In Progress"
                value={statsLoading ? '...' : stats.inProgress}
                description="Being worked on"
                icon={TrendingUp}
                variant="primary"
                className={statusFilter === 'in-progress' ? 'ring-2 ring-primary/20 shadow-lg' : ''}
              />
            </div>
            <div 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setStatusFilter('completed')}
            >
              <StatsCard
                title="Completed"
                value={statsLoading ? '...' : stats.completed}
                description="Successfully resolved"
                icon={Calendar}
                variant="success"
                className={statusFilter === 'completed' ? 'ring-2 ring-success/20 shadow-lg' : ''}
              />
            </div>
          </div>

          {/* Charts Section */}
          {statsLoading ? (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading charts...</p>
                </div>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading charts...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            <ChartCard
              title="Status Distribution"
              data={(() => {
                const chartData = [
                  { label: 'Pending', value: stats.pending, color: 'hsl(45, 93%, 47%)' },
                  { label: 'In Progress', value: stats.inProgress, color: 'hsl(221, 83%, 53%)' },
                  { label: 'Completed', value: stats.completed, color: 'hsl(142, 76%, 36%)' },
                  { label: 'Cancelled', value: stats.cancelled || 0, color: 'hsl(0, 84%, 60%)' }
                ];
                console.log('📊 Status Distribution Chart Data:', chartData);
                return chartData;
              })()}
              icon={PieChart}
              type="pie"
            />
                <ChartCard
                  title="Monthly Trends"
                  data={(() => {
                    const chartData = (dashboardStats?.monthlyTrends || []).map(item => ({
                      label: item.month,
                      value: item.count
                    })) || [
                      { label: 'Jan', value: 0 },
                      { label: 'Feb', value: 0 },
                      { label: 'Mar', value: 0 },
                      { label: 'Apr', value: 0 },
                      { label: 'May', value: 0 },
                      { label: 'Jun', value: 0 }
                    ];
                    console.log('📊 Monthly Trends Chart Data:', chartData);
                    return chartData;
                  })()}
                  icon={BarChart3}
                  type="bar"
                />
              </div>
              
              {/* Additional Charts */}
              {dashboardStats && dashboardStats.byDepartment && dashboardStats.byDeviceType && (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <ChartCard
                    title="Department Distribution"
                    data={(dashboardStats?.byDepartment || []).map((dept, index) => ({
                      label: dept.dept,
                      value: dept.count,
                      color: `hsl(${index * 60}, 70%, 60%)`
                    }))}
                    icon={Activity}
                    type="bar"
                  />
                  <ChartCard
                    title="Device Type Distribution"
                    data={(dashboardStats?.byDeviceType || []).map((device, index) => ({
                      label: device.device_type,
                      value: device.count,
                      color: `hsl(${index * 45 + 180}, 70%, 60%)`
                    }))}
                    icon={Activity}
                    type="pie"
                  />
                </div>
              )}
            </>
          )}

          {/* All Orders for Period */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                {periodFilter === 'daily' ? 'Daily' : 
                 periodFilter === 'monthly' ? 'Monthly' : 'Yearly'} Repair Orders
              </h3>
              <div className="text-sm text-muted-foreground">
                {filteredTicketsForStats.length} orders found
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTicketsForStats.map((ticket) => (
                <TicketCard 
                  key={ticket.order_no} 
                  ticket={ticket}
                  onTicketUpdate={handleTicketUpdate}
                  onTicketDelete={handleTicketDelete}
                />
              ))}
            </div>
            {filteredTicketsForStats.length === 0 && (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No repair orders found for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Repair Orders</h2>
              <p className="text-muted-foreground">Manage and track your equipment repair requests</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, subject, device, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-5 sm:flex sm:flex-row gap-1 sm:gap-3 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="default"
                onClick={() => setStatusFilter('all')}
                className="shadow-sm h-12 sm:h-9 text-sm sm:text-xs font-medium"
              >
                <span className="hidden sm:inline">All Status</span>
                <span className="sm:hidden flex items-center justify-center">
                  <List className="h-4 w-4 text-blue-600" />
                </span>
                ({tickets.length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="default"
                onClick={() => setStatusFilter('pending')}
                className="shadow-sm h-12 sm:h-9 text-sm sm:text-xs font-medium"
              >
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-500" />
                </span>
                ({tickets.filter(t => t.status === 'pending').length})
              </Button>
              <Button
                variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
                size="default"
                onClick={() => setStatusFilter('in-progress')}
                className="shadow-sm h-12 sm:h-9 text-sm sm:text-xs font-medium"
              >
                <span className="hidden sm:inline">In Progress</span>
                <span className="sm:hidden flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                </span>
                ({tickets.filter(t => t.status === 'in-progress').length})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="default"
                onClick={() => setStatusFilter('completed')}
                className="shadow-sm h-12 sm:h-9 text-sm sm:text-xs font-medium"
              >
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </span>
                ({tickets.filter(t => t.status === 'completed').length})
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                size="default"
                onClick={() => setStatusFilter('cancelled')}
                className="shadow-sm h-12 sm:h-9 text-sm sm:text-xs font-medium"
              >
                <span className="hidden sm:inline">Cancelled</span>
                <span className="sm:hidden flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                </span>
                ({tickets.filter(t => t.status === 'cancelled').length})
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading repair orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="mb-4">
                <Ticket className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{error}</p>
                {error.includes('demo mode') && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Database Status:</strong> Server is running but cannot connect to database at 10.53.64.205:1433
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Please check if the database server is running and accessible.
                    </p>
                  </div>
                )}
              </div>
              <Button onClick={fetchTickets} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!error && !loading && tickets.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <Ticket className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Repair Orders Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There are no repair orders in the database yet. Create your first repair order to get started.
                </p>
              </div>
              <Button onClick={() => setActiveTab('new-ticket')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Order
              </Button>
            </div>
          )}

          {/* Tickets Grid */}
          {!loading && !error && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.map((ticket) => (
                <TicketCard 
                  key={ticket.order_no} 
                  ticket={ticket}
                  onTicketUpdate={handleTicketUpdate}
                  onTicketDelete={handleTicketDelete}
                  isHighlighted={highlightedTicketId === ticket.order_no}
                />
              ))}
            </div>
          )}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You haven\'t created any tickets yet.'}
              </p>
              <Button onClick={() => handleTabChange('new-ticket')}>
                Create Your First Ticket
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New Ticket Tab */}
      {activeTab === 'new-ticket' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Repair Order</h2>
            <p className="text-muted-foreground">Submit a new repair request for your equipment</p>
          </div>
          <NewRepairOrderForm onSubmit={handleNewTicket} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;