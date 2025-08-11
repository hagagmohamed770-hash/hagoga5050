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
  insertPaymentSchema
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

  // مسارات العملاء
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

  // مسارات الوحدات
  app.get("/api/units", async (req, res) => {
    try {
      const status = req.query.status as string;
      let units;
      if (status) {
        units = await storage.getUnitsByStatus(status);
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

  // مسارات الأقساط
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

  // مسارات الشركاء
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
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

  // مسارات الوحدات المشتركة
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

  // مسارات الشقق المرتجعة
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

  // مسارات المدفوعات
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

  // مسار بيانات الرسم البياني
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