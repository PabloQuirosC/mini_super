import { useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const icons = {
  success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  error:   <XCircle       className="w-6 h-6 text-red-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
  info:    <Info           className="w-6 h-6 text-blue-500" />,
  confirm: <HelpCircle     className="w-6 h-6 text-blue-500" />,
};

const confirmBtnClass: Record<string, string> = {
  success: 'bg-emerald-600 hover:bg-emerald-700',
  error:   'bg-red-600 hover:bg-red-700',
  warning: 'bg-amber-500 hover:bg-amber-600',
  info:    'bg-blue-600 hover:bg-blue-700',
  confirm: 'bg-blue-600 hover:bg-blue-700',
};

export default function Modal() {
  const { modal, isOpen, closeModal } = useModal();

  const handleConfirm = useCallback(() => {
    modal?.onConfirm?.();
    closeModal();
  }, [modal, closeModal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeModal]);

  if (!isOpen || !modal) return null;

  const isConfirm = modal.type === 'confirm';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 fade-in"
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-start gap-4 p-6">
          <div className="shrink-0 mt-0.5">{icons[modal.type]}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{modal.title}</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{modal.message}</p>
          </div>
          <button onClick={closeModal} className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-5">
          {isConfirm && (
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {modal.cancelLabel ?? 'Cancelar'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmBtnClass[modal.type]}`}
          >
            {modal.confirmLabel ?? 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}
