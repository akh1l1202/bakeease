import { supabase } from "@/integrations/supabase/client";
import type { Product, Order, OrderStatus } from "./types";

// Bundled image assets — keys must match the seed image paths in the DB.
import chocolateCake from "@/assets/product-chocolate-cake.jpg";
import redVelvet from "@/assets/product-red-velvet.jpg";
import cupcakes from "@/assets/product-cupcakes.jpg";
import croissant from "@/assets/product-croissant.jpg";
import sourdough from "@/assets/product-sourdough.jpg";
import mangoCheesecake from "@/assets/product-mango-cheesecake.jpg";
import strawberryTart from "@/assets/product-strawberry-tart.jpg";
import butterscotch from "@/assets/product-butterscotch.jpg";
import weddingCake from "@/assets/product-wedding-cake.jpg";
import danish from "@/assets/product-danish.jpg";
import baguette from "@/assets/product-baguette.jpg";

const IMAGE_MAP: Record<string, string> = {
  "/assets/product-chocolate-cake.jpg": chocolateCake,
  "/assets/product-red-velvet.jpg": redVelvet,
  "/assets/product-cupcakes.jpg": cupcakes,
  "/assets/product-croissant.jpg": croissant,
  "/assets/product-sourdough.jpg": sourdough,
  "/assets/product-mango-cheesecake.jpg": mangoCheesecake,
  "/assets/product-strawberry-tart.jpg": strawberryTart,
  "/assets/product-butterscotch.jpg": butterscotch,
  "/assets/product-wedding-cake.jpg": weddingCake,
  "/assets/product-danish.jpg": danish,
  "/assets/product-baguette.jpg": baguette,
};

const FALLBACK_IMAGE = chocolateCake;

export function resolveImage(path: string | null | undefined): string {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return IMAGE_MAP[path] ?? FALLBACK_IMAGE;
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Product["category"];
  occasions: string[];
  flavour: Product["flavour"];
  rating: number;
  is_veg: boolean;
  is_available: boolean;
  best_seller: boolean;
  stock: number;
}

export function dbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: resolveImage(row.image),
    category: row.category,
    occasions: row.occasions as Product["occasions"],
    flavour: row.flavour,
    rating: Number(row.rating),
    isVeg: row.is_veg,
    isAvailable: row.is_available,
    bestSeller: row.best_seller,
    stock: row.stock,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as DbProduct[]).map(dbToProduct);
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  category: Product["category"];
  flavour: Product["flavour"];
  stock: number;
  image?: string;
}) {
  const { error } = await supabase.from("products").insert({
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    flavour: input.flavour,
    stock: input.stock,
    image: input.image ?? "",
    occasions: ["casual"],
  });
  if (error) throw error;
}

export async function setProductAvailable(id: string, isAvailable: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Orders ----------

interface DbOrder {
  id: string;
  order_number: string;
  total: number;
  status: OrderStatus;
  payment_method: "upi" | "cod";
  delivery_type: "delivery" | "pickup";
  address: string;
  created_at: string;
  user_id: string;
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

function dbToOrder(row: DbOrder): Order {
  return {
    id: row.order_number,
    date: row.created_at,
    total: Number(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    deliveryType: row.delivery_type,
    address: row.address,
    items: (row.order_items ?? []).map((it) => ({
      name: it.product_name,
      quantity: it.quantity,
      price: Number(it.unit_price),
    })),
  };
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as DbOrder[]).map(dbToOrder);
}

export interface AdminOrder extends Order {
  uuid: string;
  userId: string;
}

export async function fetchAllOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as DbOrder[]).map((row) => ({
    ...dbToOrder(row),
    uuid: row.id,
    userId: row.user_id,
  }));
}

export async function updateOrderStatus(uuid: string, status: OrderStatus) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", uuid);
  if (error) throw error;
}

export interface PlaceOrderInput {
  userId: string;
  items: { productId: string | null; productName: string; quantity: number; unitPrice: number }[];
  total: number;
  paymentMethod: "upi" | "cod";
  deliveryType: "delivery" | "pickup";
  address: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      total: input.total,
      payment_method: input.paymentMethod,
      delivery_type: input.deliveryType,
      address: input.address,
    })
    .select("id, order_number")
    .single();
  if (orderErr) throw orderErr;

  const itemRows = input.items.map((it) => ({
    order_id: orderRow.id,
    product_id: it.productId,
    product_name: it.productName,
    quantity: it.quantity,
    unit_price: it.unitPrice,
  }));
  const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
  if (itemsErr) throw itemsErr;

  return orderRow.order_number;
}
