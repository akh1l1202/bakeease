import { createFileRoute } from "@tanstack/react-router";
import { GamePage } from "../pages/GamePage";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "BakeMaster — Bake the Cake! | BakeEase" },
      { name: "description", content: "Play BakeMaster — a fun in-browser baking mini-game." },
    ],
  }),
  component: GamePage,
});
