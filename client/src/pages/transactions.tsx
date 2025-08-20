import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, CreditCard, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
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

interface Transaction {
  id: string;
  transactionType: string;
  amount: string;
  date: string;
  linkedInvoiceId: string | null;
  linkedProjectId: string | null;
  linkedClientId: string | null;
  linkedPartnerId: string | null;
  cashboxId: string | null;
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

interface Cashbox {
  id: string;
  name: string;
}

export default function Transactions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("فشل في جلب المعاملات");
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

  // Fetch cashboxes
  const { data: cashboxes = [] } = useQuery<Cashbox[]>({
    queryKey: ["cashboxes"],
    queryFn: async () => {
      const response = await fetch("/api/cashboxes");
      if (!response.ok) throw new Error("فشل في جلب الخزائن");
      return response.json();
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء المعاملة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء المعاملة بنجاح",
        description: "تم إضافة المعاملة الجديدة إلى النظام",
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

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث المعاملة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
      toast({
        title: "تم تحديث المعاملة بنجاح",
        description: "تم تحديث بيانات المعاملة",
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

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف المعاملة");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "تم حذف المعاملة بنجاح",
        description: "تم حذف المعاملة من النظام",
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

  const handleCreateTransaction = (data: any) => {
    createTransactionMutation.mutate(data);
  };

  const handleUpdateTransaction = (data: any) => {
    if (selectedTransaction) {
      updateTransactionMutation.mutate({ id: selectedTransaction.id, data });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    if (type === "قبض") {
      return <Badge variant="default" className="bg-green-100 text-green-800"><TrendingUp className="w-3 h-3 ml-1" />قبض</Badge>;
    } else {
      return <Badge variant="destructive"><TrendingDown className="w-3 h-3 ml-1" />صرف</Badge>;
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

  const getCashboxName = (cashboxId: string | null) => {
    if (!cashboxId) return "غير محدد";
    const cashbox = cashboxes.find(c => c.id === cashboxId);
    return cashbox?.name || "غير محدد";
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

  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const incomeTransactions = transactions.filter(t => t.transactionType === "قبض");
  const expenseTransactions = transactions.filter(t => t.transactionType === "صرف");
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المعاملات</h1>
          <p className="text-gray-600 mt-2">إدارة المعاملات المالية</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة معاملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة معاملة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات المعاملة الجديدة
              </DialogDescription>
            </DialogHeader>
            <CreateTransactionForm 
              onSubmit={handleCreateTransaction} 
              projects={projects}
              customers={customers}
              partners={partners}
              cashboxes={cashboxes}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعاملات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">معاملة</p>
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
            <CardTitle className="text-sm font-medium">إجمالي القبض</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الصرف</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">معاملة #{transaction.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="mt-2">
                    {transaction.description || "لا يوجد وصف"}
                  </CardDescription>
                </div>
                {getTransactionTypeBadge(transaction.transactionType)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-semibold">{parseFloat(transaction.amount).toLocaleString()} ج.م</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-semibold">{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ar })}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المشروع:</span>
                  <span className="font-semibold">{getProjectName(transaction.linkedProjectId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-semibold">{getCustomerName(transaction.linkedClientId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الشريك:</span>
                  <span className="font-semibold">{getPartnerName(transaction.linkedPartnerId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الخزنة:</span>
                  <span className="font-semibold">{getCashboxName(transaction.cashboxId)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {format(new Date(transaction.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction.id)}
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
            <DialogTitle>تعديل المعاملة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المعاملة
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <EditTransactionForm 
              transaction={selectedTransaction} 
              onSubmit={handleUpdateTransaction}
              projects={projects}
              customers={customers}
              partners={partners}
              cashboxes={cashboxes}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateTransactionForm({ 
  onSubmit, 
  projects, 
  customers, 
  partners, 
  cashboxes 
}: { 
  onSubmit: (data: any) => void;
  projects: Project[];
  customers: Customer[];
  partners: Partner[];
  cashboxes: Cashbox[];
}) {
  const [formData, setFormData] = useState({
    transactionType: "قبض",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    linkedProjectId: "",
    linkedClientId: "",
    linkedPartnerId: "",
    cashboxId: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="transactionType">نوع المعاملة</Label>
          <Select value={formData.transactionType} onValueChange={(value) => setFormData({ ...formData, transactionType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="قبض">قبض</SelectItem>
              <SelectItem value="صرف">صرف</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      </div>
      
      <div>
        <Label htmlFor="date">تاريخ المعاملة</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
        <Label htmlFor="cashboxId">الخزنة</Label>
        <Select value={formData.cashboxId} onValueChange={(value) => setFormData({ ...formData, cashboxId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الخزنة" />
          </SelectTrigger>
          <SelectContent>
            {cashboxes.map((cashbox) => (
              <SelectItem key={cashbox.id} value={cashbox.id}>
                {cashbox.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button type="submit">إنشاء المعاملة</Button>
      </div>
    </form>
  );
}

function EditTransactionForm({ 
  transaction, 
  onSubmit, 
  projects, 
  customers, 
  partners, 
  cashboxes 
}: { 
  transaction: Transaction;
  onSubmit: (data: any) => void;
  projects: Project[];
  customers: Customer[];
  partners: Partner[];
  cashboxes: Cashbox[];
}) {
  const [formData, setFormData] = useState({
    transactionType: transaction.transactionType,
    amount: transaction.amount,
    date: transaction.date.split('T')[0],
    linkedProjectId: transaction.linkedProjectId || "",
    linkedClientId: transaction.linkedClientId || "",
    linkedPartnerId: transaction.linkedPartnerId || "",
    cashboxId: transaction.cashboxId || "",
    description: transaction.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-transactionType">نوع المعاملة</Label>
          <Select value={formData.transactionType} onValueChange={(value) => setFormData({ ...formData, transactionType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="قبض">قبض</SelectItem>
              <SelectItem value="صرف">صرف</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      </div>
      
      <div>
        <Label htmlFor="edit-date">تاريخ المعاملة</Label>
        <Input
          id="edit-date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
        <Label htmlFor="edit-cashboxId">الخزنة</Label>
        <Select value={formData.cashboxId} onValueChange={(value) => setFormData({ ...formData, cashboxId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الخزنة" />
          </SelectTrigger>
          <SelectContent>
            {cashboxes.map((cashbox) => (
              <SelectItem key={cashbox.id} value={cashbox.id}>
                {cashbox.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button type="submit">تحديث المعاملة</Button>
      </div>
    </form>
  );
}