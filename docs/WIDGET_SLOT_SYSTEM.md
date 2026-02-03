# Section-Based Page Builder System

## Overview

Elementor/Webflow style page builder যেখানে:
- **Section** = Row container with column layout
- **Column** = Container within section
- **Widget** = Atomic component inside column

---

## Core Concept

```
Page
  └── Section (1 col / 2 col / 3 col / custom)
        └── Column
              └── Widget (Hero Content, Image, Lead Form, etc.)
```

---

## User Flow

### Example 1: Simple Hero + Trust + Stats

```
Step 1: Click "Add Block" → Select 1 Column
        → Add "Hero Content" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget (full width)

Step 3: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget (full width)
```

**Result:**
```
┌─────────────────────────────────────────┐
│           Hero Content                  │
│  Badge
│ Headline
│  Subheadline         
│  Features  
│  Buttons  
│  Trust Text        
├─────────────────────────────────────────┤
│  [Badge] [Badge] [Badge] [Badge]        │  ← Trust Badges
├─────────────────────────────────────────┤
│  10,000+    50+     4.9/5     24h       │  ← Stats Section
└─────────────────────────────────────────┘
```

### Example 2: Split Hero with Lead Form

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Lead Form" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget
```

**Result:**
```
┌──────────────────────┬──────────────────────┐
│    Hero Content      │     Lead Form        │
│    - Badge           │     - Name           │
│    - Headline        │     - Email          │
│    - Subheadline     │     - Phone          │
│    - Features        │     - Submit         │
│    - Buttons         │                      │
├──────────────────────┴──────────────────────┤
│    Trust Badges (Full Width)                │
└─────────────────────────────────────────────┘
```

### Example 3: Hero with Image

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Image" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget
```

---

## Column Layouts

```
1 Column:     [████████████████████████]

2 Columns:    [███████████] [███████████]  (50/50)
              [███████] [███████████████]  (33/66)
              [███████████████] [███████]  (66/33)

3 Columns:    [███████] [███████] [███████]  (33/33/33)
              [████] [████████████] [████]   (25/50/25)

4 Columns:    [█████] [█████] [█████] [█████]  (25/25/25/25)
```

---

## Data Structure

### Page Schema

```typescript
interface LandingPage {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  globalSettings: GlobalSettings;
}
```

### Section Schema

```typescript
interface Section {
  id: string;
  order: number;
  layout: SectionLayout;
  columns: Column[];
  settings: {
    fullWidth: boolean;
    backgroundColor?: string;
    backgroundImage?: string;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  };
}

type SectionLayout =
  | "1"           // Full width
  | "1-1"         // 50/50
  | "1-2"         // 33/66
  | "2-1"         // 66/33
  | "1-1-1"       // 33/33/33
  | "1-2-1"       // 25/50/25
  | "1-1-1-1";    // 25/25/25/25
```

### Column Schema

```typescript
interface Column {
  id: string;
  widgets: Widget[];
  settings: {
    verticalAlign: "top" | "center" | "bottom";
    padding: number;
    backgroundColor?: string;
  };
}
```

### Widget Schema

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  settings: Record<string, any>;  // Widget-specific settings
}

type WidgetType =
  // Content Widgets
  | "hero-content"
  | "text-block"
  | "heading"
  | "rich-text"

  // Media Widgets
  | "image"
  | "image-slider"
  | "video"
  | "gallery"
  | "lottie"

  // Form Widgets
  | "lead-form"
  | "contact-form"
  | "newsletter"

  // Social Proof Widgets
  | "trust-badges"
  | "stats-section"
  | "testimonial"
  | "testimonials-carousel"
  | "logo-cloud"
  | "reviews"

  // Commerce Widgets
  | "pricing-card"
  | "pricing-table"
  | "feature-comparison"

  // Layout Widgets
  | "divider"
  | "accordion"
  | "tabs"

  // CTA Widgets
  | "cta-banner"
  | "button-group"

  // Advanced Widgets
  | "faq"
  | "timeline"
  | "team-grid"
  | "feature-grid"
  | "countdown"
  | "map"
  | "custom-html";
```

---

## Widget Definitions

### 1. Hero Content Widget

The main hero text content - grouped together for convenience.

```typescript
interface HeroContentWidget {
  type: "hero-content";
  settings: {
    // Badge
    badge: {
      show: boolean;
      icon: string;
      text: string;
      style: "pill" | "outline" | "solid";
    };

    // Headline
    headline: {
      text: string;
      highlightWords: string[];
      highlightColor: string;
      size: "sm" | "md" | "lg" | "xl";
    };

    // Subheadline
    subheadline: {
      text: string;
      show: boolean;
    };

    // Features List
    features: {
      show: boolean;
      items: Array<{ icon: string; text: string }>;
      columns: 1 | 2 | 3;
      iconColor: string;
    };

    // Primary Button
    primaryButton: {
      show: boolean;
      text: string;
      link: string;
      badge?: string;
      style: ButtonStyle;
    };

    // Secondary Button
    secondaryButton: {
      show: boolean;
      text: string;
      link: string;
      style: "link" | "outline" | "ghost";
    };

    // Trust Text (with stars)
    trustText: {
      show: boolean;
      rating: number;
      text: string;
    };

    // Alignment
    alignment: "left" | "center" | "right";
  };
}
```

### 2. Image Widget

Modern, feature-rich image widget with professional effects inspired by Elementor, Webflow, and 2025-2026 design trends.

```typescript
interface ImageWidget {
  type: "image";
  settings: {
    // === BASIC ===
    src: string;                    // Image URL
    alt: string;                    // Alt text for accessibility
    title?: string;                 // Title attribute (tooltip)

    // === SIZE & FIT ===
    objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
    aspectRatio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "2:3" | "3:4" | "9:16";
    maxWidth?: number;              // Max width as percentage (1-100)
    alignment: "left" | "center" | "right";

    // === STYLING ===
    borderRadius: number;           // Border radius in pixels
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow";
    shadowColor?: string;           // Custom shadow color for glow effect
    border: {
      width: number;
      color: string;
      style: "solid" | "dashed" | "dotted" | "double";
    };

    // === LINK OPTIONS ===
    link?: {
      url: string;
      openInNewTab: boolean;
      lightbox: boolean;            // Open in fullscreen lightbox modal
    };

    // === CAPTION ===
    caption?: {
      enabled: boolean;
      text: string;
      position: "below" | "overlay-bottom" | "overlay-top" | "overlay-center";
      backgroundColor?: string;
      textColor?: string;
      fontSize: "xs" | "sm" | "md" | "lg";
    };

    // === HOVER EFFECTS ===
    hoverEffect:
      | "none"
      | "zoom"                      // Scale up
      | "zoom-out"                  // Scale down
      | "brighten"                  // Increase brightness
      | "darken"                    // Decrease brightness
      | "grayscale"                 // Convert to grayscale
      | "blur"                      // Apply blur
      | "rotate"                    // Slight rotation
      | "tilt-left"                 // Tilt to left
      | "tilt-right"                // Tilt to right
      | "lift"                      // Lift up with shadow
      | "glow"                      // Glow effect with shadow color
      | "shine"                     // Diagonal shine sweep
      | "overlay-fade";             // Fade in overlay
    hoverTransitionDuration: number; // Transition duration in ms

    // === OVERLAY ===
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;              // 0-1
      showOnHover: boolean;         // Only show on hover
    };

    // === ENTRANCE ANIMATION ===
    animation: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "bounce" | "flip";
    animationDuration: number;      // Duration in ms
    animationDelay: number;         // Delay in ms

    // === FLOATING ANIMATION ===
    floatAnimation: "none" | "float" | "pulse" | "bounce" | "swing" | "wobble";

    // === PARALLAX ===
    parallax?: {
      enabled: boolean;
      speed: number;                // 0-1 (higher = more movement)
      direction: "vertical" | "horizontal";
    };

    // === MASK/SHAPE ===
    mask: "none" | "circle" | "rounded-lg" | "rounded-xl" | "hexagon" | "blob" | "diamond" | "triangle";

    // === PERFORMANCE ===
    lazyLoad: boolean;              // Enable lazy loading
    priority: boolean;              // Above-fold priority loading

