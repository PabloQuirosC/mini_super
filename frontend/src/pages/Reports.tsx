import { useState, useMemo } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useAudit } from '../context/AuditContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import { exportToCSV } from '../utils/csvExport';
import Badge from '../components/common/Badge';

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);

  const { sales } = useSales();
  const { can, currentUser } = useAuth();
  const { showModal } = useModal();
  const { addLog } = useAudit();

  const filtered = useMemo(() => {
    const f = new Date(from + 'T00:00:00');
    const t = new Date(to + 'T23:59:59');
    return sales.filter(s => { const d = new Date(s.date); return d >= f && d <= t; });
  }, [sales, from, to]);

  const totalRevenue = useMemo(() => filtered.reduce((a, s) => a + s.total, 0), [filtered]);
  const avgTicket    = filtered.length ? totalRevenue / filtered.length : 0;
  const estimatedProfit = totalRevenue * 0.28;

  const handleExport = () => {
    if (!can('reports:export')) {
      showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para exportar reportes.' });
      return;
    }
    const headers = ['Factura', 'Fecha', 'Usuario', 'Productos', 'Método', 'Total'];
    const rows = filtered.map(s => [
      s.invoiceNumber, formatDateTime(s.date), s.userName,
      s.items.map(i => `${i.productName} x${i.quantity}`).join(' | '),
      s.paymentMethod, s.total,
    ]);
    exportToCSV(`reporte-ventas-${from}-${to}`, headers, rows);
    addLog({ userId: currentUser!.id, userName: currentUser!.name, action: 'REPORT_EXPORTED', module: 'Reportes', description: `Exportó reporte de ventas ${from} al ${to}`, severity: 'info' });
    showModal({ type: 'success', title: 'Exportado', message: 'El reporte fue exportado correctamente a CSV.' });
  };

  const payMethodCounts = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach(s => { m[s.paymentMethod] = (m[s.paymentMethod] ?? 0) + s.total; });
    return m;
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Fecha inicial</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Fecha final</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total vendido',      value: formatCurrency(totalRevenue),      color: 'text-emerald-600' },
          { label: 'Número de ventas',   value: String(filtered.length),            color: 'text-blue-600'   },
          { label: 'Ganancia estimada',  value: formatCurrency(estimatedProfit),    color: 'text-purple-600' },
          { label: 'Ticket promedio',    value: formatCurrency(avgTicket),           color: 'text-amber-600'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`} style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Payment method breakdown */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribución por método de pago</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(payMethodCounts).map(([method, total]) => (
            <div key={method} className="flex items-center gap-2">
              <Badge variant="neutral">{method}</Badge>
              <span className="text-sm font-semibold text-slate-700">{formatCurrency(total)}</span>
              <span className="text-xs text-slate-400">({totalRevenue > 0 ? ((total / totalRevenue) * 100).toFixed(0) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Detalle de ventas</h3>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {['Factura', 'Fecha y hora', 'Usuario', 'Productos', 'Método', 'Total'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No hay ventas en el período seleccionado
                </td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{s.invoiceNumber}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(s.date)}</td>
                  <td className="px-4 py-3 text-slate-600">{s.userName}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                    {s.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3"><Badge variant="neutral">{s.paymentMethod}</Badge></td>
                  <td className="px-4 py-3 font-semibold text-slate-800 font-mono whitespace-nowrap">{formatCurrency(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
