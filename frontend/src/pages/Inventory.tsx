import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import { formatCurrency } from '../utils/format';
import { CATEGORIES, type Product } from '../data/mockProducts';
import Badge from '../components/common/Badge';

const stockBadge = (p: Product) => {
  if (p.stock === 0) return <Badge variant="error">Agotado</Badge>;
  if (p.stock <= p.minStock) return <Badge variant="warning">Stock bajo</Badge>;
  return <Badge variant="success">Normal</Badge>;
};

interface FormState {
  barcode: string; name: string; category: string;
  purchasePrice: string; salePrice: string; stock: string; minStock: string; active: boolean;
}

const emptyForm = (): FormState => ({
  barcode: '', name: '', category: CATEGORIES[0],
  purchasePrice: '', salePrice: '', stock: '', minStock: '5', active: true,
});

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { can, currentUser } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const filtered = useMemo(() => products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)) &&
    (!categoryFilter || p.category === categoryFilter)
  ), [products, search, categoryFilter]);

  const openAdd = () => { setForm(emptyForm()); setEditingId(null); setErrors({}); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ barcode: p.barcode, name: p.name, category: p.category, purchasePrice: String(p.purchasePrice), salePrice: String(p.salePrice), stock: String(p.stock), minStock: String(p.minStock), active: p.active });
    setEditingId(p.id); setErrors({}); setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.barcode.trim()) e.barcode = 'Requerido';
    else if (!editingId && products.find(p => p.barcode === form.barcode.trim())) e.barcode = 'Código ya existe';
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.purchasePrice || parseFloat(form.purchasePrice) <= 0) e.purchasePrice = 'Debe ser mayor a 0';
    if (!form.salePrice || parseFloat(form.salePrice) <= 0) e.salePrice = 'Debe ser mayor a 0';
    if (form.stock === '' || parseInt(form.stock) < 0) e.stock = 'No puede ser negativo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      barcode: form.barcode.trim(), name: form.name.trim(), category: form.category,
      purchasePrice: parseFloat(form.purchasePrice), salePrice: parseFloat(form.salePrice),
      stock: parseInt(form.stock), minStock: parseInt(form.minStock) || 5, active: form.active,
    };
    if (editingId) {
      updateProduct(editingId, data);
      addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'PRODUCT_UPDATED', module: 'Inventario', description: `Actualizó el producto ${data.name}`, severity: 'info' });
    } else {
      addProduct(data);
      addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'PRODUCT_CREATED', module: 'Inventario', description: `Creó el producto ${data.name}`, severity: 'info' });
    }
    setShowForm(false);
  };

  const handleDelete = (p: Product) => {
    showModal({
      type: 'confirm', title: 'Eliminar producto',
      message: `¿Estás seguro de que deseas eliminar "${p.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        deleteProduct(p.id);
        addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'PRODUCT_DELETED', module: 'Inventario', description: `Eliminó el producto ${p.name}`, severity: 'warning' });
      },
    });
  };

  const field = (key: keyof FormState, label: string, rest?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
      <input
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${errors[key] ? 'border-red-400' : 'border-slate-200'}`}
        {...rest}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  const margin = (p: Product) => p.purchasePrice > 0 ? (((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(0) + '%' : '—';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-white" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-600">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {can('inventory:create') && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Código', 'Nombre', 'Categoría', 'P. Compra', 'P. Venta', 'Margen', 'Stock', 'Mín.', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No se encontraron productos</p>
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500">{p.barcode}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{formatCurrency(p.purchasePrice)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 font-mono">{formatCurrency(p.salePrice)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{margin(p)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{p.stock}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{p.minStock}</td>
                  <td className="px-4 py-3">{stockBadge(p)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {can('inventory:edit') && (
                        <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {can('inventory:delete') && (
                        <button onClick={() => handleDelete(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400 bg-slate-50">
          {filtered.length} de {products.length} productos
        </div>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 fade-in" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">{field('barcode', 'Código de barras', { placeholder: '7441000000000', disabled: !!editingId })}</div>
              <div className="col-span-2">{field('name', 'Nombre del producto', { placeholder: 'Ej: Coca-Cola 600ml' })}</div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Categoría</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field('purchasePrice', 'Precio de compra (₡)', { type: 'number', min: '0', placeholder: '0' })}
              {field('salePrice', 'Precio de venta (₡)', { type: 'number', min: '0', placeholder: '0' })}
              {field('stock', 'Stock actual', { type: 'number', min: '0', placeholder: '0' })}
              {field('minStock', 'Stock mínimo', { type: 'number', min: '1', placeholder: '5' })}
            </div>

            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                {editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
