import React, { useState, useEffect } from 'react';
import { ProductItem } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  X,
  History,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'movements'>('catalog');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // New Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number | ''>('');
  const [newProdType, setNewProdType] = useState<'product' | 'service'>('product');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdSelling, setNewProdSelling] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdAlert, setNewProdAlert] = useState('5');
  const [newProdUnit, setNewProdUnit] = useState('pcs');

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<number | ''>('');
  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, mRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/stock-movements'),
      ]);
      const [pData, cData, mData] = await Promise.all([pRes.json(), cRes.json(), mRes.json()]);
      setProducts(pData);
      setCategories(cData);
      setMovements(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          sku: newProdSku,
          categoryId: newProdCatId || null,
          type: newProdType,
          costPrice: parseInt(newProdCost, 10) || 0,
          sellingPrice: parseInt(newProdSelling, 10) || 0,
          stockQuantity: parseInt(newProdStock, 10) || 0,
          minStockAlert: parseInt(newProdAlert, 10) || 5,
          unit: newProdUnit || 'pcs',
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');
      setShowAddModal(false);
      setNewProdName('');
      setNewProdSku('');
      setNewProdCost('');
      setNewProdSelling('');
      setNewProdStock('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustQty) return;

    try {
      const res = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustProductId,
          type: adjustType,
          quantity: parseInt(adjustQty, 10),
          reason: adjustReason,
        }),
      });

      if (!res.ok) throw new Error('Failed to record stock adjustment');
      setShowAdjustModal(false);
      setAdjustQty('');
      setAdjustReason('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Metrics
  const totalCostValuation = products.reduce((acc, p) => acc + (p.costPrice * (p.type === 'product' ? p.stockQuantity : 0)), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.sellingPrice * (p.type === 'product' ? p.stockQuantity : 0)), 0);
  const potentialProfit = totalRetailValuation - totalCostValuation;
  const lowStockCount = products.filter((p) => p.isLowStock).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || String(p.categoryId) === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-400">Stock movements, FIFO valuation, supplier reorder alerts, and catalog management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Stock In / Out</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Register Product</span>
          </button>
        </div>
      </div>

      {/* Stock Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Inventory Value (Cost)
          </div>
          <div className="text-xl font-bold font-mono text-white">{formatKES(totalCostValuation)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Capital invested in stock</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Retail Valuation (Selling)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{formatKES(totalRetailValuation)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Projected revenue upon sale</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Potential Gross Profit
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">{formatKES(potentialProfit)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Gross markup yield in warehouse</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Low Stock Alerts
          </div>
          <div className={`text-xl font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {lowStockCount} items
          </div>
          <div className="text-[11px] text-slate-500 mt-1">At or below reorder threshold</div>
        </div>
      </div>

      {/* Tabs Switcher: Catalog vs Stock Movements */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'catalog'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'movements'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stock Audit Movements ({movements.length})</span>
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name / SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View Content */}
      {activeTab === 'catalog' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-emerald-400">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      <div>{p.name}</div>
                      {p.description && <div className="text-[10px] text-slate-500">{p.description}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.categoryName || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatKES(p.costPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                      {formatKES(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {p.type === 'service' ? (
                        <span className="text-teal-400">Service</span>
                      ) : (
                        <span>
                          {p.stockQuantity} {p.unit}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.type === 'service' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-400 border border-teal-800/40">
                          Active Service
                        </span>
                      ) : p.stockQuantity <= 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800/40">
                          Out of Stock
                        </span>
                      ) : p.stockQuantity <= p.minStockAlert ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/40">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-center">Change Qty</th>
                  <th className="py-3 px-4 text-center">Before → After</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4">Attendant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      {m.productName} <span className="font-mono text-slate-500">({m.productSku})</span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-[11px]">
                      <span className={m.type === 'in' ? 'text-emerald-400' : m.type === 'out' ? 'text-rose-400' : 'text-amber-400'}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {m.type === 'in' ? `+${m.quantity}` : m.type === 'out' ? `-${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {m.previousStock} → <span className="text-white font-bold">{m.newStock}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.reason || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{m.recordedByName || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Register New Product or Service</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Huawei Smart Solar Inverter"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOL-HUA-01"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Category</label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Type</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="product">Physical Inventory Product</option>
                    <option value="service">Service / Technical Labor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Cost Price (KES)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Selling Price (KES) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={newProdSelling}
                    onChange={(e) => setNewProdSelling(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {newProdType === 'product' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Low Alert Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={newProdAlert}
                      onChange={(e) => setNewProdAlert(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Unit</label>
                    <input
                      type="text"
                      placeholder="pcs, unit, kg"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Record Stock In / Out Adjustment</h2>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Select Product *</label>
                <select
                  required
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select product to adjust...</option>
                  {products
                    .filter((p) => p.type === 'product')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Current Stock: {p.stockQuantity} {p.unit}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Action Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="in">Stock Received (In)</option>
                    <option value="out">Stock Removed (Out/Damage)</option>
                    <option value="adjustment">Stock Count Audit</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Reason / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier delivery PO-2026-10 or damaged in showroom"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
