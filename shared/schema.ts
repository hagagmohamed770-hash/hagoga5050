import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// المشاريع (Projects)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("جارٍ"), // جارٍ / مكتمل / متوقف
  totalSharePercentage: decimal("total_share_percentage", { precision: 5, scale: 2 }).default("100"),
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الشركاء (Partners)
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  sharePercentage: decimal("share_percentage", { precision: 5, scale: 2 }).notNull(),
  previousBalance: decimal("previous_balance", { precision: 15, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0"),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الخزائن (Cashboxes)
export const cashboxes = pgTable("cashboxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الفواتير (Invoices)
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("غير مدفوعة"), // مدفوعة / غير مدفوعة
  dueDate: timestamp("due_date").notNull(),
  linkedTransactionId: varchar("linked_transaction_id"),
  linkedProjectId: varchar("linked_project_id"),
  linkedClientId: varchar("linked_client_id"),
  linkedPartnerId: varchar("linked_partner_id"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// المعاملات (Transactions)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionType: text("transaction_type").notNull(), // قبض / صرف
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  linkedInvoiceId: varchar("linked_invoice_id"),
  linkedProjectId: varchar("linked_project_id"),
  linkedClientId: varchar("linked_client_id"),
  linkedPartnerId: varchar("linked_partner_id"),
  cashboxId: varchar("cashbox_id"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// التسويات (Settlements)
export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 15, scale: 2 }).notNull(),
  previousBalance: decimal("previous_balance", { precision: 15, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 15, scale: 2 }).notNull(),
  finalBalance: decimal("final_balance", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  linkedProjectId: varchar("linked_project_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الإيرادات (Revenue)
export const revenue = pgTable("revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  projectId: varchar("project_id"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// المصروفات (Expenses)
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  projectId: varchar("project_id"),
  category: text("category"), // مواد بناء / عمالة / إدارة / أخرى
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// العملاء (Customers)
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الوحدات (Units) - للعقارات
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // سكني / تجاري
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 12, scale: 2 }).notNull(),
  reservationFee: decimal("reservation_fee", { precision: 10, scale: 2 }),
  commission: decimal("commission", { precision: 10, scale: 2 }),
  maintenanceAmount: decimal("maintenance_amount", { precision: 10, scale: 2 }),
  garageShare: decimal("garage_share", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("متاحة"), // متاحة / مباعة / مرتجعة
  customerId: varchar("customer_id"),
  projectId: varchar("project_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الأقساط (Installments)
export const installments = pgTable("installments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  type: text("type").notNull(), // شهري / ربع سنوي / سنوي
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").notNull().default("غير مدفوع"), // مدفوع / متأخر / غير مدفوع
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الوحدات المشتركة (Partner Units)
export const partnerUnits = pgTable("partner_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  unitId: varchar("unit_id").notNull(),
  partnershipPercentage: decimal("partnership_percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// الشقق المرتجعة (Returned Units)
export const returnedUnits = pgTable("returned_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  returnReason: text("return_reason").notNull(),
  completingPartnerId: varchar("completing_partner_id"),
  completionDate: timestamp("completion_date"),
  completionAmount: decimal("completion_amount", { precision: 12, scale: 2 }),
  resaleStatus: text("resale_status").default("متاحة للبيع"), // متاحة للبيع / تم البيع
  createdAt: timestamp("created_at").default(sql`now()`),
});

// المدفوعات (Payments)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(), // مقدم / قسط / رسوم إضافية
  paymentMethod: text("payment_method"), // نقد / تحويل / شيك
  paymentDate: timestamp("payment_date").default(sql`now()`),
  notes: text("notes"),
});

// الإحصائيات (Statistics)
export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalUnits: integer("total_units").default(0),
  availableUnits: integer("available_units").default(0),
  soldUnits: integer("sold_units").default(0),
  returnedUnits: integer("returned_units").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  pendingPayments: decimal("pending_payments", { precision: 15, scale: 2 }).default("0"),
  overdueInstallments: integer("overdue_installments").default(0),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true });
export const insertCashboxSchema = createInsertSchema(cashboxes).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertSettlementSchema = createInsertSchema(settlements).omit({ id: true, createdAt: true });
export const insertRevenueSchema = createInsertSchema(revenue).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true });
export const insertInstallmentSchema = createInsertSchema(installments).omit({ id: true, createdAt: true });
export const insertPartnerUnitSchema = createInsertSchema(partnerUnits).omit({ id: true, createdAt: true });
export const insertReturnedUnitSchema = createInsertSchema(returnedUnits).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertStatsSchema = createInsertSchema(stats).omit({ id: true, lastUpdated: true });

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Cashbox = typeof cashboxes.$inferSelect;
export type InsertCashbox = z.infer<typeof insertCashboxSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Revenue = typeof revenue.$inferSelect;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = z.infer<typeof insertInstallmentSchema>;
export type PartnerUnit = typeof partnerUnits.$inferSelect;
export type InsertPartnerUnit = z.infer<typeof insertPartnerUnitSchema>;
export type ReturnedUnit = typeof returnedUnits.$inferSelect;
export type InsertReturnedUnit = z.infer<typeof insertReturnedUnitSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;