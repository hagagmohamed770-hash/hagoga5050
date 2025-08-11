import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Phone, Mail, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type Customer } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const customerFormSchema = insertCustomerSchema.extend({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function Customers() {
  const { toast } = useToast();
  const [search, setSearch] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إضافة العميل");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "تمت إضافة العميل بنجاح" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "فشل في إضافة العميل", variant: "destructive" });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل في حذف العميل");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "تم حذف العميل بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في حذف العميل", variant: "destructive" });
    },
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    createCustomerMutation.mutate(data);
  };

  const filteredCustomers = customers.filter((customer) => {
    return customer.name.includes(search) || 
           customer.phone.includes(search) ||
           (customer.email && customer.email.includes(search));
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) {
      deleteCustomerMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
          <p className="text-gray-600">إدارة بيانات العملاء ومعلومات التواصل</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-customer">
              <Plus className="w-4 h-4 mr-2" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العميل</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أحمد محمد علي" data-testid="input-customer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="01234567890" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" placeholder="ahmed@example.com" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="القاهرة، مصر الجديدة" data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="ملاحظات إضافية" data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createCustomerMutation.isPending}
                    data-testid="button-submit-customer"
                  >
                    {createCustomerMutation.isPending ? "جاري الإضافة..." : "إضافة العميل"}
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
            placeholder="البحث في العملاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-customers"
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
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow" data-testid={`card-customer-${customer.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span data-testid={`text-customer-name-${customer.id}`}>{customer.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span data-testid={`text-phone-${customer.id}`}>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span data-testid={`text-email-${customer.id}`}>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span data-testid={`text-address-${customer.id}`}>{customer.address}</span>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span data-testid={`text-notes-${customer.id}`}>{customer.notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-${customer.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    عرض
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-edit-${customer.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    تعديل
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(customer.id, customer.name)}
                    disabled={deleteCustomerMutation.isPending}
                    data-testid={`button-delete-${customer.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredCustomers.length === 0 && (
        <Card className="text-center p-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
          <p className="text-gray-600 mb-4">
            {search ? "لا توجد عملاء تطابق معايير البحث" : "لم يتم إضافة أي عملاء بعد"}
          </p>
          {!search && (
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-customer">
              <Plus className="w-4 h-4 mr-2" />
              إضافة أول عميل
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}