export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('es-CR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const nextInvoiceNumber = (lastId: number): string =>
  `FAC-${String(lastId).padStart(6, '0')}`;
