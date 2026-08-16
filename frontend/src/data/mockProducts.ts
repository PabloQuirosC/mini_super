export interface Product {
  id: number;
  barcode: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  active: boolean;
}

export const CATEGORIES = [
  'Bebidas',
  'Snacks',
  'Lácteos',
  'Abarrotes',
  'Limpieza',
  'Higiene personal',
  'Enlatados',
  'Panadería',
];

export const initialProducts: Product[] = [
  { id: 1,  barcode: '7441029502105', name: 'Coca-Cola 600ml',          category: 'Bebidas',          purchasePrice: 450,  salePrice: 700,  stock: 48,  minStock: 12, active: true },
  { id: 2,  barcode: '7441000610099', name: 'Pepsi 600ml',              category: 'Bebidas',          purchasePrice: 420,  salePrice: 650,  stock: 36,  minStock: 12, active: true },
  { id: 3,  barcode: '7441036100019', name: 'Agua Cristal 1L',          category: 'Bebidas',          purchasePrice: 200,  salePrice: 350,  stock: 60,  minStock: 24, active: true },
  { id: 4,  barcode: '7441036100026', name: 'Agua Cristal 500ml',       category: 'Bebidas',          purchasePrice: 150,  salePrice: 250,  stock: 4,   minStock: 24, active: true },
  { id: 5,  barcode: '7441034500126', name: 'Leche Dos Pinos 1L',       category: 'Lácteos',          purchasePrice: 750,  salePrice: 1050, stock: 24,  minStock: 10, active: true },
  { id: 6,  barcode: '7441034500133', name: 'Yogurt Natural 200g',      category: 'Lácteos',          purchasePrice: 350,  salePrice: 550,  stock: 18,  minStock: 8,  active: true },
  { id: 7,  barcode: '7441035200121', name: 'Arroz Tío Pelón 1kg',      category: 'Abarrotes',        purchasePrice: 480,  salePrice: 750,  stock: 30,  minStock: 10, active: true },
  { id: 8,  barcode: '7441035200138', name: 'Frijoles Ducal 500g',      category: 'Enlatados',        purchasePrice: 380,  salePrice: 600,  stock: 25,  minStock: 10, active: true },
  { id: 9,  barcode: '7441037800145', name: 'Atún Sardimar 140g',       category: 'Enlatados',        purchasePrice: 480,  salePrice: 750,  stock: 40,  minStock: 15, active: true },
  { id: 10, barcode: '7441038200152', name: 'Galletas María 200g',      category: 'Snacks',           purchasePrice: 290,  salePrice: 500,  stock: 22,  minStock: 8,  active: true },
  { id: 11, barcode: '7441039300159', name: 'Doritos Nacho 55g',        category: 'Snacks',           purchasePrice: 350,  salePrice: 600,  stock: 3,   minStock: 12, active: true },
  { id: 12, barcode: '7441040100166', name: 'Café 1820 250g',           category: 'Abarrotes',        purchasePrice: 1200, salePrice: 1750, stock: 15,  minStock: 5,  active: true },
  { id: 13, barcode: '7441041200173', name: 'Azúcar blanca 1kg',        category: 'Abarrotes',        purchasePrice: 420,  salePrice: 650,  stock: 20,  minStock: 8,  active: true },
  { id: 14, barcode: '7441042300180', name: 'Sal Refinada 500g',        category: 'Abarrotes',        purchasePrice: 180,  salePrice: 300,  stock: 18,  minStock: 6,  active: true },
  { id: 15, barcode: '7441043400197', name: 'Aceite Coronado 1L',       category: 'Abarrotes',        purchasePrice: 950,  salePrice: 1400, stock: 12,  minStock: 5,  active: true },
  { id: 16, barcode: '7441044500204', name: 'Papel higiénico x4',       category: 'Higiene personal', purchasePrice: 1100, salePrice: 1600, stock: 20,  minStock: 6,  active: true },
  { id: 17, barcode: '7441045600211', name: 'Jabón Dove 75g',           category: 'Higiene personal', purchasePrice: 420,  salePrice: 700,  stock: 24,  minStock: 8,  active: true },
  { id: 18, barcode: '7441046700218', name: 'Detergente Ariel 500g',    category: 'Limpieza',         purchasePrice: 1050, salePrice: 1500, stock: 0,   minStock: 6,  active: true },
  { id: 19, barcode: '7441047800225', name: 'Pasta dental Colgate 75ml',category: 'Higiene personal', purchasePrice: 560,  salePrice: 850,  stock: 16,  minStock: 6,  active: true },
  { id: 20, barcode: '7441048900232', name: 'Pan cuadrado Bimbo',       category: 'Panadería',        purchasePrice: 680,  salePrice: 1050, stock: 8,   minStock: 4,  active: true },
  { id: 21, barcode: '7441049000249', name: 'Huevos x12',               category: 'Lácteos',          purchasePrice: 1800, salePrice: 2500, stock: 10,  minStock: 5,  active: true },
  { id: 22, barcode: '7441050100256', name: 'Atol de maíz 400g',        category: 'Abarrotes',        purchasePrice: 320,  salePrice: 550,  stock: 14,  minStock: 6,  active: true },
  { id: 23, barcode: '7441051200263', name: 'Cloro Clorox 946ml',       category: 'Limpieza',         purchasePrice: 650,  salePrice: 950,  stock: 9,   minStock: 4,  active: true },
  { id: 24, barcode: '7441052300270', name: 'Chips Ruffles 43g',        category: 'Snacks',           purchasePrice: 280,  salePrice: 500,  stock: 30,  minStock: 10, active: true },
];
