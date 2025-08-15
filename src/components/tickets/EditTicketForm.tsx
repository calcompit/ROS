import React, { useState } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Ticket } from './TicketCard';
import { repairOrdersApi } from '@/services/api';
import { useDatabase } from '@/contexts/DatabaseContext';

interface EditTicketFormProps {
  ticket: Ticket;
  onSave: (updatedTicket: Ticket) => void;
  onCancel: () => void;
  onDelete: (orderNo: string | number) => void;
}

const EditTicketForm: React.FC<EditTicketFormProps> = ({ ticket, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    subject: ticket.subject,        // Issue Title -> Subject
    rootcause: ticket.rootcause || '',  // Problem Description -> Root Cause
    status: ticket.status,
    priority: ticket.priority || 'medium',
    deviceType: ticket.deviceType || '',
    emp_repair: ticket.emprepair || '',   // Technician -> emp_repair
    items: ticket.items || '',             // New field
    action: ticket.action || '',           // New field
    notes: ticket.notes || '',             // Notes field
    name: ticket.name,                     // PC/Device name (read-only)
    dept: ticket.dept,                     // Department (read-only)
    emp: ticket.emp                        // Reporter (read-only)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { forceRedirectToError } = useDatabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await repairOrdersApi.update(ticket.order_no, {
        subject: formData.subject,
        rootcause: formData.rootcause,
        status: formData.status,
        emprepair: formData.emp_repair,
        items: formData.items,
        action: formData.action,
        notes: formData.notes
      });

      if (response.success) {
        if (response.demo) {
          toast({
            title: "⚠️ Demo Mode",
            description: "Database connection failed. Redirecting to error page...",
            variant: "destructive"
          });
          // Redirect to error page after a short delay
          setTimeout(() => {
            forceRedirectToError();
          }, 2000);
        } else {
          onSave(response.data);
          toast({
            title: "Repair order updated successfully!",
            description: `Order ${ticket.order_no} has been updated.`,
          });
        }
      } else {
        throw new Error(response.message || 'Failed to update repair order');
      }
    } catch (error) {
      console.error('Error updating repair order:', error);
      toast({
        title: "Error updating ticket",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Read-only Basic Information */}
      <div className="grid gap-4 md:grid-cols-3 p-3 bg-muted/50 rounded-lg">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Order No.</Label>
          <p className="text-sm font-medium">{ticket.order_no}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Device/PC Name</Label>
          <p className="text-sm">{ticket.name}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Department</Label>
          <p className="text-sm">{ticket.dept}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-subject">Issue Subject</Label>
          <Input
            id="edit-subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-deviceType">Device Type</Label>
          <Select 
            value={formData.deviceType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laptop">Laptop</SelectItem>
              <SelectItem value="Desktop">Desktop Computer</SelectItem>
              <SelectItem value="Tablet">Tablet</SelectItem>
              <SelectItem value="Smartphone">Smartphone</SelectItem>
              <SelectItem value="Printer">Printer</SelectItem>
              <SelectItem value="Scanner">Scanner</SelectItem>
              <SelectItem value="Monitor">Monitor</SelectItem>
              <SelectItem value="Network Equipment">Network Equipment</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-items">Equipment/Items Details</Label>
        <Textarea
          id="edit-items"
          placeholder="Detailed information about the equipment (model, specifications, etc.)"
          value={formData.items}
          onChange={(e) => setFormData(prev => ({ ...prev, items: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-rootcause">Root Cause Analysis</Label>
        <Textarea
          id="edit-rootcause"
          placeholder="Describe the root cause of the issue"
          value={formData.rootcause}
          onChange={(e) => setFormData(prev => ({ ...prev, rootcause: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-action">Action Taken</Label>
        <Textarea
          id="edit-action"
          placeholder="Describe the actions taken to resolve the issue"
          value={formData.action}
          onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Ticket['status'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" className="text-yellow-600">🟡 Pending</SelectItem>
              <SelectItem value="in-progress" className="text-blue-600">🔵 In Progress</SelectItem>
              <SelectItem value="completed" className="text-green-600">🟢 Completed</SelectItem>
              <SelectItem value="cancelled" className="text-red-600">🔴 Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-priority">Priority Level</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Ticket['priority'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

            <div className="space-y-2">
        <Label htmlFor="edit-emp_repair">Assigned Technician</Label>
        <Input
          id="edit-emp_repair"
          placeholder="Enter technician name"
          value={formData.emp_repair}
          onChange={(e) => setFormData(prev => ({ ...prev, emp_repair: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Additional Notes</Label>
        <Textarea
          id="edit-notes"
          placeholder="Add additional notes or comments..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={() => onDelete && onDelete(ticket.order_no)}
          disabled={isSubmitting || !onDelete}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </form>
  );
};

export default EditTicketForm;
