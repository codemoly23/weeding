"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { Phone, MapPin, MessageCircle, ChevronRight, Send, CheckCircle2 } from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Hook: trigger animation once when in viewport ───────────────
function useScrollReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return { ref, inView };
}

// ─── Data ─────────────────────────────────────────────────────────
const INFO_CARDS = [
  {
    icon: Phone,
    title: "Reach Out",
    description:
      "Have a question or want to learn more about our services? Give us a call — we're happy to help.",
    buttonText: "Call Us",
    href: "tel:+12345678900",
  },
  {
    icon: MapPin,
    title: "Find Us",
    description:
      "Planning to visit? Come find us at our office to discuss your event needs in person.",
    buttonText: "Get Directions",
    href: "https://maps.google.com",
  },
  {
    icon: MessageCircle,
    title: "Get Support",
    description:
      "Need help with your account or planning? Our support team is always ready for you.",
    buttonText: "Start Chat",
    href: "#chat",
  },
];

const OFFICE_LOCATIONS = [
  { city: "NEW YORK",  country: "USA",     name: "Cecilia Chapman 711-2880",    address: "Nulla St.",      phone: "(478) 339 120" },
  { city: "TBILISI",  country: "GEORGIA",  name: "Aaron Hawkins 5587 Nunc.",    address: "Avenue",         phone: "(134) 984 428" },
  { city: "MOSCOW",   country: "RUSSIA",   name: "Lawrence Moreno 935-9940",    address: "Tortor. Street", phone: "(433) 892 109" },
  { city: "CAIRO",    country: "EGYPT",    name: "Aaron Hawkins 5587 Nunc.",    address: "Avenue",         phone: "(006) 338 148" },
];

interface FormState {
  fullName: string;
  subject: string;
  phoneNumber: string;
  email: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  fullName: "", subject: "", phoneNumber: "", email: "", message: "",
};

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20";