    // === CSS FILTERS ===
    filters?: {
      brightness: number;           // 0-200 (100 = normal)
      contrast: number;             // 0-200 (100 = normal)
      saturation: number;           // 0-200 (100 = normal)
      blur: number;                 // 0-20 pixels
      grayscale: number;            // 0-100 percent
      sepia: number;                // 0-100 percent
      hueRotate: number;            // 0-360 degrees
    };
  };
}
```

#### Image Widget Features

| Category | Features |
|----------|----------|
| **Hover Effects** | Zoom, zoom-out, brighten, darken, grayscale, blur, rotate, tilt, lift, glow, shine sweep, overlay fade |
| **Entrance Animations** | Fade, slide (4 directions), zoom, bounce, flip - triggered on scroll |
| **Floating Animations** | Float, pulse, bounce, swing, wobble - continuous looping |
| **Parallax** | Vertical or horizontal parallax on scroll |
| **Lightbox** | Full-screen modal with click-to-close |
| **Masks/Shapes** | Circle, rounded corners, hexagon, blob, diamond, triangle |
| **Filters** | Brightness, contrast, saturation, blur, grayscale, sepia, hue-rotate |
| **Captions** | Below image or overlay (top/center/bottom) with custom styling |
| **Shadows** | 6 preset sizes + custom glow color |

### 3. Lead Form Widget

```typescript
interface LeadFormWidget {
  type: "lead-form";
  settings: {
    title?: string;
    description?: string;

    fields: Array<{
      type: "text" | "email" | "phone" | "select" | "textarea";
      name: string;
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];  // For select
    }>;

    submitButton: {
      text: string;
      style: ButtonStyle;
      fullWidth: boolean;
    };

    successMessage: string;

    // Integration
    submitTo: "database" | "webhook" | "email";
    webhookUrl?: string;
    emailTo?: string;

    // Styling
    backgroundColor?: string;
    padding: number;
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 4. Trust Badges Widget

```typescript
interface TrustBadgesWidget {
  type: "trust-badges";
  settings: {
    badges: Array<{
      icon: string;
      text: string;
    }>;

    layout: "horizontal" | "grid";
    columns: 2 | 3 | 4 | 5;

    style: {
      backgroundColor: string;
      borderColor: string;
      iconColor: string;
      textColor: string;
      borderRadius: number;
    };

    centered: boolean;
  };
}
```

### 5. Stats Section Widget

```typescript
interface StatsSectionWidget {
  type: "stats-section";
  settings: {
    stats: Array<{
      value: string;      // "10,000+"
      label: string;      // "LLCs Formed"
      prefix?: string;    // "$"
      suffix?: string;    // "+"
      animate: boolean;   // Count up animation
    }>;

    columns: 2 | 3 | 4 | 5;

    style: {
      valueColor: string;
      labelColor: string;
      valueSize: "sm" | "md" | "lg" | "xl";
      divider: boolean;
    };

    centered: boolean;
  };
}
```

### 6. Video Widget

```typescript
interface VideoWidget {
  type: "video";
  settings: {
    source: "youtube" | "vimeo" | "custom";
    url: string;
    thumbnail?: string;

    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;

    aspectRatio: "16:9" | "4:3" | "1:1";
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 7. Image Slider Widget

Modern, feature-rich image slider/carousel widget inspired by Slider Revolution, Swiper.js, and 2025 design trends. Designed for high-impact hero sections, product showcases, and portfolios.

#### Research Summary (2025 Modern Design Analysis)

| Source | Key Insights |
|--------|--------------|
| **[Slider Revolution](https://www.sliderrevolution.com/)** | Layer-based animations, IN/OUT system, timeline control, Ken Burns effects |
| **[Swiper.js v12](https://swiperjs.com/)** | Cube, Coverflow, Cards, Flip effects; parallax; touch-first |
| **[Codrops GSAP Tutorial](https://tympanus.net/codrops/2025/04/21/mastering-carousels-with-gsap-from-basics-to-advanced-animation/)** | GSAP-powered smooth transitions, infinite loops, 3D transforms |
| **[Splide.js](https://splidejs.com/)** | Lightweight, accessible, progress bar indicators |
| **[2025 Carousel Trends](https://uicreative.net/blog/10-best-carousel-design-2025.html)** | Minimal full-screen, subtle parallax, vertical sliders, 3-5 slides max |

#### Design Principles

1. **Mobile-First**: Touch/swipe as primary interaction, responsive breakpoints
2. **Performance**: Lazy loading, lightweight bundle, GPU-accelerated animations
3. **Accessibility**: Keyboard navigation, ARIA labels, pause controls
4. **Minimal by Default**: 3-5 slides recommended, focused messaging
5. **Flexible Effects**: From subtle fades to dramatic 3D transforms

```typescript
interface ImageSliderWidget {
  type: "image-slider";
  settings: {
    // === SLIDES ===
    slides: SlideItem[];

    // === SLIDER TYPE ===
    sliderType:
      | "standard"      // Classic horizontal slider
      | "hero"          // Full-width hero slider
      | "carousel"      // Multiple visible slides
      | "gallery"       // With thumbnail navigation
      | "split"         // Split-screen (content + image)
      | "vertical";     // Vertical scroll slider

    // === TRANSITION EFFECTS ===
    effect:
      | "slide"         // Standard horizontal slide
      | "fade"          // Crossfade between slides
      | "cube"          // 3D cube rotation
      | "coverflow"     // 3D coverflow (like iTunes)
      | "flip"          // 3D flip effect
      | "cards"         // Stacked cards effect
      | "creative"      // Custom creative transforms
      | "parallax";     // Parallax depth effect

    // Creative effect custom transforms (when effect = "creative")
    creativeEffect?: {
      prev: {
        translate: [number, number, number];  // [x%, y%, z(px)]
        rotate: [number, number, number];     // [x, y, z] degrees
        scale: number;
        opacity: number;
      };
      next: {
        translate: [number, number, number];
        rotate: [number, number, number];
        scale: number;
        opacity: number;
      };
    };

    // === AUTOPLAY ===
    autoplay: {
      enabled: boolean;
      delay: number;                // Delay between slides (ms), default 5000
      pauseOnHover: boolean;        // Pause when hovering
      pauseOnInteraction: boolean;  // Pause after user interaction
      reverseDirection: boolean;    // Reverse autoplay direction
      showPauseButton: boolean;     // Show pause/play button
    };

    // === NAVIGATION ===
    navigation: {
      arrows: {
        enabled: boolean;
        style: "default" | "minimal" | "rounded" | "square" | "floating" | "outside";
        size: "sm" | "md" | "lg";
        color: string;
        backgroundColor?: string;
        hoverEffect: "none" | "scale" | "glow" | "slide";
        position: "sides" | "bottom" | "bottom-right";  // Arrow placement
        showOnHover: boolean;  // Only show arrows on hover
      };

      pagination: {
        enabled: boolean;
        type: "dots" | "fraction" | "progressbar" | "bullets-dynamic" | "custom";
        position: "bottom" | "top" | "left" | "right";
        clickable: boolean;
        activeColor: string;
        inactiveColor: string;
        // For progressbar type
        progressbarFill: "horizontal" | "vertical";
        progressbarPosition: "top" | "bottom";
      };

      thumbnails: {
        enabled: boolean;
        position: "bottom" | "left" | "right";
        size: number;           // Thumbnail size in px
        gap: number;            // Gap between thumbnails
        activeStyle: "border" | "opacity" | "scale";
        aspectRatio: "1:1" | "16:9" | "4:3";
      };

      keyboard: boolean;          // Enable keyboard navigation
      mousewheel: boolean;        // Enable mousewheel navigation
      grabCursor: boolean;        // Show grab cursor on hover
    };

    // === TOUCH & SWIPE ===
    touch: {
      enabled: boolean;
      threshold: number;          // Swipe threshold in px (default 50)
      resistance: boolean;        // Resistance at edges
      shortSwipes: boolean;       // Allow short swipes
      longSwipesRatio: number;    // Ratio (0-1) for long swipe (default 0.5)
    };

    // === LOOP & SPEED ===
    loop: boolean;                 // Enable infinite loop
    speed: number;                 // Transition speed in ms (default 500)
    slidesPerView: number | "auto"; // Slides visible (for carousel type)
    spaceBetween: number;         // Gap between slides in carousel
    centeredSlides: boolean;      // Center active slide

    // === KEN BURNS EFFECT ===
    kenBurns: {
      enabled: boolean;
      duration: number;           // Effect duration in ms (default 8000)
      scale: {
        start: number;            // Starting scale (e.g., 1)
        end: number;              // Ending scale (e.g., 1.2)
      };
      position: "random" | "center" | "top" | "bottom" | "left" | "right";
      direction: "in" | "out" | "random";  // Zoom in, out, or random
    };

    // === PARALLAX DEPTH ===
    parallax: {
      enabled: boolean;
      // Per-layer parallax data attributes will be on slide content
    };

    // === SPLIT SCREEN (for sliderType = "split") ===
    splitScreen?: {
      contentPosition: "left" | "right";
      ratio: "50-50" | "40-60" | "60-40" | "33-66" | "66-33";
      contentBackground?: string;
      mobileStack: "content-first" | "image-first";
    };

    // === LAYOUT & SIZING ===
    height:
      | "auto"           // Based on content
      | "viewport"       // 100vh
      | "large"          // 80vh
      | "medium"         // 60vh
      | "small"          // 40vh
      | number;          // Custom px value
    maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    aspectRatio?: "16:9" | "21:9" | "4:3" | "1:1" | "auto";

    // === STYLING ===
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    overflow: "hidden" | "visible";  // For 3D effects that extend beyond

    // === RESPONSIVE ===
    responsive?: {
      mobile?: {
        slidesPerView?: number;
        spaceBetween?: number;
        effect?: string;
        navigation?: { arrows?: { enabled?: boolean } };
      };
      tablet?: {
        slidesPerView?: number;
        spaceBetween?: number;
      };
    };
  };
}

// === SLIDE ITEM ===
interface SlideItem {
  id: string;

