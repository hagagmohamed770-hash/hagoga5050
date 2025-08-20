import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calculator, DollarSign, Calendar, UserCheck, TrendingUp } from "lucide-react";
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

interface Settlement {
  id: string;
  partnerId: string;
  paymentAmount: string;
  previousBalance: string;
  outstandingAmount: string;
  finalBalance: string;
  date: string;
  linkedProjectId: string;
  notes: string | null;
  createdAt: string;
  partner?: {
    name: string;
  };
  project?: {
    name: string;
  };
}

interface Partner {
  id: string;
  name: string;
  sharePercentage: string;
  currentBalance: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Settlements() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch settlements
  const { data: settlements = [], isLoading } = useQuery<Settlement[]>({
    queryKey: ["settlements"],
    queryFn: async () => {
      const response = await fetch("/api/settlements");
      if (!response.ok) throw new Error("فشل في جلب التسويات");
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

  // Fetch partners
  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: async () => {
      const response = await fetch("/api/partners");
      if (!response.ok) throw new Error("فشل في جلب الشركاء");
      return response.json();
    },
  });

  // Create settlement mutation
  const createSettlementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء التسوية");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء التسوية بنجاح",
        description: "تم إضافة التسوية الجديدة إلى النظام",
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

  // Update settlement mutation
  const updateSettlementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/settlements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث التسوية");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setIsEditDialogOpen(false);
      setSelectedSettlement(null);
      toast({
        title: "تم تحديث التسوية بنجاح",
        description: "تم تحديث بيانات التسوية",
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

  // Delete settlement mutation
  const deleteSettlementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settlements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف التسوية");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "تم حذف التسوية بنجاح",
        description: "تم حذف التسوية من النظام",
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

  // Calculate settlements mutation
  const calculateSettlementsMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/settlements/calculate/${projectId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("فشل في حساب التسويات");
      return response.json();
    },
    onSuccess: (calculatedSettlements) => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      setIsCalculateDialogOpen(false);
      toast({
        title: "تم حساب التسويات بنجاح",
        description: `تم إنشاء ${calculatedSettlements.length} تسوية جديدة`,
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

  const handleCreateSettlement = (data: any) => {
    createSettlementMutation.mutate(data);
  };

  const handleUpdateSettlement = (data: any) => {
    if (selectedSettlement) {
      updateSettlementMutation.mutate({ id: selectedSettlement.id, data });
    }
  };

  const handleDeleteSettlement = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه التسوية؟")) {
      deleteSettlementMutation.mutate(id);
    }
  };

  const handleCalculateSettlements = () => {
    if (selectedProjectId) {
      calculateSettlementsMutation.mutate(selectedProjectId);
    }
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || "غير محدد";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
  };

  const getBalanceStatus = (finalBalance: string) => {
    const balance = parseFloat(finalBalance);
    if (balance > 0) {
      return { variant: "default", text: "رصيد إيجابي", color: "text-green-600" };
    } else if (balance < 0) {
      return { variant: "destructive", text: "رصيد سالب", color: "text-red-600" };
    } else {
      return { variant: "secondary", text: "رصيد متوازن", color: "text-gray-600" };
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التسويات</h1>
          <p className="text-gray-600 mt-2">إدارة تسويات الشركاء في المشاريع</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="w-4 h-4 ml-2" />
                حساب التسويات
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>حساب التسويات التلقائي</DialogTitle>
                <DialogDescription>
                  اختر المشروع لحساب التسويات بين الشركاء
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-select">المشروع</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
                <div className="flex justify-end gap-2">
                  <Button onClick={handleCalculateSettlements} disabled={!selectedProjectId}>
                    حساب التسويات
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                إضافة تسوية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة تسوية جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات التسوية الجديدة
                </DialogDescription>
              </DialogHeader>
              <CreateSettlementForm onSubmit={handleCreateSettlement} projects={projects} partners={partners} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسويات</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settlements.length}</div>
            <p className="text-xs text-muted-foreground">تسوية</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settlements.reduce((sum, s) => sum + parseFloat(s.paymentAmount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبالغ المستحقة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settlements.reduce((sum, s) => sum + parseFloat(s.outstandingAmount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشركاء النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(settlements.map(s => s.partnerId)).size}
            </div>
            <p className="text-xs text-muted-foreground">شريك</p>
          </CardContent>
        </Card>
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">التسويات الحديثة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settlements.map((settlement) => {
            const balanceStatus = getBalanceStatus(settlement.finalBalance);
            return (
              <Card key={settlement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{getPartnerName(settlement.partnerId)}</CardTitle>
                      <CardDescription className="mt-2">
                        {getProjectName(settlement.linkedProjectId)}
                      </CardDescription>
                    </div>
                    <Badge variant={balanceStatus.variant as any}>{balanceStatus.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">المبلغ المدفوع:</span>
                      <span className="font-semibold">{parseFloat(settlement.paymentAmount).toLocaleString()} ج.م</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">الرصيد السابق:</span>
                      <span className="font-semibold">{parseFloat(settlement.previousBalance).toLocaleString()} ج.م</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">المبلغ المستحق:</span>
                      <span className="font-semibold">{parseFloat(settlement.outstandingAmount).toLocaleString()} ج.م</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">الرصيد النهائي:</span>
                      <span className={`font-semibold ${balanceStatus.color}`}>
                        {parseFloat(settlement.finalBalance).toLocaleString()} ج.م
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(settlement.date), "dd/MM/yyyy", { locale: ar })}</span>
                    </div>

                    {settlement.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {settlement.notes}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSettlement(settlement);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSettlement(settlement.id)}
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل التسوية</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات التسوية
            </DialogDescription>
          </DialogHeader>
          {selectedSettlement && (
            <EditSettlementForm 
              settlement={selectedSettlement} 
              onSubmit={handleUpdateSettlement}
              projects={projects}
              partners={partners}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateSettlementForm({ 
  onSubmit, 
  projects, 
  partners 
}: { 
  onSubmit: (data: any) => void;
  projects: Project[];
  partners: Partner[];
}) {
  const [formData, setFormData] = useState({
    partnerId: "",
    paymentAmount: "",
    previousBalance: "",
    outstandingAmount: "",
    finalBalance: "",
    date: new Date().toISOString().split('T')[0],
    linkedProjectId: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="partnerId">الشريك</Label>
        <Select value={formData.partnerId} onValueChange={(value) => setFormData({ ...formData, partnerId: value })}>
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
          <Label htmlFor="paymentAmount">المبلغ المدفوع</Label>
          <Input
            id="paymentAmount"
            type="number"
            value={formData.paymentAmount}
            onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="previousBalance">الرصيد السابق</Label>
          <Input
            id="previousBalance"
            type="number"
            value={formData.previousBalance}
            onChange={(e) => setFormData({ ...formData, previousBalance: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="outstandingAmount">المبلغ المستحق</Label>
          <Input
            id="outstandingAmount"
            type="number"
            value={formData.outstandingAmount}
            onChange={(e) => setFormData({ ...formData, outstandingAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="finalBalance">الرصيد النهائي</Label>
          <Input
            id="finalBalance"
            type="number"
            value={formData.finalBalance}
            onChange={(e) => setFormData({ ...formData, finalBalance: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="date">تاريخ التسوية</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء التسوية</Button>
      </div>
    </form>
  );
}

function EditSettlementForm({ 
  settlement, 
  onSubmit, 
  projects, 
  partners 
}: { 
  settlement: Settlement;
  onSubmit: (data: any) => void;
  projects: Project[];
  partners: Partner[];
}) {
  const [formData, setFormData] = useState({
    partnerId: settlement.partnerId,
    paymentAmount: settlement.paymentAmount,
    previousBalance: settlement.previousBalance,
    outstandingAmount: settlement.outstandingAmount,
    finalBalance: settlement.finalBalance,
    date: settlement.date.split('T')[0],
    linkedProjectId: settlement.linkedProjectId,
    notes: settlement.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-partnerId">الشريك</Label>
        <Select value={formData.partnerId} onValueChange={(value) => setFormData({ ...formData, partnerId: value })}>
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
          <Label htmlFor="edit-paymentAmount">المبلغ المدفوع</Label>
          <Input
            id="edit-paymentAmount"
            type="number"
            value={formData.paymentAmount}
            onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-previousBalance">الرصيد السابق</Label>
          <Input
            id="edit-previousBalance"
            type="number"
            value={formData.previousBalance}
            onChange={(e) => setFormData({ ...formData, previousBalance: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-outstandingAmount">المبلغ المستحق</Label>
          <Input
            id="edit-outstandingAmount"
            type="number"
            value={formData.outstandingAmount}
            onChange={(e) => setFormData({ ...formData, outstandingAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-finalBalance">الرصيد النهائي</Label>
          <Input
            id="edit-finalBalance"
            type="number"
            value={formData.finalBalance}
            onChange={(e) => setFormData({ ...formData, finalBalance: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-date">تاريخ التسوية</Label>
        <Input
          id="edit-date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-notes">ملاحظات</Label>
        <Textarea
          id="edit-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث التسوية</Button>
      </div>
    </form>
  );
}