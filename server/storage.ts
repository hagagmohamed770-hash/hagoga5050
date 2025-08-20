import { 
  type Customer, 
  type InsertCustomer, 
  type Unit, 
  type InsertUnit, 
  type Installment, 
  type InsertInstallment,
  type Partner, 
  type InsertPartner,
  type PartnerUnit, 
  type InsertPartnerUnit,
  type ReturnedUnit, 
  type InsertReturnedUnit,
  type Payment, 
  type InsertPayment,
  type Stats, 
  type InsertStats,
  type Project,
  type InsertProject,
  type Cashbox,
  type InsertCashbox,
  type Invoice,
  type InsertInvoice,
  type Transaction,
  type InsertTransaction,
  type Settlement,
  type InsertSettlement,
  type Revenue,
  type InsertRevenue,
  type Expense,
  type InsertExpense
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // المشاريع (Projects)
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByStatus(status: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // الشركاء (Partners)
  getPartner(id: string): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  getPartnersByProject(projectId: string): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<Partner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;

  // الخزائن (Cashboxes)
  getCashbox(id: string): Promise<Cashbox | undefined>;
  getAllCashboxes(): Promise<Cashbox[]>;
  createCashbox(cashbox: InsertCashbox): Promise<Cashbox>;
  updateCashbox(id: string, cashbox: Partial<Cashbox>): Promise<Cashbox | undefined>;
  deleteCashbox(id: string): Promise<boolean>;

  // الفواتير (Invoices)
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByStatus(status: string): Promise<Invoice[]>;
  getInvoicesByProject(projectId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;

  // المعاملات (Transactions)
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  getTransactionsByProject(projectId: string): Promise<Transaction[]>;
  getTransactionsByCashbox(cashboxId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // التسويات (Settlements)
  getSettlement(id: string): Promise<Settlement | undefined>;
  getAllSettlements(): Promise<Settlement[]>;
  getSettlementsByProject(projectId: string): Promise<Settlement[]>;
  getSettlementsByPartner(partnerId: string): Promise<Settlement[]>;
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  updateSettlement(id: string, settlement: Partial<Settlement>): Promise<Settlement | undefined>;
  deleteSettlement(id: string): Promise<boolean>;
  calculateSettlements(projectId: string): Promise<Settlement[]>;

  // الإيرادات (Revenue)
  getRevenue(id: string): Promise<Revenue | undefined>;
  getAllRevenue(): Promise<Revenue[]>;
  getRevenueByProject(projectId: string): Promise<Revenue[]>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: string, revenue: Partial<Revenue>): Promise<Revenue | undefined>;
  deleteRevenue(id: string): Promise<boolean>;

  // المصروفات (Expenses)
  getExpense(id: string): Promise<Expense | undefined>;
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByProject(projectId: string): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // العملاء (Customers)
  getCustomer(id: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  
  // الوحدات (Units)
  getUnit(id: string): Promise<Unit | undefined>;
  getAllUnits(): Promise<Unit[]>;
  getUnitsByStatus(status: string): Promise<Unit[]>;
  getUnitsByProject(projectId: string): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<Unit>): Promise<Unit | undefined>;
  deleteUnit(id: string): Promise<boolean>;
  
  // الأقساط (Installments)
  getInstallment(id: string): Promise<Installment | undefined>;
  getInstallmentsByUnit(unitId: string): Promise<Installment[]>;
  getOverdueInstallments(): Promise<Installment[]>;
  getAllInstallments(): Promise<Installment[]>;
  createInstallment(installment: InsertInstallment): Promise<Installment>;
  updateInstallment(id: string, installment: Partial<Installment>): Promise<Installment | undefined>;
  
  // الوحدات المشتركة (Partner Units)
  getPartnerUnit(id: string): Promise<PartnerUnit | undefined>;
  getPartnerUnitsByPartner(partnerId: string): Promise<PartnerUnit[]>;
  getPartnerUnitsByUnit(unitId: string): Promise<PartnerUnit[]>;
  createPartnerUnit(partnerUnit: InsertPartnerUnit): Promise<PartnerUnit>;
  
  // الشقق المرتجعة (Returned Units)
  getReturnedUnit(id: string): Promise<ReturnedUnit | undefined>;
  getAllReturnedUnits(): Promise<ReturnedUnit[]>;
  createReturnedUnit(returnedUnit: InsertReturnedUnit): Promise<ReturnedUnit>;
  updateReturnedUnit(id: string, returnedUnit: Partial<ReturnedUnit>): Promise<ReturnedUnit | undefined>;
  
  // المدفوعات (Payments)
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUnit(unitId: string): Promise<Payment[]>;
  getPaymentsByCustomer(customerId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // الإحصائيات (Statistics)
  getStats(): Promise<Stats | undefined>;
  updateStats(): Promise<void>;

  // التقارير (Reports)
  getSettlementReport(projectId: string): Promise<any>;
  getFinancialReport(projectId: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project> = new Map();
  private partners: Map<string, Partner> = new Map();
  private cashboxes: Map<string, Cashbox> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private settlements: Map<string, Settlement> = new Map();
  private revenue: Map<string, Revenue> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private customers: Map<string, Customer> = new Map();
  private units: Map<string, Unit> = new Map();
  private installments: Map<string, Installment> = new Map();
  private partnerUnits: Map<string, PartnerUnit> = new Map();
  private returnedUnits: Map<string, ReturnedUnit> = new Map();
  private payments: Map<string, Payment> = new Map();
  private stats: Stats | undefined;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // المشاريع التجريبية
    const project1: Project = {
      id: randomUUID(),
      name: "مشروع الواحة السكني",
      description: "مجمع سكني فاخر في قلب المدينة",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      status: "جارٍ",
      totalSharePercentage: "100",
      totalBudget: "50000000",
      createdAt: new Date()
    };

    const project2: Project = {
      id: randomUUID(),
      name: "مشروع النخيل التجاري",
      description: "مركز تجاري متكامل",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2026-06-30"),
      status: "جارٍ",
      totalSharePercentage: "100",
      totalBudget: "75000000",
      createdAt: new Date()
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);

    // الشركاء التجريبيين
    const partner1: Partner = {
      id: randomUUID(),
      name: "أحمد محمد علي",
      phone: "01234567890",
      email: "ahmed@example.com",
      address: "القاهرة، مصر الجديدة",
      sharePercentage: "50",
      previousBalance: "0",
      currentBalance: "2500000",
      projectId: project1.id,
      createdAt: new Date()
    };

    const partner2: Partner = {
      id: randomUUID(),
      name: "محمد سعيد أحمد",
      phone: "01098765432",
      email: "mohamed@example.com",
      address: "الجيزة، الهرم",
      sharePercentage: "50",
      previousBalance: "0",
      currentBalance: "1800000",
      projectId: project1.id,
      createdAt: new Date()
    };

    this.partners.set(partner1.id, partner1);
    this.partners.set(partner2.id, partner2);

    // الخزائن التجريبية
    const cashbox1: Cashbox = {
      id: randomUUID(),
      name: "الخزنة الرئيسية",
      initialBalance: "1000000",
      currentBalance: "2500000",
      createdAt: new Date()
    };

    const cashbox2: Cashbox = {
      id: randomUUID(),
      name: "خزنة المشروع الثاني",
      initialBalance: "500000",
      currentBalance: "1200000",
      createdAt: new Date()
    };

    this.cashboxes.set(cashbox1.id, cashbox1);
    this.cashboxes.set(cashbox2.id, cashbox2);

    // العملاء التجريبيين
    const customer1: Customer = {
      id: randomUUID(),
      name: "علي حسن محمد",
      phone: "01123456789",
      email: "ali@example.com",
      address: "الإسكندرية، سموحة",
      notes: "عميل مميز",
      createdAt: new Date()
    };
    
    const customer2: Customer = {
      id: randomUUID(),
      name: "فاطمة أحمد علي",
      phone: "01087654321",
      email: "fatima@example.com",
      address: "بورسعيد، الشرق",
      notes: null,
      createdAt: new Date()
    };

    this.customers.set(customer1.id, customer1);
    this.customers.set(customer2.id, customer2);

    // الوحدات التجريبية
    const unit1: Unit = {
      id: randomUUID(),
      type: "سكني",
      area: "120.5",
      totalPrice: "1500000",
      downPayment: "300000",
      reservationFee: "10000",
      commission: "45000",
      maintenanceAmount: "5000",
      garageShare: "15000",
      status: "مباعة",
      customerId: customer1.id,
      projectId: project1.id,
      createdAt: new Date()
    };

    const unit2: Unit = {
      id: randomUUID(),
      type: "تجاري",
      area: "85.0",
      totalPrice: "2000000",
      downPayment: "400000",
      reservationFee: "15000",
      commission: "60000",
      maintenanceAmount: "8000",
      garageShare: "20000",
      status: "متاحة",
      customerId: null,
      projectId: project1.id,
      createdAt: new Date()
    };

    this.units.set(unit1.id, unit1);
    this.units.set(unit2.id, unit2);

    // الفواتير التجريبية
    const invoice1: Invoice = {
      id: randomUUID(),
      invoiceNumber: "INV-001",
      amount: "300000",
      status: "مدفوعة",
      dueDate: new Date("2024-02-15"),
      linkedTransactionId: null,
      linkedProjectId: project1.id,
      linkedClientId: customer1.id,
      linkedPartnerId: null,
      description: "دفعة مقدمة للوحدة السكنية",
      createdAt: new Date()
    };

    const invoice2: Invoice = {
      id: randomUUID(),
      invoiceNumber: "INV-002",
      amount: "50000",
      status: "غير مدفوعة",
      dueDate: new Date("2024-03-15"),
      linkedTransactionId: null,
      linkedProjectId: project1.id,
      linkedClientId: customer1.id,
      linkedPartnerId: null,
      description: "قسط شهري",
      createdAt: new Date()
    };

    this.invoices.set(invoice1.id, invoice1);
    this.invoices.set(invoice2.id, invoice2);

    // المعاملات التجريبية
    const transaction1: Transaction = {
      id: randomUUID(),
      transactionType: "قبض",
      amount: "300000",
      date: new Date("2024-02-10"),
      linkedInvoiceId: invoice1.id,
      linkedProjectId: project1.id,
      linkedClientId: customer1.id,
      linkedPartnerId: null,
      cashboxId: cashbox1.id,
      description: "دفعة مقدمة من العميل",
      createdAt: new Date()
    };

    const transaction2: Transaction = {
      id: randomUUID(),
      transactionType: "صرف",
      amount: "100000",
      date: new Date("2024-02-12"),
      linkedInvoiceId: null,
      linkedProjectId: project1.id,
      linkedClientId: null,
      linkedPartnerId: partner1.id,
      cashboxId: cashbox1.id,
      description: "مصروفات مواد بناء",
      createdAt: new Date()
    };

    this.transactions.set(transaction1.id, transaction1);
    this.transactions.set(transaction2.id, transaction2);

    // التسويات التجريبية
    const settlement1: Settlement = {
      id: randomUUID(),
      partnerId: partner1.id,
      paymentAmount: "2500000",
      previousBalance: "0",
      outstandingAmount: "700000",
      finalBalance: "1800000",
      date: new Date("2024-02-01"),
      linkedProjectId: project1.id,
      notes: "تسوية شهر فبراير",
      createdAt: new Date()
    };

    this.settlements.set(settlement1.id, settlement1);

    // الإيرادات التجريبية
    const revenue1: Revenue = {
      id: randomUUID(),
      amount: "300000",
      date: new Date("2024-02-10"),
      projectId: project1.id,
      description: "إيراد من بيع الوحدة الأولى",
      createdAt: new Date()
    };

    this.revenue.set(revenue1.id, revenue1);

    // المصروفات التجريبية
    const expense1: Expense = {
      id: randomUUID(),
      amount: "100000",
      date: new Date("2024-02-12"),
      projectId: project1.id,
      category: "مواد بناء",
      description: "شراء أسمنت وحديد",
      createdAt: new Date()
    };

    const expense2: Expense = {
      id: randomUUID(),
      amount: "50000",
      date: new Date("2024-02-15"),
      projectId: project1.id,
      category: "عمالة",
      description: "أجور عمال البناء",
      createdAt: new Date()
    };

    this.expenses.set(expense1.id, expense1);
    this.expenses.set(expense2.id, expense2);

    // الأقساط التجريبية
    const installment1: Installment = {
      id: randomUUID(),
      unitId: unit1.id,
      type: "شهري",
      amount: "25000",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // شهر من الآن
      paymentDate: null,
      status: "غير مدفوع",
      createdAt: new Date()
    };

    const installment2: Installment = {
      id: randomUUID(),
      unitId: unit1.id,
      type: "شهري",
      amount: "25000",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // متأخر 5 أيام
      paymentDate: null,
      status: "متأخر",
      createdAt: new Date()
    };

    this.installments.set(installment1.id, installment1);
    this.installments.set(installment2.id, installment2);

    // الإحصائيات الأولية
    const initialStats: Stats = {
      id: randomUUID(),
      totalUnits: 2,
      availableUnits: 1,
      soldUnits: 1,
      returnedUnits: 0,
      totalRevenue: "300000",
      pendingPayments: "50000",
      overdueInstallments: 1,
      lastUpdated: new Date()
    };
    this.stats = initialStats;
  }

  // ===== تنفيذ المشاريع =====
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.status === status);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id,
      createdAt: new Date(),
      description: insertProject.description ?? null,
      endDate: insertProject.endDate ?? null,
      totalBudget: insertProject.totalBudget ?? null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // ===== تنفيذ الشركاء =====
  async getPartner(id: string): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async getPartnersByProject(projectId: string): Promise<Partner[]> {
    return Array.from(this.partners.values()).filter(partner => partner.projectId === projectId);
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = randomUUID();
    const partner: Partner = { 
      ...insertPartner, 
      id,
      createdAt: new Date(),
      phone: insertPartner.phone ?? null,
      email: insertPartner.email ?? null,
      address: insertPartner.address ?? null
    };
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: string, partnerUpdate: Partial<Partner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...partnerUpdate };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: string): Promise<boolean> {
    return this.partners.delete(id);
  }

  // ===== تنفيذ الخزائن =====
  async getCashbox(id: string): Promise<Cashbox | undefined> {
    return this.cashboxes.get(id);
  }

  async getAllCashboxes(): Promise<Cashbox[]> {
    return Array.from(this.cashboxes.values());
  }

  async createCashbox(insertCashbox: InsertCashbox): Promise<Cashbox> {
    const id = randomUUID();
    const cashbox: Cashbox = { 
      ...insertCashbox, 
      id,
      createdAt: new Date()
    };
    this.cashboxes.set(id, cashbox);
    return cashbox;
  }

  async updateCashbox(id: string, cashboxUpdate: Partial<Cashbox>): Promise<Cashbox | undefined> {
    const cashbox = this.cashboxes.get(id);
    if (!cashbox) return undefined;
    
    const updatedCashbox = { ...cashbox, ...cashboxUpdate };
    this.cashboxes.set(id, updatedCashbox);
    return updatedCashbox;
  }

  async deleteCashbox(id: string): Promise<boolean> {
    return this.cashboxes.delete(id);
  }

  // ===== تنفيذ الفواتير =====
  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.status === status);
  }

  async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.linkedProjectId === projectId);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id,
      createdAt: new Date(),
      linkedTransactionId: insertInvoice.linkedTransactionId ?? null,
      linkedProjectId: insertInvoice.linkedProjectId ?? null,
      linkedClientId: insertInvoice.linkedClientId ?? null,
      linkedPartnerId: insertInvoice.linkedPartnerId ?? null,
      description: insertInvoice.description ?? null
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: string, invoiceUpdate: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...invoiceUpdate };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // ===== تنفيذ المعاملات =====
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.transactionType === type);
  }

  async getTransactionsByProject(projectId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.linkedProjectId === projectId);
  }

  async getTransactionsByCashbox(cashboxId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.cashboxId === cashboxId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date(),
      linkedInvoiceId: insertTransaction.linkedInvoiceId ?? null,
      linkedProjectId: insertTransaction.linkedProjectId ?? null,
      linkedClientId: insertTransaction.linkedClientId ?? null,
      linkedPartnerId: insertTransaction.linkedPartnerId ?? null,
      cashboxId: insertTransaction.cashboxId ?? null,
      description: insertTransaction.description ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, transactionUpdate: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // ===== تنفيذ التسويات =====
  async getSettlement(id: string): Promise<Settlement | undefined> {
    return this.settlements.get(id);
  }

  async getAllSettlements(): Promise<Settlement[]> {
    return Array.from(this.settlements.values());
  }

  async getSettlementsByProject(projectId: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter(settlement => settlement.linkedProjectId === projectId);
  }

  async getSettlementsByPartner(partnerId: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter(settlement => settlement.partnerId === partnerId);
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<Settlement> {
    const id = randomUUID();
    const settlement: Settlement = { 
      ...insertSettlement, 
      id,
      createdAt: new Date(),
      notes: insertSettlement.notes ?? null
    };
    this.settlements.set(id, settlement);
    return settlement;
  }

  async updateSettlement(id: string, settlementUpdate: Partial<Settlement>): Promise<Settlement | undefined> {
    const settlement = this.settlements.get(id);
    if (!settlement) return undefined;
    
    const updatedSettlement = { ...settlement, ...settlementUpdate };
    this.settlements.set(id, updatedSettlement);
    return updatedSettlement;
  }

  async deleteSettlement(id: string): Promise<boolean> {
    return this.settlements.delete(id);
  }

  async calculateSettlements(projectId: string): Promise<Settlement[]> {
    const partners = await this.getPartnersByProject(projectId);
    const settlements: Settlement[] = [];

    if (partners.length < 2) {
      return settlements;
    }

    // حساب إجمالي المدفوعات لكل شريك
    const partnerPayments = new Map<string, number>();
    for (const partner of partners) {
      const transactions = await this.getTransactionsByProject(projectId);
      const partnerTransactions = transactions.filter(t => t.linkedPartnerId === partner.id);
      const totalPaid = partnerTransactions.reduce((sum, t) => {
        if (t.transactionType === "قبض") {
          return sum + parseFloat(t.amount);
        } else {
          return sum - parseFloat(t.amount);
        }
      }, 0);
      partnerPayments.set(partner.id, totalPaid);
    }

    // حساب المتوسط
    const totalPayments = Array.from(partnerPayments.values()).reduce((sum, amount) => sum + amount, 0);
    const averagePayment = totalPayments / partners.length;

    // إنشاء التسويات
    for (const partner of partners) {
      const partnerPayment = partnerPayments.get(partner.id) || 0;
      const outstandingAmount = averagePayment - partnerPayment;
      
      if (Math.abs(outstandingAmount) > 0.01) { // تجنب التسويات الصغيرة جداً
        const settlement: Settlement = {
          id: randomUUID(),
          partnerId: partner.id,
          paymentAmount: Math.abs(outstandingAmount),
          previousBalance: parseFloat(partner.currentBalance),
          outstandingAmount: Math.abs(outstandingAmount),
          finalBalance: outstandingAmount > 0 ? parseFloat(partner.currentBalance) + outstandingAmount : parseFloat(partner.currentBalance) - Math.abs(outstandingAmount),
          date: new Date(),
          linkedProjectId: projectId,
          notes: outstandingAmount > 0 ? "مستحق للشريك" : "مستحق على الشريك",
          createdAt: new Date()
        };
        settlements.push(settlement);
      }
    }

    return settlements;
  }

  // ===== تنفيذ الإيرادات =====
  async getRevenue(id: string): Promise<Revenue | undefined> {
    return this.revenue.get(id);
  }

  async getAllRevenue(): Promise<Revenue[]> {
    return Array.from(this.revenue.values());
  }

  async getRevenueByProject(projectId: string): Promise<Revenue[]> {
    return Array.from(this.revenue.values()).filter(rev => rev.projectId === projectId);
  }

  async createRevenue(insertRevenue: InsertRevenue): Promise<Revenue> {
    const id = randomUUID();
    const revenueItem: Revenue = { 
      ...insertRevenue, 
      id,
      createdAt: new Date(),
      projectId: insertRevenue.projectId ?? null,
      description: insertRevenue.description ?? null
    };
    this.revenue.set(id, revenueItem);
    return revenueItem;
  }

  async updateRevenue(id: string, revenueUpdate: Partial<Revenue>): Promise<Revenue | undefined> {
    const revenueItem = this.revenue.get(id);
    if (!revenueItem) return undefined;
    
    const updatedRevenue = { ...revenueItem, ...revenueUpdate };
    this.revenue.set(id, updatedRevenue);
    return updatedRevenue;
  }

  async deleteRevenue(id: string): Promise<boolean> {
    return this.revenue.delete(id);
  }

  // ===== تنفيذ المصروفات =====
  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(exp => exp.projectId === projectId);
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(exp => exp.category === category);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { 
      ...insertExpense, 
      id,
      createdAt: new Date(),
      projectId: insertExpense.projectId ?? null,
      category: insertExpense.category ?? null,
      description: insertExpense.description ?? null
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, expenseUpdate: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // ===== تنفيذ العملاء =====
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: new Date(),
      email: insertCustomer.email ?? null,
      address: insertCustomer.address ?? null,
      notes: insertCustomer.notes ?? null
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, customerUpdate: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  // ===== تنفيذ الوحدات =====
  async getUnit(id: string): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async getAllUnits(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async getUnitsByStatus(status: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(unit => unit.status === status);
  }

  async getUnitsByProject(projectId: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(unit => unit.projectId === projectId);
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const id = randomUUID();
    const unit: Unit = { 
      ...insertUnit, 
      id,
      createdAt: new Date(),
      customerId: insertUnit.customerId ?? null,
      projectId: insertUnit.projectId ?? null,
      reservationFee: insertUnit.reservationFee ?? null,
      commission: insertUnit.commission ?? null,
      maintenanceAmount: insertUnit.maintenanceAmount ?? null,
      garageShare: insertUnit.garageShare ?? null
    };
    this.units.set(id, unit);
    await this.updateStats();
    return unit;
  }

  async updateUnit(id: string, unitUpdate: Partial<Unit>): Promise<Unit | undefined> {
    const unit = this.units.get(id);
    if (!unit) return undefined;
    
    const updatedUnit = { ...unit, ...unitUpdate };
    this.units.set(id, updatedUnit);
    await this.updateStats();
    return updatedUnit;
  }

  async deleteUnit(id: string): Promise<boolean> {
    const deleted = this.units.delete(id);
    if (deleted) await this.updateStats();
    return deleted;
  }

  // ===== تنفيذ الأقساط =====
  async getInstallment(id: string): Promise<Installment | undefined> {
    return this.installments.get(id);
  }

  async getInstallmentsByUnit(unitId: string): Promise<Installment[]> {
    return Array.from(this.installments.values()).filter(inst => inst.unitId === unitId);
  }

  async getOverdueInstallments(): Promise<Installment[]> {
    const now = new Date();
    return Array.from(this.installments.values()).filter(
      inst => inst.status === "متأخر" || (inst.dueDate < now && inst.status === "غير مدفوع")
    );
  }

  async getAllInstallments(): Promise<Installment[]> {
    return Array.from(this.installments.values());
  }

  async createInstallment(insertInstallment: InsertInstallment): Promise<Installment> {
    const id = randomUUID();
    const installment: Installment = { 
      ...insertInstallment, 
      id,
      createdAt: new Date(),
      paymentDate: insertInstallment.paymentDate ?? null
    };
    this.installments.set(id, installment);
    return installment;
  }

  async updateInstallment(id: string, installmentUpdate: Partial<Installment>): Promise<Installment | undefined> {
    const installment = this.installments.get(id);
    if (!installment) return undefined;
    
    const updatedInstallment = { ...installment, ...installmentUpdate };
    this.installments.set(id, updatedInstallment);
    return updatedInstallment;
  }

  // ===== تنفيذ الوحدات المشتركة =====
  async getPartnerUnit(id: string): Promise<PartnerUnit | undefined> {
    return this.partnerUnits.get(id);
  }

  async getPartnerUnitsByPartner(partnerId: string): Promise<PartnerUnit[]> {
    return Array.from(this.partnerUnits.values()).filter(pu => pu.partnerId === partnerId);
  }

  async getPartnerUnitsByUnit(unitId: string): Promise<PartnerUnit[]> {
    return Array.from(this.partnerUnits.values()).filter(pu => pu.unitId === unitId);
  }

  async createPartnerUnit(insertPartnerUnit: InsertPartnerUnit): Promise<PartnerUnit> {
    const id = randomUUID();
    const partnerUnit: PartnerUnit = { 
      ...insertPartnerUnit, 
      id,
      createdAt: new Date()
    };
    this.partnerUnits.set(id, partnerUnit);
    return partnerUnit;
  }

  // ===== تنفيذ الشقق المرتجعة =====
  async getReturnedUnit(id: string): Promise<ReturnedUnit | undefined> {
    return this.returnedUnits.get(id);
  }

  async getAllReturnedUnits(): Promise<ReturnedUnit[]> {
    return Array.from(this.returnedUnits.values());
  }

  async createReturnedUnit(insertReturnedUnit: InsertReturnedUnit): Promise<ReturnedUnit> {
    const id = randomUUID();
    const returnedUnit: ReturnedUnit = { 
      ...insertReturnedUnit, 
      id,
      createdAt: new Date(),
      completingPartnerId: insertReturnedUnit.completingPartnerId ?? null,
      completionDate: insertReturnedUnit.completionDate ?? null,
      completionAmount: insertReturnedUnit.completionAmount ?? null
    };
    this.returnedUnits.set(id, returnedUnit);
    return returnedUnit;
  }

  async updateReturnedUnit(id: string, returnedUnitUpdate: Partial<ReturnedUnit>): Promise<ReturnedUnit | undefined> {
    const returnedUnit = this.returnedUnits.get(id);
    if (!returnedUnit) return undefined;
    
    const updatedReturnedUnit = { ...returnedUnit, ...returnedUnitUpdate };
    this.returnedUnits.set(id, updatedReturnedUnit);
    return updatedReturnedUnit;
  }

  // ===== تنفيذ المدفوعات =====
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByUnit(unitId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.unitId === unitId);
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.customerId === customerId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      paymentMethod: insertPayment.paymentMethod ?? null,
      notes: insertPayment.notes ?? null,
      paymentDate: insertPayment.paymentDate ?? new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  // ===== تنفيذ الإحصائيات =====
  async getStats(): Promise<Stats | undefined> {
    return this.stats;
  }

  async updateStats(): Promise<void> {
    const units = Array.from(this.units.values());
    const overdueInst = await this.getOverdueInstallments();
    
    const totalUnits = units.length;
    const availableUnits = units.filter(u => u.status === "متاحة").length;
    const soldUnits = units.filter(u => u.status === "مباعة").length;
    const returnedUnits = units.filter(u => u.status === "مرتجعة").length;
    
    const payments = Array.from(this.payments.values());
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toString();
    const pendingInstallments = Array.from(this.installments.values()).filter(i => i.status === "غير مدفوع");
    const pendingPayments = pendingInstallments.reduce((sum, i) => sum + parseFloat(i.amount), 0).toString();
    
    this.stats = {
      id: this.stats?.id || randomUUID(),
      totalUnits,
      availableUnits,
      soldUnits,
      returnedUnits,
      totalRevenue,
      pendingPayments,
      overdueInstallments: overdueInst.length,
      lastUpdated: new Date()
    };
  }

  // ===== تنفيذ التقارير =====
  async getSettlementReport(projectId: string): Promise<any> {
    const settlements = await this.getSettlementsByProject(projectId);
    const partners = await this.getPartnersByProject(projectId);
    
    return {
      projectId,
      settlements,
      partners,
      totalSettlements: settlements.length,
      totalAmount: settlements.reduce((sum, s) => sum + parseFloat(s.paymentAmount), 0),
      generatedAt: new Date()
    };
  }

  async getFinancialReport(projectId: string): Promise<any> {
    const revenue = await this.getRevenueByProject(projectId);
    const expenses = await this.getExpensesByProject(projectId);
    const transactions = await this.getTransactionsByProject(projectId);
    
    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      projectId,
      revenue,
      expenses,
      transactions,
      totalRevenue,
      totalExpenses,
      netProfit,
      generatedAt: new Date()
    };
  }
}

export const storage = new MemStorage();