  // === IMAGE ===
  image: {
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
    objectPosition: "center" | "top" | "bottom" | "left" | "right";
    // Ken Burns override per slide
    kenBurnsOverride?: {
      direction: "in" | "out";
      position: "center" | "top" | "bottom" | "left" | "right";
    };
  };

  // === OVERLAY ===
  overlay?: {
    enabled: boolean;
    type: "solid" | "gradient";
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      angle?: number;        // For linear
      colors: Array<{ color: string; position: number }>;
    };
    opacity: number;
  };

  // === CONTENT LAYERS (Slider Revolution style) ===
  content?: {
    enabled: boolean;
    position:
      | "center"
      | "top-left" | "top-center" | "top-right"
      | "center-left" | "center-right"
      | "bottom-left" | "bottom-center" | "bottom-right";
    maxWidth: "sm" | "md" | "lg" | "xl" | "full";
    padding: number;
    textAlign: "left" | "center" | "right";

    // Content elements (each with individual animations)
    badge?: {
      show: boolean;
      text: string;
      icon?: string;
      style: "pill" | "outline" | "solid";
      animation: LayerAnimation;
    };

    headline?: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
      color: string;
      highlightWords?: string[];
      highlightColor?: string;
      animation: LayerAnimation;
    };

    subheadline?: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color: string;
      animation: LayerAnimation;
    };

    description?: {
      show: boolean;
      text: string;
      color: string;
      animation: LayerAnimation;
    };

    buttons?: {
      show: boolean;
      items: Array<{
        text: string;
        link: string;
        style: "primary" | "secondary" | "outline" | "ghost";
        openInNewTab: boolean;
      }>;
      animation: LayerAnimation;
    };
  };

  // === VIDEO BACKGROUND ===
  videoBackground?: {
    enabled: boolean;
    src: string;
    type: "mp4" | "webm" | "youtube" | "vimeo";
    muted: boolean;
    loop: boolean;
    playbackRate: number;      // 0.5 - 2.0
    fallbackImage: string;     // Fallback for mobile/no-autoplay
  };

  // === LINK ===
  link?: {
    url: string;
    openInNewTab: boolean;
    ariaLabel: string;
  };
}

// === LAYER ANIMATION (Slider Revolution style IN/OUT) ===
interface LayerAnimation {
  in: {
    type: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
        | "zoom" | "zoom-out" | "rotate" | "flip" | "bounce" | "elastic";
    duration: number;       // ms
    delay: number;          // ms (stagger effect)
    easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "bounce" | "elastic";
  };
  out?: {
    type: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
        | "zoom" | "zoom-out" | "rotate" | "flip";
    duration: number;
    easing: string;
  };
}
```

#### Image Slider Features Summary

| Category | Features |
|----------|----------|
| **Slider Types** | Standard, Hero (fullscreen), Carousel (multi-slide), Gallery (thumbnails), Split-screen, Vertical |
| **Transition Effects** | Slide, Fade, Cube 3D, Coverflow 3D, Flip 3D, Cards, Creative (custom), Parallax |
| **Ken Burns** | Zoom in/out, Pan directions, Random variations, Per-slide override |
| **Navigation** | Arrows (6 styles), Dots, Fraction, Progress bar, Thumbnails |
| **Autoplay** | Configurable delay, Pause on hover/interaction, Pause button, Reverse direction |
| **Touch/Swipe** | Enabled by default, Configurable threshold, Resistance at edges |
| **Content Layers** | Badge, Headline, Subheadline, Description, Buttons - each with IN/OUT animations |
| **Video Background** | MP4, WebM, YouTube, Vimeo support with fallback images |
| **Responsive** | Mobile/tablet breakpoint overrides |
| **Accessibility** | Keyboard navigation, ARIA labels, Pause controls |

#### Implementation Notes

**Libraries to Consider:**
- **Swiper.js v12** - Primary choice for effects, touch, responsive
- **GSAP** - For advanced animations and smooth transitions
- **CSS-only Ken Burns** - Lightweight pan/zoom without extra dependencies

**Performance Best Practices:**
```typescript
// Lazy load slides not in view
<SwiperSlide lazy={true}>
  <img data-src="image.jpg" className="swiper-lazy" />
  <div className="swiper-lazy-preloader"></div>
</SwiperSlide>

// Preload adjacent slides
preloadImages: false,
lazy: {
  loadPrevNext: true,
  loadPrevNextAmount: 2
}
```

**Ken Burns CSS Implementation:**
```css
@keyframes kenBurnsZoomIn {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.2) translate(-2%, -2%);
  }
}

