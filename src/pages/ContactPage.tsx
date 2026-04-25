import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Plus, Minus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/StarRating";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Do you deliver across all of Mumbai?",
    a: "Yes — we deliver across the Mumbai metropolitan area including Bandra, Andheri, Powai, Juhu, South Mumbai and Thane. Same-day delivery available for orders before 2 PM.",
  },
  {
    q: "How far in advance should I order a custom cake?",
    a: "We recommend ordering at least 48 hours in advance for custom cakes, and 7 days for tiered wedding cakes.",
  },
  {
    q: "Are your products vegetarian?",
    a: "All our cakes, pastries and breads are 100% eggless on request. Look for the green dot on each product card.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI (GPay, PhonePe, Paytm), all major cards, and Cash on Delivery.",
  },
  {
    q: "Can I cancel or modify my order?",
    a: "Orders can be cancelled or modified up to 6 hours before the scheduled delivery time. Custom orders cannot be cancelled once production starts.",
  },
];

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number>(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    if (!name.trim()) eMap.name = "Name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) eMap.email = "Valid email required";
    if (!subject) eMap.subject = "Pick a subject";
    if (message.trim().length < 10) eMap.message = "Tell us a bit more (min 10 chars)";
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-display text-4xl font-bold md:text-5xl">Get in Touch</h1>
          <p className="mt-3 text-muted-foreground">
            Questions, custom orders, feedback or suggestions — we'd love to hear from you.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-warm-sm">
              <h2 className="font-display text-xl font-semibold">Visit Us</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>24, Linking Road, Bandra West<br />Mumbai 400050, India</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 text-primary" />
                  <a href="tel:+912226000000" className="hover:text-primary">+91 22 2600 0000</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-5 text-primary" />
                  <a href="mailto:hello@bakeease.in" className="hover:text-primary">hello@bakeease.in</a>
                </li>
              </ul>

              <h3 className="mt-6 flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="size-4 text-primary" /> Operating Hours
              </h3>
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 text-muted-foreground">Mon – Fri</td><td className="py-2 text-right">8:00 AM – 10:00 PM</td></tr>
                  <tr><td className="py-2 text-muted-foreground">Sat – Sun</td><td className="py-2 text-right">9:00 AM – 11:00 PM</td></tr>
                </tbody>
              </table>
            </div>

            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
              <iframe
                title="BakeEase location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.8200%2C19.0500%2C72.8500%2C19.0700&amp;layer=mapnik"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-warm-sm md:p-8">
            {success ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="size-16 text-success" />
                <h2 className="mt-4 font-display text-2xl font-bold">Thank you!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  We've received your message and will get back to you within 24 hours.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => {
                  setSuccess(false); setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage(""); setRating(0);
                }}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cname">Full Name</Label>
                    <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cemail">Email</Label>
                    <Input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="cphone">Phone (optional)</Label>
                  <Input id="cphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order Issue</SelectItem>
                      <SelectItem value="feedback">Product Feedback</SelectItem>
                      <SelectItem value="enquiry">General Enquiry</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject}</p>}
                </div>
                <div>
                  <Label htmlFor="cmsg">Message</Label>
                  <Textarea id="cmsg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                </div>
                <div>
                  <Label>Rate your experience</Label>
                  <div className="mt-1">
                    <StarRating value={rating} interactive size={28} onChange={setRating} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cfile">Attachment (optional)</Label>
                  <Input id="cfile" type="file" className="mt-1" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-2">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium hover:bg-secondary/40"
                  >
                    <span>{f.q}</span>
                    {open ? <Minus className="size-4 shrink-0" /> : <Plus className="size-4 shrink-0" />}
                  </button>
                  <div className={cn("grid transition-all", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
