import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  Users, 
  UserCheck, 
  FileText, 
  Settings,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  FolderOpen,
  CreditCard,
  Receipt,
  Wallet,
  BarChart3,
  PiggyBank,
  Calculator
} from "lucide-react";

const navigation = [
  {
    name: "لوحة التحكم",
    href: "/",
    icon: Home,
    description: "نظرة عامة على النظام"
  },
  {
    name: "المشاريع",
    href: "/projects",
    icon: FolderOpen,
    description: "إدارة المشاريع العقارية"
  },
  {
    name: "الشركاء",
    href: "/partners",
    icon: UserCheck,
    description: "إدارة الشركاء وحصص الأرباح"
  },
  {
    name: "الخزائن",
    href: "/cashboxes",
    icon: Wallet,
    description: "إدارة الخزائن والأرصدة"
  },
  {
    name: "الفواتير",
    href: "/invoices",
    icon: Receipt,
    description: "إدارة الفواتير والمدفوعات"
  },
  {
    name: "المعاملات",
    href: "/transactions",
    icon: CreditCard,
    description: "إدارة المعاملات المالية"
  },
  {
    name: "التسويات",
    href: "/settlements",
    icon: Calculator,
    description: "تسويات الشركاء"
  },
  {
    name: "الإيرادات",
    href: "/revenue",
    icon: TrendingUp,
    description: "إدارة الإيرادات"
  },
  {
    name: "المصروفات",
    href: "/expenses",
    icon: PiggyBank,
    description: "إدارة المصروفات"
  },
  {
    name: "الوحدات العقارية", 
    href: "/units",
    icon: Building,
    description: "إدارة الوحدات السكنية والتجارية"
  },
  {
    name: "العملاء",
    href: "/customers", 
    icon: Users,
    description: "إدارة بيانات العملاء"
  },
  {
    name: "التقارير",
    href: "/reports",
    icon: BarChart3,
    description: "تقارير المبيعات والإحصائيات"
  },
  {
    name: "الإعدادات",
    href: "/settings",
    icon: Settings,
    description: "إعدادات النظام"
  }
];

const quickStats = [
  { 
    label: "مشاريع نشطة", 
    value: "3", 
    icon: FolderOpen,
    color: "text-blue-600 bg-blue-100"
  },
  { 
    label: "خزائن", 
    value: "2", 
    icon: Wallet,
    color: "text-green-600 bg-green-100"
  },
  { 
    label: "تسويات معلقة", 
    value: "1", 
    icon: AlertCircle,
    color: "text-red-600 bg-red-100"
  },
  { 
    label: "إجمالي الإيرادات", 
    value: "2.5م ج.م", 
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-100"
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-l border-gray-200 shadow-sm h-screen flex flex-col overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900" data-testid="sidebar-title">
              نظام إدارة الخزائن والتسويات
            </h1>
            <p className="text-sm text-gray-500">نظام شامل للشركاء</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            القوائم الرئيسية
          </h2>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  data-testid={`nav-link-${item.href.replace('/', '') || 'dashboard'}`}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            إحصائيات سريعة
          </h2>
          <div className="space-y-2">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                data-testid={`quick-stat-${index}`}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-600">اليوم</div>
          </div>
        </div>
      </div>
    </aside>
  );
}