@keyframes kenBurnsZoomOut {
  0% {
    transform: scale(1.2) translate(-2%, -2%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}

.slide-active .ken-burns {
  animation: kenBurnsZoomIn 8s ease-out forwards;
}
```

**Mobile Optimization:**
```typescript
responsive: {
  mobile: {
    slidesPerView: 1,
    spaceBetween: 0,
    effect: "fade",  // Simpler effect on mobile
    navigation: {
      arrows: { enabled: false }  // Hide arrows, use swipe
    }
  }
}
```

### 7. Testimonial Widget

```typescript
interface TestimonialWidget {
  type: "testimonial";
  settings: {
    quote: string;
    author: {
      name: string;
      role: string;
      company?: string;
      avatar?: string;
    };
    rating?: number;

    style: {
      backgroundColor?: string;
      quoteColor: string;
      showQuoteIcon: boolean;
    };
  };
}
```

### 8. Text Block Widget (Tiptap)

Modern rich text editor widget powered by **Tiptap** - a headless, framework-agnostic editor built on ProseMirror. Designed for content-heavy sections like about pages, service descriptions, and blog content.

#### Why Tiptap?

| Feature | Tiptap |
|---------|--------|
| **Architecture** | Headless - full UI control |
| **Bundle Size** | ~45kb (core + starter kit) |
| **React Support** | Native React hooks & components |
| **Extensibility** | 50+ official extensions |
| **Output** | HTML or JSON (flexible storage) |
| **Collaboration** | Built-in real-time support (Yjs) |
| **TypeScript** | First-class support |
| **Documentation** | Excellent with examples |
| **Community** | Large, active ecosystem (2025) |

#### Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight
```

#### TypeScript Definition

```typescript
// === TEXT BLOCK WIDGET SETTINGS ===
interface TextBlockWidgetSettings {
  // === CONTENT ===
  content: string;  // HTML content from Tiptap

  // === EDITOR CONFIG ===
  editor: {
    // Toolbar configuration
    toolbar: TextBlockToolbarPreset;

    // Editor height
    minHeight: number;        // px (default: 200)
    maxHeight?: number;       // px (optional limit)

    // Character/word limits
    charLimit?: number;

    // Placeholder text
    placeholder?: string;
  };

  // === TYPOGRAPHY ===
  typography: {
    fontFamily?: string;           // Base font family
    fontSize: number;              // Base font size (px)
    lineHeight: number;            // Line height (unitless, e.g., 1.6)
    letterSpacing?: number;        // Letter spacing (px)
    color: string;                 // Text color

    // Link styling
    linkColor: string;
    linkHoverColor: string;
    linkUnderline: boolean;
  };

  // === CONTAINER STYLING ===
  container: {
    backgroundColor?: string;
    padding: number;               // px
    borderRadius: number;          // px
    border?: {
      width: number;
      color: string;
      style: "solid" | "dashed" | "dotted";
    };
    shadow?: "none" | "sm" | "md" | "lg";
    maxWidth?: number;             // px (for readability)
  };

  // === PARAGRAPH STYLING ===
  paragraphSpacing: number;        // Margin between paragraphs (px)

  // === LIST STYLING ===
  lists: {
    bulletStyle: "disc" | "circle" | "square" | "none";
    bulletColor?: string;
    numberStyle: "decimal" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman";
    indentation: number;           // px
  };

  // === BLOCKQUOTE STYLING ===
  blockquote: {
    borderColor: string;
    borderWidth: number;
    backgroundColor?: string;
    fontStyle: "normal" | "italic";
    padding: number;
  };

  // === DROP CAP ===
  dropCap: {
    enabled: boolean;
    size: number;                  // Lines to span (2-4)
    color?: string;
    fontFamily?: string;
  };

  // === COLUMNS (Multi-column text) ===
  columns?: {
    enabled: boolean;
    count: 1 | 2 | 3;
    gap: number;                   // px
    divider?: {
      show: boolean;
      color: string;
      width: number;
    };
  };

  // === ANIMATION ===
  animation?: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up" | "fade-down" | "slide-up";
      duration: number;            // ms
      delay: number;               // ms
    };
  };

  // === RESPONSIVE ===
  responsive?: {
    tablet?: {
      fontSize?: number;
      lineHeight?: number;
      columns?: number;
    };
    mobile?: {
      fontSize?: number;
      lineHeight?: number;
      columns?: number;
    };
  };

  // === ADVANCED ===
  advanced?: {
    customClass?: string;
    customId?: string;
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;
  };
}

// Toolbar presets for different use cases
type TextBlockToolbarPreset =
  | "minimal"      // Bold, Italic, Link only
  | "basic"        // + Headings, Lists, Alignment
  | "standard"     // + Colors, Images, Tables
  | "full"         // All features
  | "custom";      // Custom toolbar configuration

// Custom toolbar buttons (when preset = "custom")
type ToolbarButton =
  | "bold" | "italic" | "underline" | "strike"
  | "subscript" | "superscript"
  | "formatBlock"  // Headings H1-H6, P
  | "fontColor" | "hiliteColor"
  | "align"        // Left, Center, Right, Justify
  | "list"         // Ordered, Unordered
  | "indent" | "outdent"
  | "link" | "image" | "video"
  | "table"
  | "blockquote" | "horizontalRule"
  | "removeFormat"
  | "codeView"     // HTML source
  | "fullScreen";
```

#### Toolbar Presets

```typescript
// Tiptap extensions to enable per preset
const TOOLBAR_PRESETS = {
  minimal: {
    buttons: ["bold", "italic", "link"],
    extensions: ["StarterKit", "Link"],
  },

  basic: {
    buttons: ["heading", "bold", "italic", "bulletList", "orderedList", "link"],
    extensions: ["StarterKit", "Link", "Placeholder"],
  },

  standard: {
    buttons: [
      "heading", "bold", "italic", "strike",
      "highlight", "textAlign",
      "bulletList", "orderedList",
      "link", "image", "blockquote", "horizontalRule",
      "undo", "redo"
    ],
    extensions: [
      "StarterKit", "Link", "Image", "Placeholder",
      "TextAlign", "Highlight", "Color", "TextStyle"
    ],
  },

  full: {
    buttons: [
      "heading", "bold", "italic", "underline", "strike",
      "highlight", "color", "textAlign",
      "bulletList", "orderedList",
      "link", "image", "blockquote", "codeBlock", "horizontalRule",
      "undo", "redo", "clearFormatting"
    ],
    extensions: [
      "StarterKit", "Link", "Image", "Placeholder",
      "TextAlign", "Highlight", "Color", "TextStyle",
      "Underline", "Subscript", "Superscript"
    ],
  },
};
```

#### Text Block Widget Features Summary

| Category | Features |
|----------|----------|
| **Editor** | Tiptap (ProseMirror), 4 toolbar presets, HTML/JSON output |
| **Formatting** | Bold, Italic, Underline, Strike, Headings (H1-H6) |
| **Lists** | Ordered, Unordered with custom bullet/number styles |
| **Media** | Image upload with drag-drop support |
| **Typography** | Font family, size, line-height, letter-spacing, colors |
| **Links** | Custom link colors, hover states, underline toggle |
| **Blockquotes** | Border color, background, font style |
| **Drop Cap** | First letter styling, size, color, font |
| **Columns** | 1-3 column layout with gap and dividers |
| **Container** | Background, padding, border radius, shadow |
| **Animation** | Fade, slide entrance animations |
| **Responsive** | Per-device typography and column overrides |

#### Implementation Architecture

```
src/
├── components/
│   └── page-builder/
│       ├── widgets/
│       │   └── content/
│       │       └── text-block-widget.tsx     # Main widget component
│       │
│       └── settings/
│           └── widget-settings/
│               └── text-block-settings/
│                   ├── index.tsx             # Main settings panel
│                   ├── editor-tab.tsx        # Toolbar preset, height
│                   ├── style-tab.tsx         # Typography, lists, blockquote
│                   └── advanced-tab.tsx      # Columns, animation, responsive
│
├── lib/
│   └── page-builder/
│       ├── types.ts                          # TextBlockWidgetSettings
│       ├── defaults.ts                       # DEFAULT_TEXT_BLOCK_SETTINGS
│       └── tiptap-extensions.ts              # Tiptap extension configs
│
└── styles/
    └── tiptap-editor.css                     # Custom Tiptap theme
```

#### React Component Example

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import type { TextBlockWidgetSettings } from "@/lib/page-builder/types";
import { TiptapToolbar } from "./tiptap-toolbar";

interface TextBlockWidgetProps {
  settings: TextBlockWidgetSettings;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
}

export function TextBlockWidget({
  settings,
  isEditing = false,
  onContentChange,
}: TextBlockWidgetProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: settings.editor.placeholder || "Start writing...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Highlight,
      Color,
      TextStyle,
    ],
    content: settings.content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  // Read-only view (frontend)
  if (!isEditing) {
    return (
      <div
        className="text-block-widget prose prose-invert max-w-none"
        style={{
          fontFamily: settings.typography.fontFamily,
          fontSize: settings.typography.fontSize,
          lineHeight: settings.typography.lineHeight,
          letterSpacing: settings.typography.letterSpacing,
          color: settings.typography.color,
          backgroundColor: settings.container.backgroundColor,
          padding: settings.container.padding,
          borderRadius: settings.container.borderRadius,
          columnCount: settings.columns?.enabled ? settings.columns.count : 1,
          columnGap: settings.columns?.gap,
        }}
        dangerouslySetInnerHTML={{ __html: settings.content }}
      />
    );
  }

  // Editor view (admin)
  return (
    <div className="text-block-editor">
      <TiptapToolbar editor={editor} preset={settings.editor.toolbar} />
      <EditorContent
        editor={editor}
        className="tiptap-content"
        style={{
          minHeight: settings.editor.minHeight,
          maxHeight: settings.editor.maxHeight,
        }}
      />
    </div>
  );
}
```

#### Custom Dark Theme CSS

```css
/* Tiptap Dark Theme for Admin Panel */
.tiptap-editor {
  --tiptap-bg: #1e293b;
  --tiptap-text: #e2e8f0;
  --tiptap-border: #334155;
  --tiptap-toolbar-bg: #0f172a;
  --tiptap-btn-hover: #334155;
  --tiptap-btn-active: #475569;
}

/* Toolbar */
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background-color: var(--tiptap-toolbar-bg);
  border: 1px solid var(--tiptap-border);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.tiptap-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--tiptap-text);
  cursor: pointer;
  transition: background-color 0.15s;
}

.tiptap-toolbar button:hover {
  background-color: var(--tiptap-btn-hover);
}

.tiptap-toolbar button.is-active {
  background-color: var(--tiptap-btn-active);
}

