import { createFileRoute } from "@tanstack/react-router";
import { CataloguePage } from "../pages/CataloguePage";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Menu — Cakes, Pastries & Bread | BakeEase" },
      {
        name: "description",
        content:
          "Browse our full bakery menu — cakes, cupcakes, pastries, breads and custom orders. Filter by occasion and flavour.",
      },
    ],
  }),
  component: CataloguePage,
});
