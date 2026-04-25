import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Feedback — BakeEase Mumbai" },
      {
        name: "description",
        content: "Get in touch with BakeEase Mumbai. Send feedback, ask questions, or share suggestions.",
      },
    ],
  }),
  component: ContactPage,
});
