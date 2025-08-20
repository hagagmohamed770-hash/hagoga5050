import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  FileText,
  Calendar,
  Calculator,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  status: string;
  totalBudget: string;
  totalSharePercentage: string;
}

interface Partner {
  id: string;
  name: string;
  sharePercentage: string;
  previousBalance: string;
  currentBalance: string;
  projectId: string;
}

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
}

interface Transaction {
  id: string;
  transactionType: string;
  amount: string;
  date: string;
  linkedProjectId: string | null;
}

interface Revenue {
  id: string;
  amount: string;
  date: string;
  projectId: string | null;
}

interface Expense {
  id: string;
  amount: string;
  date: string;
  projectId: string | null;
  category: string;
}

export default function Reports() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("financial");

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

  // Fetch settlements
  const { data: settlements = [] } = useQuery<Settlement[]>({
    queryKey: ["settlements"],
    queryFn: async () => {
      const response = await fetch("/api/settlements");
      if (!response.ok) throw new Error("فشل في جلب التسويات");
      return response.json();
    },
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("فشل في جلب المعاملات");
      return response.json();
    },
  });

  // Fetch revenue
  const { data: revenue = [] } = useQuery<Revenue[]>({
    queryKey: ["revenue"],
    queryFn: async () => {
      const response = await fetch("/api/revenue");
      if (!response.ok) throw new Error("فشل في جلب الإيرادات");
      return response.json();
    },
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await fetch("/api/expenses");
      if (!response.ok) throw new Error("فشل في جلب المصروفات");
      return response.json();
    },
  });

  // Filter data based on selected project
  const filteredPartners = selectedProject === "all" 
    ? partners 
    : partners.filter(p => p.projectId === selectedProject);

  const filteredSettlements = selectedProject === "all"
    ? settlements
    : settlements.filter(s => s.linkedProjectId === selectedProject);

  const filteredTransactions = selectedProject === "all"
    ? transactions
    : transactions.filter(t => t.linkedProjectId === selectedProject);

  const filteredRevenue = selectedProject === "all"
    ? revenue
    : revenue.filter(r => r.projectId === selectedProject);

  const filteredExpenses = selectedProject === "all"
    ? expenses
    : expenses.filter(e => e.projectId === selectedProject);

  // Calculate statistics
  const totalPartners = filteredPartners.length;
  const totalSettlements = filteredSettlements.length;
  const totalTransactions = filteredTransactions.length;
  const totalRevenue = filteredRevenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Calculate partner balances
  const partnerBalances = filteredPartners.map(partner => {
    const partnerSettlements = filteredSettlements.filter(s => s.partnerId === partner.id);
    const totalSettled = partnerSettlements.reduce((sum, s) => sum + parseFloat(s.paymentAmount), 0);
    const currentBalance = parseFloat(partner.currentBalance);
    
    return {
      ...partner,
      totalSettled,
      remainingBalance: currentBalance - totalSettled
    };
  });

  // Calculate expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  // Calculate monthly trends
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthRevenue = filteredRevenue.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const thisMonthExpenses = filteredExpenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "غير محدد";
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || "غير محدد";
  };

  const handleExportReport = () => {
    // This would implement actual export functionality
    alert("سيتم تنفيذ تصدير التقرير قريباً");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
          <p className="text-gray-600 mt-2">تقارير شاملة للنظام المالي</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقرير</CardTitle>
          <CardDescription>اختر المشروع ونوع التقرير</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project">المشروع</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشاريع</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportType">نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">تقرير مالي</SelectItem>
                  <SelectItem value="settlements">تقرير التسويات</SelectItem>
                  <SelectItem value="partners">تقرير الشركاء</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الشركاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">شريك</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إيرادات هذا الشهر</CardTitle>
            <CardDescription>إجمالي الإيرادات للشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{thisMonthRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>مصروفات هذا الشهر</CardTitle>
            <CardDescription>إجمالي المصروفات للشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{thisMonthExpenses.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>صافي الربح الشهري</CardTitle>
            <CardDescription>صافي الربح للشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(thisMonthRevenue - thisMonthExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(thisMonthRevenue - thisMonthExpenses).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content Based on Type */}
      {reportType === "financial" && (
        <div className="space-y-6">
          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
              <CardDescription>إجمالي المصروفات لكل فئة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{category}</div>
                    <div className="text-lg font-bold text-red-600">{amount.toLocaleString()} ج.م</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>آخر المعاملات</CardTitle>
              <CardDescription>أحدث المعاملات المالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.transactionType === "قبض" ? "bg-green-100" : "bg-red-100"}`}>
                        {transaction.transactionType === "قبض" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {transaction.transactionType === "قبض" ? "قبض" : "صرف"} - {parseFloat(transaction.amount).toLocaleString()} ج.م
                        </div>
                        <div className="text-sm text-gray-600">
                          {transaction.linkedProjectId && getProjectName(transaction.linkedProjectId)} • {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ar })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={transaction.transactionType === "قبض" ? "default" : "destructive"}>
                      {transaction.transactionType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "settlements" && (
        <div className="space-y-6">
          {/* Settlement Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص التسويات</CardTitle>
              <CardDescription>إجمالي التسويات والمدفوعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{totalSettlements}</div>
                  <div className="text-sm text-gray-600">إجمالي التسويات</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredSettlements.reduce((sum, s) => sum + parseFloat(s.paymentAmount), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المدفوعات (ج.م)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredSettlements.reduce((sum, s) => sum + parseFloat(s.outstandingAmount), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">المبالغ المعلقة (ج.م)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Balances */}
          <Card>
            <CardHeader>
              <CardTitle>أرصدة الشركاء</CardTitle>
              <CardDescription>الأرصدة الحالية والمدفوعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerBalances.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{partner.name}</div>
                      <div className="text-sm text-gray-600">
                        المشروع: {getProjectName(partner.projectId)} • النسبة: {partner.sharePercentage}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">الرصدة الحالية: {parseFloat(partner.currentBalance).toLocaleString()} ج.م</div>
                      <div className="text-sm text-green-600">المدفوع: {partner.totalSettled.toLocaleString()} ج.م</div>
                      <div className="text-sm text-blue-600">المتبقي: {partner.remainingBalance.toLocaleString()} ج.م</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Settlements */}
          <Card>
            <CardHeader>
              <CardTitle>آخر التسويات</CardTitle>
              <CardDescription>أحدث عمليات التسوية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSettlements.slice(0, 10).map((settlement) => (
                  <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{getPartnerName(settlement.partnerId)}</div>
                      <div className="text-sm text-gray-600">
                        المشروع: {getProjectName(settlement.linkedProjectId)} • {format(new Date(settlement.date), "dd/MM/yyyy", { locale: ar })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">المدفوع: {parseFloat(settlement.paymentAmount).toLocaleString()} ج.م</div>
                      <div className="text-sm text-gray-600">الرصدة السابقة: {parseFloat(settlement.previousBalance).toLocaleString()} ج.م</div>
                      <div className="text-sm text-blue-600">الرصدة النهائية: {parseFloat(settlement.finalBalance).toLocaleString()} ج.م</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "partners" && (
        <div className="space-y-6">
          {/* Partners Overview */}
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة على الشركاء</CardTitle>
              <CardDescription>إحصائيات الشركاء والمشاريع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{totalPartners}</div>
                  <div className="text-sm text-gray-600">إجمالي الشركاء</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {filteredPartners.reduce((sum, p) => sum + parseFloat(p.sharePercentage), 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">إجمالي النسب المئوية</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredPartners.reduce((sum, p) => sum + parseFloat(p.currentBalance), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي الأرصدة (ج.م)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {projects.filter(p => selectedProject === "all" || p.id === selectedProject).length}
                  </div>
                  <div className="text-sm text-gray-600">عدد المشاريع</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partners Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الشركاء</CardTitle>
              <CardDescription>معلومات مفصلة عن كل شريك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPartners.map((partner) => (
                  <div key={partner.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{partner.name}</div>
                        <div className="text-sm text-gray-600">{getProjectName(partner.projectId)}</div>
                      </div>
                      <Badge variant="outline">{partner.sharePercentage}%</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">الرصدة السابقة:</span>
                        <span className="font-semibold mr-2">{parseFloat(partner.previousBalance).toLocaleString()} ج.م</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الرصدة الحالية:</span>
                        <span className="font-semibold mr-2">{parseFloat(partner.currentBalance).toLocaleString()} ج.م</span>
                      </div>
                      <div>
                        <span className="text-gray-600">التغيير:</span>
                        <span className={`font-semibold mr-2 ${parseFloat(partner.currentBalance) - parseFloat(partner.previousBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(partner.currentBalance) - parseFloat(partner.previousBalance)).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
