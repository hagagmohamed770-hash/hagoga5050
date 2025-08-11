import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Activity,
  PieChart,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import type { Stats, Unit, Customer, Installment } from "@shared/schema";

const StatCard = ({ title, value, change, changeType, icon: Icon, color }: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: any;
  color: string;
}) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'increase' ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"], 
  });

  const { data: overdueInstallments = [] } = useQuery<Installment[]>({
    queryKey: ["/api/installments", "overdue"],
    queryFn: () => fetch("/api/installments?overdue=true").then(res => res.json()),
  });

  const { data: revenueData } = useQuery({
    queryKey: ["/api/charts/revenue"],
  });

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return "0 ج.م";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const recentUnits = units.slice(0, 5);
  const recentCustomers = customers.slice(0, 3);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك في نظام إدارة الاستثمار العقاري</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-view-reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            عرض التقارير
          </Button>
          <Link href="/units">
            <Button size="sm" data-testid="button-add-unit">
              <Plus className="w-4 h-4 mr-2" />
              إضافة وحدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الوحدات"
          value={stats?.totalUnits || units.length}
          change="+3 هذا الشهر"
          changeType="increase"
          icon={Building}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="الوحدات المتاحة"
          value={stats?.availableUnits || units.filter(u => u.status === "متاحة").length}
          icon={Activity}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="إجمالي العملاء"
          value={customers.length}
          change="+5 هذا الأسبوع"
          changeType="increase"
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="الأقساط المتأخرة"
          value={stats?.overdueInstallments || overdueInstallments.length}
          change="-2 من الأسبوع الماضي"
          changeType="decrease"
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Revenue and Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              نظرة عامة مالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">إجمالي الإيرادات</span>
                </div>
                <p className="text-xl font-bold text-green-800" data-testid="total-revenue">
                  {formatCurrency(stats?.totalRevenue)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">مدفوعات معلقة</span>
                </div>
                <p className="text-xl font-bold text-orange-800" data-testid="pending-payments">
                  {formatCurrency(stats?.pendingPayments)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">معدل التحصيل</span>
                </div>
                <p className="text-xl font-bold text-blue-800">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unit Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              حالة الوحدات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متاحة</span>
              <Badge variant="default" data-testid="available-units-count">
                {stats?.availableUnits || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">مباعة</span>
              <Badge variant="secondary" data-testid="sold-units-count">
                {stats?.soldUnits || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">مرتجعة</span>
              <Badge variant="destructive" data-testid="returned-units-count">
                {stats?.returnedUnits || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Units */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              الوحدات الحديثة
            </CardTitle>
            <Link href="/units">
              <Button variant="outline" size="sm" data-testid="button-view-all-units">
                <Eye className="w-4 h-4 mr-2" />
                عرض الكل
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUnits.length > 0 ? (
              recentUnits.map((unit) => (
                <div 
                  key={unit.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`recent-unit-${unit.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">وحدة {unit.type}</p>
                      <p className="text-xs text-gray-500">{unit.area} متر</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge 
                      variant={unit.status === "متاحة" ? "default" : unit.status === "مباعة" ? "secondary" : "destructive"}
                      className="mb-1"
                    >
                      {unit.status}
                    </Badge>
                    <p className="text-xs font-medium">{formatCurrency(unit.totalPrice)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد وحدات</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              العملاء الجدد
            </CardTitle>
            <Link href="/customers">
              <Button variant="outline" size="sm" data-testid="button-view-all-customers">
                <Eye className="w-4 h-4 mr-2" />
                عرض الكل
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  data-testid={`recent-customer-${customer.id}`}
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد عملاء</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Installments Alert */}
      {overdueInstallments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              تنبيه: أقساط متأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-3">
              يوجد {overdueInstallments.length} قسط متأخر يحتاج للمتابعة
            </p>
            <Button variant="destructive" size="sm" data-testid="button-view-overdue">
              عرض الأقساط المتأخرة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}