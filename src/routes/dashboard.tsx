import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Account — BakeEase" },
      { name: "description", content: "Track your orders, manage addresses and account settings." },
    ],
  }),
  component: DashboardPage,
});
