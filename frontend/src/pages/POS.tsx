import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Smartphone, Banknote, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import { formatCurrency } from '../utils/format';
import type { Product } from '../data/mockProducts';
import type { PaymentMethod } from '../data/mockSales';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POS() {
  const [barcode, setBarcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [cashReceived, setCashReceived] = useState('');

  const barcodeRef = useRef<HTMLInputElement>(null);
  const { products, decreaseStock, getByBarcode } = useProducts();
  const { createSale } = useSales();
  const { currentUser } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();

  const focusScanner = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  useEffect(() => { focusScanner(); }, [focusScanner]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    if (product.stock === 0) {
      showModal({ type: 'error', title: 'Sin stock', message: `${product.name} no tiene stock disponible.` });
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock) {
          showModal({ type: 'warning', title: 'Stock insuficiente', message: `Solo hay ${product.stock} unidades disponibles de ${product.name}.` });
          return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { product, quantity: qty }];
    });
    addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'PRODUCT_ADDED_TO_CART', module: 'POS', description: `Agregó ${product.name} al carrito`, severity: 'info' });
    setSearchQuery('');
    setSearchResults([]);
    focusScanner();
  }, [showModal, addLog, currentUser, focusScanner]);

  const handleBarcodeEnter = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const code = barcode.trim();
    if (!code) return;
    const product = getByBarcode(code);
    if (!product) {
      showModal({ type: 'error', title: 'Producto no encontrado', message: `No existe un producto con el código de barras: ${code}` });
    } else {
      addToCart(product);
    }
    setBarcode('');
  }, [barcode, getByBarcode, showModal, addToCart]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const r = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
    setSearchResults(r);
  };

  const updateQty = useCallback((productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.product.stock) {
        showModal({ type: 'warning', title: 'Stock insuficiente', message: `Solo hay ${item.product.stock} unidades disponibles.` });
        return item;
      }
      return { ...item, quantity: newQty };
    }));
  }, [showModal]);

  const setQty = useCallback((productId: number, val: string) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 1) return;
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      if (n > item.product.stock) {
        showModal({ type: 'warning', title: 'Stock insuficiente', message: `Solo hay ${item.product.stock} unidades.` });
        return item;
      }
      return { ...item, quantity: n };
    }));
  }, [showModal]);

  const removeItem = useCallback((productId: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar producto',
      message: '¿Deseas eliminar este producto del carrito?',
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
        focusScanner();
      },
    });
  }, [showModal, focusScanner]);

  const clearCart = () => {
    if (cart.length === 0) return;
    showModal({
      type: 'confirm', title: 'Cancelar venta',
      message: '¿Deseas cancelar la venta y vaciar el carrito?',
      confirmLabel: 'Sí, cancelar',
      onConfirm: () => {
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'SALE_CANCELLED', module: 'POS', description: 'Canceló carrito de venta en progreso', severity: 'warning' });
        setCart([]); setCashReceived(''); focusScanner();
      },
    });
  };

  const subtotal = cart.reduce((a, i) => a + i.product.salePrice * i.quantity, 0);
  const change = paymentMethod === 'Efectivo' ? (parseFloat(cashReceived) || 0) - subtotal : 0;

  const handleCobrar = () => {
    if (cart.length === 0) {
      showModal({ type: 'warning', title: 'Carrito vacío', message: 'Agrega al menos un producto para procesar la venta.' });
      return;
    }
    if (paymentMethod === 'Efectivo' && (parseFloat(cashReceived) || 0) < subtotal) {
      showModal({ type: 'warning', title: 'Monto insuficiente', message: 'El monto recibido es menor al total de la venta.' });
      return;
    }

    const items = cart.map(i => ({
      productId: i.product.id, productName: i.product.name,
      barcode: i.product.barcode, quantity: i.quantity,
      unitPrice: i.product.salePrice, subtotal: i.product.salePrice * i.quantity,
    }));

    const nextId = Date.now();
    const invoiceNumber = `FAC-${String(nextId).slice(-6).padStart(6, '0')}`;

    // Decrease stock
    cart.forEach(i => decreaseStock(i.product.id, i.quantity));

    createSale({
      userId: currentUser!.id, userName: currentUser!.name, items,
      subtotal, total: subtotal, paymentMethod,
      cashReceived: paymentMethod === 'Efectivo' ? parseFloat(cashReceived) : undefined,
      change: paymentMethod === 'Efectivo' ? change : undefined,
    });

    addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'SALE_CREATED', module: 'POS', description: `Registró venta ${invoiceNumber} por ${formatCurrency(subtotal)}`, severity: 'success' });

    showModal({
      type: 'success', title: '¡Venta completada!',
      message: `${invoiceNumber} registrada correctamente por ${formatCurrency(subtotal)}.${paymentMethod === 'Efectivo' ? `\nCambio: ${formatCurrency(Math.max(0, change))}` : ''}`,
    });

    setCart([]); setCashReceived(''); focusScanner();
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-104px)]">
      {/* Left — scanner + search */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Scanner */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Escanear código de barras</label>
          <input
            ref={barcodeRef}
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeEnter}
            placeholder="Escanear o escribir código y presionar Enter..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Búsqueda manual</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); focusScanner(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.barcode}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(p.salePrice)}</p>
                    <p className={`text-xs ${p.stock === 0 ? 'text-red-500' : p.stock <= p.minStock ? 'text-amber-500' : 'text-slate-400'}`}>
                      {p.stock === 0 ? 'Sin stock' : `${p.stock} disponibles`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart table */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Carrito</span>
              <span className="text-xs text-slate-400">({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</span>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Cancelar venta
              </button>
            )}
          </div>

          <div className="overflow-auto flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">El carrito está vacío</p>
                <p className="text-xs mt-1">Escanea un código o busca un producto</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase tracking-wide">Producto</th>
                    <th className="text-center px-3 py-2 font-semibold text-slate-500 uppercase tracking-wide">Cant.</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.product.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-800">{item.product.name}</p>
                        <p className="text-slate-400 font-mono">{item.product.barcode}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number" value={item.quantity} min={1} max={item.product.stock}
                            onChange={e => setQty(item.product.id, e.target.value)}
                            className="w-10 text-center border border-slate-200 rounded-md py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                          <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{formatCurrency(item.product.salePrice)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(item.product.salePrice * item.quantity)}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => removeItem(item.product.id)} className="w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right — payment panel */}
      <div className="w-72 shrink-0 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Método de pago</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['Efectivo', 'SINPE', 'Tarjeta'] as PaymentMethod[]).map(m => {
              const Icon = m === 'Efectivo' ? Banknote : m === 'SINPE' ? Smartphone : CreditCard;
              return (
                <button
                  key={m}
                  onClick={() => { setPaymentMethod(m); setCashReceived(''); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${paymentMethod === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <Icon className="w-5 h-5" />
                  {m}
                </button>
              );
            })}
          </div>

          {paymentMethod === 'Efectivo' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto recibido</label>
              <input
                type="number"
                value={cashReceived}
                onChange={e => setCashReceived(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              {parseFloat(cashReceived) > 0 && (
                <div className={`flex items-center justify-between text-sm font-semibold px-3 py-2 rounded-lg ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  <span>Cambio</span>
                  <span>{formatCurrency(Math.max(0, change))}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>TOTAL</span>
            <span className="text-2xl font-bold text-emerald-600 font-mono">{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <button
          onClick={handleCobrar}
          disabled={cart.length === 0}
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-all shadow-md shadow-emerald-500/25"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          COBRAR
        </button>
      </div>
    </div>
  );
}
