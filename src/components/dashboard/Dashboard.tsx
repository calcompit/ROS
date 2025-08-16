import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    return today.toISOString().split('T')[0];
  });
  const [periodFilter, setPeriodFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const { addNotification } = useNotifications();
  const { isConnected: wsConnected, onOrderCreated, onOrderUpdated, onOrderDeleted, offOrderCreated, offOrderUpdated, offOrderDeleted } = useWebSocket();
  const { isConnected } = useDatabase();
  
  // Use refs to store the latest functions
  const fetchTicketsRef = useRef<() => Promise<void>>();
  const fetchDashboardStatsRef = useRef<() => Promise<void>>();

  // Fetch dashboard statistics from API
  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log('📊 Fetching dashboard stats with filters:', {
        date: dateFilter,
        period: periodFilter
      });
      const response = await repairOrdersApi.getStats({
        date: dateFilter,
        period: periodFilter
      });
      
      if (response.success) {
        console.log('📊 Dashboard stats received:', response.data);
        console.log('📊 Filter applied:', {
          date: dateFilter,
          period: periodFilter
        });
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
  }, [dateFilter, periodFilter]);
  
  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      console.log('📡 Fetching tickets from API...');
      setLoading(true);
      setError(null);
      
      // Always fetch all tickets - filtering will be done on frontend
      const response = await repairOrdersApi.getAll({});
      
      if (response.success) {
        console.log('✅ API response received:', response.data);
        console.log('📊 Tickets count:', response.data.length);
        console.log('📊 Tickets details:', response.data.map(t => ({
          order_no: t.order_no,
          subject: t.subject,
          status: t.status,
          last_date: t.last_date
        })));
        setTickets(response.data);
        setError(null);

      } else {
        console.error('❌ API response failed:', response.message);
        setError('Failed to fetch tickets');
      }
    } catch (err) {
      console.error('❌ Error fetching tickets:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      console.log('📡 Fetch tickets completed');
    }
  }, []);
  
  // Update refs when functions change
  useEffect(() => {
    fetchTicketsRef.current = fetchTickets;
    fetchDashboardStatsRef.current = fetchDashboardStats;
  }, [fetchTickets, fetchDashboardStats]);

  // Load tickets on component mount only
  useEffect(() => {
    fetchTickets();
  }, []);

  // Load dashboard stats on component mount and when date/period filters change
  useEffect(() => {
    fetchDashboardStats();
  }, [dateFilter, periodFilter]);

  // WebSocket event handlers - use useCallback to prevent infinite re-renders
  const handleOrderCreated = useCallback((data: any) => {
    console.log('🔄 Real-time: Order created:', data);
    const newTicket = data.data;
    if (newTicket) {
      // Add new ticket with fade-in animation
      setTickets(prev => [newTicket, ...prev]);
      // Update stats
      setDashboardStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + (newTicket.status === 'pending' ? 1 : 0),
          inProgress: prev.inProgress + (newTicket.status === 'in-progress' ? 1 : 0),
          completed: prev.completed + (newTicket.status === 'completed' ? 1 : 0),
          cancelled: prev.cancelled + (newTicket.status === 'cancelled' ? 1 : 0)
        };
      });
    }
  }, []);

  const handleOrderUpdated = useCallback((data: any) => {
    console.log('🔄 Real-time: Order updated:', data);
    const updatedTicket = data.data;
    const orderNo = data.orderNo;
    
    if (updatedTicket && orderNo) {
      setTickets(prev => prev.map(ticket => 
        ticket.order_no.toString() === orderNo.toString() ? updatedTicket : ticket
      ));
      
      // Update stats by recalculating
      setDashboardStats(prev => {
        if (!prev) return prev;
        const updatedTickets = tickets.map(ticket => 
          ticket.order_no.toString() === orderNo.toString() ? updatedTicket : ticket
        );
        return {
          ...prev,
          pending: updatedTickets.filter(t => t.status === 'pending').length,
          inProgress: updatedTickets.filter(t => t.status === 'in-progress').length,
          completed: updatedTickets.filter(t => t.status === 'completed').length,
          cancelled: updatedTickets.filter(t => t.status === 'cancelled').length
        };
      });
    }
  }, [tickets]);

  const handleOrderDeleted = useCallback((data: any) => {
    console.log('🔄 Real-time: Order deleted:', data);
    const orderNo = data.orderNo;
    
    if (orderNo) {
      // Remove ticket with fade-out animation
      setTickets(prev => prev.filter(ticket => ticket.order_no.toString() !== orderNo.toString()));
      
      // Update stats by recalculating
      setDashboardStats(prev => {
        if (!prev) return prev;
        const remainingTickets = tickets.filter(ticket => ticket.order_no.toString() !== orderNo.toString());
        return {
          ...prev,
          total: prev.total - 1,
          pending: remainingTickets.filter(t => t.status === 'pending').length,
          inProgress: remainingTickets.filter(t => t.status === 'in-progress').length,
          completed: remainingTickets.filter(t => t.status === 'completed').length,
          cancelled: remainingTickets.filter(t => t.status === 'cancelled').length
        };
      });
    }
  }, [tickets]);

  // Set up WebSocket event listeners for real-time updates
  useEffect(() => {
    console.log('🔄 Setting up WebSocket event listeners...');
    console.log('🔄 WebSocket connected:', wsConnected);
    console.log('🔄 Current tickets count:', tickets.length);
    console.log('🔄 fetchTicketsRef.current:', fetchTicketsRef.current);
    console.log('🔄 fetchDashboardStatsRef.current:', fetchDashboardStatsRef.current);
    
    if (!wsConnected) {
      console.log('🔄 WebSocket not connected, skipping event setup');
      return;
    }

    console.log('🔄 Registering event listeners...');
    // Register event listeners
    onOrderCreated(handleOrderCreated);
    onOrderUpdated(handleOrderUpdated);
    onOrderDeleted(handleOrderDeleted);
    console.log('🔄 Event listeners registered successfully');

    // Cleanup event listeners
    return () => {
      console.log('🔄 Cleaning up event listeners...');
      offOrderCreated(handleOrderCreated);
      offOrderUpdated(handleOrderUpdated);
      offOrderDeleted(handleOrderDeleted);
    };
  }, [wsConnected]);

  // Update ticket count when tickets change
  useEffect(() => {
    if (onTicketCountUpdate) {
      const activeTicketCount = tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
      onTicketCountUpdate(activeTicketCount);
    }
  }, [tickets, onTicketCountUpdate]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.order_no.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.emp.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

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
    setTickets(prev => prev.map(ticket => 
      ticket.order_no === updatedTicket.order_no ? updatedTicket : ticket
    ));
    
    // Refresh dashboard stats when ticket is updated
    fetchDashboardStats();
    
    // Add notification for ticket update
    const oldTicket = tickets.find(t => t.order_no === updatedTicket.order_no);
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
        message: `Order ${updatedTicket.order_no} ${statusMessages[updatedTicket.status as keyof typeof statusMessages] || 'status has been updated'}.`,
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

  const handleStatusFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
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
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome back!</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {wsConnected ? 'Real-time Active' : 'Real-time Offline'}
                </span>
              </div>
            </div>
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
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105"
              onClick={() => handleStatusFilterChange('all')}
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
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105"
              onClick={() => handleStatusFilterChange('pending')}
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
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105"
              onClick={() => handleStatusFilterChange('in-progress')}
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
              className="cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105"
              onClick={() => handleStatusFilterChange('completed')}
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
                  <Loader2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading charts...</p>
                </div>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 mx-auto mb-2" />
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
                  title={(() => {
                    switch (periodFilter) {
                      case 'daily':
                        return 'Hourly Trends';
                      case 'monthly':
                        return 'Daily Trends';
                      case 'yearly':
                        return 'Monthly Trends';
                      default:
                        return 'Monthly Trends';
                    }
                  })()}
                  data={(() => {
                    const trendsLabel = dashboardStats?.trendsLabel || 'month';
                    const chartData = (dashboardStats?.monthlyTrends || []).map(item => ({
                      label: item[trendsLabel] || item.month || item.day || item.hour,
                      value: item.count
                    })) || [
                      { label: 'No Data', value: 0 }
                    ];
                    console.log('📊 Dynamic Trends Chart Data:', chartData);
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
                <div 
                  key={ticket.order_no}
                  className=""
                  style={{ 
                    animationDelay: '0ms',
                    animationDuration: '0ms'
                  }}
                >
                  <TicketCard 
                    ticket={ticket}
                    onTicketUpdate={handleTicketUpdate}
                    onTicketDelete={handleTicketDelete}
                  />
                </div>
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

          {/* Search Bar - Full Width */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, subject, device, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter Buttons - Icon + Count for iPad, Text for Desktop */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="default"
              onClick={() => handleStatusFilterChange('all')}
              className="shadow-sm h-12 md:h-10 text-xs font-medium flex items-center justify-center gap-2"
            >
              <List className="h-4 w-4 text-blue-600" />
              <span className="text-xs xl:hidden">({tickets.length})</span>
              <span className="hidden xl:inline text-sm">All ({tickets.length})</span>
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="default"
              onClick={() => handleStatusFilterChange('pending')}
              className="shadow-sm h-12 md:h-10 text-xs font-medium flex items-center justify-center gap-2"
            >
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs xl:hidden">({tickets.filter(t => t.status === 'pending').length})</span>
              <span className="hidden xl:inline text-sm">Pending ({tickets.filter(t => t.status === 'pending').length})</span>
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              size="default"
              onClick={() => handleStatusFilterChange('in-progress')}
              className="shadow-sm h-12 md:h-10 text-xs font-medium flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs xl:hidden">({tickets.filter(t => t.status === 'in-progress').length})</span>
              <span className="hidden xl:inline text-sm">In Progress ({tickets.filter(t => t.status === 'in-progress').length})</span>
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="default"
              onClick={() => handleStatusFilterChange('completed')}
              className="shadow-sm h-12 md:h-10 text-xs font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs xl:hidden">({tickets.filter(t => t.status === 'completed').length})</span>
              <span className="hidden xl:inline text-sm">Completed ({tickets.filter(t => t.status === 'completed').length})</span>
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              size="default"
              onClick={() => handleStatusFilterChange('cancelled')}
              className="shadow-sm h-12 md:h-10 text-xs font-medium flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs xl:hidden">({tickets.filter(t => t.status === 'cancelled').length})</span>
              <span className="hidden xl:inline text-sm">Cancelled ({tickets.filter(t => t.status === 'cancelled').length})</span>
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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

          {/* Tickets Grid */}
          {!loading && !error && filteredTickets.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredTickets.map((ticket, index) => (
                <div 
                  key={ticket.order_no}
                  className=""
                  style={{ 
                    animationDelay: '0ms',
                    animationDuration: '0ms'
                  }}
                >
                  <TicketCard 
                    ticket={ticket}
                    onTicketUpdate={handleTicketUpdate}
                    onTicketDelete={handleTicketDelete}
                    isHighlighted={highlightedTicketId === ticket.order_no}  
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State - Show when no tickets found after filtering */}
          {!loading && !error && filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {tickets.length === 0 ? 'No Repair Orders Found' : 'No tickets found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {tickets.length === 0 
                  ? 'There are no repair orders in the database yet. Create your first repair order to get started.'
                  : searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'You haven\'t created any tickets yet.'
                }
              </p>
              <Button onClick={() => handleTabChange('new-ticket')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {tickets.length === 0 ? 'Create First Order' : 'Create Your First Ticket'}
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