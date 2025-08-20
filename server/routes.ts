import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertUnitSchema, 
  insertInstallmentSchema,
  insertPartnerSchema,
  insertPartnerUnitSchema,
  insertReturnedUnitSchema,
  insertPaymentSchema,
  insertProjectSchema,
  insertCashboxSchema,
  insertInvoiceSchema,
  insertTransactionSchema,
  insertSettlementSchema,
  insertRevenueSchema,
  insertExpenseSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // الإحصائيات العامة
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الإحصائيات" });
    }
  });

  // ===== مسارات المشاريع =====
  app.get("/api/projects", async (req, res) => {
    try {
      const status = req.query.status as string;
      let projects;
      if (status) {
        projects = await storage.getProjectsByStatus(status);
      } else {
        projects = await storage.getAllProjects();
      }
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المشاريع" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "بيانات المشروع غير صحيحة" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المشروع" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث المشروع" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف المشروع" });
    }
  });

  // ===== مسارات الشركاء =====
  app.get("/api/partners", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      let partners;
      if (projectId) {
        partners = await storage.getPartnersByProject(projectId);
      } else {
        partners = await storage.getAllPartners();
      }
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الشركاء" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      res.status(400).json({ message: "بيانات الشريك غير صحيحة" });
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const partner = await storage.updatePartner(id, req.body);
      if (!partner) {
        return res.status(404).json({ message: "الشريك غير موجود" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الشريك" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePartner(id);
      if (!deleted) {
        return res.status(404).json({ message: "الشريك غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف الشريك" });
    }
  });

  // ===== مسارات الخزائن =====
  app.get("/api/cashboxes", async (req, res) => {
    try {
      const cashboxes = await storage.getAllCashboxes();
      res.json(cashboxes);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الخزائن" });
    }
  });

  app.post("/api/cashboxes", async (req, res) => {
    try {
      const validatedData = insertCashboxSchema.parse(req.body);
      const cashbox = await storage.createCashbox(validatedData);
      res.status(201).json(cashbox);
    } catch (error) {
      res.status(400).json({ message: "بيانات الخزنة غير صحيحة" });
    }
  });

  app.get("/api/cashboxes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cashbox = await storage.getCashbox(id);
      if (!cashbox) {
        return res.status(404).json({ message: "الخزنة غير موجودة" });
      }
      res.json(cashbox);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الخزنة" });
    }
  });

  app.put("/api/cashboxes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cashbox = await storage.updateCashbox(id, req.body);
      if (!cashbox) {
        return res.status(404).json({ message: "الخزنة غير موجودة" });
      }
      res.json(cashbox);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الخزنة" });
    }
  });

  app.delete("/api/cashboxes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCashbox(id);
      if (!deleted) {
        return res.status(404).json({ message: "الخزنة غير موجودة" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف الخزنة" });
    }
  });

  // ===== مسارات الفواتير =====
  app.get("/api/invoices", async (req, res) => {
    try {
      const status = req.query.status as string;
      const projectId = req.query.projectId as string;
      let invoices;
      if (status) {
        invoices = await storage.getInvoicesByStatus(status);
      } else if (projectId) {
        invoices = await storage.getInvoicesByProject(projectId);
      } else {
        invoices = await storage.getAllInvoices();
      }
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الفواتير" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "بيانات الفاتورة غير صحيحة" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الفاتورة" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.updateInvoice(id, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الفاتورة" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف الفاتورة" });
    }
  });

  // ===== مسارات المعاملات =====
  app.get("/api/transactions", async (req, res) => {
    try {
      const type = req.query.type as string;
      const projectId = req.query.projectId as string;
      const cashboxId = req.query.cashboxId as string;
      let transactions;
      if (type) {
        transactions = await storage.getTransactionsByType(type);
      } else if (projectId) {
        transactions = await storage.getTransactionsByProject(projectId);
      } else if (cashboxId) {
        transactions = await storage.getTransactionsByCashbox(cashboxId);
      } else {
        transactions = await storage.getAllTransactions();
      }
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المعاملات" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "بيانات المعاملة غير صحيحة" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "المعاملة غير موجودة" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المعاملة" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.updateTransaction(id, req.body);
      if (!transaction) {
        return res.status(404).json({ message: "المعاملة غير موجودة" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث المعاملة" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "المعاملة غير موجودة" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف المعاملة" });
    }
  });

  // ===== مسارات التسويات =====
  app.get("/api/settlements", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const partnerId = req.query.partnerId as string;
      let settlements;
      if (projectId) {
        settlements = await storage.getSettlementsByProject(projectId);
      } else if (partnerId) {
        settlements = await storage.getSettlementsByPartner(partnerId);
      } else {
        settlements = await storage.getAllSettlements();
      }
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب التسويات" });
    }
  });

  app.post("/api/settlements", async (req, res) => {
    try {
      const validatedData = insertSettlementSchema.parse(req.body);
      const settlement = await storage.createSettlement(validatedData);
      res.status(201).json(settlement);
    } catch (error) {
      res.status(400).json({ message: "بيانات التسوية غير صحيحة" });
    }
  });

  app.get("/api/settlements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const settlement = await storage.getSettlement(id);
      if (!settlement) {
        return res.status(404).json({ message: "التسوية غير موجودة" });
      }
      res.json(settlement);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب التسوية" });
    }
  });

  app.put("/api/settlements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const settlement = await storage.updateSettlement(id, req.body);
      if (!settlement) {
        return res.status(404).json({ message: "التسوية غير موجودة" });
      }
      res.json(settlement);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث التسوية" });
    }
  });

  app.delete("/api/settlements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSettlement(id);
      if (!deleted) {
        return res.status(404).json({ message: "التسوية غير موجودة" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف التسوية" });
    }
  });

  // ===== مسارات الإيرادات =====
  app.get("/api/revenue", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      let revenue;
      if (projectId) {
        revenue = await storage.getRevenueByProject(projectId);
      } else {
        revenue = await storage.getAllRevenue();
      }
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الإيرادات" });
    }
  });

  app.post("/api/revenue", async (req, res) => {
    try {
      const validatedData = insertRevenueSchema.parse(req.body);
      const revenueItem = await storage.createRevenue(validatedData);
      res.status(201).json(revenueItem);
    } catch (error) {
      res.status(400).json({ message: "بيانات الإيراد غير صحيحة" });
    }
  });

  app.put("/api/revenue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const revenueItem = await storage.updateRevenue(id, req.body);
      if (!revenueItem) {
        return res.status(404).json({ message: "الإيراد غير موجود" });
      }
      res.json(revenueItem);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الإيراد" });
    }
  });

  app.delete("/api/revenue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRevenue(id);
      if (!deleted) {
        return res.status(404).json({ message: "الإيراد غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف الإيراد" });
    }
  });

  // ===== مسارات المصروفات =====
  app.get("/api/expenses", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const category = req.query.category as string;
      let expenses;
      if (projectId) {
        expenses = await storage.getExpensesByProject(projectId);
      } else if (category) {
        expenses = await storage.getExpensesByCategory(category);
      } else {
        expenses = await storage.getAllExpenses();
      }
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المصروفات" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: "بيانات المصروف غير صحيحة" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await storage.updateExpense(id, req.body);
      if (!expense) {
        return res.status(404).json({ message: "المصروف غير موجود" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث المصروف" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "المصروف غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف المصروف" });
    }
  });

  // ===== مسارات العملاء =====
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب العملاء" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "بيانات العميل غير صحيحة" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث العميل" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف العميل" });
    }
  });

  // ===== مسارات الوحدات =====
  app.get("/api/units", async (req, res) => {
    try {
      const status = req.query.status as string;
      const projectId = req.query.projectId as string;
      let units;
      if (status) {
        units = await storage.getUnitsByStatus(status);
      } else if (projectId) {
        units = await storage.getUnitsByProject(projectId);
      } else {
        units = await storage.getAllUnits();
      }
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الوحدات" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.status(201).json(unit);
    } catch (error) {
      res.status(400).json({ message: "بيانات الوحدة غير صحيحة" });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const unit = await storage.getUnit(id);
      if (!unit) {
        return res.status(404).json({ message: "الوحدة غير موجودة" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الوحدة" });
    }
  });

  app.put("/api/units/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const unit = await storage.updateUnit(id, req.body);
      if (!unit) {
        return res.status(404).json({ message: "الوحدة غير موجودة" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الوحدة" });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUnit(id);
      if (!deleted) {
        return res.status(404).json({ message: "الوحدة غير موجودة" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "فشل في حذف الوحدة" });
    }
  });

  // ===== مسارات الأقساط =====
  app.get("/api/installments", async (req, res) => {
    try {
      const unitId = req.query.unitId as string;
      const overdue = req.query.overdue === 'true';
      
      let installments;
      if (unitId) {
        installments = await storage.getInstallmentsByUnit(unitId);
      } else if (overdue) {
        installments = await storage.getOverdueInstallments();
      } else {
        installments = await storage.getAllInstallments();
      }
      res.json(installments);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الأقساط" });
    }
  });

  app.post("/api/installments", async (req, res) => {
    try {
      const validatedData = insertInstallmentSchema.parse(req.body);
      const installment = await storage.createInstallment(validatedData);
      res.status(201).json(installment);
    } catch (error) {
      res.status(400).json({ message: "بيانات القسط غير صحيحة" });
    }
  });

  app.put("/api/installments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const installment = await storage.updateInstallment(id, req.body);
      if (!installment) {
        return res.status(404).json({ message: "القسط غير موجود" });
      }
      res.json(installment);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث القسط" });
    }
  });

  // ===== مسارات الوحدات المشتركة =====
  app.get("/api/partner-units", async (req, res) => {
    try {
      const partnerId = req.query.partnerId as string;
      const unitId = req.query.unitId as string;
      
      let partnerUnits;
      if (partnerId) {
        partnerUnits = await storage.getPartnerUnitsByPartner(partnerId);
      } else if (unitId) {
        partnerUnits = await storage.getPartnerUnitsByUnit(unitId);
      } else {
        partnerUnits = [];
      }
      res.json(partnerUnits);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الوحدات المشتركة" });
    }
  });

  app.post("/api/partner-units", async (req, res) => {
    try {
      const validatedData = insertPartnerUnitSchema.parse(req.body);
      const partnerUnit = await storage.createPartnerUnit(validatedData);
      res.status(201).json(partnerUnit);
    } catch (error) {
      res.status(400).json({ message: "بيانات الشراكة غير صحيحة" });
    }
  });

  // ===== مسارات الشقق المرتجعة =====
  app.get("/api/returned-units", async (req, res) => {
    try {
      const returnedUnits = await storage.getAllReturnedUnits();
      res.json(returnedUnits);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب الشقق المرتجعة" });
    }
  });

  app.post("/api/returned-units", async (req, res) => {
    try {
      const validatedData = insertReturnedUnitSchema.parse(req.body);
      const returnedUnit = await storage.createReturnedUnit(validatedData);
      res.status(201).json(returnedUnit);
    } catch (error) {
      res.status(400).json({ message: "بيانات الارتجاع غير صحيحة" });
    }
  });

  app.put("/api/returned-units/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const returnedUnit = await storage.updateReturnedUnit(id, req.body);
      if (!returnedUnit) {
        return res.status(404).json({ message: "الشقة المرتجعة غير موجودة" });
      }
      res.json(returnedUnit);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث الشقة المرتجعة" });
    }
  });

  // ===== مسارات المدفوعات =====
  app.get("/api/payments", async (req, res) => {
    try {
      const unitId = req.query.unitId as string;
      const customerId = req.query.customerId as string;
      
      let payments;
      if (unitId) {
        payments = await storage.getPaymentsByUnit(unitId);
      } else if (customerId) {
        payments = await storage.getPaymentsByCustomer(customerId);
      } else {
        payments = await storage.getAllPayments();
      }
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب المدفوعات" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "بيانات الدفعة غير صحيحة" });
    }
  });

  // ===== مسارات التقارير =====
  app.get("/api/reports/settlements/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const report = await storage.getSettlementReport(projectId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب تقرير التسويات" });
    }
  });

  app.get("/api/reports/financial/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const report = await storage.getFinancialReport(projectId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب التقرير المالي" });
    }
  });

  // ===== مسار حساب التسوية التلقائي =====
  app.post("/api/settlements/calculate/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const settlements = await storage.calculateSettlements(projectId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ message: "فشل في حساب التسويات" });
    }
  });

  // ===== مسار بيانات الرسم البياني =====
  app.get("/api/charts/revenue", async (req, res) => {
    try {
      // بيانات تجريبية للرسم البياني
      const chartData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
        datasets: [
          {
            label: 'الإيرادات',
            data: [850000, 920000, 780000, 1100000, 960000, 1200000, 1050000],
            borderColor: '#0066CC',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
          },
          {
            label: 'المدفوعات المستحقة',
            data: [120000, 150000, 95000, 180000, 140000, 210000, 160000],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
          }
        ]
      };
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب بيانات الرسم البياني" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}