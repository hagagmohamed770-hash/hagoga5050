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
  type InsertStats 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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
  
  // الشركاء (Partners)
  getPartner(id: string): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<Partner>): Promise<Partner | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer> = new Map();
  private units: Map<string, Unit> = new Map();
  private installments: Map<string, Installment> = new Map();
  private partners: Map<string, Partner> = new Map();
  private partnerUnits: Map<string, PartnerUnit> = new Map();
  private returnedUnits: Map<string, ReturnedUnit> = new Map();
  private payments: Map<string, Payment> = new Map();
  private stats: Stats | undefined;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // العملاء التجريبيين
    const customer1: Customer = {
      id: randomUUID(),
      name: "أحمد محمد علي",
      phone: "01234567890",
      email: "ahmed@example.com",
      address: "القاهرة، مصر الجديدة",
      notes: "عميل مميز",
      createdAt: new Date()
    };
    
    const customer2: Customer = {
      id: randomUUID(),
      name: "سارة إبراهيم",
      phone: "01098765432",
      email: "sara@example.com",
      address: "الجيزة، الهرم",
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
      createdAt: new Date()
    };

    this.units.set(unit1.id, unit1);
    this.units.set(unit2.id, unit2);

    // الشركاء التجريبيين
    const partner1: Partner = {
      id: randomUUID(),
      name: "محمد أحمد",
      partnershipType: "50/50",
      profitPercentage: "50",
      receivedPayments: "500000",
      remainingPayments: "200000",
      createdAt: new Date()
    };

    this.partners.set(partner1.id, partner1);

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
      totalRevenue: "700000",
      pendingPayments: "50000",
      overdueInstallments: 1,
      lastUpdated: new Date()
    };
    this.stats = initialStats;
  }

  // تنفيذ العملاء
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

  // تنفيذ الوحدات
  async getUnit(id: string): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async getAllUnits(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async getUnitsByStatus(status: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(unit => unit.status === status);
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const id = randomUUID();
    const unit: Unit = { 
      ...insertUnit, 
      id,
      createdAt: new Date(),
      customerId: insertUnit.customerId ?? null,
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

  // تنفيذ الأقساط
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

  // تنفيذ الشركاء
  async getPartner(id: string): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = randomUUID();
    const partner: Partner = { 
      ...insertPartner, 
      id,
      createdAt: new Date()
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

  // تنفيذ الوحدات المشتركة
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

  // تنفيذ الشقق المرتجعة
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

  // تنفيذ المدفوعات
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

  // تنفيذ الإحصائيات
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
}

export const storage = new MemStorage();