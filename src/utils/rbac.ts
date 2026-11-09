export type UserRole =
  | 'super_admin'
  | 'business_owner'
  | 'business_manager'
  | 'accountant'
  | 'sales_attendant'
  | 'inventory_manager';

export interface RolePermissions {
  canViewSuperAdmin: boolean;
  canManageBusinessSettings: boolean;
  canManageSubscription: boolean;
  canManageEmployees: boolean;
  canViewFinancials: boolean;
  canRecordExpenses: boolean;
  canRecordSales: boolean;
  canManageInventory: boolean;
  canManageInvoices: boolean;
  canManageAppointments: boolean;
  canAccessGeminiAI: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    canViewSuperAdmin: true,
    canManageBusinessSettings: true,
    canManageSubscription: true,
    canManageEmployees: true,
    canViewFinancials: true,
    canRecordExpenses: true,
    canRecordSales: true,
    canManageInventory: true,
    canManageInvoices: true,
    canManageAppointments: true,
    canAccessGeminiAI: true,
  },
  business_owner: {
    canViewSuperAdmin: false,
    canManageBusinessSettings: true,
    canManageSubscription: true,
    canManageEmployees: true,
    canViewFinancials: true,
    canRecordExpenses: true,
    canRecordSales: true,
    canManageInventory: true,
    canManageInvoices: true,
    canManageAppointments: true,
    canAccessGeminiAI: true,
  },
  business_manager: {
    canViewSuperAdmin: false,
    canManageBusinessSettings: false,
    canManageSubscription: false,
    canManageEmployees: true,
    canViewFinancials: true,
    canRecordExpenses: true,
    canRecordSales: true,
    canManageInventory: true,
    canManageInvoices: true,
    canManageAppointments: true,
    canAccessGeminiAI: true,
  },
  accountant: {
    canViewSuperAdmin: false,
    canManageBusinessSettings: false,
    canManageSubscription: false,
    canManageEmployees: false,
    canViewFinancials: true,
    canRecordExpenses: true,
    canRecordSales: false,
    canManageInventory: false,
    canManageInvoices: true,
    canManageAppointments: false,
    canAccessGeminiAI: true,
  },
  sales_attendant: {
    canViewSuperAdmin: false,
    canManageBusinessSettings: false,
    canManageSubscription: false,
    canManageEmployees: false,
    canViewFinancials: false,
    canRecordExpenses: false,
    canRecordSales: true,
    canManageInventory: false,
    canManageInvoices: false,
    canManageAppointments: true,
    canAccessGeminiAI: false,
  },
  inventory_manager: {
    canViewSuperAdmin: false,
    canManageBusinessSettings: false,
    canManageSubscription: false,
    canManageEmployees: false,
    canViewFinancials: false,
    canRecordExpenses: false,
    canRecordSales: false,
    canManageInventory: true,
    canManageInvoices: false,
    canManageAppointments: false,
    canAccessGeminiAI: false,
  },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return !!ROLE_PERMISSIONS[role]?.[permission];
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Administrator';
    case 'business_owner':
      return 'Business Owner';
    case 'business_manager':
      return 'Business Manager';
    case 'accountant':
      return 'Accountant';
    case 'sales_attendant':
      return 'Sales Attendant';
    case 'inventory_manager':
      return 'Inventory Manager';
    default:
      return role;
  }
}
