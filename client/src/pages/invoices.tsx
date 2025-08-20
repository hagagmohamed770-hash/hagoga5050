import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Receipt, DollarSign, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string;
  linkedTransactionId: string | null;
  linkedProjectId: string | null;
  linkedClientId: string | null;
  linkedPartnerId: string | null;
  description: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Partner {
  id: string;
  name: string;
}

export default function Invoices() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("فشل في جلب الفواتير");
      return response.json();
    },
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("فشل في جلب المشاريع");
      return response.json();
    },
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("فشل في جلب العملاء");
      return response.json();
    },
  });

  // Fetch partners
  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: async () => {
      const response = await fetch("/api/partners");
      if (!response.ok) throw new Error("فشل في جلب الشركاء");
      return response.json();
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء الفاتورة بنجاح",
        description: "تم إضافة الفاتورة الجديدة إلى النظام",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
      toast({
        title: "تم تحديث الفاتورة بنجاح",
        description: "تم تحديث بيانات الفاتورة",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف الفاتورة");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "تم حذف الفاتورة بنجاح",
        description: "تم حذف الفاتورة من النظام",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateInvoice = (data: any) => {
    createInvoiceMutation.mutate(data);
  };

  const handleUpdateInvoice = (data: any) => {
    if (selectedInvoice) {
      updateInvoiceMutation.mutate({ id: selectedInvoice.id, data });
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "مدفوعة") {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 ml-1" />مدفوعة</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />غير مدفوعة</Badge>;
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "غير محدد";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "غير محدد";
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "غير محدد";
  };

  const getPartnerName = (partnerId: string | null) => {
    if (!partnerId) return "غير محدد";
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || "غير محدد";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  const totalAmount = invoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const paidInvoices = invoices.filter(i => i.status === "مدفوعة");
  const unpaidInvoices = invoices.filter(i => i.status === "غير مدفوعة");
  const totalPaid = paidInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
          <p className="text-gray-600 mt-2">إدارة الفواتير والمدفوعات</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات الفاتورة الجديدة
              </DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm 
              onSubmit={handleCreateInvoice} 
              projects={projects}
              customers={customers}
              partners={partners}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">فاتورة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المدفوعة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير غير المدفوعة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalUnpaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">فاتورة #{invoice.invoiceNumber}</CardTitle>
                  <CardDescription className="mt-2">
                    {invoice.description || "لا يوجد وصف"}
                  </CardDescription>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-semibold">{parseFloat(invoice.amount).toLocaleString()} ج.م</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">تاريخ الاستحقاق:</span>
                  <span className="font-semibold">{format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: ar })}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المشروع:</span>
                  <span className="font-semibold">{getProjectName(invoice.linkedProjectId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-semibold">{getCustomerName(invoice.linkedClientId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الشريك:</span>
                  <span className="font-semibold">{getPartnerName(invoice.linkedPartnerId)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {format(new Date(invoice.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الفاتورة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الفاتورة
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <EditInvoiceForm 
              invoice={selectedInvoice} 
              onSubmit={handleUpdateInvoice}
              projects={projects}
              customers={customers}
              partners={partners}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateInvoiceForm({ 
  onSubmit, 
  projects, 
  customers, 
  partners 
}: { 
  onSubmit: (data: any) => void;
  projects: Project[];
  customers: Customer[];
  partners: Partner[];
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    status: "غير مدفوعة",
    dueDate: new Date().toISOString().split('T')[0],
    linkedProjectId: "",
    linkedClientId: "",
    linkedPartnerId: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
        <Input
          id="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">الحالة</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="مدفوعة">مدفوعة</SelectItem>
              <SelectItem value="غير مدفوعة">غير مدفوعة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="linkedProjectId">المشروع</Label>
        <Select value={formData.linkedProjectId} onValueChange={(value) => setFormData({ ...formData, linkedProjectId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المشروع" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedClientId">العميل</Label>
          <Select value={formData.linkedClientId} onValueChange={(value) => setFormData({ ...formData, linkedClientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="linkedPartnerId">الشريك</Label>
          <Select value={formData.linkedPartnerId} onValueChange={(value) => setFormData({ ...formData, linkedPartnerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الشريك" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء الفاتورة</Button>
      </div>
    </form>
  );
}

function EditInvoiceForm({ 
  invoice, 
  onSubmit, 
  projects, 
  customers, 
  partners 
}: { 
  invoice: Invoice;
  onSubmit: (data: any) => void;
  projects: Project[];
  customers: Customer[];
  partners: Partner[];
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    status: invoice.status,
    dueDate: invoice.dueDate.split('T')[0],
    linkedProjectId: invoice.linkedProjectId || "",
    linkedClientId: invoice.linkedClientId || "",
    linkedPartnerId: invoice.linkedPartnerId || "",
    description: invoice.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-invoiceNumber">رقم الفاتورة</Label>
        <Input
          id="edit-invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-amount">المبلغ</Label>
          <Input
            id="edit-amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-status">الحالة</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="مدفوعة">مدفوعة</SelectItem>
              <SelectItem value="غير مدفوعة">غير مدفوعة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-dueDate">تاريخ الاستحقاق</Label>
        <Input
          id="edit-dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-linkedProjectId">المشروع</Label>
        <Select value={formData.linkedProjectId} onValueChange={(value) => setFormData({ ...formData, linkedProjectId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المشروع" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-linkedClientId">العميل</Label>
          <Select value={formData.linkedClientId} onValueChange={(value) => setFormData({ ...formData, linkedClientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-linkedPartnerId">الشريك</Label>
          <Select value={formData.linkedPartnerId} onValueChange={(value) => setFormData({ ...formData, linkedPartnerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الشريك" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-description">الوصف</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث الفاتورة</Button>
      </div>
    </form>
  );
}