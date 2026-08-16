export interface SaleItem {
  productId: number;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'Efectivo' | 'SINPE' | 'Tarjeta';

export interface Sale {
  id: number;
  invoiceNumber: string;
  date: string;
  userId: number;
  userName: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
}

const today = new Date();
const d = (daysAgo: number, hour: string) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  const [h, m] = hour.split(':');
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d.toISOString();
};

export const initialSales: Sale[] = [
  {
    id: 1, invoiceNumber: 'FAC-000001', date: d(6, '08:15'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 1, productName: 'Coca-Cola 600ml', barcode: '7441029502105', quantity: 2, unitPrice: 700, subtotal: 1400 },
      { productId: 10, productName: 'Galletas María 200g', barcode: '7441038200152', quantity: 1, unitPrice: 500, subtotal: 500 },
    ],
    subtotal: 1900, total: 1900, paymentMethod: 'Efectivo', cashReceived: 2000, change: 100,
  },
  {
    id: 2, invoiceNumber: 'FAC-000002', date: d(6, '10:30'), userId: 1, userName: 'Administrador',
    items: [
      { productId: 5, productName: 'Leche Dos Pinos 1L', barcode: '7441034500126', quantity: 2, unitPrice: 1050, subtotal: 2100 },
      { productId: 7, productName: 'Arroz Tío Pelón 1kg', barcode: '7441035200121', quantity: 1, unitPrice: 750, subtotal: 750 },
      { productId: 13, productName: 'Azúcar blanca 1kg', barcode: '7441041200173', quantity: 1, unitPrice: 650, subtotal: 650 },
    ],
    subtotal: 3500, total: 3500, paymentMethod: 'SINPE',
  },
  {
    id: 3, invoiceNumber: 'FAC-000003', date: d(5, '09:00'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 3, productName: 'Agua Cristal 1L', barcode: '7441036100019', quantity: 3, unitPrice: 350, subtotal: 1050 },
      { productId: 24, productName: 'Chips Ruffles 43g', barcode: '7441052300270', quantity: 2, unitPrice: 500, subtotal: 1000 },
    ],
    subtotal: 2050, total: 2050, paymentMethod: 'Tarjeta',
  },
  {
    id: 4, invoiceNumber: 'FAC-000004', date: d(5, '14:45'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 9, productName: 'Atún Sardimar 140g', barcode: '7441037800145', quantity: 3, unitPrice: 750, subtotal: 2250 },
      { productId: 8, productName: 'Frijoles Ducal 500g', barcode: '7441035200138', quantity: 2, unitPrice: 600, subtotal: 1200 },
      { productId: 14, productName: 'Sal Refinada 500g', barcode: '7441042300180', quantity: 1, unitPrice: 300, subtotal: 300 },
    ],
    subtotal: 3750, total: 3750, paymentMethod: 'Efectivo', cashReceived: 4000, change: 250,
  },
  {
    id: 5, invoiceNumber: 'FAC-000005', date: d(4, '11:20'), userId: 3, userName: 'María López',
    items: [
      { productId: 12, productName: 'Café 1820 250g', barcode: '7441040100166', quantity: 1, unitPrice: 1750, subtotal: 1750 },
      { productId: 20, productName: 'Pan cuadrado Bimbo', barcode: '7441048900232', quantity: 2, unitPrice: 1050, subtotal: 2100 },
    ],
    subtotal: 3850, total: 3850, paymentMethod: 'SINPE',
  },
  {
    id: 6, invoiceNumber: 'FAC-000006', date: d(3, '08:40'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 16, productName: 'Papel higiénico x4', barcode: '7441044500204', quantity: 1, unitPrice: 1600, subtotal: 1600 },
      { productId: 17, productName: 'Jabón Dove 75g', barcode: '7441045600211', quantity: 2, unitPrice: 700, subtotal: 1400 },
      { productId: 19, productName: 'Pasta dental Colgate 75ml', barcode: '7441047800225', quantity: 1, unitPrice: 850, subtotal: 850 },
    ],
    subtotal: 3850, total: 3850, paymentMethod: 'Tarjeta',
  },
  {
    id: 7, invoiceNumber: 'FAC-000007', date: d(2, '16:10'), userId: 1, userName: 'Administrador',
    items: [
      { productId: 15, productName: 'Aceite Coronado 1L', barcode: '7441043400197', quantity: 2, unitPrice: 1400, subtotal: 2800 },
      { productId: 7, productName: 'Arroz Tío Pelón 1kg', barcode: '7441035200121', quantity: 2, unitPrice: 750, subtotal: 1500 },
      { productId: 22, productName: 'Atol de maíz 400g', barcode: '7441050100256', quantity: 1, unitPrice: 550, subtotal: 550 },
    ],
    subtotal: 4850, total: 4850, paymentMethod: 'Efectivo', cashReceived: 5000, change: 150,
  },
  {
    id: 8, invoiceNumber: 'FAC-000008', date: d(1, '09:55'), userId: 3, userName: 'María López',
    items: [
      { productId: 21, productName: 'Huevos x12', barcode: '7441049000249', quantity: 2, unitPrice: 2500, subtotal: 5000 },
      { productId: 5, productName: 'Leche Dos Pinos 1L', barcode: '7441034500126', quantity: 1, unitPrice: 1050, subtotal: 1050 },
    ],
    subtotal: 6050, total: 6050, paymentMethod: 'SINPE',
  },
  {
    id: 9, invoiceNumber: 'FAC-000009', date: d(1, '13:30'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 1, productName: 'Coca-Cola 600ml', barcode: '7441029502105', quantity: 4, unitPrice: 700, subtotal: 2800 },
      { productId: 11, productName: 'Doritos Nacho 55g', barcode: '7441039300159', quantity: 3, unitPrice: 600, subtotal: 1800 },
    ],
    subtotal: 4600, total: 4600, paymentMethod: 'Efectivo', cashReceived: 5000, change: 400,
  },
  {
    id: 10, invoiceNumber: 'FAC-000010', date: d(0, '07:45'), userId: 2, userName: 'Cajero Principal',
    items: [
      { productId: 3, productName: 'Agua Cristal 1L', barcode: '7441036100019', quantity: 2, unitPrice: 350, subtotal: 700 },
      { productId: 10, productName: 'Galletas María 200g', barcode: '7441038200152', quantity: 1, unitPrice: 500, subtotal: 500 },
    ],
    subtotal: 1200, total: 1200, paymentMethod: 'Efectivo', cashReceived: 1500, change: 300,
  },
  {
    id: 11, invoiceNumber: 'FAC-000011', date: d(0, '10:20'), userId: 1, userName: 'Administrador',
    items: [
      { productId: 12, productName: 'Café 1820 250g', barcode: '7441040100166', quantity: 2, unitPrice: 1750, subtotal: 3500 },
      { productId: 23, productName: 'Cloro Clorox 946ml', barcode: '7441051200263', quantity: 1, unitPrice: 950, subtotal: 950 },
    ],
    subtotal: 4450, total: 4450, paymentMethod: 'Tarjeta',
  },
];
