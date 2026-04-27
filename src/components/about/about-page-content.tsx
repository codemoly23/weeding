"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Home,
  Star,
  CalendarDays,
  Users,
  Building2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

// ─── Animation Variants ───────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.7,  ease } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.7,  ease } },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
});

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
};

// ─── Count-Up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, inView: boolean, duration = 1.8) {
  const motionVal = useMotionValue(0);
  const spring    = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsubscribe;
  }, [spring]);

  return display;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: CalendarDays, rawValue: 2400,  suffix: "+", label: "Events Planned"  },
  { icon: Users,        rawValue: 1800,  suffix: "+", label: "Happy Couples"   },
  { icon: Building2,    rawValue: 350,   suffix: "+", label: "Partner Vendors" },
  { icon: MapPin,       rawValue: 12,    suffix: "",  label: "Cities Covered"  },
];

const TEAM = [
  {
    id: 1,
    name: "Emma Lindqvist",
    role: "Lead Wedding Planner",
    bio: "With over 8 years crafting unforgettable ceremonies, Emma brings warmth and meticulous attention to every detail of your celebration.",
    featured: false,
    initials: "EL",
    ringFrom: "#fed7aa",
    ringTo:   "#f97316",
    avatarBg: "bg-orange-50",
    avatarText: "text-orange-600",
  },
  {
    id: 2,
    name: "Marcus Okafor",
    role: "Creative Director",
    bio: "Marcus transforms vision boards into reality, overseeing décor, styling, and the visual story behind every beautiful event.",
    featured: true,
    initials: "MO",
    ringFrom: "#e9d5ff",
    ringTo:   "#9333ea",
    avatarBg: "bg-purple-50",
    avatarText: "text-purple-600",
  },
  {
    id: 3,
    name: "Sofia Bergström",
    role: "Guest Experience Lead",
    bio: "Sofia ensures every guest feels welcomed and every logistical detail — from RSVP to seating — runs flawlessly.",
    featured: true,
    initials: "SB",
    ringFrom: "#fce7f3",
    ringTo:   "#ec4899",
    avatarBg: "bg-pink-50",
    avatarText: "text-pink-600",
  },
  {
    id: 4,
    name: "Daniel Park",
    role: "Vendor Relations Manager",
    bio: "Daniel curates and coordinates our trusted vendor network, ensuring top-quality services for every event type.",
    featured: false,
    initials: "DP",
    ringFrom: "#dbeafe",
    ringTo:   "#2563eb",
    avatarBg: "bg-blue-50",
    avatarText: "text-blue-600",
  },
  {
    id: 5,
    name: "Amara Nwosu",
    role: "Digital Platform Lead",
    bio: "Amara keeps Ceremoney running smoothly, turning complex logistics into simple, intuitive digital experiences.",
    featured: false,
    initials: "AN",
    ringFrom: "#ccfbf1",
    ringTo:   "#0d9488",
    avatarBg: "bg-teal-50",
    avatarText: "text-teal-600",
  },
];

const VISIBLE_COUNT = 3; // desktop — on mobile CSS grid stacks them vertically

// ─── Stat Item (needs its own component for count-up hook) ────────────────────

