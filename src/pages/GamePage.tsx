import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cake, Trophy, Star, ArrowLeft, Timer, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
type Phase = "start" | "playing" | "result";

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  layer: "base" | "frosting" | "decoration";
  color: string; // tailwind bg
}

const INGREDIENTS: Ingredient[] = [
  { id: "vanilla-base", name: "Vanilla Sponge", emoji: "🟡", layer: "base", color: "bg-yellow-200" },
  { id: "choco-base", name: "Chocolate Sponge", emoji: "🟫", layer: "base", color: "bg-amber-700" },
  { id: "redvelvet-base", name: "Red Velvet", emoji: "🔴", layer: "base", color: "bg-rose-700" },
  { id: "vanilla-frost", name: "Vanilla Frosting", emoji: "⚪", layer: "frosting", color: "bg-amber-50" },
  { id: "choco-frost", name: "Chocolate Frosting", emoji: "🍫", layer: "frosting", color: "bg-amber-900" },
  { id: "strawberry-frost", name: "Strawberry Frosting", emoji: "🍓", layer: "frosting", color: "bg-rose-300" },
  { id: "sprinkles", name: "Rainbow Sprinkles", emoji: "✨", layer: "decoration", color: "bg-pink-300" },
  { id: "cherry", name: "Cherry on Top", emoji: "🍒", layer: "decoration", color: "bg-red-500" },
  { id: "choco-chips", name: "Choco Chips", emoji: "🍫", layer: "decoration", color: "bg-amber-800" },
];

const DIFFICULTY: Record<Difficulty, { time: number; label: string }> = {
  easy: { time: 0, label: "Easy" },
  medium: { time: 30, label: "Medium" },
  hard: { time: 15, label: "Hard" },
};

interface Order {
  base: Ingredient;
  frosting: Ingredient;
  decoration: Ingredient;
}

function makeOrder(): Order {
  const pick = (layer: Ingredient["layer"]) => {
    const opts = INGREDIENTS.filter((i) => i.layer === layer);
    return opts[Math.floor(Math.random() * opts.length)];
  };
  return { base: pick("base"), frosting: pick("frosting"), decoration: pick("decoration") };
}

const HS_KEY = "bakeease.bakemaster.highscore";

