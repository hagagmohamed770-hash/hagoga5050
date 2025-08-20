import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, UserCheck, DollarSign, Percent, Calendar } from "lucide-react";
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

interface Partner {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  sharePercentage: string;
  previousBalance: string;
  currentBalance: string;
  projectId: string;
  createdAt: string;
  project?: {
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
}

export default function Partners() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const queryClient = useQueryClient();

  // Fetch partners
  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: async () => {
      const response = await fetch("/api/partners");
      if (!response.ok) throw new Error("فشل في جلب الشركاء");
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

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء الشريك");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء الشريك بنجاح",
        description: "تم إضافة الشريك الجديد إلى النظام",
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

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث الشريك");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setIsEditDialogOpen(false);
      setSelectedPartner(null);
      toast({
        title: "تم تحديث الشريك بنجاح",
        description: "تم تحديث بيانات الشريك",
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

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/partners/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف الشريك");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "تم حذف الشريك بنجاح",
        description: "تم حذف الشريك من النظام",
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

  const handleCreatePartner = (data: any) => {
    createPartnerMutation.mutate(data);
  };

  const handleUpdatePartner = (data: any) => {
    if (selectedPartner) {
      updatePartnerMutation.mutate({ id: selectedPartner.id, data });
    }
  };

  const handleDeletePartner = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الشريك؟")) {
      deletePartnerMutation.mutate(id);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
  };

  const getBalanceStatus = (currentBalance: string) => {
    const balance = parseFloat(currentBalance);
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

  const totalSharePercentage = partners.reduce((sum, p) => sum + parseFloat(p.sharePercentage), 0);
  const totalCurrentBalance = partners.reduce((sum, p) => sum + parseFloat(p.currentBalance), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الشركاء</h1>
          <p className="text-gray-600 mt-2">إدارة الشركاء وحصص الأرباح في المشاريع</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة شريك جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة شريك جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الشريك الجديد
              </DialogDescription>
            </DialogHeader>
            <CreatePartnerForm onSubmit={handleCreatePartner} projects={projects} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الشركاء</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
            <p className="text-xs text-muted-foreground">شريك</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي نسبة المشاركة</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSharePercentage}%</div>
            <p className="text-xs text-muted-foreground">من إجمالي المشاريع</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الرصيد</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.length > 0 ? (totalCurrentBalance / partners.length).toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground">ج.م لكل شريك</p>
          </CardContent>
        </Card>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const balanceStatus = getBalanceStatus(partner.currentBalance);
          return (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {getProjectName(partner.projectId)}
                    </CardDescription>
                  </div>
                  <Badge variant={balanceStatus.variant as any}>{balanceStatus.text}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">نسبة المشاركة:</span>
                    <span className="font-semibold">{partner.sharePercentage}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الرصيد السابق:</span>
                    <span className="font-semibold">{parseFloat(partner.previousBalance).toLocaleString()} ج.م</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الرصيد الحالي:</span>
                    <span className={`font-semibold ${balanceStatus.color}`}>
                      {parseFloat(partner.currentBalance).toLocaleString()} ج.م
                    </span>
                  </div>
                  
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>الهاتف: {partner.phone}</span>
                    </div>
                  )}
                  
                  {partner.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>البريد الإلكتروني: {partner.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>تاريخ الإنضمام: {format(new Date(partner.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePartner(partner.id)}
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
            <DialogTitle>تعديل الشريك</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الشريك
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <EditPartnerForm 
              partner={selectedPartner} 
              onSubmit={handleUpdatePartner}
              projects={projects}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatePartnerForm({ 
  onSubmit, 
  projects 
}: { 
  onSubmit: (data: any) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    sharePercentage: "",
    previousBalance: "0",
    currentBalance: "0",
    projectId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم الشريك</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sharePercentage">نسبة المشاركة (%)</Label>
          <Input
            id="sharePercentage"
            type="number"
            value={formData.sharePercentage}
            onChange={(e) => setFormData({ ...formData, sharePercentage: e.target.value })}
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
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء الشريك</Button>
      </div>
    </form>
  );
}

function EditPartnerForm({ 
  partner, 
  onSubmit, 
  projects 
}: { 
  partner: Partner;
  onSubmit: (data: any) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    name: partner.name,
    phone: partner.phone || "",
    email: partner.email || "",
    address: partner.address || "",
    sharePercentage: partner.sharePercentage,
    previousBalance: partner.previousBalance,
    currentBalance: partner.currentBalance,
    projectId: partner.projectId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">اسم الشريك</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-phone">رقم الهاتف</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-email">البريد الإلكتروني</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-address">العنوان</Label>
        <Textarea
          id="edit-address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-sharePercentage">نسبة المشاركة (%)</Label>
          <Input
            id="edit-sharePercentage"
            type="number"
            value={formData.sharePercentage}
            onChange={(e) => setFormData({ ...formData, sharePercentage: e.target.value })}
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
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث الشريك</Button>
      </div>
    </form>
  );
}