function StatItem({
  icon: Icon,
  rawValue,
  suffix,
  label,
  index,
}: (typeof STATS)[number] & { index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count  = useCountUp(rawValue, inView);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={index}
      className="flex flex-col items-center text-center gap-4"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.12 }}
        className="w-16 h-16 rounded-full border border-white/20 bg-white/5 flex items-center justify-center"
      >
        <Icon className="w-7 h-7 text-white" strokeWidth={1.25} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.2, ease }}
        className="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight"
      >
        {count}{suffix}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.4 }}
        className="text-xs text-white/60 font-medium uppercase tracking-[0.15em]"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AboutPageContent() {
  const [teamStart, setTeamStart] = useState(0);
  const [direction, setDirection] = useState(0);

  const canPrev     = teamStart > 0;
  const canNext     = teamStart + VISIBLE_COUNT < TEAM.length;
  const visibleTeam = TEAM.slice(teamStart, teamStart + VISIBLE_COUNT);

  function paginate(dir: 1 | -1) {
    setDirection(dir);
    setTeamStart((i) =>
      dir === 1
        ? Math.min(TEAM.length - VISIBLE_COUNT, i + 1)
        : Math.max(0, i - 1)
    );
  }

  // Refs for scroll-triggered sections
  const introRef  = useRef<HTMLDivElement>(null);
  const teamRef   = useRef<HTMLDivElement>(null);
  const videoRef  = useRef<HTMLDivElement>(null);

  const introInView = useInView(introRef,  { once: true, margin: "-80px" });
  const teamInView  = useInView(teamRef,   { once: true, margin: "-80px" });
  const videoInView = useInView(videoRef,  { once: true, margin: "-80px" });

  // Carousel card variants
  const cardVariants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.35, ease } }),
  };

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── 1. Hero Banner ───────────────────────────────────────── */}
      <section className="relative min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden">
        {/* Ken Burns — subtle scale */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <Image
            src="/hero/1776769664956-wedding1.jpeg"
            alt="Elegant wedding celebration"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/75 via-[#0A0F1E]/65 to-[#0A0F1E]/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="flex items-center gap-1.5 text-sm text-white/60 mb-6"
          >
            <Link href="/" className="hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white/40">Pages</span>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white font-medium">About Us</span>
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-heading tracking-tight leading-tight"
          >
            About Us
          </motion.h1>
        </div>
      </section>

      {/* ─── 2. About Intro ───────────────────────────────────────── */}
      <section className="py-20 bg-white" ref={introRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* Left — image slides in from left */}
            <motion.div
              className="relative px-2 sm:px-0"
              variants={fadeLeft}
              initial="hidden"
              animate={introInView ? "show" : "hidden"}
            >
              {/* Decorative rings — hidden on mobile to avoid overflow */}
              <motion.div
                className="absolute -bottom-5 -right-5 w-40 h-40 rounded-full border-[3px] border-primary/15 -z-10 hidden sm:block"
                initial={{ scale: 0, opacity: 0 }}
                animate={introInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.5 }}
              />
              <motion.div
                className="absolute -top-5 -left-5 w-24 h-24 rounded-full border-[3px] border-primary/10 -z-10 hidden sm:block"
                initial={{ scale: 0, opacity: 0 }}
                animate={introInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.65 }}
              />
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
                <Image
                  src="/hero/1776767843369-couple.png"
                  alt="Happy couple planning their wedding with Ceremoney"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Right — text staggered from right */}
            <motion.div
              className="space-y-5 lg:pl-4"
              variants={stagger(0.1)}
              initial="hidden"
              animate={introInView ? "show" : "hidden"}
            >
              <motion.p
                variants={fadeRight}
                className="text-xs font-bold text-primary tracking-[0.2em] uppercase font-heading"
              >
                About Us
              </motion.p>
              <motion.h2
                variants={fadeRight}
                className="text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.15] text-slate-900 italic font-accent"
              >
                We create unforgettable moments for every celebration.
              </motion.h2>
              <motion.p variants={fadeRight} className="text-base text-slate-500 leading-relaxed">
                Ceremoney is a modern digital platform built for couples, families, and event hosts
                who want a seamless, stress-free planning experience. From intimate baptisms to grand
                weddings, we handle every detail with care and precision.
              </motion.p>
              <motion.p variants={fadeRight} className="text-base text-slate-500 leading-relaxed">
                Our platform brings together smart tools, trusted vendors, and a passionate team —
                so you can focus on the joy, while we handle the flow.
              </motion.p>
              <motion.div variants={fadeRight} className="pt-2">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-primary/25"
                >
                  Explore Our Services
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 3. Stats Bar ─────────────────────────────────────────── */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: `url("/hero/1776856822751-i2.jpg")`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0A0F1E]/55" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {STATS.map((stat, i) => (
              <StatItem key={stat.label} {...stat} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 4. Team Section ──────────────────────────────────────── */}
      <section className="py-20 bg-white" ref={teamRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
            variants={fadeUp}
            initial="hidden"
            animate={teamInView ? "show" : "hidden"}
          >
            <div>
              <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase font-heading mb-2">
                Our Backbone
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] text-slate-900 italic font-accent leading-tight">
                Meet Our Team
              </h2>
            </div>

            <div className="flex gap-2 sm:mb-1">
              <button
                onClick={() => paginate(-1)}
                disabled={!canPrev}
                aria-label="Previous team members"
                className="w-11 h-11 rounded-lg border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => paginate(1)}
                disabled={!canNext}
                aria-label="Next team members"
                className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-orange-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Cards with AnimatePresence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              {visibleTeam.map((member, i) => (
                <motion.div
                  key={member.id}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                  className="relative flex flex-col items-center text-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 transition-shadow duration-300 px-8 pt-10 pb-8 cursor-default"
                >
                  {/* Featured star badge — top left */}
                  {member.featured && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 + i * 0.1 }}
                      className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-md"
                    >
                      <Star className="w-4 h-4 text-white fill-white" />
                    </motion.div>
                  )}

                  {/* Circular avatar with gradient ring */}
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="mb-5"
                  >
                    <div
                      className="w-[120px] h-[120px] rounded-full p-[3px] shadow-md"
                      style={{
                        background: `linear-gradient(145deg, ${member.ringFrom}, ${member.ringTo})`,
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold font-heading ${member.avatarBg} ${member.avatarText}`}
                      >
                        {member.initials}
                      </div>
                    </div>
                  </motion.div>

                  {/* Name & role */}
                  <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-400">{member.role}</p>

                  {/* Divider */}
                  <div className="w-full h-px bg-slate-100 my-5" />

                  {/* Bio */}
                  <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-6">
                    {member.bio}
                  </p>

                  {/* Centered pill button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="group/btn px-8 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-md shadow-primary/25 flex items-center gap-2"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── 5. Video / Approach Section ──────────────────────────── */}
      <section className="relative py-24 bg-slate-50 overflow-hidden" ref={videoRef}>
        {/* Balloons — hidden on mobile, visible from md */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden md:block"
          initial={{ opacity: 0, y: 40 }}
          animate={videoInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease }}
        >
          <HeartBalloons />
        </motion.div>
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none scale-x-[-1] hidden md:block"
          initial={{ opacity: 0, y: 40 }}
          animate={videoInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.35, ease }}
        >
          <HeartBalloons />
        </motion.div>

        <motion.div
          className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl"
          variants={stagger(0.12)}
          initial="hidden"
          animate={videoInView ? "show" : "hidden"}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold text-primary tracking-[0.2em] uppercase font-heading mb-3"
          >
            Our Approach
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-[2.75rem] text-slate-900 italic font-accent mb-5 leading-tight"
          >
            See How We Make Magic Happen
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-slate-500 leading-relaxed mb-10">
            From the very first consultation to the final farewell, our team is by your side —
            guiding, coordinating, and celebrating every milestone of your journey with care.
          </motion.p>

          {/* Play button with pulse ring */}
          <motion.div
            variants={scaleIn}
            className="relative inline-flex items-center justify-center"
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.button
              aria-label="Watch our story"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white shadow-xl shadow-primary/30"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}

// ─── Heart Balloons SVG ───────────────────────────────────────────────────────

function HeartBalloons() {
  return (
    <svg
      width="160"
      height="320"
      viewBox="0 0 160 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="80" cy="95" rx="46" ry="54" fill="#EF4444" />
      <path
        d="M80 82 C80 82 64 68 64 57 C64 49 72 44 80 52 C88 44 96 49 96 57 C96 68 80 82 80 82Z"
        fill="#DC2626"
      />
      <line x1="80" y1="149" x2="77" y2="210" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

      <ellipse cx="38" cy="178" rx="32" ry="38" fill="#EF4444" />
      <path
        d="M38 167 C38 167 26 156 26 148 C26 142 32 138 38 145 C44 138 50 142 50 148 C50 156 38 167 38 167Z"
        fill="#DC2626"
      />
      <line x1="38" y1="216" x2="35" y2="270" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

      <ellipse cx="122" cy="190" rx="28" ry="34" fill="#EF4444" />
      <path
        d="M122 180 C122 180 112 171 112 164 C112 159 117 155 122 161 C127 155 132 159 132 164 C132 171 122 180 122 180Z"
        fill="#DC2626"
      />
      <line x1="122" y1="224" x2="119" y2="275" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M77 210 Q72 245 70 280" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M35 270 Q34 285 34 295" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M119 275 Q118 288 118 298" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
