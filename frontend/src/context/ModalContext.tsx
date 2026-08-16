import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ModalType = 'success' | 'error' | 'warning' | 'confirm' | 'info';

export interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ModalContextValue {
  showModal: (config: ModalConfig) => void;
  closeModal: () => void;
  modal: ModalConfig | null;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const showModal = useCallback((config: ModalConfig) => setModal(config), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <ModalContext.Provider value={{ showModal, closeModal, modal, isOpen: modal !== null }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