// ─── Component ────────────────────────────────────────────────────
export function ContactPageContent() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardsSection  = useScrollReveal();
  const leftSection   = useScrollReveal();
  const rightSection  = useScrollReveal();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const parts = form.fullName.trim().split(" ");
    const firstName = parts[0] || "Guest";
    const lastName  = parts.slice(1).join(" ") || undefined;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName,
          email: form.email,
          phone: form.phoneNumber || undefined,
          message: form.subject
            ? `Subject: ${form.subject}\n\n${form.message}`
            : form.message,
          source: "WEBSITE",
          sourceDetail: "contact-page",
          lastPageViewed: "/contact",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Submission failed");
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════
          HERO — Ken Burns zoom + fade-in text
      ══════════════════════════════════════ */}
      <section className="relative h-80 w-full overflow-hidden md:h-[380px] lg:h-[440px]">
        {/* Ken Burns slow zoom */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
        >
          <Image
            src="/hero/1775649593571-wedding1.jpeg"
            alt="Contact Us"
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />

        {/* Breadcrumb + Title — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {/* Breadcrumb */}
          <motion.nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm font-medium text-white/70"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/50" />
            <span className="text-white/90">Contact Us</span>
          </motion.nav>

          {/* Big title */}
          <motion.h1
            className="font-heading px-4 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Contact Us
          </motion.h1>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO CARDS — stagger slide-up
      ══════════════════════════════════════ */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 xl:px-6">
          <motion.div
            ref={cardsSection.ref}
            variants={staggerContainer}
            initial="hidden"
            animate={cardsSection.inView ? "visible" : "hidden"}
            className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            {INFO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={cardVariant}
                  className="flex items-start gap-4 px-4 py-8 sm:gap-5 sm:px-6 md:px-8 md:first:pl-0 md:last:pr-0"
                >
                  {/* Icon with pulse ring on hover */}
                  <motion.div
                    className="shrink-0 pt-0.5"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Icon className="h-12 w-12 stroke-[1.3] text-primary" />
                  </motion.div>

                  <div className="flex flex-col items-start gap-2">
                    <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {card.description}
                    </p>
                    <motion.a
                      href={card.href}
                      className="mt-2 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white"
                      whileHover={{ scale: 1.05, opacity: 0.9 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {card.buttonText}
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOCATIONS + FORM — slide in from sides
      ══════════════════════════════════════ */}
      <section className="bg-gray-50/60 py-10 md:py-14">
        <div className="container mx-auto px-4 xl:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">

            {/* Left — slide in from left */}
            <motion.div
              ref={leftSection.ref}
              variants={slideLeft}
              initial="hidden"
              animate={leftSection.inView ? "visible" : "hidden"}
              className="space-y-7"
            >
              {/* Image with subtle scale */}
              <motion.div
                className="relative h-52 w-full overflow-hidden rounded-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Image
                  src="/hero/1776226659493-venue.jpg"
                  alt="Wedding venue"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Office grid — stagger children */}
              <motion.div
                className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7"
                variants={staggerContainer}
                initial="hidden"
                animate={leftSection.inView ? "visible" : "hidden"}
              >
                {OFFICE_LOCATIONS.map((office, i) => (
                  <motion.div
                    key={`${office.city}-${office.country}`}
                    variants={fadeUp}

                    className="space-y-0.5"
                  >
                    <p className="text-sm font-bold tracking-wide text-gray-900">{office.city}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{office.country}</p>
                    <p className="pt-1 text-sm text-gray-600">{office.name}</p>
                    <p className="text-sm text-gray-600">{office.address}</p>
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="block pt-0.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
                    >
                      {office.phone}
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — slide in from right */}
            <motion.div
              ref={rightSection.ref}
              variants={slideRight}
              initial="hidden"
              animate={rightSection.inView ? "visible" : "hidden"}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8"
            >
              {submitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  >
                    <CheckCircle2 className="mb-4 h-14 w-14 text-green-500" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Message Sent!</h3>
                  <p className="max-w-xs text-sm text-gray-500">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.p
                    className="mb-1 text-sm font-semibold text-primary"
                    variants={fadeIn}

                    initial="hidden"
                    animate={rightSection.inView ? "visible" : "hidden"}
                  >
                    Contact Us
                  </motion.p>

                  <motion.h2
                    className="font-accent mb-6 text-3xl italic text-slate-900"
                    variants={fadeUp}

                    initial="hidden"
                    animate={rightSection.inView ? "visible" : "hidden"}
                  >
                    Got Any Questions?
                  </motion.h2>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    noValidate
                    variants={staggerContainer}
                    initial="hidden"
                    animate={rightSection.inView ? "visible" : "hidden"}
                  >
                    {/* Row 1 */}
                    <motion.div variants={cardVariant} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Full Name</label>
                        <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                          placeholder="Full Name" required className={INPUT_CLASS} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Subject</label>
                        <input type="text" name="subject" value={form.subject} onChange={handleChange}
                          placeholder="Subject" className={INPUT_CLASS} />
                      </div>
                    </motion.div>

                    {/* Row 2 */}
                    <motion.div variants={cardVariant} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                        <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                          placeholder="Phone Number" className={INPUT_CLASS} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Email Address</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="Email Address" required className={INPUT_CLASS} />
                      </div>
                    </motion.div>

                    {/* Row 3 */}
                    <motion.div variants={cardVariant} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">Your Message</label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Type your message..." required rows={4}
                        className={`${INPUT_CLASS} resize-none`} />
                    </motion.div>

                    {/* Error */}
                    {error && (
                      <motion.p
                        className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    {/* Submit button */}
                    <motion.div variants={cardVariant}>
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-orange-600"
                        whileHover={{ scale: 1.04, opacity: 0.93 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {submitting ? (
                          <>
                            <motion.span
                              className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <motion.span
                              initial={{ x: 0 }}
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <Send className="h-4 w-4" />
                            </motion.span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
