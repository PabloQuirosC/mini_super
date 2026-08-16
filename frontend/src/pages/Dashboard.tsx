import { useMemo } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSales } from '../context/SalesContext';
import { useProducts } from '../context/ProductContext';
import { formatCurrency, formatDate } from '../utils/format';
import Badge from '../components/common/Badge';

interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ title, value, sub, trend, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up'   && <TrendingUp   className="w-3 h-3 text-emerald-500" />}
            {trend === 'down' && <TrendingDown  className="w-3 h-3 text-red-500" />}
            <p className={`text-xs ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>{sub}</p>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { sales } = useSales();
  const { products } = useProducts();

  const today = useMemo(() => new Date().toDateString(), []);
  const yesterday = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); }, []);

  const todaySales    = useMemo(() => sales.filter(s => new Date(s.date).toDateString() === today), [sales, today]);
  const yesterdaySales = useMemo(() => sales.filter(s => new Date(s.date).toDateString() === yesterday), [sales, yesterday]);

  const todayTotal    = useMemo(() => todaySales.reduce((a, s) => a + s.total, 0), [todaySales]);
  const yesterdayTotal = useMemo(() => yesterdaySales.reduce((a, s) => a + s.total, 0), [yesterdaySales]);
  const trend = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

  const lowStock = useMemo(() => products.filter(p => p.stock <= p.minStock && p.stock > 0), [products]);
  const outStock  = useMemo(() => products.filter(p => p.stock === 0), [products]);

  // Chart: last 7 days
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const total = sales.filter(s => new Date(s.date).toDateString() === key).reduce((a, s) => a + s.total, 0);
      return { day: d.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric' }), total };
    });
  }, [sales]);

  // Top 5 products
  const topProducts = useMemo(() => {
    const map: Record<number, { name: string; qty: number; revenue: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.subtotal;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const estimatedProfit = useMemo(() => todayTotal * 0.28, [todayTotal]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas de hoy"
          value={formatCurrency(todayTotal)}
          sub={`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% vs ayer`}
          trend={trend >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          accent="bg-emerald-50"
        />
        <StatCard
          title="Facturas hoy"
          value={String(todaySales.length)}
          sub={`${yesterdaySales.length} ayer`}
          trend={todaySales.length >= yesterdaySales.length ? 'up' : 'down'}
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          accent="bg-blue-50"
        />
        <StatCard
          title="Ganancia estimada"
          value={formatCurrency(estimatedProfit)}
          sub="Margen ~28%"
          trend="neutral"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          accent="bg-purple-50"
        />
        <StatCard
          title="Stock bajo / agotado"
          value={`${lowStock.length + outStock.length}`}
          sub={`${outStock.length} sin stock`}
          trend={outStock.length > 0 ? 'down' : 'neutral'}
          icon={<Package className="w-5 h-5 text-amber-600" />}
          accent="bg-amber-50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Ventas — últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ventas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₡${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(v: unknown) => [formatCurrency(Number(v)), 'Total']}
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#ventas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alert */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-700">Alertas de stock</h2>
          </div>
          <div className="space-y-2.5">
            {[...outStock, ...lowStock].slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-700 truncate flex-1">{p.name}</span>
                <Badge variant={p.stock === 0 ? 'error' : 'warning'}>
                  {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                </Badge>
              </div>
            ))}
            {lowStock.length === 0 && outStock.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Todo el inventario está en niveles óptimos</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Top 5 productos más vendidos</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.qty} unidades</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Ventas recientes</h2>
          <div className="space-y-2.5">
            {sales.slice(0, 6).map(s => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-mono font-medium text-slate-700">{s.invoiceNumber}</p>
                  <p className="text-slate-400">{s.userName} · {formatDate(s.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{formatCurrency(s.total)}</p>
                  <Badge variant="neutral">{s.paymentMethod}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
