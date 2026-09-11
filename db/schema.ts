// db/schema.ts
import { pgTable, serial, text, timestamp, boolean, numeric, integer, jsonb } from 'drizzle-orm/pg-core';

// جدول المستخدمين
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('USER'), // ADMIN or USER
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// جدول الصلاحيات
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  actionName: text('action_name').notNull().unique(),
});

export const userPermissions = pgTable('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionId: integer('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
});

// جدول الأصناف
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  itemsPerBox: integer('items_per_box').notNull(),
  buyPriceBox: numeric('buy_price_box', { precision: 10, scale: 2 }).notNull(),
  sellPriceBox: numeric('sell_price_box', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'), // Soft delete
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// فواتير الشراء الرئيسية
export const purchaseInvoices = pgTable('purchase_invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  date: timestamp('date').defaultNow().notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  deletedAt: timestamp('deleted_at'),
});

// بنود فاتورة الشراء (مع تجميد الأسعار التاريخية Snapshot)
export const purchaseInvoiceItems = pgTable('purchase_invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => purchaseInvoices.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(), // عدد العلب
  buyPriceAtTime: numeric('buy_price_at_time', { precision: 10, scale: 2 }).notNull(),
  sellPriceAtTime: numeric('sell_price_at_time', { precision: 10, scale: 2 }).notNull(),
  itemsPerBoxAtTime: integer('items_per_box_at_time').notNull(),
});

// جدول الجرد اليومي الرئيسي
export const inventoryCounts = pgTable('inventory_counts', {
  id: serial('id').primaryKey(),
  date: timestamp('date').defaultNow().notNull(),
  totalValue: numeric('total_value', { precision: 10, scale: 2 }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
});

// تفاصيل بنود الجرد اليومي (العلب والقطع لكل صنف)
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  inventoryCountId: integer('inventory_count_id').references(() => inventoryCounts.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  fullBoxes: integer('full_boxes').notNull().default(0),
  looseItems: integer('loose_items').notNull().default(0),
  itemValue: numeric('item_value', { precision: 10, scale: 2 }).notNull(),
});

// جدول الأرباح اليومية
export const dailyProfits = pgTable('daily_profits', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull().unique(),
  buffetProfit: numeric('buffet_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  iceCreamProfit: numeric('ice_cream_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  billiardProfit: numeric('billiard_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  playstationProfit: numeric('playstation_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  barberProfit: numeric('barber_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  otherProfit: numeric('other_profit', { precision: 10, scale: 2 }).default('0').notNull(),
  totalExpenses: numeric('total_expenses', { precision: 10, scale: 2 }).default('0').notNull(),
  netProfit: numeric('net_profit', { precision: 10, scale: 2 }).default('0').notNull(),
});

// جدول المصروفات
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  date: timestamp('date').defaultNow().notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // كهرباء، إيجار، رواتب...
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  notes: text('notes'),
  deletedAt: timestamp('deleted_at'),
});

// جدول الديون
export const debts = pgTable('debts', {
  id: serial('id').primaryKey(),
  creditorName: text('creditor_name').notNull(),
  phone: text('phone'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  remainingAmount: numeric('remaining_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE / COMPLETED
  notes: text('notes'),
  deletedAt: timestamp('deleted_at'),
});

// جدول الأقساط والدفعات
export const installments = pgTable('installments', {
  id: serial('id').primaryKey(),
  debtId: integer('debt_id').references(() => debts.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING / PAID
  paidAt: timestamp('paid_at'),
});

// سجل العمليات الحساسة (Audit Log)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(), // ADD, EDIT, DELETE, PRICE_CHANGE
  tableName: text('table_name').notNull(),
  recordId: integer('record_id').notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});