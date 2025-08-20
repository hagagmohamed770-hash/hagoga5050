import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, Users } from "lucide-react";
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  totalSharePercentage: string;
  totalBudget: string | null;
  createdAt: string;
}

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("فشل في جلب المشاريع");
      return response.json();
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء المشروع");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: "تم إضافة المشروع الجديد إلى النظام",
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

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث المشروع");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      toast({
        title: "تم تحديث المشروع بنجاح",
        description: "تم تحديث بيانات المشروع",
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

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف المشروع");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "تم حذف المشروع بنجاح",
        description: "تم حذف المشروع من النظام",
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

  const handleCreateProject = (data: any) => {
    createProjectMutation.mutate(data);
  };

  const handleUpdateProject = (data: any) => {
    if (selectedProject) {
      updateProjectMutation.mutate({ id: selectedProject.id, data });
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "جارٍ": { variant: "default", text: "جارٍ" },
      "مكتمل": { variant: "secondary", text: "مكتمل" },
      "متوقف": { variant: "destructive", text: "متوقف" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["جارٍ"];
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">المشاريع</h1>
          <p className="text-gray-600 mt-2">إدارة المشاريع العقارية والشراكات</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مشروع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مشروع جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المشروع الجديد
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm onSubmit={handleCreateProject} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {project.description || "لا يوجد وصف"}
                  </CardDescription>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(project.startDate), "dd/MM/yyyy", { locale: ar })}
                    {project.endDate && ` - ${format(new Date(project.endDate), "dd/MM/yyyy", { locale: ar })}`}
                  </span>
                </div>
                
                {project.totalBudget && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>الميزانية: {parseFloat(project.totalBudget).toLocaleString()} ج.م</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>نسبة المشاركة: {project.totalSharePercentage}%</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
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
            <DialogTitle>تعديل المشروع</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المشروع
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <EditProjectForm 
              project={selectedProject} 
              onSubmit={handleUpdateProject} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateProjectForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "جارٍ",
    totalSharePercentage: "100",
    totalBudget: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم المشروع</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">تاريخ البداية</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">الحالة</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="جارٍ">جارٍ</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
              <SelectItem value="متوقف">متوقف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="totalSharePercentage">نسبة المشاركة (%)</Label>
          <Input
            id="totalSharePercentage"
            type="number"
            value={formData.totalSharePercentage}
            onChange={(e) => setFormData({ ...formData, totalSharePercentage: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="totalBudget">الميزانية الإجمالية</Label>
        <Input
          id="totalBudget"
          type="number"
          value={formData.totalBudget}
          onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">إنشاء المشروع</Button>
      </div>
    </form>
  );
}

function EditProjectForm({ project, onSubmit }: { project: Project; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate ? project.endDate.split('T')[0] : "",
    status: project.status,
    totalSharePercentage: project.totalSharePercentage,
    totalBudget: project.totalBudget || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">اسم المشروع</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-description">الوصف</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-startDate">تاريخ البداية</Label>
          <Input
            id="edit-startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-endDate">تاريخ الانتهاء</Label>
          <Input
            id="edit-endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-status">الحالة</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="جارٍ">جارٍ</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
              <SelectItem value="متوقف">متوقف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-totalSharePercentage">نسبة المشاركة (%)</Label>
          <Input
            id="edit-totalSharePercentage"
            type="number"
            value={formData.totalSharePercentage}
            onChange={(e) => setFormData({ ...formData, totalSharePercentage: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-totalBudget">الميزانية الإجمالية</Label>
        <Input
          id="edit-totalBudget"
          type="number"
          value={formData.totalBudget}
          onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit">تحديث المشروع</Button>
      </div>
    </form>
  );
}