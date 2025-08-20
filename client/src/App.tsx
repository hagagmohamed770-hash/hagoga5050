import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Partners from "@/pages/partners";
import Cashboxes from "@/pages/cashboxes";
import Invoices from "@/pages/invoices";
import Transactions from "@/pages/transactions";
import Settlements from "@/pages/settlements";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import Units from "@/pages/units";
import Customers from "@/pages/customers";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/partners" component={Partners} />
          <Route path="/cashboxes" component={Cashboxes} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/settlements" component={Settlements} />
          <Route path="/revenue" component={Revenue} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/units" component={Units} />
          <Route path="/customers" component={Customers} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
