export type Category =
  | "cakes"
  | "cupcakes"
  | "pastries"
  | "bread"
  | "custom";

export type Occasion =
  | "birthday"
  | "wedding"
  | "anniversary"
  | "babyShower"
  | "casual";

export type Flavour =
  | "chocolate"
  | "vanilla"
  | "redVelvet"
  | "mango"
  | "butterscotch";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  occasions: Occasion[];
  flavour: Flavour;
  rating: number;
  isVeg: boolean;
  isAvailable: boolean;
  bestSeller?: boolean;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "baking"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  paymentMethod: "upi" | "cod";
  deliveryType: "delivery" | "pickup";
  address: string;
}

export interface Coupon {
  code: string;
  discountPct: number;
  minOrderValue: number;
}

export type UserRole = "customer" | "admin";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}
