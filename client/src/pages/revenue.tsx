import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Revenue {
  id: string;
  amount: string;
  date: string;
  projectId: string | null;
  description: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Revenue() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const queryClient = useQueryClient();

  // Fetch revenue
  const { data: revenue = [], isLoading } = useQuery<Revenue[]>({
    queryKey: ["revenue"],
    queryFn: async () => {
      const response = await fetch("/api/revenue");
      if (!response.ok) throw new Error("فشل في جلب الإيرادات");
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

  // Create revenue mutation
  const createRevenueMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء الإيراد");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء الإيراد بنجاح",
        description: "تم إضافة الإيراد الجديد إلى النظام",
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

  // Update revenue mutation
  const updateRevenueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/revenue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث الإيراد");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      setIsEditDialogOpen(false);
      setSelectedRevenue(null);
      toast({
        title: "تم تحديث الإيراد بنجاح",
        description: "تم تحديث بيانات الإيراد",
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

  // Delete revenue mutation
  const deleteRevenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/revenue/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف الإيراد");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      toast({
        title: "تم حذف الإيراد بنجاح",
        description: "تم حذف الإيراد من النظام",
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

  const handleCreateRevenue = (data: any) => {
    createRevenueMutation.mutate(data);
  };

  const handleUpdateRevenue = (data: any) => {
    if (selectedRevenue) {
      updateRevenueMutation.mutate({ id: selectedRevenue.id, data });
    }
  };

  const handleDeleteRevenue = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الإيراد؟")) {
      deleteRevenueMutation.mutate(id);
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "غير محدد";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
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

  const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const thisMonthRevenue = revenue.filter(r => {
    const revenueDate = new Date(r.date);
    const now = new Date();
    return revenueDate.getMonth() === now.getMonth() && revenueDate.getFullYear() === now.getFullYear();
  }).reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الإيرادات</h1>
          <p className="text-gray-600 mt-2">إدارة الإيرادات المالية</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة إيراد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة إيراد جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الإيراد الجديد
              </DialogDescription>
            </DialogHeader>
            <CreateRevenueForm 
              onSubmit={handleCreateRevenue} 
              projects={projects}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات هذا الشهر</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{thisMonthRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الإيرادات</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.length}</div>
            <p className="text-xs text-muted-foreground">إيراد</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revenue.map((revenueItem) => (
          <Card key={revenueItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">إيراد #{revenueItem.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="mt-2">
                    {revenueItem.description || "لا يوجد وصف"}
                  </CardDescription>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-semibold text-green-600">{parseFloat(revenueItem.amount).toLocaleString()} ج.م</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-semibold">{format(new Date(revenueItem.date), "dd/MM/yyyy", { locale: ar })}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المشروع:</span>
                  <span className="font-semibold">{getProjectName(revenueItem.projectId)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {format(new Date(revenueItem.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRevenue(revenueItem);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRevenue(revenueItem.id)}
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
            <DialogTitle>تعديل الإيراد</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الإيراد
            </DialogDescription>
          </DialogHeader>
          {selectedRevenue && (
            <EditRevenueForm 
              revenue={selectedRevenue} 
              onSubmit={handleUpdateRevenue}
              projects={projects}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateRevenueForm({ 
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
        <Label htmlFor="date">تاريخ الإيراد</Label>
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
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء الإيراد</Button>
      </div>
    </form>
  );
}

function EditRevenueForm({ 
  revenue, 
  onSubmit, 
  projects 
}: { 
  revenue: Revenue;
  onSubmit: (data: any) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    amount: revenue.amount,
    date: revenue.date.split('T')[0],
    projectId: revenue.projectId || "",
    description: revenue.description || "",
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
        <Label htmlFor="edit-date">تاريخ الإيراد</Label>
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
        <Label htmlFor="edit-description">الوصف</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث الإيراد</Button>
      </div>
    </form>
  );
}