/* Editor Content Area */
.tiptap-content .ProseMirror {
  padding: 16px;
  min-height: 200px;
  background-color: var(--tiptap-bg);
  border: 1px solid var(--tiptap-border);
  border-radius: 0 0 8px 8px;
  color: var(--tiptap-text);
  outline: none;
}

.tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #64748b;
  pointer-events: none;
  float: left;
  height: 0;
}

/* Typography in Editor */
.tiptap-content .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
.tiptap-content .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 0.75rem 0; }
.tiptap-content .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
.tiptap-content .ProseMirror p { margin: 0.5rem 0; }

/* Links */
.tiptap-content .ProseMirror a {
  color: #60a5fa;
  text-decoration: underline;
  cursor: pointer;
}

/* Lists */
.tiptap-content .ProseMirror ul,
.tiptap-content .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

/* Blockquote */
.tiptap-content .ProseMirror blockquote {
  border-left: 4px solid #f97316;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #94a3b8;
  font-style: italic;
}

/* Code Block */
.tiptap-content .ProseMirror pre {
  background-color: #0f172a;
  border-radius: 8px;
  padding: 1rem;
  font-family: monospace;
  overflow-x: auto;
}

/* Horizontal Rule */
.tiptap-content .ProseMirror hr {
  border: none;
  border-top: 1px solid var(--tiptap-border);
  margin: 1.5rem 0;
}

/* Image */
.tiptap-content .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
```

#### Settings Panel UI Mock

```
┌─────────────────────────────────────┐
│ ← Back         Text Block        :   │
├─────────────────────────────────────┤
│ Content │ Style │ Advanced          │
├─────────────────────────────────────┤
│                                     │
│ Toolbar Preset                      │
│ ┌───────────────────────────┬─────┐ │
│ │ Standard                  │ ▼   │ │
│ └───────────────────────────┴─────┘ │
│                                     │
│ Editor Height                       │
│ ○ Auto  ● Fixed                    │
│ Height  [300] px                    │
│ Min     [200] px                    │
│                                     │
│ ▼ Content Editor                    │
│ ┌─────────────────────────────────┐ │
│ │ B I U  │ ≡ │ • 1. │ 🔗 🖼      │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │ Enter your content here...     │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Character Limit                     │
│ ☐ Enable     [5000] chars          │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Content │ Style │ Advanced          │
├─────────────────────────────────────┤
│                                     │
│ ▼ Typography                        │
│   Font Family  [Inter ▼]           │
│   Font Size    [16] px              │
│   Line Height  [1.6]                │
│   Text Color   [████] #cbd5e1       │
│                                     │
│ ▼ Links                             │
│   Link Color       [████] #60a5fa   │
│   Hover Color      [████] #93c5fd   │
│   ☑ Show Underline                 │
│                                     │
│ ▼ Lists                             │
│   Bullet Style   [● Disc ▼]        │
│   Bullet Color   [████] #f97316     │
│   Number Style   [1. Decimal ▼]    │
│                                     │
│ ▼ Blockquote                        │
│   Border Color   [████] #f97316     │
│   Border Width   [4] px             │
│   Background     [████] #1e293b     │
│   ☑ Italic Text                    │
│                                     │
│ ▼ Drop Cap                          │
│   ☐ Enable Drop Cap                │
│   Lines to Span  [3]                │
│   Color          [████] #f97316     │
│                                     │
│ ▼ Container                         │
│   Background     [████] transparent │
│   Padding        [0] px             │
│   Border Radius  [0] px             │
│   Shadow         [None ▼]          │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Content │ Style │ Advanced          │
├─────────────────────────────────────┤
│                                     │
│ ▼ Multi-Column Layout               │
│   ☐ Enable Columns                 │
│   Columns  [2]                      │
│   Gap      [32] px                  │
│   ☐ Show Divider                   │
│                                     │
│ ▼ Animation                         │
│   ☐ Enable Entrance                │
│   Type      [Fade Up ▼]            │
│   Duration  [600] ms                │
│   Delay     [0] ms                  │
│                                     │
│ ▼ Responsive                        │
│   Tablet                            │
│     Font Size  [15] px              │
│     Columns    [1]                  │
│   Mobile                            │
│     Font Size  [14] px              │
│     Columns    [1]                  │
│                                     │
│ ▼ Visibility                        │
│   ☐ Hide on Desktop                │
│   ☐ Hide on Tablet                 │
│   ☐ Hide on Mobile                 │
│                                     │
│ Custom Class                        │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

#### Performance Notes

1. **SSR Safe**: Tiptap works with Next.js App Router - use `useEditor` hook in client components
2. **Lazy Load in View Mode**: In read-only mode, just render HTML - no need to load the editor
3. **Debounced onChange**: Tiptap batches updates efficiently, but consider debouncing for network saves
4. **Extension Loading**: Only load extensions needed for the selected toolbar preset
5. **Image Optimization**: Use Next.js Image component for uploaded images

---

### 9. Heading Widget

Modern, feature-rich heading widget inspired by Elementor, Webflow, Divi, and Framer (2025 analysis). Designed for flexible typography with animations, gradients, and advanced text effects.

#### Research Summary (2025 Page Builder Analysis)

