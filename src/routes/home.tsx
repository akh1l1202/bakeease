import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../pages/HomePage";

function HomeRoute() {
  return <HomePage />;
}

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "BakeEase — Fresh Baked, Just for You | Mumbai Bakery" },
      {
        name: "description",
        content:
          "Order fresh handcrafted cakes, cupcakes, pastries and breads online. Delivered across Mumbai with UPI or COD.",
      },
    ],
  }),
  component: HomeRoute,
});
