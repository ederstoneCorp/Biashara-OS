import React, { useState, useEffect } from 'react';
import { ProductItem, CustomerProfile, SaleItem, BusinessTenant } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import { generateMockDarajaReference } from '../utils/mpesa.ts';
import { ReceiptModal } from './ReceiptModal.tsx';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Phone,
  CheckCircle,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
} from 'lucide-react';

interface PosViewProps {
  business?: BusinessTenant;
}

export const PosView: React.FC<PosViewProps> = ({ business }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart state
  const [cart, setCart] = useState<Array<{ product: ProductItem; quantity: number }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash' | 'card' | 'bank'>('mpesa');
  const [mpesaReference, setMpesaReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
      ]);
      const [prodData, custData] = await Promise.all([prodRes.json(), custRes.json()]);
      setProducts(prodData);
      setCustomers(custData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (product: ProductItem) => {
    setErrorMsg(null);
    if (product.type === 'product' && product.stockQuantity <= 0) {
      setErrorMsg(`Item "${product.name}" is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (product.type === 'product' && existing.quantity >= product.stockQuantity) {
          setErrorMsg(`Only ${product.stockQuantity} units available for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setErrorMsg(null);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (item.product.type === 'product' && newQty > item.product.stockQuantity) {
              setErrorMsg(`Stock limit reached for ${item.product.name}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: ProductItem; quantity: number }>;
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - (discountAmount || 0));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        items: cart.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
        customerId: selectedCustomerId || null,
        discountAmount: discountAmount || 0,
        paymentMethod,
        mpesaReference: paymentMethod === 'mpesa' ? (mpesaReference || generateMockDarajaReference()) : null,
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to complete sale');
      }

      const saleData = await res.json();
      setCompletedSale(saleData);
      setCart([]);
      setDiscountAmount(0);
      setMpesaReference('');
      setSelectedCustomerId('');
      loadData(); // reload stock levels
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products
  const categoriesList = Array.from(new Set(products.map((p) => p.categoryName || 'General')));
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || (p.categoryName || 'General') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-5rem)]">
      {/* Left: Product Catalog Grid */}
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Point of Sale (POS) Terminal</h1>
          <p className="text-xs text-slate-400">Fast checkout, M-Pesa reference capture, and automatic inventory deduction</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Items
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[680px] pr-1">
          {filteredProducts.map((p) => {
            const inCart = cart.find((it) => it.product.id === p.id);
            const isOutOfStock = p.type === 'product' && p.stockQuantity <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && addToCart(p)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-900/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                    : inCart
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono text-emerald-400">{p.sku}</span>
                    <span className={p.type === 'service' ? 'text-teal-400' : p.stockQuantity <= p.minStockAlert ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                      {p.type === 'service' ? 'Service' : `${p.stockQuantity} in stock`}
                    </span>
                  </div>
                  <h2 className="font-semibold text-xs text-white line-clamp-2 leading-tight">{p.name}</h2>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="font-mono font-bold text-sm text-emerald-400">{formatKES(p.sellingPrice)}</span>
                  <button
                    disabled={isOutOfStock}
                    className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Checkout & Cart Terminal Panel */}
      <div className="w-full lg:w-96 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Current Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Click any product to add to cart
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="max-w-[150px]">
                    <div className="font-medium text-white truncate">{product.name}</div>
                    <div className="font-mono text-[11px] text-emerald-400">
                      {formatKES(product.sellingPrice)} × {quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Select Customer (Optional)</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Walk-in Customer (General Counter)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || 'No phone'}) · {c.loyaltyPoints} pts
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'mpesa', label: 'M-Pesa', icon: Smartphone },
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'bank', label: 'Bank', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* M-Pesa Reference Field */}
          {paymentMethod === 'mpesa' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <label className="font-semibold text-slate-400">M-Pesa Code / Reference</label>
                <button
                  type="button"
                  onClick={() => setMpesaReference(generateMockDarajaReference())}
                  className="text-emerald-400 hover:underline"
                >
                  Generate Reference
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. QHK82910MA"
                value={mpesaReference}
                onChange={(e) => setMpesaReference(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Discount Field */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Discount (KES)
            </span>
            <input
              type="number"
              min="0"
              value={discountAmount || ''}
              placeholder="0"
              onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Totals & Submit */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">{formatKES(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Discount</span>
                <span className="font-mono">-{formatKES(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-1">
              <span>Total Due</span>
              <span className="font-mono text-emerald-400 text-lg">{formatKES(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Recording Sale...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Complete Sale ({formatKES(total)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          business={business}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
