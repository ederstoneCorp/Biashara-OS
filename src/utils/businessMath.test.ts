import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinancialSummary,
  calculateInventoryValuation,
  calculateStaffCommission,
} from './businessMath.ts';
import { hasPermission, getRoleLabel } from './rbac.ts';
import { normalizeKenyanPhone } from './mpesa.ts';

test('financial summary computes gross profit, net profit and margins correctly', () => {
  const result = calculateFinancialSummary({
    salesTotal: 200000,
    costOfGoodsSold: 120000,
    expensesTotal: 30000,
  });

  assert.equal(result.revenue, 200000);
  assert.equal(result.grossProfit, 80000);
  assert.equal(result.grossMarginPct, 40);
  assert.equal(result.netProfit, 50000);
  assert.equal(result.netMarginPct, 25);
});

test('inventory valuation aggregates units, cost and retail correctly', () => {
  const items = [
    { costPrice: 30000, sellingPrice: 38000, stockQuantity: 10 },
    { costPrice: 1000, sellingPrice: 1500, stockQuantity: 20 },
  ];
  const valuation = calculateInventoryValuation(items);

  assert.equal(valuation.totalUnits, 30);
  assert.equal(valuation.totalCostValue, 320000); // 300000 + 20000
  assert.equal(valuation.totalRetailValue, 410000); // 380000 + 30000
  assert.equal(valuation.potentialGrossProfit, 90000);
});

test('staff commission applies percentage accurately', () => {
  const commission = calculateStaffCommission(150000, '5.0');
  assert.equal(commission, 7500);

  const zeroCommission = calculateStaffCommission(150000, '0.0');
  assert.equal(zeroCommission, 0);
});

test('RBAC enforces correct permissions by role', () => {
  assert.equal(hasPermission('super_admin', 'canViewSuperAdmin'), true);
  assert.equal(hasPermission('business_owner', 'canViewSuperAdmin'), false);
  assert.equal(hasPermission('sales_attendant', 'canRecordSales'), true);
  assert.equal(hasPermission('sales_attendant', 'canViewFinancials'), false);
  assert.equal(hasPermission('accountant', 'canViewFinancials'), true);
  assert.equal(hasPermission('accountant', 'canRecordSales'), false);
  assert.equal(getRoleLabel('sales_attendant'), 'Sales Attendant');
});

test('M-Pesa phone normalizer handles standard Kenyan formats', () => {
  assert.equal(normalizeKenyanPhone('0712345678'), '254712345678');
  assert.equal(normalizeKenyanPhone('+254 712-345-678'), '254712345678');
  assert.equal(normalizeKenyanPhone('0110123456'), '254110123456');
  assert.equal(normalizeKenyanPhone('12345'), null);
});