export function GamePage() {
  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [order, setOrder] = useState<Order>(() => makeOrder());
  const [picked, setPicked] = useState<Record<Ingredient["layer"], Ingredient | null>>({
    base: null, frosting: null, decoration: null,
  });
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [highScore, setHighScore] = useState(0);
  const [stars, setStars] = useState(0);
  const startedAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(HS_KEY);
    if (raw) setHighScore(parseInt(raw, 10) || 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setOrder(makeOrder());
    setPicked({ base: null, frosting: null, decoration: null });
    setScore(0);
    setStars(0);
    const initialTime = DIFFICULTY[difficulty].time;
    setTime(initialTime);
    startedAt.current = Date.now();
    setPhase("playing");

    if (initialTime > 0) {
      timerRef.current = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  };

  const finishGame = () => {
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
    setTime(elapsed);
    if (timerRef.current) clearInterval(timerRef.current);
    // determine stars based on score
    setStars((s) => {
      const final = score >= 300 ? 3 : score >= 200 ? 2 : score >= 100 ? 1 : 0;
      // also persist HS
      if (score > highScore) {
        setHighScore(score);
        if (typeof window !== "undefined") localStorage.setItem(HS_KEY, String(score));
      }
      return final || s;
    });
    setPhase("result");
  };

  const handlePick = (ing: Ingredient) => {
    const correct = order[ing.layer].id === ing.id && picked[ing.layer] === null;
    if (correct) {
      setPicked((p) => ({ ...p, [ing.layer]: ing }));
      setScore((s) => s + 100);
      setFeedback("correct");
      setTimeout(() => setFeedback(""), 350);
      // check completion
      const next = { ...picked, [ing.layer]: ing };
      if (next.base && next.frosting && next.decoration) {
        setTimeout(() => {
          // bonus
          setScore((s) => s + 50);
          finishGame();
        }, 500);
      }
    } else {
      setScore((s) => Math.max(0, s - 25));
      setFeedback("wrong");
      setTimeout(() => setFeedback(""), 350);
    }
  };

  const layers: Ingredient["layer"][] = ["base", "frosting", "decoration"];

  return (
    <div style={{ background: "#2C1810" }} className="min-h-screen text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {phase === "start" && <StartScreen highScore={highScore} difficulty={difficulty} onChange={setDifficulty} onStart={startGame} />}

        {phase === "playing" && (
          <div className="space-y-6">
            <div className="grid items-start gap-4 md:grid-cols-3">
              {/* Order */}
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-white/60">Order</p>
                <p className="mt-1 font-display text-lg font-bold">Build this cake!</p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>🎂 Base: <strong>{order.base.name}</strong></li>
                  <li>🧁 Frosting: <strong>{order.frosting.name}</strong></li>
                  <li>✨ Decor: <strong>{order.decoration.name}</strong></li>
                </ul>
              </div>

              {/* Cake preview */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs uppercase tracking-wider text-white/60">Your Cake</p>
                <div className={cn(
                  "mt-3 flex flex-col-reverse items-center gap-1 transition-transform",
                  feedback === "correct" && "animate-bounce-in",
                  feedback === "wrong" && "animate-shake"
                )}>
                  <div className={cn("h-8 w-32 rounded-md transition-colors", picked.base?.color ?? "bg-white/10")} />
                  <div className={cn("h-6 w-28 rounded-md transition-colors", picked.frosting?.color ?? "bg-white/10")} />
                  <div className={cn("h-4 w-20 rounded-full transition-colors", picked.decoration?.color ?? "bg-white/10")} />
                </div>
                <div className="mt-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <Star key={i} className={cn("size-5", i < Object.values(picked).filter(Boolean).length ? "fill-accent text-accent" : "text-white/20")} />
                  ))}
                </div>
              </div>

              {/* Timer / score */}
              <div className="rounded-xl bg-white/10 p-4 text-right backdrop-blur-md">
                <p className="text-xs uppercase tracking-wider text-white/60">Score</p>
                <p className="font-display text-3xl font-bold text-accent">{score}</p>
                {difficulty !== "easy" && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/40 px-3 py-1 text-sm">
                    <Timer className="size-4" /> {time}s
                  </div>
                )}
              </div>
            </div>

            {/* Ingredient trays */}
            {layers.map((layer) => (
              <div key={layer}>
                <p className="mb-2 text-xs uppercase tracking-wider text-white/60">{layer}</p>
                <div className="grid grid-cols-3 gap-3">
                  {INGREDIENTS.filter((i) => i.layer === layer).map((i) => {
                    const used = picked[layer]?.id === i.id;
                    return (
                      <button
                        key={i.id}
                        disabled={used}
                        onClick={() => handlePick(i)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border-2 border-white/20 bg-white/5 p-4 transition-all hover:scale-105 hover:border-accent disabled:opacity-30",
                        )}
                      >
                        <span className="text-3xl">{i.emoji}</span>
                        <span className="text-xs font-medium">{i.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {phase === "result" && (
          <ResultScreen score={score} stars={stars} time={time} highScore={highScore} onReplay={startGame} />
        )}
      </div>
    </div>
  );
}

function StartScreen({
  highScore, difficulty, onChange, onStart,
}: {
  highScore: number;
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow shadow-warm-lg">
        <Cake className="size-12 text-white" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold">BakeMaster</h1>
      <p className="mt-2 text-white/70">Match the order. Stack the layers. Become a master baker.</p>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2">
        <Trophy className="size-4 text-accent" />
        <span className="text-sm">High Score: <strong>{highScore}</strong></span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-semibold capitalize transition-colors",
              difficulty === d
                ? "border-accent bg-accent text-accent-foreground"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            )}
          >
            {DIFFICULTY[d].label}
          </button>
        ))}
      </div>

      <Button onClick={onStart} variant="hero" size="xl" className="mt-8 w-full">
        Start Baking
      </Button>
    </div>
  );
}

function ResultScreen({
  score, stars, time, highScore, onReplay,
}: {
  score: number; stars: number; time: number; highScore: number; onReplay: () => void;
}) {
  const isHigh = score >= highScore && score > 0;
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-accent to-primary shadow-warm-lg">
        <Trophy className="size-12 text-white" />
      </div>
      <h2 className="mt-6 font-display text-4xl font-bold">{stars >= 3 ? "Master Baker!" : stars >= 1 ? "Well baked!" : "Practice more!"}</h2>
      {isHigh && <p className="mt-1 text-accent font-semibold">🎉 New high score!</p>}

      <div className="mt-4 flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <Star key={i} className={cn("size-10", i < stars ? "fill-accent text-accent" : "text-white/20")} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-xs text-white/60">Score</p>
          <p className="font-display text-2xl font-bold text-accent">{score}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-xs text-white/60">Time</p>
          <p className="font-display text-2xl font-bold">{time}s</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onReplay} variant="hero" size="lg" className="flex-1">
          <RotateCcw className="size-4" /> Play Again
        </Button>
        <Link to="/catalogue" className="flex-1">
          <Button variant="heroOutline" size="lg" className="w-full">
            <ArrowLeft className="size-4" /> Back to Shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
