import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, HandHeart, DollarSign, TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartnerSchema, type Partner } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const partnerFormSchema = insertPartnerSchema.extend({
  name: z.string().min(1, "اسم الشريك مطلوب"),
  partnershipType: z.string().min(1, "نوع الشراكة مطلوب"),
  profitPercentage: z.string().min(1, "نسبة الأرباح مطلوبة"),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function Partners() {
  const { toast } = useToast();
  const [search, setSearch] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إضافة الشريك");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "تمت إضافة الشريك بنجاح" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "فشل في إضافة الشريك", variant: "destructive" });
    },
  });

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      partnershipType: "",
      profitPercentage: "",
      receivedPayments: "0",
      remainingPayments: "0",
    },
  });

  const onSubmit = (data: PartnerFormData) => {
    createPartnerMutation.mutate(data);
  };

  const filteredPartners = partners.filter((partner) => {
    return partner.name.includes(search) || partner.partnershipType.includes(search);
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0 ج.م";
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getPartnershipBadgeColor = (type: string) => {
    switch (type) {
      case "50/50":
        return "default";
      case "70/30":
      case "30/70":
        return "secondary";
      case "60/40":
      case "40/60":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الشركاء</h1>
          <p className="text-gray-600">إدارة الشركاء وحصص الأرباح</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-partner">
              <Plus className="w-4 h-4 mr-2" />
              إضافة شريك جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة شريك جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشريك</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="محمد أحمد" data-testid="input-partner-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الشراكة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-partnership-type">
                            <SelectValue placeholder="اختر نوع الشراكة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="50/50">50/50</SelectItem>
                          <SelectItem value="70/30">70/30</SelectItem>
                          <SelectItem value="30/70">30/70</SelectItem>
                          <SelectItem value="60/40">60/40</SelectItem>
                          <SelectItem value="40/60">40/60</SelectItem>
                          <SelectItem value="80/20">80/20</SelectItem>
                          <SelectItem value="20/80">20/80</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profitPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نسبة الأرباح (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" step="0.01" placeholder="50" data-testid="input-profit-percentage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedPayments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبالغ المستلمة (جنيه)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" placeholder="0" data-testid="input-received-payments" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remainingPayments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبالغ المتبقية (جنيه)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" placeholder="0" data-testid="input-remaining-payments" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createPartnerMutation.isPending}
                    data-testid="button-submit-partner"
                  >
                    {createPartnerMutation.isPending ? "جاري الإضافة..." : "إضافة الشريك"}
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
            placeholder="البحث في الشركاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-partners"
          />
        </div>
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
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow" data-testid={`card-partner-${partner.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span data-testid={`text-partner-name-${partner.id}`}>{partner.name}</span>
                  </CardTitle>
                  <Badge 
                    variant={getPartnershipBadgeColor(partner.partnershipType)}
                    data-testid={`badge-partnership-${partner.id}`}
                  >
                    {partner.partnershipType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span data-testid={`text-profit-percentage-${partner.id}`}>{partner.profitPercentage}% نسبة الأرباح</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">المبالغ المستلمة</span>
                      </div>
                      <span className="font-bold text-green-800" data-testid={`text-received-payments-${partner.id}`}>
                        {formatCurrency(partner.receivedPayments)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HandHeart className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">المبالغ المتبقية</span>
                      </div>
                      <span className="font-bold text-orange-800" data-testid={`text-remaining-payments-${partner.id}`}>
                        {formatCurrency(partner.remainingPayments)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-${partner.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    عرض
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-edit-${partner.id}`}
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

      {!isLoading && filteredPartners.length === 0 && (
        <Card className="text-center p-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد شركاء</h3>
          <p className="text-gray-600 mb-4">
            {search ? "لا توجد شركاء تطابق معايير البحث" : "لم يتم إضافة أي شركاء بعد"}
          </p>
          {!search && (
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-partner">
              <Plus className="w-4 h-4 mr-2" />
              إضافة أول شريك
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}