| Source | Key Insights |
|--------|--------------|
| **[Elementor](https://elementor.com/help/heading-widget/)** | Typography controls (family, weight, size, line-height, letter-spacing), responsive sizes, text shadow, HTML tags, link option |
| **[Webflow](https://help.webflow.com/hc/en-us/articles/33961334261779-Advanced-web-typography)** | Text fills (color, gradient, image), animated gradients, spans for highlighting, CH units for max-width |
| **[Divi](https://diviflash.com/modules/advanced-heading/)** | Multi-heading (per-word styling), animated text (9 effects), dual colors, text stroke, gradient text, divider integration |
| **[Framer](https://www.framer.com/blog/text-animations/)** | Split text animation (char/word), text reveal on scroll, staggered animations, blur/fade effects |
| **[ThePlus Addons](https://theplusaddons.com/elementor-widget/heading-titles/)** | Advanced effects, marquee text, highlight animations |

#### Design Principles

1. **Progressive Complexity**: Basic settings first, advanced options expandable
2. **Responsive First**: Per-device typography controls (desktop/tablet/mobile)
3. **Performance**: CSS-only animations where possible, lazy-load GSAP for complex effects
4. **Accessibility**: Semantic HTML tags, proper contrast, reduced-motion support
5. **Composable**: Can combine multiple effects (gradient + shadow + animation)

```typescript
// === HEADING WIDGET SETTINGS ===
interface HeadingWidgetSettings {
  // === CONTENT TAB ===
  content: {
    // Main text
    text: string;

    // HTML tag (semantic heading or display element)
    htmlTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span" | "p";

    // Link (make heading clickable)
    link?: {
      url: string;
      openInNewTab: boolean;
    };

    // Highlight specific words (comma-separated)
    highlight?: {
      enabled: boolean;
      words: string;           // "US Business, LLC" (comma-separated)
      style: HighlightStyle;
    };

    // Split heading (Divi-style multi-part heading)
    splitHeading?: {
      enabled: boolean;
      beforeText: string;      // "Start Your"
      mainText: string;        // "US Business"
      afterText: string;       // "Today"
      // Each part can have different styling
    };
  };

  // === STYLE TAB ===
  style: {
    // Alignment
    alignment: "left" | "center" | "right";

    // Typography
    typography: TypographySettings;

    // Text Color/Fill
    textFill: TextFillSettings;

    // Text Effects
    textStroke?: TextStrokeSettings;
    textShadow?: TextShadowSettings;

    // Highlight styling (when highlight.enabled = true)
    highlightStyle?: {
      color?: string;
      backgroundColor?: string;
      backgroundType?: "solid" | "gradient" | "marker";
      gradientColors?: string[];
      padding?: string;          // "0 4px"
      borderRadius?: number;
    };

    // Split heading styles (when splitHeading.enabled = true)
    splitStyles?: {
      before: Partial<TypographySettings> & { color?: string };
      main: Partial<TypographySettings> & { color?: string };
      after: Partial<TypographySettings> & { color?: string };
    };
  };

  // === ANIMATION TAB ===
  animation?: {
    // Entrance animation (triggered on scroll into view)
    entrance?: {
      enabled: boolean;
      type: EntranceAnimationType;
      duration: number;        // ms (default: 600)
      delay: number;           // ms (default: 0)
      easing: EasingType;
    };

    // Text animation (split text effects)
    textAnimation?: {
      enabled: boolean;
      type: TextAnimationType;
      splitBy: "characters" | "words" | "lines";
      staggerDelay: number;    // ms between each item (default: 50)
      duration: number;        // ms per item
      easing: EasingType;
      loop: boolean;           // For rotating/typing effects
      loopDelay?: number;      // Delay between loops
    };

    // Continuous animation (always running)
    continuousAnimation?: {
      enabled: boolean;
      type: ContinuousAnimationType;
      duration: number;
      // For gradient-shift
      gradientColors?: string[];
      gradientAngle?: number;
    };

    // Hover animation
    hoverAnimation?: {
      enabled: boolean;
      type: HoverAnimationType;
      duration: number;
    };
  };

  // === RESPONSIVE TAB ===
  responsive?: {
    desktop: ResponsiveOverrides;
    tablet?: ResponsiveOverrides;
    mobile?: ResponsiveOverrides;
  };

  // === ADVANCED TAB ===
  advanced?: {
    // CSS classes
    customClass?: string;

    // Max width (for readability)
    maxWidth?: {
      enabled: boolean;
      value: number;
      unit: "px" | "ch" | "%" | "vw";  // ch = character width (Webflow style)
    };

    // Visibility
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;

    // Attributes
    customId?: string;
    customAttributes?: Record<string, string>;
  };
}

// === TYPOGRAPHY SETTINGS ===
interface TypographySettings {
  fontFamily?: string;         // Google Font or system font
  fontSize: number;
  fontSizeUnit: "px" | "em" | "rem" | "vw";
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle: "normal" | "italic";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;          // Unitless (1.2, 1.5, etc.)
  letterSpacing: number;       // px or em
  letterSpacingUnit: "px" | "em";
  wordSpacing?: number;        // px
}

// === TEXT FILL SETTINGS ===
interface TextFillSettings {
  type: "solid" | "gradient" | "image";

  // Solid color
  color?: string;

  // Gradient fill
  gradient?: {
    type: "linear" | "radial";
    angle: number;             // For linear (0-360)
    colors: Array<{
      color: string;
      position: number;        // 0-100
    }>;
  };

  // Image fill (knockout text)
  image?: {
    url: string;
    size: "cover" | "contain" | "auto";
    position: "center" | "top" | "bottom";
    fixed: boolean;            // Parallax effect
  };
}

// === TEXT STROKE (OUTLINE) ===
interface TextStrokeSettings {
  enabled: boolean;
  width: number;               // px (typically 1-5)
  color: string;
  fillColor?: string;          // Optional: make text transparent to show only stroke
}

// === TEXT SHADOW ===
interface TextShadowSettings {
  enabled: boolean;
  shadows: Array<{
    offsetX: number;           // px
    offsetY: number;           // px
    blur: number;              // px
    color: string;
  }>;
}

// === HIGHLIGHT STYLES ===
type HighlightStyle =
  | "color"              // Just different color
  | "background"         // Background color
  | "gradient"           // Gradient background
  | "underline"          // Animated underline
  | "marker"             // Marker/highlighter effect
  | "glow";              // Glow effect

// === ANIMATION TYPES ===

// Entrance animations (scroll-triggered)
type EntranceAnimationType =
  | "none"
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "slide-up"
  | "slide-down"
  | "flip"
  | "bounce";

// Text animations (split text)
type TextAnimationType =
  | "none"
  | "fade-in"            // Each char/word fades in
  | "slide-up"           // Each char/word slides up
  | "slide-down"         // Each char/word slides down
  | "scale"              // Each char/word scales in
  | "rotate"             // Each char/word rotates in
  | "blur-in"            // Each char/word blurs in (Framer style)
  | "typewriter"         // Typing effect
  | "wave"               // Wave animation (Divi style)
  | "bounce"             // Bounce in
  | "elastic"            // Elastic spring
  | "glitch"             // Glitch effect
  | "scramble";          // Text scramble/decode

// Continuous animations (always running)
type ContinuousAnimationType =
  | "none"
  | "gradient-shift"     // Animated gradient (Webflow style)
  | "pulse"              // Subtle pulse
  | "glow"               // Pulsing glow
  | "shimmer"            // Shimmer/shine effect
  | "float";             // Gentle floating

// Hover animations
type HoverAnimationType =
  | "none"
  | "color-change"
  | "underline-grow"
  | "background-fill"
  | "scale"
  | "letter-spacing"
  | "glow";

// Easing types
type EasingType =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic"
  | "back";

// Responsive overrides
interface ResponsiveOverrides {
  fontSize?: number;
  fontSizeUnit?: "px" | "em" | "rem" | "vw";
  lineHeight?: number;
  letterSpacing?: number;
  alignment?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
}
```

#### Heading Widget Features Summary

| Category | Features |
|----------|----------|
| **Typography** | Font family (Google Fonts), size (px/em/rem/vw), weight (100-900), style, transform, decoration, line-height, letter-spacing |
| **Text Fill** | Solid color, linear/radial gradient, image fill (knockout text) |
| **Text Effects** | Stroke/outline (width + color), shadows (multiple layers), glow |
| **Highlighting** | Per-word styling, color, background, gradient, underline, marker effect |
| **Split Heading** | 3-part heading with independent styling per part (Divi Multi-Heading style) |
| **Entrance Animations** | 12 types: fade, slide, zoom, flip, bounce - scroll triggered |
| **Text Animations** | 12 types: typewriter, wave, blur-in, glitch, scramble - split by char/word/line |
| **Continuous Animations** | Gradient shift, pulse, glow, shimmer, float |
| **Hover Effects** | Color change, underline grow, background fill, scale, letter-spacing |
| **Responsive** | Per-device typography overrides (desktop/tablet/mobile) |
| **Advanced** | Max-width (px/ch/%/vw), custom classes, visibility toggles |

#### Implementation Architecture

```
src/
├── components/
│   └── page-builder/
│       ├── widgets/
│       │   └── content/
│       │       └── heading-widget.tsx      # Main widget component
│       │
│       └── settings/
│           └── widget-settings/
│               └── heading-settings/
│                   ├── index.tsx           # Main settings panel
│                   ├── content-tab.tsx     # Text, HTML tag, link, highlight
│                   ├── style-tab.tsx       # Typography, fill, effects
│                   ├── animation-tab.tsx   # All animation controls
│                   └── responsive-tab.tsx  # Per-device overrides
│
├── lib/
│   └── page-builder/
│       ├── types.ts                        # HeadingWidgetSettings interface
│       ├── defaults.ts                     # DEFAULT_HEADING_SETTINGS
│       └── animations/
│           ├── text-animations.ts          # Split text animation utilities
│           └── entrance-animations.ts      # Intersection Observer based
│
└── styles/
    └── heading-animations.css              # CSS keyframes for animations
```

#### CSS Animation Examples

```css
/* Gradient Shift Animation (Webflow style) */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.heading-gradient-animated {
  background: linear-gradient(90deg, var(--color-1), var(--color-2), var(--color-1));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
}

/* Text Stroke (Outline) */
.heading-stroke {
  -webkit-text-stroke: var(--stroke-width) var(--stroke-color);
  -webkit-text-fill-color: var(--fill-color, transparent);
}

/* Marker Highlight Effect */
.heading-highlight-marker {
  background: linear-gradient(
    to bottom,
    transparent 50%,
    var(--highlight-color) 50%
  );
  padding: 0 4px;
}

/* Split Text Animation (Framer style) */
.heading-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: char-reveal 0.5s ease forwards;
  animation-delay: calc(var(--char-index) * 50ms);
}

@keyframes char-reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typewriter Effect */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.heading-typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typewriter 2s steps(var(--char-count)) forwards;
  border-right: 2px solid currentColor;
}

/* Wave Animation (Divi style) */
.heading-wave .char {
  display: inline-block;
  animation: wave 1s ease-in-out infinite;
  animation-delay: calc(var(--char-index) * 0.1s);
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Glitch Effect */
@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

.heading-glitch {
  position: relative;
}

.heading-glitch::before,
.heading-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.heading-glitch::before {
  animation: glitch 0.3s infinite;
  color: #ff00ff;
  z-index: -1;
  left: 2px;
}

.heading-glitch::after {
  animation: glitch 0.3s infinite reverse;
  color: #00ffff;
  z-index: -2;
  left: -2px;
}
```

#### React Implementation Pattern

```typescript
// Split text utility for character/word animations
function splitText(text: string, splitBy: "characters" | "words" | "lines"): string[] {
  switch (splitBy) {
    case "characters":
      return text.split("");
    case "words":
      return text.split(" ");
    case "lines":
      return text.split("\n");
    default:
      return [text];
  }
}

// Heading Widget Component
export function HeadingWidget({ settings }: { settings: HeadingWidgetSettings }) {
  const Tag = settings.content.htmlTag as keyof JSX.IntrinsicElements;
  const ref = useRef<HTMLElement>(null);

  // Intersection Observer for entrance animation
  useEffect(() => {
    if (!settings.animation?.entrance?.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.classList.add("animate-in");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Text animation rendering
  const renderAnimatedText = () => {
    if (!settings.animation?.textAnimation?.enabled) {
      return renderHighlightedText(settings.content.text);
    }

    const parts = splitText(
      settings.content.text,
      settings.animation.textAnimation.splitBy
    );

    return parts.map((part, index) => (
      <span
        key={index}
        className="heading-char"
        style={{ "--char-index": index } as React.CSSProperties}
      >
        {part}
        {settings.animation?.textAnimation?.splitBy === "words" && " "}
      </span>
    ));
  };

  return (
    <Tag
      ref={ref}
      className={cn(
        "heading-widget",
        getAlignmentClass(settings.style.alignment),
        getEntranceClass(settings.animation?.entrance),
        getTextFillClass(settings.style.textFill),
        settings.advanced?.customClass
      )}
      style={{
        ...getTypographyStyles(settings.style.typography),
        ...getTextFillStyles(settings.style.textFill),
        ...getTextStrokeStyles(settings.style.textStroke),
        ...getTextShadowStyles(settings.style.textShadow),
      }}
    >
      {renderAnimatedText()}
    </Tag>
  );
}
```

#### Settings Panel UI Mock

```
┌─────────────────────────────────────┐
│ ← Back           Heading        :   │
├─────────────────────────────────────┤
│ Content │ Style │ Animation │ Adv.  │
├─────────────────────────────────────┤
│                                     │
│ Text                                │
│ ┌─────────────────────────────────┐ │
│ │ Start Your US Business Today   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ HTML Tag                            │
│ ┌───────────────────────────┬─────┐ │
│ │ H2                        │ ▼   │ │
│ └───────────────────────────┴─────┘ │
│                                     │
│ ▼ Highlight Words                   │
│   ☑ Enable Highlighting            │
│   Words  [US Business, Today]      │
│   Style  [Gradient ▼]              │
│                                     │
│ ▼ Link                              │
│   URL    [https://...]             │
│   ☐ Open in New Tab                │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Content │ Style │ Animation │ Adv.  │
├─────────────────────────────────────┤
│                                     │
│ Alignment                           │
│ [◀ Left] [Center] [Right ▶]       │
│                                     │
│ ▼ Typography                        │
│   Font Family  [Inter ▼]           │
│   Size         [48] [px ▼]         │
│   Weight       [700 Bold ▼]        │
│   Line Height  [1.2]               │
│   Letter Spacing [0] px            │
│   Transform    [None ▼]            │
│                                     │
│ ▼ Text Fill                         │
│   ○ Solid  ● Gradient  ○ Image    │
│   ┌─────────────────────────────┐  │
│   │ ████████████████████████████│  │
│   │ #F97316 ──────── #EF4444   │  │
│   └─────────────────────────────┘  │
│   Angle [90°]                       │
│                                     │
│ ▼ Text Stroke                       │
│   ☐ Enable Stroke                  │
│   Width [2] px                      │
│   Color [████] #ffffff              │
│                                     │
│ ▼ Text Shadow                       │
│   ☑ Enable Shadow                  │
│   + Add Shadow                      │
│   ┌─────────────────────────────┐  │
│   │ X: 0  Y: 4  Blur: 10  #000 │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Content │ Style │ Animation │ Adv.  │
├─────────────────────────────────────┤
│                                     │
│ ▼ Entrance Animation                │
│   ☑ Enable                         │
│   Type      [Fade Up ▼]            │
│   Duration  [600] ms                │
│   Delay     [0] ms                  │
│   Easing    [Ease Out ▼]           │
│                                     │
│ ▼ Text Animation                    │
│   ☑ Enable                         │
│   Type      [Blur In ▼]            │
│   Split By  [Words ▼]              │
│   Stagger   [50] ms                 │
│   Duration  [400] ms                │
│   ☐ Loop Animation                 │
│                                     │
│ ▼ Continuous Animation              │
│   ☐ Enable                         │
│   Type      [Gradient Shift ▼]     │
│                                     │
│ ▼ Hover Animation                   │
│   ☐ Enable                         │
│   Type      [Underline Grow ▼]     │
│                                     │
└─────────────────────────────────────┘
```

#### Performance Best Practices

1. **CSS-First Animations**: Use CSS keyframes for simple animations
2. **Lazy Load GSAP**: Only load for complex text animations (glitch, scramble)
3. **Intersection Observer**: Trigger entrance animations only when visible
4. **Will-Change Hints**: Use `will-change: transform, opacity` sparingly
5. **Reduced Motion**: Respect `prefers-reduced-motion` media query

```typescript
// Reduced motion support
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  // Disable or simplify animations
}
```

---

## Widget Browser UI

When user clicks "+" in a column:

```
┌─────────────────────────────────────────────────────────┐
│  Add Widget                                        ✕    │
├─────────────────────────────────────────────────────────┤
│  🔍 Search widgets...                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⭐ Most Used                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Image   │ │ Lead    │ │ Trust   │      │
│  │ Content │ │         │ │ Form    │ │ Badges  │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📝 Content                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Heading │ │ Text    │ │ Rich    │      │
│  │ Content │ │         │ │ Block   │ │ Text    │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📷 Media                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Image   │ │ Image   │ │ Video   │ │ Gallery │      │
│  │         │ │ Slider  │ │         │ │         │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📋 Forms                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Lead    │ │ Contact │ │ News-   │                  │
│  │ Form    │ │ Form    │ │ letter  │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
│  ⭐ Social Proof                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Trust   │ │ Stats   │ │ Testi-  │ │ Logo    │      │
│  │ Badges  │ │ Section │ │ monial  │ │ Cloud   │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  💰 Commerce                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Pricing │ │ Pricing │ │ Feature │                  │
│  │ Card    │ │ Table   │ │ Compare │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Section/Column Selector UI

When user clicks "Add Block":

```
┌─────────────────────────────────────────────────────────┐
│  Select Layout                                     ✕    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████████████████████████████████████   │   │
│  │                  1 Column                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████████████  ████████████████████      │   │
│  │              2 Columns (50/50)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████  ██████████████████████████████    │   │
│  │              2 Columns (33/66)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ██████████████████████████████  ████████████    │   │
│  │              2 Columns (66/33)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████  █████████████  █████████████     │   │
│  │              3 Columns (33/33/33)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
src/
├── lib/
│   └── page-builder/
│       ├── types.ts              # All type definitions
│       ├── widget-registry.ts    # Widget registration
│       ├── section-layouts.ts    # Layout configurations
│       └── defaults.ts           # Default settings
│
├── components/
│   └── page-builder/
│       │
│       ├── core/
│       │   ├── page-canvas.tsx       # Main canvas
│       │   ├── section.tsx           # Section container
│       │   ├── column.tsx            # Column container
│       │   └── widget-wrapper.tsx    # Widget container
│       │
│       ├── ui/
│       │   ├── add-section-button.tsx
│       │   ├── layout-selector.tsx   # Column layout modal
│       │   ├── widget-browser.tsx    # Widget selection modal
│       │   ├── section-toolbar.tsx   # Section controls
│       │   └── widget-toolbar.tsx    # Widget controls
│       │
│       ├── widgets/
│       │   ├── content/
│       │   │   ├── hero-content.tsx
│       │   │   ├── heading.tsx
│       │   │   └── text-block.tsx
│       │   │
│       │   ├── media/
│       │   │   ├── image-widget.tsx
│       │   │   ├── video-widget.tsx
│       │   │   └── gallery-widget.tsx
│       │   │
│       │   ├── forms/
│       │   │   ├── lead-form.tsx
│       │   │   ├── contact-form.tsx
│       │   │   └── newsletter.tsx
│       │   │
│       │   └── social-proof/
│       │       ├── trust-badges.tsx
│       │       ├── stats-section.tsx
│       │       └── testimonial.tsx
│       │
│       └── settings/
│           ├── section-settings.tsx
│           ├── column-settings.tsx
│           └── widget-settings/
│               ├── hero-content-settings.tsx
│               ├── image-settings.tsx
│               ├── lead-form-settings.tsx
│               ├── trust-badges-settings.tsx
│               └── stats-section-settings.tsx
│
└── app/
    └── admin/
        └── appearance/
            └── landing-page/
                └── page.tsx          # Page builder page
```

---

## Settings Panel (Left Sidebar)

### When Section is Selected:
```
┌─────────────────────────────┐
│ ← Back          Section     │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ Layout                      │
│ ┌─────────────────────────┐ │
│ │ [1] [2] [2] [3] [Custom]│ │
│ └─────────────────────────┘ │
│                             │
│ Background                  │
│ ○ None  ○ Color  ○ Image   │
│                             │
│ Spacing                     │
│ Padding Top    [40] px      │
│ Padding Bottom [40] px      │
│ Column Gap     [24] px      │
│                             │
│ Container Width             │
│ [████████████░░░░] 1280px   │
│                             │
└─────────────────────────────┘
```

### When Widget is Selected:
```
┌─────────────────────────────┐
│ ← Back      Hero Content    │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ ▼ Badge                     │
│   ☑ Show Badge             │
│   Icon  [🇺🇸 ▼]             │
│   Text  [Trusted by...]    │
│                             │
│ ▼ Headline                  │
│   Text  [Start Your...]    │
│   Highlight [US LLC]       │
│   Color [████] #F97316     │
│                             │
│ ▼ Subheadline              │
│   ...                       │
│                             │
│ ▼ Features List            │
│   ...                       │
│                             │
│ ▼ Primary Button           │
│   ...                       │
│                             │
│ ▼ Secondary Button         │
│   ...                       │
│                             │
│ ▼ Trust Text               │
│   ...                       │
│                             │
└─────────────────────────────┘
```

---

## Database Schema

```prisma
model LandingPage {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  isPublished   Boolean  @default(false)

  // JSON structure
  sections      Json     // Array of Section objects
  globalSettings Json    // Global page settings

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// The 'sections' JSON will contain:
// [
//   {
//     id: "section-1",
//     layout: "1-1",
//     columns: [
//       { id: "col-1", widgets: [...] },
//       { id: "col-2", widgets: [...] }
//     ],
//     settings: { ... }
//   },
//   ...
// ]
```

---

## Migration Strategy

### Phase 1: Core Infrastructure ✅
- [x] Create Section, Column, Widget type definitions
- [x] Build widget registry system
- [x] Create layout selector component
- [x] Create widget browser component
- [x] Build section/column rendering

### Phase 2: Essential Widgets ✅
- [x] Hero Content widget (with button style presets: Craft, Flow, Neural)
- [x] Image widget (comprehensive modern features)
- [x] Trust Badges widget
- [x] Stats Section widget
- [x] **Heading widget** (v3.2 - comprehensive modern features, see spec below)
- [x] **Text Block widget** (v3.3 - Tiptap WYSIWYG, see spec below)
- [x] Divider widget (10 styles including gradient, dotted, icon, text)

### Phase 3: Form Widgets ✅
- [x] Lead Form widget
- [ ] Contact Form widget
- [ ] Form submission handling

### Phase 4: More Widgets
- [x] Video widget
- [x] Testimonial widget
- [ ] **Image Slider widget** (Ken Burns, 3D effects, content layers)
- [ ] FAQ widget
- [ ] Pricing widgets

### Phase 5: Advanced Features
- [x] Drag & drop reordering (sections)
- [x] Copy/duplicate sections
- [x] Section settings (background: solid/gradient/image/video, spacing, max-width)
- [x] Column settings (vertical alignment, padding)
- [x] Widget spacing controls (margin top/bottom)
- [ ] Section templates/presets
- [ ] Global styles
- [ ] Responsive controls

---

## Scalability Benefits

1. **Adding New Widgets**
   - Create component + settings panel
   - Register in widget registry
   - Done! Works everywhere automatically

2. **Adding New Layouts**
   - Add layout config to section-layouts.ts
   - Done! Available in layout selector

3. **Third-party Widgets**
   - Plugin system possible
   - Developers can create custom widgets

4. **Theming**
   - Global styles apply to all widgets
   - Individual widget overrides possible

---

## CodeCanyon Marketing Points

- "Elementor-Style Drag & Drop Page Builder"
- "30+ Pre-built Widgets"
- "Unlimited Layout Combinations"
- "No Coding Required"
- "Fully Responsive"
- "Developer-Friendly Plugin System"

---

---

## Changelog

### v3.3 (2026-02-03)
- **Text Block Widget**: Complete specification with Tiptap integration
  - Tiptap WYSIWYG editor (ProseMirror-based, React-native)
  - 4 toolbar presets: Minimal, Basic, Standard, Full
  - Typography controls: Font family, size, line-height, letter-spacing, color
  - Link styling: Custom colors, hover states, underline toggle
  - List styling: Custom bullet/number styles and colors
  - Blockquote styling: Border color/width, background, italic
  - Drop Cap: First letter styling with size and color
  - Multi-column layout: 1-3 columns with gap and dividers
  - Container styling: Background, padding, border radius, shadow
  - Entrance animations: Fade, fade-up, fade-down, slide-up
  - Responsive: Per-device typography and column overrides
  - Dark theme CSS for admin panel

### v3.2 (2026-01-23)
- **Heading Widget**: Complete rewrite with modern 2025 page builder features
  - Based on analysis of: Elementor, Webflow, Divi, Framer, ThePlus Addons
  - Typography: Full control (family, size in px/em/rem/vw, weight, line-height, letter-spacing)
  - Text Fill: Solid color, linear/radial gradient, image fill (knockout text)
  - Text Effects: Stroke/outline, multiple text shadows, glow
  - Highlighting: Per-word styling with 6 styles (color, background, gradient, underline, marker, glow)
  - Split Heading: 3-part heading with independent styling (Divi Multi-Heading style)
  - Entrance Animations: 12 types (fade, slide, zoom, flip, bounce) - scroll triggered
  - Text Animations: 12 types (typewriter, wave, blur-in, glitch, scramble) - split by char/word/line
  - Continuous Animations: Gradient shift, pulse, glow, shimmer, float
  - Hover Effects: Color change, underline grow, background fill, scale, letter-spacing
  - Responsive: Per-device typography overrides (desktop/tablet/mobile)
  - Advanced: Max-width (px/ch/%/vw), custom classes, visibility toggles
  - Accessibility: Semantic HTML tags, reduced-motion support
  - Performance: CSS-first animations, lazy GSAP loading, Intersection Observer

### v3.1 (2026-01-12)
- **Image Slider Widget**: Comprehensive specification added
  - 6 slider types: Standard, Hero, Carousel, Gallery, Split-screen, Vertical
  - 8 transition effects including Cube 3D, Coverflow, Flip, Cards
  - Ken Burns (pan/zoom) effect with per-slide override
  - Slider Revolution style content layers with IN/OUT animations
  - Multi-navigation: Arrows, Dots, Progress bar, Thumbnails
  - Video background support (MP4, WebM, YouTube, Vimeo)
  - Touch/swipe with configurable threshold
  - Responsive breakpoint overrides
  - Based on 2025 research: Swiper.js, Slider Revolution, GSAP techniques

### v3.0 (2026-01-12)
- **Image Widget**: Complete rewrite with modern features
  - 13 hover effects (zoom, glow, shine, tilt, lift, etc.)
  - 8 entrance animations with Intersection Observer
  - 5 floating animations (continuous looping)
  - Parallax scrolling support
  - Lightbox modal
  - 8 mask shapes (circle, hexagon, blob, diamond, etc.)
  - 7 CSS filters
  - Caption overlay support
- **Spacer Widget**: Removed (widgets now have built-in spacing controls)
- **Migration Status**: Updated to reflect completed phases

### v2.0
- Section-Based Architecture (Elementor/Webflow style)
- Widget registry system
- Core widgets implementation

*Document Version: 3.3 - Text Block Widget with Tiptap (2026-02-03)*
