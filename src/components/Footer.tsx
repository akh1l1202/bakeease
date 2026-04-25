import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-lg font-bold">
              B
            </span>
            <span className="font-display text-xl font-bold text-white">BakeEase</span>
          </div>
          <p className="mt-3 text-sm text-white/60">
            Mumbai's freshest online bakery. Handcrafted cakes, breads &amp; pastries delivered to your door.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-primary">
              <Instagram className="size-4" />
            </a>
            <a href="#" aria-label="Facebook" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-primary">
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/home" className="hover:text-accent">Home</Link></li>
            <li><Link to="/catalogue" className="hover:text-accent">Menu</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link to="/game" className="hover:text-accent">BakeMaster Game</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Categories</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/catalogue" className="hover:text-accent">Cakes</Link></li>
            <li><Link to="/catalogue" className="hover:text-accent">Cupcakes</Link></li>
            <li><Link to="/catalogue" className="hover:text-accent">Pastries</Link></li>
            <li><Link to="/catalogue" className="hover:text-accent">Bread</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> 24, Linking Road, Bandra West, Mumbai 400050</li>
            <li className="flex items-center gap-2"><Phone className="size-4" /> <a href="tel:+912226000000" className="hover:text-accent">+91 22 2600 0000</a></li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> <a href="mailto:hello@bakeease.in" className="hover:text-accent">hello@bakeease.in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} BakeEase Mumbai. All rights reserved.</p>
          <p>Aligned with SDG 8 — Decent Work &amp; Economic Growth</p>
        </div>
      </div>
    </footer>
  );
}
