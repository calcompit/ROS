import { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, Eye, Edit, X, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import EditTicketForm from './EditTicketForm';

export interface Ticket {
  // Database fields (internal)
  order_no: string | number;     // Primary key
  subject: string;               // Issue description
  name: string;                  // PC/Device name
  dept: string;                  // Department
  emp: string;                   // Employee who reported
  insert_date: string;           // Creation date
  items?: string;                // Equipment/items details
  rootcause?: string;            // Root cause analysis
  action?: string;               // Action taken
  emprepair?: string;            // Technician assigned (from database: emprepair)
  last_date: string;             // Last update date
  status: string;                // Status from database
  
  // Optional display fields
  deviceType?: string;           // Device type (Laptop, PC, etc.)
  notes?: string;                // Additional notes
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface TicketCardProps {
  ticket: Ticket;
  onTicketUpdate?: (updatedTicket: Ticket) => void;
  onTicketDelete?: (orderNo: string | number) => void;
  isHighlighted?: boolean;
}

const TicketCard = ({ ticket, onTicketUpdate, onTicketDelete, isHighlighted = false }: TicketCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth();

  // Helper functions for display names and formatting
  const getDisplayName = (field: keyof Ticket): string => {
    const displayNames = {
      order_no: 'Order Number',
      subject: 'Issue Description',
      name: 'Device/PC Name',
      dept: 'Department',
      emp: 'Reported By',
      insert_date: 'Created Date',
      items: 'Equipment/Items Details',
      rootcause: 'Root Cause Analysis',
      action: 'Action Taken',
      emprepair: 'Assigned Technician',
      last_date: 'Last Updated',
      status: 'Status',
      deviceType: 'Device Type',
      notes: 'Notes',
      priority: 'Priority'
    };
    return displayNames[field] || field;
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in-progress':
      case 'inprogress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
      case 'canceled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 text-red-600 bg-transparent';
      case 'high':
        return 'border-orange-500 text-orange-600 bg-transparent';
      case 'medium':
        return 'border-blue-500 text-blue-600 bg-transparent';
      case 'low':
        return 'border-gray-400 text-gray-600 bg-transparent';
      default:
        return 'border-gray-400 text-gray-600 bg-transparent';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleTicketSave = (updatedTicket: Ticket) => {
    onTicketUpdate?.(updatedTicket);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Auto-open dialog when ticket is highlighted from notification
  useEffect(() => {
    if (isHighlighted) {
      setIsDetailOpen(true);
      // Clear highlight after opening dialog
      setTimeout(() => {
        window.location.hash = 'tickets';
      }, 100);
    }
  }, [isHighlighted]);

  return (
    <>
      <Card className={`flex flex-col h-full shadow-card hover:shadow-hover transition-all duration-200 animate-fade-in ${
        isHighlighted 
          ? 'border-primary border-2 ring-2 ring-primary/20 shadow-lg' 
          : 'border-border'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-sm">{ticket.order_no}</h3>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{ticket.dept}</span>
              </div>
              <h4 className="font-medium text-foreground line-clamp-1 text-sm">{ticket.subject}</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">Device:</span> {ticket.name}</p>
                <p><span className="font-medium">Reported by:</span> {ticket.emp}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge variant="outline" className={getStatusColor(ticket.status)}>
                {formatStatus(ticket.status)}
              </Badge>
              {ticket.priority && (
                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(ticket.insert_date).toLocaleDateString()}</span>
              </div>
              {ticket.deviceType && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{ticket.deviceType}</span>
                </div>
              )}
            </div>

            {ticket.emprepair && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned to {ticket.emprepair}</span>
              </div>
            )}

            {/* Technical Information - Compact Design */}
            <div className="space-y-1.5">
              {ticket.rootcause && ticket.rootcause.trim() !== '' && (
                <div className="flex items-center gap-2 p-2 rounded bg-red-50/80 border-l-3 border-red-500 dark:bg-red-950/10">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 min-w-0 flex-shrink-0 text-center">
                    <div>Root</div>
                    <div>Cause</div>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 min-w-0 flex-shrink-0">:</div>
                  <div className="text-xs text-red-700 dark:text-red-300 line-clamp-2 min-w-0">{ticket.rootcause}</div>
                </div>
              )}
              
              {ticket.action && ticket.action.trim() !== '' && (
                <div className="flex items-center gap-2 p-2 rounded bg-amber-50/80 border-l-3 border-amber-500 dark:bg-amber-950/10">
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400 min-w-0 flex-shrink-0 text-center">Action</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 min-w-0 flex-shrink-0">:</div>
                  <div className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2 min-w-0">{ticket.action}</div>
                </div>
              )}

              {ticket.items && ticket.items.trim() !== '' && (
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-50/80 border-l-3 border-yellow-500 dark:bg-yellow-950/10">
                  <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 min-w-0 flex-shrink-0 text-center">Items</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 min-w-0 flex-shrink-0">:</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 line-clamp-2 min-w-0">{ticket.items}</div>
                </div>
              )}

              {ticket.notes && ticket.notes.trim() !== '' && (
                <div className="flex items-center gap-2 p-2 rounded bg-blue-50/80 border-l-3 border-blue-500 dark:bg-blue-950/10">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 min-w-0 flex-shrink-0 text-center">Notes</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 min-w-0 flex-shrink-0">:</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2 min-w-0">{ticket.notes}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* View Details Button - Fixed at bottom for consistent card height */}
        <div className="px-6 pb-4 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsDetailOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0">
          {/* Header - Fixed */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 relative">
            <DialogHeader className="text-center">
              <DialogTitle>
                {isEditing ? `Edit Order - ${ticket.order_no}` : `Order Details - ${ticket.order_no}`}
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Description */}
            <div className="text-sm text-muted-foreground">
              {isEditing 
                ? "Update repair order information (Admin access)" 
                : `Complete information about repair order for ${ticket.dept}`}
            </div>

            {isEditing ? (
              <EditTicketForm 
                ticket={ticket}
                onSave={handleTicketSave}
                onCancel={handleEditCancel}
                onDelete={onTicketDelete}
              />
            ) : (
              <>
            {/* Header Information */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('order_no')}</label>
                <p className="text-lg font-semibold text-foreground mt-1">{ticket.order_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('status')}</label>
                <Badge variant="outline" className={`${getStatusColor(ticket.status)} mt-1`}>
                  {formatStatus(ticket.status)}
                </Badge>
              </div>
              {ticket.priority && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{getDisplayName('priority')}</label>
                  <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} mt-1`}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            {/* Subject and Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">{getDisplayName('subject')}</label>
              <h3 className="text-lg font-semibold text-foreground mt-1">{ticket.subject}</h3>
            </div>

            {/* Device and Reporter Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('name')}</label>
                <p className="text-foreground mt-1">{ticket.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('dept')}</label>
                <p className="text-foreground mt-1">{ticket.dept}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('emp')}</label>
                <p className="text-foreground mt-1">{ticket.emp}</p>
              </div>
              {ticket.emprepair && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{getDisplayName('emprepair')}</label>
                  <p className="text-foreground mt-1">{ticket.emprepair}</p>
                </div>
              )}
            </div>

            {/* Technical Information - Clean Design */}
            <div className="space-y-3">
              {ticket.rootcause && ticket.rootcause.trim() !== '' && (
                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50/50 dark:bg-red-950/10">
                  <label className="text-sm font-medium text-red-700 dark:text-red-300">{getDisplayName('rootcause')}</label>
                  <p className="text-red-600 dark:text-red-400 mt-1 leading-relaxed">{ticket.rootcause}</p>
                </div>
              )}

              {ticket.action && ticket.action.trim() !== '' && (
                <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/50 dark:bg-amber-950/10">
                  <label className="text-sm font-medium text-amber-700 dark:text-amber-300">{getDisplayName('action')}</label>
                  <p className="text-amber-600 dark:text-amber-400 mt-1 leading-relaxed">{ticket.action}</p>
                </div>
              )}

              {ticket.items && ticket.items.trim() !== '' && (
                <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50/50 dark:bg-yellow-950/10">
                  <label className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{getDisplayName('items')}</label>
                  <p className="text-yellow-600 dark:text-yellow-400 mt-1 leading-relaxed">{ticket.items}</p>
                </div>
              )}

              {ticket.notes && ticket.notes.trim() !== '' && (
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-950/10">
                  <label className="text-sm font-medium text-blue-700 dark:text-blue-300">{getDisplayName('notes')}</label>
                  <p className="text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">{ticket.notes}</p>
                </div>
              )}
            </div>

            {/* Timestamps and Device Type */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('insert_date')}</label>
                <p className="text-foreground mt-1">{formatDate(ticket.insert_date)}</p>
              </div>
              {ticket.deviceType && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{getDisplayName('deviceType')}</label>
                  <p className="text-foreground mt-1">{ticket.deviceType}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">{getDisplayName('last_date')}</label>
                <p className="text-foreground mt-1">{formatDate(ticket.last_date)}</p>
              </div>
            </div>

              </>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="mt-auto bg-background border-t px-6 py-4">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleEditCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  form="edit-ticket-form"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => onTicketDelete && onTicketDelete(ticket.order_no)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1">
                  Download Report
                </Button>
                <Button className="flex-1">
                  Contact Support
                </Button>
                {isAdmin() && (
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketCard;