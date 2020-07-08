export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount?: number;
}
