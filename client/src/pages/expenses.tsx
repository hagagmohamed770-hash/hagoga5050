import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingDown, BarChart3, Tag } from "lucide-react";
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

interface Expense {
  id: string;
  amount: string;
  date: string;
  projectId: string | null;
  category: string;
  description: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

const EXPENSE_CATEGORIES = [
  "مواد بناء",
  "أجور عمال",
  "مصاريف إدارية",
  "مصاريف كهرباء",
  "مصاريف مياه",
  "مصاريف صيانة",
  "مصاريف نقل",
  "مصاريف أخرى"
];

export default function Expenses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await fetch("/api/expenses");
      if (!response.ok) throw new Error("فشل في جلب المصروفات");
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

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء المصروف");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء المصروف بنجاح",
        description: "تم إضافة المصروف الجديد إلى النظام",
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

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث المصروف");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      toast({
        title: "تم تحديث المصروف بنجاح",
        description: "تم تحديث بيانات المصروف",
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

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف المصروف");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "تم حذف المصروف بنجاح",
        description: "تم حذف المصروف من النظام",
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

  const handleCreateExpense = (data: any) => {
    createExpenseMutation.mutate(data);
  };

  const handleUpdateExpense = (data: any) => {
    if (selectedExpense) {
      updateExpenseMutation.mutate({ id: selectedExpense.id, data });
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "غير محدد";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      "مواد بناء": "bg-blue-100 text-blue-800",
      "أجور عمال": "bg-green-100 text-green-800",
      "مصاريف إدارية": "bg-purple-100 text-purple-800",
      "مصاريف كهرباء": "bg-yellow-100 text-yellow-800",
      "مصاريف مياه": "bg-cyan-100 text-cyan-800",
      "مصاريف صيانة": "bg-orange-100 text-orange-800",
      "مصاريف نقل": "bg-pink-100 text-pink-800",
      "مصاريف أخرى": "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        <Tag className="w-3 h-3 ml-1" />
        {category}
      </Badge>
    );
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

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المصروفات</h1>
          <p className="text-gray-600 mt-2">إدارة المصروفات المالية</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مصروف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مصروف جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المصروف الجديد
              </DialogDescription>
            </DialogHeader>
            <CreateExpenseForm 
              onSubmit={handleCreateExpense} 
              projects={projects}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصروفات هذا الشهر</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{thisMonthExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المصروفات</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">مصروف</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
          <CardDescription>إجمالي المصروفات لكل فئة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="text-center p-4 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{category}</div>
                <div className="text-lg font-bold text-red-600">{amount.toLocaleString()} ج.م</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">مصروف #{expense.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="mt-2">
                    {expense.description || "لا يوجد وصف"}
                  </CardDescription>
                </div>
                <div className="text-red-600">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-semibold text-red-600">{parseFloat(expense.amount).toLocaleString()} ج.م</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-semibold">{format(new Date(expense.date), "dd/MM/yyyy", { locale: ar })}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المشروع:</span>
                  <span className="font-semibold">{getProjectName(expense.projectId)}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  {getCategoryBadge(expense.category)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {format(new Date(expense.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.id)}
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
            <DialogTitle>تعديل المصروف</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المصروف
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <EditExpenseForm 
              expense={selectedExpense} 
              onSubmit={handleUpdateExpense}
              projects={projects}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateExpenseForm({ 
  onSubmit, 
  projects 
}: { 
  onSubmit: (data: any) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    projectId: "",
    category: "مصاريف أخرى",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="date">تاريخ المصروف</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="projectId">المشروع</Label>
        <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
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
      
      <div>
        <Label htmlFor="category">فئة المصروف</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
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
        <Button type="submit">إنشاء المصروف</Button>
      </div>
    </form>
  );
}

function EditExpenseForm({ 
  expense, 
  onSubmit, 
  projects 
}: { 
  expense: Expense;
  onSubmit: (data: any) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    amount: expense.amount,
    date: expense.date.split('T')[0],
    projectId: expense.projectId || "",
    category: expense.category,
    description: expense.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="edit-date">تاريخ المصروف</Label>
        <Input
          id="edit-date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-projectId">المشروع</Label>
        <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
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
      
      <div>
        <Label htmlFor="edit-category">فئة المصروف</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
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
        <Button type="submit">تحديث المصروف</Button>
      </div>
    </form>
  );
}