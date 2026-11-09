import { UserRole, RolePermissions } from '../utils/rbac.ts';

export interface BusinessTenant {
  id: number;
  name: string;
  slug: string;
  currency: string;
  country: string;
  phone?: string;
  email?: string;
  address?: string;
  taxPin?: string;
  tier: string;
  tierStatus: string;
  tierRenewalDate?: string;
  mpesaPaybill?: string;
  mpesaTill?: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  businessId: number | null;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  commissionRate?: string;
  status: string;
}

export interface AuthState {
  user: UserProfile;
  business?: BusinessTenant;
  permissions: RolePermissions;
  availableUsers: Array<{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    businessId: number | null;
    businessName: string;
  }>;
  availableBusinesses: BusinessTenant[];
}

export interface ProductItem {
  id: number;
  businessId: number;
  categoryId?: number;
  categoryName?: string;
  sku: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  isLowStock?: boolean;
}

export interface SaleItem {
  id: number;
  receiptNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  mpesaReference?: string;
  paymentStatus: string;
  itemsJson: string;
  notes?: string;
  createdAt: string;
  customerId?: number;
  customerName?: string;
  cashierUserId?: number;
  cashierName?: string;
}

export interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  itemsJson: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseItem {
  id: number;
  businessId: number;
  category: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  description: string;
  paidTo?: string;
  expenseDate: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  outstandingBalance: number;
  loyaltyPoints: number;
  notes?: string;
  totalPurchasesCount?: number;
  totalSpend?: number;
}

export interface EmployeeProfile {
  id: number;
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  phone?: string;
  commissionRate: string;
  status: string;
  salesCount?: number;
  totalSalesAttributed?: number;
  commissionEarned?: number;
}

export interface AppointmentItem {
  id: number;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  staffUserId?: number;
  staffName?: string;
  status: string;
  price: number;
  notes?: string;
}

export interface SubscriptionPlan {
  code: string;
  name: string;
  priceKES: number;
  usersLimit: number;
  productsLimit: number;
  invoicesLimit: number;
  aiAssistant: boolean;
}
