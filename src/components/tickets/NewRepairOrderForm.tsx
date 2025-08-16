import { useState, useEffect } from 'react';
import { Plus, Monitor, Laptop, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Ticket } from './TicketCard';
import { subjectsApi, departmentsApi, repairOrdersApi } from '@/services/api';
import { useDatabase } from '@/contexts/DatabaseContext';

interface NewRepairOrderFormProps {
  onSubmit?: (ticket: Ticket) => void;
}

const NewRepairOrderForm = ({ onSubmit }: NewRepairOrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<{ subject: string }[]>([]);
  const [departments, setDepartments] = useState<{ dept: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  
  const [formData, setFormData] = useState({
    subject: '',
    name: '',
    dept: '',
    emp: '',
    deviceType: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Load subjects and departments from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [subjectsResponse, departmentsResponse] = await Promise.all([
          subjectsApi.getAll(),
          departmentsApi.getAll()
        ]);
        
        if (subjectsResponse.success) {
          setSubjects(subjectsResponse.data);
        }
        
        if (departmentsResponse.success) {
          console.log('📊 Departments API Response:', departmentsResponse);
          console.log('📋 Departments Data:', departmentsResponse.data);
          setDepartments(departmentsResponse.data);
        }
        

      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          title: "Error loading form data",
          description: "Please refresh the page to try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Generate order number
  const generateOrderNo = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-3);
    return `RO-${year}-${timestamp}`;
  };

  // Get device type icon
  const getDeviceTypeIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'computer':
        return <Monitor className="h-4 w-4 text-blue-600" />;
      case 'laptop':
        return <Laptop className="h-4 w-4 text-green-600" />;
      case 'other':
        return <Smartphone className="h-4 w-4 text-purple-600" />;
      default:
        return <Smartphone className="h-4 w-4 text-purple-600" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await repairOrdersApi.create({
        subject: formData.subject,
        name: formData.name,
        dept: formData.dept,
        emp: formData.emp,
        device_type: formData.deviceType,
        items: '',
        notes: formData.notes,

        action: '',
        emprepair: '',
        status: 'pending',

      });

      if (response.success) {
        onSubmit?.(response.data);
        
        toast({
          title: "Repair order created successfully!",
          description: `Your repair order ${response.data?.order_no || 'has been submitted'} and is pending review.`,
        });

        // Reset form
        setFormData({
          subject: '',
          name: '',
          dept: '',
          emp: '',
          deviceType: '',

          notes: '',
          priority: 'medium'
        });
      } else {
        throw new Error(response.message || 'Failed to create repair order');
      }
    } catch (error) {
      console.error('Error creating repair order:', error);
      toast({
        title: "Error creating repair order",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card w-full max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Plus className="h-5 w-5 text-primary" />
          Create New Repair Order
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Issue Description</Label>
              <Input
                id="subject"
                placeholder="Brief description of the problem"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-muted/30 focus:bg-background transition-colors"
                required
              />
              {/* Quick Issue Templates */}
              <div className="flex flex-wrap gap-2 mt-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading subjects...</div>
                ) : subjects.length > 0 ? (
                  subjects.slice(0, 8).map((subject, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, subject: subject.subject }))}
                      className="text-xs"
                    >
                      {subject.subject}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No subjects available</div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select 
                value={formData.deviceType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}
                required
              >
                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                    <SelectValue placeholder="Select device type">
                    {formData.deviceType && (
                      <div className="flex items-center gap-2">
                        {formData.deviceType === 'Computer' && <Monitor className="h-4 w-4 text-blue-600" />}
                        {formData.deviceType === 'Laptop' && <Laptop className="h-4 w-4 text-green-600" />}
                        {formData.deviceType === 'Other' && <Smartphone className="h-4 w-4 text-purple-600" />}
                        {formData.deviceType}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer">
                    <div className="flex items-center gap-3 w-full">
                      <Monitor className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span>Computer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Laptop">
                    <div className="flex items-center gap-3 w-full">
                      <Laptop className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Laptop</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-3 w-full">
                      <Smartphone className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span>Other</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Device/PC Name</Label>
              <Input
                id="name"
                placeholder="P123456789"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-muted/30 focus:bg-background transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dept">Department</Label>
              <Select 
                value={formData.dept} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, dept: value }))}
                required
              >
                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                  ) : departments.length > 0 ? (
                    departments.map((dept, index) => (
                      <SelectItem key={index} value={dept.dept}>
                        {dept.dept}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No departments available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp">Reported By</Label>
              <Input
                id="emp"
                placeholder="Employee name"
                value={formData.emp}
                onChange={(e) => setFormData(prev => ({ ...prev, emp: e.target.value }))}
                className="bg-muted/30 focus:bg-background transition-colors"
                required
              />
            </div>
          </div>



          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or comments..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-muted/30 focus:bg-background transition-colors"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low" className="text-green-600">🟢 Low - Non-urgent</SelectItem>
                <SelectItem value="medium" className="text-blue-600">🔵 Medium - Normal</SelectItem>
                <SelectItem value="high" className="text-orange-600">🟠 High - Important</SelectItem>
                <SelectItem value="urgent" className="text-red-600">🔴 Urgent - Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Order...' : 'Create Repair Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewRepairOrderForm;
