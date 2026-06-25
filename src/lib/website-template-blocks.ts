function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

interface Block {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
}

function block(type: string, order: number, settings: Record<string, unknown>): Block {
  return { id: `wb-${uid()}`, type, order, visible: true, settings };
}

// Default blocks grouped by plannerTheme
const THEME_BLOCKS: Record<string, (slug?: string) => Block[]> = {
  minimal: () => [
    block("cover", 0, {
      quote: "Two souls, one journey.",
      brideName: "",
      groomName: "",
      date: "",
      backgroundImage: null,
      navLinks: ["Our Story", "When & Where", "RSVP"],
    }),
    block("our-story", 1, {
      title: "Our Story",
      content: "It started with a simple hello and grew into a lifetime of love. We are beyond excited to begin this new chapter and can't wait to celebrate with everyone we cherish.",
    }),
    block("venue", 2, {
      title: "When & Where",
      ceremonyName: "Ceremony Venue",
      ceremonyAddress: "",
      ceremonyTime: "",
      receptionName: "Reception Venue",
      receptionAddress: "",
      receptionTime: "",
    }),
    block("schedule", 3, {
      title: "Day Schedule",
      items: [
        { time: "3:00 PM", title: "Doors Open" },
        { time: "4:00 PM", title: "Ceremony" },
        { time: "5:00 PM", title: "Cocktail Hour" },
        { time: "7:00 PM", title: "Dinner & Dancing" },
      ],
    }),
    block("rsvp", 4, {
      title: "RSVP",
      deadline: "",
      message: "Kindly reply by the date noted on your invitation.",
    }),
    block("guestbook", 5, {
      title: "Leave a Wish",
      message: "We'd love to hear from you. Leave us a note!",
    }),
  ],

  rustic: () => [
    block("cover", 0, {
      quote: "Love is the greatest adventure.",
      brideName: "",
      groomName: "",
      date: "",
      backgroundImage: null,
      navLinks: ["Our Story", "Where to Be", "RSVP", "Guestbook"],
    }),
    block("countdown", 1, {
      title: "Counting Down to Our Big Day",
      targetDate: "",
    }),
    block("our-story", 2, {
      title: "Our Love Story",
      content: "From the first moment we met, we knew something special had begun. Through adventures big and small, our love has grown into something truly beautiful. We're so grateful to share this day with our favourite people.",
    }),
    block("venue", 3, {
      title: "Find Us Here",
      ceremonyName: "Ceremony Venue",
      ceremonyAddress: "",
      ceremonyTime: "",
      receptionName: "Reception Venue",
      receptionAddress: "",
      receptionTime: "",
    }),
    block("schedule", 4, {
      title: "The Day's Events",
      items: [
        { time: "3:30 PM", title: "Guests Arrive" },
        { time: "4:00 PM", title: "Ceremony Begins" },
        { time: "5:30 PM", title: "Cocktail Hour" },
        { time: "7:00 PM", title: "Dinner" },
        { time: "9:00 PM", title: "Dancing & Celebration" },
      ],
    }),
    block("rsvp", 5, {
      title: "Will You Join Us?",
      deadline: "",
      message: "Please let us know if you can make it. We'd love to have you there!",
    }),
    block("registry", 6, {
      title: "Wedding Registry",
      items: [
        { name: "Amazon", url: "" },
        { name: "Our Honeymoon Fund", url: "" },
      ],
    }),
    block("guestbook", 7, {
      title: "Sign Our Guestbook",
      message: "Leave us your warmest wishes!",
    }),
  ],

  floral: () => [
    block("cover", 0, {
      quote: "Forever starts today.",
      brideName: "",
      groomName: "",
      date: "",
      backgroundImage: null,
      navLinks: ["Our Story", "Wedding Party", "Ceremony", "RSVP"],
    }),
    block("our-story", 1, {
      title: "Our Story",
      content: "A chance encounter blossomed into a beautiful love story. From the very first date to this magical moment, every step has led us here. We are so honoured to celebrate this milestone with our dearest family and friends.",
    }),
    block("people", 2, {
      title: "Wedding Party",
      people: [
        { name: "", role: "Maid of Honor" },
        { name: "", role: "Best Man" },
        { name: "", role: "Bridesmaid" },
        { name: "", role: "Groomsman" },
      ],
    }),
    block("venue", 3, {
      title: "Ceremony & Reception",
      ceremonyName: "Ceremony Venue",
      ceremonyAddress: "",
      ceremonyTime: "",
      receptionName: "Reception Venue",
      receptionAddress: "",
      receptionTime: "",
    }),
    block("schedule", 4, {
      title: "Order of Events",
      items: [
        { time: "3:30 PM", title: "Guests Seated" },
        { time: "4:00 PM", title: "Ceremony" },
        { time: "5:00 PM", title: "Cocktail Reception" },
        { time: "7:00 PM", title: "Wedding Dinner" },
        { time: "9:00 PM", title: "First Dance & Dancing" },
      ],
    }),
    block("rsvp", 5, {
      title: "RSVP",
      deadline: "",
      message: "Please respond at your earliest convenience. We look forward to celebrating with you.",
    }),
    block("registry", 6, {
      title: "Gift Registry",
      items: [
        { name: "Amazon", url: "" },
        { name: "Williams-Sonoma", url: "" },
      ],
    }),
    block("guestbook", 7, {
      title: "Guestbook",
      message: "Your words mean the world to us. Please leave a message below.",
    }),
  ],

  modern: () => [
    block("countdown", 0, {
      title: "The Big Day Is Coming",
      targetDate: "",
    }),
    block("cover", 1, {
      quote: "Two hearts, one dream.",
      brideName: "",
      groomName: "",
      date: "",
      backgroundImage: null,
      navLinks: ["About Us", "Details", "Gallery", "RSVP"],
    }),
    block("our-story", 2, {
      title: "About Us",
      content: "We met by chance and chose each other by heart. Our journey together has been filled with laughter, growth and endless love. Now we're ready to make it official — and we want you to be part of every moment.",
    }),
    block("venue", 3, {
      title: "Details",
      ceremonyName: "Ceremony Venue",
      ceremonyAddress: "",
      ceremonyTime: "",
      receptionName: "Reception Venue",
      receptionAddress: "",
      receptionTime: "",
    }),
    block("schedule", 4, {
      title: "Timeline",
      items: [
        { time: "4:00 PM", title: "Ceremony" },
        { time: "5:00 PM", title: "Cocktails" },
        { time: "7:00 PM", title: "Dinner" },
        { time: "9:00 PM", title: "Party" },
      ],
    }),
    block("gallery", 5, {
      title: "Our Photos",
      images: [],
    }),
    block("rsvp", 6, {
      title: "RSVP",
      deadline: "",
      message: "Let us know if you can make it!",
    }),
    block("guestbook", 7, {
      title: "Leave a Message",
      message: "We'd love to hear from you.",
    }),
  ],
};

