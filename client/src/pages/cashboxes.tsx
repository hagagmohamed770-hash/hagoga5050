import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Wallet, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Cashbox {
  id: string;
  name: string;
  initialBalance: string;
  currentBalance: string;
  createdAt: string;
}

export default function Cashboxes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCashbox, setSelectedCashbox] = useState<Cashbox | null>(null);
  const queryClient = useQueryClient();

  // Fetch cashboxes
  const { data: cashboxes = [], isLoading } = useQuery<Cashbox[]>({
    queryKey: ["cashboxes"],
    queryFn: async () => {
      const response = await fetch("/api/cashboxes");
      if (!response.ok) throw new Error("فشل في جلب الخزائن");
      return response.json();
    },
  });

  // Create cashbox mutation
  const createCashboxMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/cashboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء الخزنة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashboxes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء الخزنة بنجاح",
        description: "تم إضافة الخزنة الجديدة إلى النظام",
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

  // Update cashbox mutation
  const updateCashboxMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/cashboxes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث الخزنة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashboxes"] });
      setIsEditDialogOpen(false);
      setSelectedCashbox(null);
      toast({
        title: "تم تحديث الخزنة بنجاح",
        description: "تم تحديث بيانات الخزنة",
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

  // Delete cashbox mutation
  const deleteCashboxMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cashboxes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف الخزنة");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashboxes"] });
      toast({
        title: "تم حذف الخزنة بنجاح",
        description: "تم حذف الخزنة من النظام",
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

  const handleCreateCashbox = (data: any) => {
    createCashboxMutation.mutate(data);
  };

  const handleUpdateCashbox = (data: any) => {
    if (selectedCashbox) {
      updateCashboxMutation.mutate({ id: selectedCashbox.id, data });
    }
  };

  const handleDeleteCashbox = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزنة؟")) {
      deleteCashboxMutation.mutate(id);
    }
  };

  const getBalanceStatus = (initialBalance: string, currentBalance: string) => {
    const initial = parseFloat(initialBalance);
    const current = parseFloat(currentBalance);
    const difference = current - initial;
    
    if (difference > 0) {
      return { variant: "default", text: "رصيد إيجابي", color: "text-green-600", icon: TrendingUp };
    } else if (difference < 0) {
      return { variant: "destructive", text: "رصيد سالب", color: "text-red-600", icon: TrendingDown };
    } else {
      return { variant: "secondary", text: "رصيد متوازن", color: "text-gray-600", icon: TrendingUp };
    }
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

  const totalInitialBalance = cashboxes.reduce((sum, c) => sum + parseFloat(c.initialBalance), 0);
  const totalCurrentBalance = cashboxes.reduce((sum, c) => sum + parseFloat(c.currentBalance), 0);
  const totalDifference = totalCurrentBalance - totalInitialBalance;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الخزائن</h1>
          <p className="text-gray-600 mt-2">إدارة الخزائن والأرصدة المالية</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة خزنة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة خزنة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات الخزنة الجديدة
              </DialogDescription>
            </DialogHeader>
            <CreateCashboxForm onSubmit={handleCreateCashbox} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخزائن</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashboxes.length}</div>
            <p className="text-xs text-muted-foreground">خزنة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرصيد الأولي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInitialBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرصيد الحالي</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفرق</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalDifference >= 0 ? '+' : ''}{totalDifference.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* Cashboxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashboxes.map((cashbox) => {
          const balanceStatus = getBalanceStatus(cashbox.initialBalance, cashbox.currentBalance);
          const difference = parseFloat(cashbox.currentBalance) - parseFloat(cashbox.initialBalance);
          
          return (
            <Card key={cashbox.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cashbox.name}</CardTitle>
                    <CardDescription className="mt-2">
                      تم الإنشاء في {format(new Date(cashbox.createdAt), "dd/MM/yyyy", { locale: ar })}
                    </CardDescription>
                  </div>
                  <Badge variant={balanceStatus.variant as any}>{balanceStatus.text}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الرصيد الأولي:</span>
                    <span className="font-semibold">{parseFloat(cashbox.initialBalance).toLocaleString()} ج.م</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الرصيد الحالي:</span>
                    <span className="font-semibold">{parseFloat(cashbox.currentBalance).toLocaleString()} ج.م</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الفرق:</span>
                    <span className={`font-semibold ${balanceStatus.color}`}>
                      {difference >= 0 ? '+' : ''}{difference.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCashbox(cashbox);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCashbox(cashbox.id)}
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الخزنة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الخزنة
            </DialogDescription>
          </DialogHeader>
          {selectedCashbox && (
            <EditCashboxForm 
              cashbox={selectedCashbox} 
              onSubmit={handleUpdateCashbox} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateCashboxForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    initialBalance: "",
    currentBalance: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم الخزنة</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="initialBalance">الرصيد الأولي</Label>
        <Input
          id="initialBalance"
          type="number"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="currentBalance">الرصيد الحالي</Label>
        <Input
          id="currentBalance"
          type="number"
          value={formData.currentBalance}
          onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء الخزنة</Button>
      </div>
    </form>
  );
}

function EditCashboxForm({ cashbox, onSubmit }: { cashbox: Cashbox; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: cashbox.name,
    initialBalance: cashbox.initialBalance,
    currentBalance: cashbox.currentBalance,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">اسم الخزنة</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-initialBalance">الرصيد الأولي</Label>
        <Input
          id="edit-initialBalance"
          type="number"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-currentBalance">الرصيد الحالي</Label>
        <Input
          id="edit-currentBalance"
          type="number"
          value={formData.currentBalance}
          onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث الخزنة</Button>
      </div>
    </form>
  );
}