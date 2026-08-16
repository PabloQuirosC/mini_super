import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { initialAuditLogs, type AuditLog, type AuditModule, type AuditSeverity } from '../data/mockAuditLogs';

interface LogParams {
  userId: number;
  userName: string;
  action: string;
  module: AuditModule;
  description: string;
  severity: AuditSeverity;
}

interface AuditContextValue {
  logs: AuditLog[];
  addLog: (params: LogParams) => void;
}

const STORAGE_KEY = 'minisuper_audit';

const load = (): AuditLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialAuditLogs;
  } catch {
    return initialAuditLogs;
  }
};

const save = (logs: AuditLog[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

const AuditContext = createContext<AuditContextValue | null>(null);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<AuditLog[]>(load);

  const addLog = useCallback((params: LogParams) => {
    setLogs(prev => {
      const next: AuditLog = {
        id: (prev[0]?.id ?? 0) + 1,
        timestamp: new Date().toISOString(),
        ...params,
      };
      const updated = [next, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  return (
    <AuditContext.Provider value={{ logs, addLog }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};
