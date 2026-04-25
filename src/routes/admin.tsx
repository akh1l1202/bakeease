import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../pages/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — BakeEase" },
      { name: "description", content: "BakeEase admin dashboard." },
    ],
  }),
  component: AdminPage,
});
