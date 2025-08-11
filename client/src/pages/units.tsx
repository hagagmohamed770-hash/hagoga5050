import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Building, Home, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUnitSchema, type Unit } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const unitFormSchema = insertUnitSchema.extend({
  area: z.string().min(1, "المساحة مطلوبة"),
  totalPrice: z.string().min(1, "السعر الكلي مطلوب"),
  downPayment: z.string().min(1, "المقدم مطلوب"),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

export default function Units() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: units = [], isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: UnitFormData) => {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إضافة الوحدة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({ title: "تمت إضافة الوحدة بنجاح" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "فشل في إضافة الوحدة", variant: "destructive" });
    },
  });

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      type: "سكني",
      area: "",
      totalPrice: "",
      downPayment: "",
      status: "متاحة",
    },
  });

  const onSubmit = (data: UnitFormData) => {
    createUnitMutation.mutate(data);
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.type.includes(search) || 
                         (unit.area && unit.area.toString().includes(search));
    const matchesFilter = !filter || unit.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "متاحة":
        return "default";
      case "مباعة":
        return "secondary";
      case "مرتجعة":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "غير محدد";
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الوحدات العقارية</h1>
          <p className="text-gray-600">إدارة الوحدات السكنية والتجارية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-unit">
              <Plus className="w-4 h-4 mr-2" />
              إضافة وحدة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة وحدة جديدة</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الوحدة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-unit-type">
                            <SelectValue placeholder="اختر نوع الوحدة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="سكني">سكني</SelectItem>
                          <SelectItem value="تجاري">تجاري</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المساحة (متر مربع)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="120.5" data-testid="input-area" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر الكلي (جنيه)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1500000" data-testid="input-total-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المقدم (جنيه)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="300000" data-testid="input-down-payment" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reservationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>جدية الحجز (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" placeholder="10000" data-testid="input-reservation-fee" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العمولة (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" placeholder="45000" data-testid="input-commission" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createUnitMutation.isPending}
                    data-testid="button-submit-unit"
                  >
                    {createUnitMutation.isPending ? "جاري الإضافة..." : "إضافة الوحدة"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الوحدات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-units"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48" data-testid="select-filter-status">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الحالات</SelectItem>
            <SelectItem value="متاحة">متاحة</SelectItem>
            <SelectItem value="مباعة">مباعة</SelectItem>
            <SelectItem value="مرتجعة">مرتجعة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow" data-testid={`card-unit-${unit.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {unit.type === "سكني" ? (
                      <Home className="w-5 h-5" />
                    ) : (
                      <Building className="w-5 h-5" />
                    )}
                    <span data-testid={`text-unit-type-${unit.id}`}>وحدة {unit.type}</span>
                  </CardTitle>
                  <Badge 
                    variant={getStatusBadgeVariant(unit.status)}
                    data-testid={`badge-status-${unit.id}`}
                  >
                    {unit.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600" data-testid={`text-unit-area-${unit.id}`}>
                  المساحة: {unit.area} متر مربع
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">السعر الكلي:</span>
                    <span className="font-medium" data-testid={`text-total-price-${unit.id}`}>
                      {formatCurrency(unit.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المقدم:</span>
                    <span className="font-medium" data-testid={`text-down-payment-${unit.id}`}>
                      {formatCurrency(unit.downPayment)}
                    </span>
                  </div>
                  {unit.commission && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">العمولة:</span>
                      <span className="font-medium">{formatCurrency(unit.commission)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-${unit.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    عرض
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-edit-${unit.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredUnits.length === 0 && (
        <Card className="text-center p-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وحدات</h3>
          <p className="text-gray-600 mb-4">
            {search || filter ? "لا توجد وحدات تطابق معايير البحث" : "لم يتم إضافة أي وحدات بعد"}
          </p>
          {!search && !filter && (
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-unit">
              <Plus className="w-4 h-4 mr-2" />
              إضافة أول وحدة
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}