import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login or Register — BakeEase" },
      { name: "description", content: "Sign in to BakeEase to order fresh bakes in Mumbai." },
    ],
  }),
  component: LoginPage,
});
