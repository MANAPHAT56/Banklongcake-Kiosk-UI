export type Cake = {
  id: string;
  productId: number;
  name: string;
  tagline: string;
  price: number;
  image: string;
  description: string;
  storage: string;
  salesCount?: number;
  totalRevenue?: number;
};