// Fallback default set
const DEFAULT_BLOCKS: Block[] = [
  block("cover", 0, {
    quote: "We're Getting Married!",
    brideName: "", groomName: "", date: "", backgroundImage: null,
    navLinks: ["Our Story", "When & Where", "RSVP"],
  }),
  block("our-story", 1, {
    title: "Our Story",
    content: "We met, we fell in love, and now we're getting married. We can't wait to celebrate with you!",
  }),
  block("venue", 2, {
    title: "When & Where",
    ceremonyName: "", ceremonyAddress: "", ceremonyTime: "",
    receptionName: "", receptionAddress: "", receptionTime: "",
  }),
  block("schedule", 3, {
    title: "Schedule",
    items: [
      { time: "4:00 PM", title: "Ceremony" },
      { time: "5:00 PM", title: "Cocktail Hour" },
      { time: "7:00 PM", title: "Reception & Dinner" },
    ],
  }),
  block("rsvp", 4, {
    title: "RSVP",
    deadline: "",
    message: "Please let us know if you can make it!",
  }),
  block("guestbook", 5, {
    title: "Guestbook",
    message: "Leave us a note!",
  }),
];

export function getTemplateBlocks(plannerTheme: string): Block[] {
  const factory = THEME_BLOCKS[plannerTheme];
  return factory ? factory() : DEFAULT_BLOCKS.map((b) => ({ ...b, id: `wb-${uid()}` }));
}
