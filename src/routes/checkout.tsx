import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "../pages/CheckoutPage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Cart & Checkout — BakeEase" },
      { name: "description", content: "Review your cart and complete your bakery order." },
    ],
  }),
  component: CheckoutPage,
});
