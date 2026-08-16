import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { initialProducts, type Product } from '../data/mockProducts';

interface ProductContextValue {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, p: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  decreaseStock: (id: number, qty: number) => void;
  getByBarcode: (barcode: string) => Product | undefined;
}

const STORAGE_KEY = 'minisuper_products';

const load = (): Product[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : initialProducts;
  } catch {
    return initialProducts;
  }
};

const save = (products: Product[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

const ProductContext = createContext<ProductContextValue | null>(null);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(load);

  const set = useCallback((next: Product[]) => { setProducts(next); save(next); }, []);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts(prev => {
      const next = [...prev, { ...p, id: Math.max(0, ...prev.map(x => x.id)) + 1 }];
      save(next); return next;
    });
  }, []);

  const updateProduct = useCallback((id: number, p: Partial<Product>) => {
    setProducts(prev => { const next = prev.map(x => x.id === id ? { ...x, ...p } : x); save(next); return next; });
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setProducts(prev => { const next = prev.filter(x => x.id !== id); save(next); return next; });
  }, []);

  const decreaseStock = useCallback((id: number, qty: number) => {
    setProducts(prev => {
      const next = prev.map(x => x.id === id ? { ...x, stock: Math.max(0, x.stock - qty) } : x);
      save(next); return next;
    });
  }, [set]);

  const getByBarcode = useCallback((barcode: string) => products.find(p => p.barcode === barcode), [products]);

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, decreaseStock, getByBarcode }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
