import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { initialSales, type Sale, type SaleItem, type PaymentMethod } from '../data/mockSales';

interface CreateSaleParams {
  userId: number;
  userName: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
}

interface SalesContextValue {
  sales: Sale[];
  createSale: (params: CreateSaleParams) => Sale;
}

const STORAGE_KEY = 'minisuper_sales';

const load = (): Sale[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : initialSales;
  } catch {
    return initialSales;
  }
};

const SalesContext = createContext<SalesContextValue | null>(null);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>(load);

  const createSale = useCallback((params: CreateSaleParams): Sale => {
    setSales(prev => {
      const nextId = (prev[0]?.id ?? 0) + 1;
      const sale: Sale = {
        id: nextId,
        invoiceNumber: `FAC-${String(nextId).padStart(6, '0')}`,
        date: new Date().toISOString(),
        ...params,
      };
      const updated = [sale, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    // Return synchronously — we use state updater so compute inline
    const nextId = load()[0]?.id ?? 0;
    return {
      id: nextId,
      invoiceNumber: `FAC-${String(nextId).padStart(6, '0')}`,
      date: new Date().toISOString(),
      ...params,
    };
  }, []);

  return (
    <SalesContext.Provider value={{ sales, createSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
};
