
export enum Category {
  SMARTPHONES = 'Smartphones',
  LAPTOPS = 'Laptops',
  HEADPHONES = 'Headphones',
  SMART_TVS = 'Smart TVs',
  ACCESSORIES = 'Accessories',
  GAMING = 'Gaming',
  CAMERAS = 'Cameras',
  SMART_HOME = 'Smart Home'
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  images: string[]; // Multiple angles: Front, Back, Side, Top, Ports, In-use
  category: Category;
  stock: number;
  description: string;
  specs: Record<string, string>;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered'
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: string;
}
