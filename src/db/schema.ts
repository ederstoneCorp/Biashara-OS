import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Businesses (Tenants)
export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  currency: text('currency').notNull().default('KES'),
  country: text('country').notNull().default('Kenya'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  taxPin: text('tax_pin'),
  tier: text('tier').notNull().default('starter'), // free, starter, business, premium, enterprise
  tierStatus: text('tier_status').notNull().default('active'),
  tierRenewalDate: timestamp('tier_renewal_date'),
  mpesaPaybill: text('mpesa_paybill'),
  mpesaTill: text('mpesa_till'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Users (Role-based access: super_admin, business_owner, business_manager, accountant, sales_attendant, inventory_manager)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  businessId: integer('business_id').references(() => businesses.id),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('business_owner'),
  phone: text('phone'),
  commissionRate: text('commission_rate').default('0.0'), // Percentage string e.g. "5.0"
  status: text('status').notNull().default('active'), // active, inactive
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Products & Services
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().default('product'), // 'product' | 'service'
  costPrice: integer('cost_price').notNull().default(0), // in KES
  sellingPrice: integer('selling_price').notNull().default(0), // in KES
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockAlert: integer('min_stock_alert').notNull().default(5),
  unit: text('unit').notNull().default('pcs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Stock Movements
export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // 'in', 'out', 'adjustment', 'sale'
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason'),
  recordedByUserId: integer('recorded_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Suppliers
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  balance: integer('balance').notNull().default(0), // debt to supplier
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Purchases
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  reference: text('reference').notNull(),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('received'), // 'ordered', 'received', 'cancelled'
  paymentStatus: text('payment_status').notNull().default('paid'), // 'paid', 'partial', 'unpaid'
  itemsJson: text('items_json').notNull().default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Customers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  outstandingBalance: integer('outstanding_balance').notNull().default(0),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Sales (POS)
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  receiptNumber: text('receipt_number').notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  cashierUserId: integer('cashier_user_id').references(() => users.id),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  taxAmount: integer('tax_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('mpesa'), // mpesa, cash, card, bank, credit
  mpesaReference: text('mpesa_reference'), // e.g. QHK482910X
  paymentStatus: text('payment_status').notNull().default('completed'), // completed, partial, pending
  itemsJson: text('items_json').notNull().default('[]'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Invoices
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
  subtotal: integer('subtotal').notNull(),
  taxAmount: integer('tax_amount').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  amountPaid: integer('amount_paid').notNull().default(0),
  status: text('status').notNull().default('sent'), // draft, sent, paid, partial, overdue, cancelled
  itemsJson: text('items_json').notNull().default('[]'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Expenses
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  category: text('category').notNull(), // Rent, Utilities, Payroll, Inventory, Transport, Marketing, Other
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('mpesa'),
  reference: text('reference'),
  description: text('description').notNull(),
  paidTo: text('paid_to'),
  recordedByUserId: integer('recorded_by_user_id').references(() => users.id),
  expenseDate: text('expense_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Appointments
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  staffUserId: integer('staff_user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceName: text('service_name').notNull(),
  appointmentDate: text('appointment_date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  status: text('status').notNull().default('confirmed'), // pending, confirmed, completed, cancelled
  price: integer('price').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id).notNull(),
  planCode: text('plan_code').notNull(), // free, starter, business, premium, enterprise
  planName: text('plan_name').notNull(),
  billingCycle: text('billing_cycle').notNull().default('monthly'), // monthly, yearly
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('KES'),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').notNull().default('active'), // active, expired, cancelled
  paymentChannel: text('payment_channel').notNull().default('daraja_mpesa'),
  mpesaCheckoutRequestId: text('mpesa_checkout_request_id'),
  mpesaReceiptNumber: text('mpesa_receipt_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const businessesRelations = relations(businesses, ({ many }) => ({
  users: many(users),
  products: many(products),
  sales: many(sales),
  invoices: many(invoices),
  expenses: many(expenses),
  customers: many(customers),
  subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
  sales: many(sales),
  expenses: many(expenses),
  appointments: many(appointments),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stockMovements: many(stockMovements),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
  sales: many(sales),
  invoices: many(invoices),
  appointments: many(appointments),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  business: one(businesses, {
    fields: [sales.businessId],
    references: [businesses.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  cashier: one(users, {
    fields: [sales.cashierUserId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  business: one(businesses, {
    fields: [invoices.businessId],
    references: [businesses.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));
