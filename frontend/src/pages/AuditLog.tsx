import { useState, useMemo } from 'react';
import { Search, ClipboardList, Filter } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { formatDateTime } from '../utils/format';
import Badge from '../components/common/Badge';
import type { AuditModule, AuditSeverity } from '../data/mockAuditLogs';

const MODULES: AuditModule[] = ['Autenticación', 'POS', 'Inventario', 'Reportes', 'Seguridad'];

const severityVariant = (s: AuditSeverity): 'success' | 'warning' | 'error' | 'info' => s === 'success' ? 'success' : s === 'warning' ? 'warning' : s === 'error' ? 'error' : 'info';

const PAGE_SIZE = 15;

export default function AuditLog() {
  const { logs } = useAudit();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const users = useMemo(() => [...new Set(logs.map(l => l.userName))].sort(), [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (search && !l.description.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase())) return false;
      if (moduleFilter && l.module !== moduleFilter) return false;
      if (severityFilter && l.severity !== severityFilter) return false;
      if (userFilter && l.userName !== userFilter) return false;
      if (fromDate && new Date(l.timestamp) < new Date(fromDate + 'T00:00:00')) return false;
      if (toDate   && new Date(l.timestamp) > new Date(toDate   + 'T23:59:59')) return false;
      return true;
    });
  }, [logs, search, moduleFilter, severityFilter, userFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => { setSearch(''); setModuleFilter(''); setSeverityFilter(''); setUserFilter(''); setFromDate(''); setToDate(''); setPage(1); };

  const hasFilters = search || moduleFilter || severityFilter || userFilter || fromDate || toDate;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <Filter className="w-3.5 h-3.5" /> Filtros
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar en descripción o acción..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
          </div>
          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-600">
            <option value="">Todos los módulos</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-600">
            <option value="">Todos los usuarios</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-600">
            <option value="">Todos los niveles</option>
            <option value="success">Éxito</option>
            <option value="info">Info</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>
          <div className="flex gap-2">
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
              className="flex-1 px-2 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
              className="flex-1 px-2 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
          </div>
        </div>
        {hasFilters && (
          <button onClick={reset} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <ClipboardList className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Registro de auditoría</h3>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {['Fecha y hora', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'Nivel'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No se encontraron registros con los filtros aplicados
                </td></tr>
              )}
              {paged.map(log => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{log.userName}</td>
                  <td className="px-4 py-3"><Badge variant="neutral">{log.module}</Badge></td>
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[280px] truncate" title={log.description}>{log.description}</td>
                  <td className="px-4 py-3"><Badge variant={severityVariant(log.severity)}>
                    {log.severity === 'success' ? 'Éxito' : log.severity === 'warning' ? 'Advertencia' : log.severity === 'error' ? 'Error' : 'Info'}
                  </Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-2.5 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors">← Anterior</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-7 h-7 rounded-md border transition-colors ${pg === page ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:bg-white'}`}>
                  {pg}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors">Siguiente →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
