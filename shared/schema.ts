import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// الوحدات (Units)
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

// الشركاء (Partners)
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  partnershipType: text("partnership_type").notNull(), // 50/50, 20/70, etc.
  profitPercentage: decimal("profit_percentage", { precision: 5, scale: 2 }).notNull(),
  receivedPayments: decimal("received_payments", { precision: 12, scale: 2 }).default("0"),
  remainingPayments: decimal("remaining_payments", { precision: 12, scale: 2 }).default("0"),
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
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true });
export const insertInstallmentSchema = createInsertSchema(installments).omit({ id: true, createdAt: true });
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true });
export const insertPartnerUnitSchema = createInsertSchema(partnerUnits).omit({ id: true, createdAt: true });
export const insertReturnedUnitSchema = createInsertSchema(returnedUnits).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertStatsSchema = createInsertSchema(stats).omit({ id: true, lastUpdated: true });

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = z.infer<typeof insertInstallmentSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type PartnerUnit = typeof partnerUnits.$inferSelect;
export type InsertPartnerUnit = z.infer<typeof insertPartnerUnitSchema>;
export type ReturnedUnit = typeof returnedUnits.$inferSelect;
export type InsertReturnedUnit = z.infer<typeof insertReturnedUnitSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;