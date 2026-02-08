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

### Phase 6: Blog Widgets
- [ ] Public Blog API (`/api/blog` + `/api/blog/[slug]`)
- [ ] Shared blog components (BlogCard, BlogSectionHeader, BlogFilterTabs, useBlogData hook)
- [ ] **Blog Post Grid widget** (Grid/Masonry/Magazine, query builder, filter tabs, pagination)
- [ ] **Blog Post Carousel widget** (Swiper-based, autoplay, navigation)
- [ ] **Blog Featured Post widget** (Overlay/Split/Stacked layouts, hero-style)
- [ ] **Blog Post List widget** (Vertical list with side images)
- [ ] **Blog Recent Posts widget** (Compact footer/sidebar list)

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

## Blog Widgets

Blog widgets allow displaying blog content (posts, categories) anywhere in the page builder — homepage, landing pages, or any custom page. These widgets fetch data from the existing BlogPost/BlogCategory models and render them with configurable layouts and styles.

### Research Summary (2025-2026 Page Builder Analysis)

| Source | Key Insights |
|--------|--------------|
| **[Elementor Posts Widget Pro](https://elementor.com/help/posts-widget-pro/)** | 3 skins (Classic/Cards/Full Content), 1-6 columns, masonry toggle, advanced query builder (category/tag/author/date/manual selection/related/offset/sticky), Ajax pagination (Numbers/Prev-Next/Load More/Infinite Scroll) |
| **[Webflow Collection List](https://help.webflow.com/hc/en-us/articles/33961294051347)** | Total design freedom — CSS Grid/Flexbox layouts, filter by any CMS field, conditional visibility, bind any element to CMS data |
| **[Divi Blog Module](https://www.elegantthemes.com/documentation/divi/blog/)** | Grid (up to 3 cols) and Fullwidth layouts, category filter, offset, standard pagination |
| **[Squarespace Summary Blocks](https://support.squarespace.com/hc/en-us/articles/206543337)** | 4 layout types: Grid, List, Carousel, Wall (masonry), filter by blog/tag/category |
| **[Wix Blog Feed](https://support.wix.com/en/article/wix-blog-customizing-your-blog-feed)** | Grid, Side-by-side, Magazine layouts, Feature Posts toggle, Category nav, Infinite scroll with posts-per-load control |
| **[WordPress Gutenberg Query Loop](https://wordpress.org/documentation/article/query-loop-block/)** | Post type/taxonomy/author/date/keyword filtering, inherit query from template, extensible via PHP hooks |
| **[Framer CMS](https://allaboutframer.com/a-complete-guide-to-using-the-framer-cms)** | Design-first CMS binding, multi-collection category pages, empty state design |

### Design Principles

1. **Data-Driven**: All widgets fetch from the existing BlogPost API — no duplicate content management
2. **Query Builder Pattern**: Flexible data source selection (all posts, by category, by tag, featured, manual, recent N)
3. **Layout Flexibility**: Grid, List, Carousel, Magazine — same data, different presentations
4. **Progressive Complexity**: Simple defaults that work out of the box, advanced options expandable
5. **Performance**: Skeleton loading, lazy images, paginated API calls, ISR-compatible
6. **Responsive First**: Per-device column counts and element visibility

### Widget Category

New widget category: `"blog"` — added to `WidgetCategory` type.

### New Widget Types

Added to `WidgetType`:
```typescript
// Blog Widgets
| "blog-post-grid"        // Grid/Masonry/Magazine layout of posts
| "blog-post-carousel"    // Horizontal carousel/slider of posts
| "blog-featured-post"    // Single featured/hero post
| "blog-post-list"        // Vertical list layout (image + text side by side)
| "blog-recent-posts"     // Compact list for sidebar/footer (title + date)
```

---

### 10. Blog Post Grid Widget

The primary blog widget. Displays posts in a configurable multi-column grid with card design, filtering, and pagination. Inspired by Elementor Posts Widget, Wix Blog Feed, and Squarespace Grid Summary Block.

#### 2025-2026 Design Trends Applied

- **Clean Card Design**: Large border-radius (12-16px), subtle shadows, generous padding
- **Category Badges**: Colored pills overlaid on image or above title
- **Minimal Metadata**: Show only 2-3 meta items (e.g., Category + Date + Reading Time)
- **Section Header**: Title left-aligned with "View All →" link right-aligned
- **Hover Micro-Interactions**: Image zoom, card lift, color overlay (200-300ms)
- **Skeleton Loading**: Gray pulsing rectangles while loading
- **Dark Mode Compatible**: Automatic card/text color adjustments

```typescript
// === BLOG POST GRID WIDGET SETTINGS ===
interface BlogPostGridWidgetSettings {
  // === SECTION HEADER ===
  header: {
    show: boolean;
    badge?: {
      show: boolean;
      text: string;                    // "Our Blog"
      icon?: string;                   // Lucide icon name
      style: "pill" | "outline" | "solid";
      bgColor?: string;
      textColor?: string;
    };
    heading: {
      text: string;                    // "Latest Articles"
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      highlightWords?: string;         // Comma-separated words to highlight
      highlightColor?: string;
    };
    subheading?: {
      show: boolean;
      text: string;                    // "Insights and guides for entrepreneurs"
      color?: string;
    };
    viewAllLink: {
      show: boolean;
      text: string;                    // "View All Articles →"
      url: string;                     // "/blog"
      style: "link" | "button-outline" | "button-solid";
      color?: string;
    };
    alignment: "left" | "center" | "space-between";  // space-between = title left, link right
  };

  // === DATA SOURCE (Query Builder) ===
  dataSource: {
    source:
      | "all"                          // All published posts
      | "category"                     // Filter by specific categories
      | "tag"                          // Filter by specific tags
      | "featured"                     // Only featured/sticky posts
      | "recent"                       // Most recent N posts
      | "manual";                      // Hand-picked specific posts

    // Filter options (when source = "category" or "tag")
    categories?: string[];             // Category slugs to include
    tags?: string[];                   // Tags to include
    excludeCategories?: string[];      // Category slugs to exclude

    // Manual selection (when source = "manual")
    postIds?: string[];                // Manually selected post IDs (ordered)

    // Common options
    postCount: number;                 // Number of posts to display (default: 6)
    offset: number;                    // Skip first N posts (default: 0)
    orderBy: "date" | "title" | "random" | "modified";
    orderDirection: "desc" | "asc";
    excludeCurrentPost: boolean;       // Exclude the currently viewed post (for related posts)
  };

  // === LAYOUT ===
  layout: {
    type: "grid" | "masonry" | "magazine";

    // Grid settings
    columns: {
      desktop: 1 | 2 | 3 | 4;         // Default: 3
      tablet: 1 | 2 | 3;              // Default: 2
      mobile: 1 | 2;                  // Default: 1
    };
    gap: number;                       // Gap between cards in px (default: 24)
    equalHeight: boolean;              // Force all cards to same height (default: true)

    // Magazine layout (when type = "magazine")
    // Pattern: 1 large card + smaller cards in grid
    magazinePattern:
      | "1-large-2-small"              // 1 big left, 2 stacked right
      | "1-large-3-small"              // 1 big left, 3 stacked right
      | "1-large-4-small"              // 1 big top, 4 below in grid
      | "featured-row";               // 1 full-width hero + grid below
  };

  // === CARD DESIGN ===
  card: {
    // Card container
    style: "default" | "bordered" | "elevated" | "glassmorphism" | "minimal";
    backgroundColor?: string;
    borderRadius: number;              // Default: 12
    border?: {
      width: number;
      color: string;
      style: "solid" | "dashed";
    };
    shadow: "none" | "sm" | "md" | "lg";
    padding: number;                   // Internal padding (default: 0 for edge-to-edge image)

    // Hover effects
    hoverEffect: "none" | "lift" | "shadow" | "border-color" | "scale" | "glow";
    hoverTransition: number;           // Duration in ms (default: 300)

    // Featured Image
    image: {
      show: boolean;
      aspectRatio: "16:9" | "4:3" | "3:2" | "1:1" | "auto";
      position: "top" | "left" | "right" | "behind";  // "behind" = overlay card
      borderRadius: number;            // Image-specific border radius
      hoverEffect: "none" | "zoom" | "brighten" | "grayscale" | "blur" | "overlay";
      overlayColor?: string;           // For "overlay" or "behind" mode
      overlayOpacity?: number;         // 0-1
      fallbackImage?: string;          // When post has no cover image
    };

    // Category Badge
    categoryBadge: {
      show: boolean;
      position: "overlay-top-left" | "overlay-top-right" | "above-title" | "below-title";
      style: "pill" | "solid" | "outline" | "minimal";
      bgColor?: string;               // Auto-colored per category if not set
      textColor?: string;
      fontSize: "xs" | "sm";
    };

    // Title
    title: {
      show: boolean;
      htmlTag: "h2" | "h3" | "h4" | "h5";
      maxLines: number;                // Line clamp (default: 2)
      color?: string;
      hoverColor?: string;
      fontSize: "sm" | "md" | "lg" | "xl";
      fontWeight: 500 | 600 | 700 | 800;
    };

    // Excerpt
    excerpt: {
      show: boolean;
      maxLength: number;               // Characters (default: 120)
      color?: string;
      fontSize: "xs" | "sm" | "md";
    };

    // Meta Data
    meta: {
      show: boolean;
      items: Array<"author" | "date" | "category" | "readingTime" | "tags">;
      position: "above-title" | "below-title" | "below-excerpt" | "footer";
      dateFormat: "relative" | "short" | "long";
      // relative = "2 days ago", short = "Jan 15", long = "January 15, 2026"
      showAuthorAvatar: boolean;
      separator: "dot" | "dash" | "slash" | "pipe";
      color?: string;
      fontSize: "xs" | "sm";
    };

    // Read More
    readMore: {
      show: boolean;
      text: string;                    // "Read More", "Continue Reading →"
      style: "link" | "button-sm" | "arrow-only";
      color?: string;
      hoverColor?: string;
    };

    // Content padding (inside card, below image)
    contentPadding: number;            // Default: 16
  };

  // === CATEGORY FILTER TABS ===
  filterTabs: {
    show: boolean;
    position: "above-header" | "below-header";
    style: "pills" | "underline" | "buttons" | "minimal";
    showAll: boolean;                  // Show "All" tab
    allText: string;                   // "All", "All Posts", "Everything"
    categories: string[];              // Category slugs to show as tabs (empty = auto from posts)
    activeColor?: string;
    inactiveColor?: string;
    animated: boolean;                 // Smooth transition on filter
  };

  // === PAGINATION ===
  pagination: {
    type: "none" | "load-more" | "numbered" | "infinite-scroll";
    postsPerLoad: number;              // For load-more and infinite-scroll (default: 6)
    loadMoreText: string;              // "Load More Articles"
    loadMoreStyle: "button-outline" | "button-solid" | "link";
    showPostCount: boolean;            // "Showing 6 of 24 articles"
  };

  // === EMPTY STATE ===
  emptyState: {
    title: string;                     // "No articles found"
    description: string;               // "Check back later for new content"
    icon?: string;                     // Lucide icon name
  };

  // === LOADING STATE ===
  loading: {
    type: "skeleton" | "spinner" | "none";
    skeletonCount: number;             // Number of skeleton cards to show
  };

  // === ANIMATION ===
  animation: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up" | "slide-up" | "scale";
      stagger: boolean;                // Stagger animation per card
      staggerDelay: number;            // ms between each card (default: 100)
      duration: number;                // ms (default: 500)
    };
  };
}
```

#### Blog Post Grid Card Layouts

```
GRID LAYOUT (3 columns):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ┌──────────┐│  │  ┌──────────┐│  │  ┌──────────┐│
│  │  IMAGE   ││  │  │  IMAGE   ││  │  │  IMAGE   ││
│  │          ││  │  │          ││  │  │          ││
│  └──────────┘│  │  └──────────┘│  │  └──────────┘│
│  [Category]  │  │  [Category]  │  │  [Category]  │
│  Title of    │  │  Title of    │  │  Title of    │
│  the Post    │  │  the Post    │  │  the Post    │
│              │  │              │  │              │
│  Short exce- │  │  Short exce- │  │  Short exce- │
│  rpt text... │  │  rpt text... │  │  rpt text... │
│              │  │              │  │              │
│  👤 Author    │  │  👤 Author    │  │  👤 Author    │
│  📅 Jan 15   │  │  📅 Jan 15   │  │  📅 Jan 15   │
└──────────────┘  └──────────────┘  └──────────────┘

MAGAZINE LAYOUT (1-large-2-small):
┌────────────────────────┐  ┌──────────────┐
│                        │  │  ┌──────────┐│
│        IMAGE           │  │  │  IMAGE   ││
│                        │  │  └──────────┘│
│   [Business]           │  │  Title of    │
│   Featured Article     │  │  the Post    │
│   Title Here           │  │  📅 Jan 15   │
│                        │  ├──────────────┤
│   Longer excerpt text  │  │  ┌──────────┐│
│   displayed for the    │  │  │  IMAGE   ││
│   featured post...     │  │  └──────────┘│
│                        │  │  Title of    │
│   👤 Author · 📅 Date   │  │  the Post    │
│                        │  │  📅 Jan 14   │
└────────────────────────┘  └──────────────┘

LIST LAYOUT (image-left):
┌────────────────────────────────────────────────┐
│  ┌──────────┐  [Category] · Jan 15, 2026       │
│  │  IMAGE   │  Title of the Blog Post          │
│  │          │  Short excerpt text that gives    │
│  │          │  a preview of the article...      │
│  └──────────┘  Read More →                      │
├────────────────────────────────────────────────┤
│  ┌──────────┐  [Category] · Jan 14, 2026       │
│  │  IMAGE   │  Another Blog Post Title          │
│  │          │  Short excerpt text that gives    │
│  │          │  a preview of the article...      │
│  └──────────┘  Read More →                      │
└────────────────────────────────────────────────┘
```

#### Blog Post Grid Features Summary

| Category | Features |
|----------|----------|
| **Data Source** | All posts, by category, by tag, featured, recent, manual selection, exclude current, offset |
| **Layouts** | Grid (1-4 cols), Masonry, Magazine (4 patterns) |
| **Card Design** | 5 styles, configurable image/title/excerpt/meta/badge/readMore visibility |
| **Category Badge** | 4 positions, 4 styles, auto-color per category |
| **Hover Effects** | Card: lift/shadow/scale/glow; Image: zoom/brighten/grayscale/blur/overlay |
| **Filter Tabs** | Interactive category tabs (pills/underline/buttons), animated filtering |
| **Pagination** | None, Load More, Numbered, Infinite Scroll |
| **Loading** | Skeleton loading, spinner, or none |
| **Animation** | Fade/slide entrance with per-card stagger |
| **Responsive** | Per-device column counts (desktop/tablet/mobile) |

---

### 11. Blog Post Carousel Widget

Horizontal carousel/slider of blog posts. Perfect for homepage sections. Inspired by Elementor Loop Carousel, Squarespace Carousel Summary Block, and Swiper.js.

```typescript
// === BLOG POST CAROUSEL WIDGET SETTINGS ===
interface BlogPostCarouselWidgetSettings {
  // === SECTION HEADER ===
  // Same as BlogPostGridWidgetSettings.header (reuse HeaderSettings type)
  header: BlogSectionHeader;

  // === DATA SOURCE ===
  // Same query builder as BlogPostGrid
  dataSource: BlogDataSource;

  // === CAROUSEL SETTINGS ===
  carousel: {
    slidesPerView: {
      desktop: 1 | 2 | 3 | 4;         // Default: 3
      tablet: 1 | 2 | 3;              // Default: 2
      mobile: 1 | 1.2;                // Default: 1 (1.2 = peek next slide)
    };
    spaceBetween: number;              // Gap between slides (default: 24)
    centeredSlides: boolean;           // Center active slide

    // Autoplay
    autoplay: {
      enabled: boolean;
      delay: number;                   // ms (default: 5000)
      pauseOnHover: boolean;
      pauseOnInteraction: boolean;
    };

    // Loop & Speed
    loop: boolean;                     // Infinite loop (default: true)
    speed: number;                     // Transition speed in ms (default: 500)
    effect: "slide" | "fade" | "coverflow";  // Default: slide

    // Navigation
    navigation: {
      arrows: {
        enabled: boolean;
        style: "default" | "minimal" | "rounded" | "floating" | "outside";
        size: "sm" | "md" | "lg";
        color?: string;
        backgroundColor?: string;
        position: "sides" | "top-right" | "bottom-center";
        showOnHover: boolean;
      };
      dots: {
        enabled: boolean;
        style: "dots" | "lines" | "fraction";
        position: "bottom" | "below";
        activeColor?: string;
        inactiveColor?: string;
      };
    };

    // Touch/Swipe
    grabCursor: boolean;
    freeMode: boolean;                 // Free scrolling without snapping
  };

  // === CARD DESIGN ===
  // Same as BlogPostGridWidgetSettings.card
  card: BlogPostCard;

  // === ANIMATION ===
  animation: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up" | "slide-left";
      duration: number;
    };
  };
}
```

#### Carousel Visual

```
Section Header: "Latest from Our Blog"              View All →

  ◀  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ▶
     │  ┌──────────┐│  │  ┌──────────┐│  │  ┌──────────┐│
     │  │  IMAGE   ││  │  │  IMAGE   ││  │  │  IMAGE   ││
     │  │          ││  │  │          ││  │  │          ││
     │  └──────────┘│  │  └──────────┘│  │  └──────────┘│
     │  [Business]  │  │  [Guides]    │  │  [News]      │
     │  Post Title  │  │  Post Title  │  │  Post Title  │
     │  Excerpt...  │  │  Excerpt...  │  │  Excerpt...  │
     │  📅 Jan 15   │  │  📅 Jan 14   │  │  📅 Jan 13   │
     └──────────────┘  └──────────────┘  └──────────────┘

                         ● ● ○ ○ ○
```

---

### 12. Blog Featured Post Widget

Single prominent featured post displayed hero-style. Perfect for the top of a blog section or as a standalone highlight. Inspired by Wix Featured Posts, Squarespace Featured Post, and modern editorial layouts.

```typescript
// === BLOG FEATURED POST WIDGET SETTINGS ===
interface BlogFeaturedPostWidgetSettings {
  // === DATA SOURCE ===
  dataSource: {
    source: "latest" | "featured" | "specific" | "category-latest";
    postId?: string;                   // When source = "specific"
    categorySlug?: string;             // When source = "category-latest"
  };

  // === LAYOUT ===
  layout:
    | "overlay"          // Text overlaid on full-width image with gradient
    | "split-left"       // Image left, content right
    | "split-right"      // Image right, content left
    | "stacked";         // Full-width image top, content below

  // === IMAGE ===
  image: {
    aspectRatio: "16:9" | "21:9" | "4:3" | "auto";
    borderRadius: number;
    overlay: {
      enabled: boolean;
      type: "gradient" | "solid";
      color?: string;                  // For solid
      gradientFrom?: string;           // For gradient (bottom)
      gradientTo?: string;             // For gradient (top, usually transparent)
      opacity: number;
    };
    hoverEffect: "none" | "zoom" | "parallax" | "ken-burns";
    parallaxSpeed?: number;            // 0-1 for parallax effect
  };

  // === CONTENT ===
  content: {
    categoryBadge: {
      show: boolean;
      style: "pill" | "solid" | "outline";
      bgColor?: string;
      textColor?: string;
    };

    title: {
      size: "lg" | "xl" | "2xl" | "3xl" | "4xl";
      color?: string;
      fontWeight: 600 | 700 | 800 | 900;
      maxLines: number;                // Line clamp
    };

    excerpt: {
      show: boolean;
      maxLength: number;               // Characters (default: 200)
      color?: string;
      fontSize: "sm" | "md" | "lg";
    };

    meta: {
      show: boolean;
      items: Array<"author" | "date" | "readingTime" | "category">;
      showAuthorAvatar: boolean;
      dateFormat: "relative" | "short" | "long";
      color?: string;
    };

    readMore: {
      show: boolean;
      text: string;
      style: "button-primary" | "button-outline" | "link" | "arrow";
      color?: string;
    };

    // Content alignment (for overlay and stacked layouts)
    alignment: "left" | "center";
    verticalPosition: "top" | "center" | "bottom";  // For overlay layout
    maxWidth?: number;                 // Max content width in px (for readability)
  };

  // === SIZING ===
  height: "auto" | "sm" | "md" | "lg" | "xl" | "viewport";
  // sm = 300px, md = 400px, lg = 500px, xl = 600px, viewport = 70vh

  // === ANIMATION ===
  animation: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up" | "zoom-in";
      duration: number;
    };
    contentReveal: {
      enabled: boolean;
      type: "none" | "slide-up" | "fade" | "typewriter-title";
      stagger: boolean;
      staggerDelay: number;
    };
  };
}
```

#### Featured Post Layouts

```
OVERLAY LAYOUT:
┌─────────────────────────────────────────────────────┐
│                                                     │
│            ██████████████████████████                │
│            ██  COVER IMAGE WITH  ██                │
│            ██  GRADIENT OVERLAY  ██                │
│            ██████████████████████████                │
│                                                     │
│   [Business]                                        │
│                                                     │
│   Featured Article Title That                       │
│   Spans Multiple Lines                              │
│                                                     │
│   Longer excerpt text for the featured post that    │
│   provides more context about the article...        │
│                                                     │
│   👤 John Doe · 📅 January 15, 2026 · 5 min read    │
│                                                     │
│   [ Read Article → ]                                │
│                                                     │
└─────────────────────────────────────────────────────┘

SPLIT LAYOUT (split-left):
┌──────────────────────────┬──────────────────────────┐
│                          │                          │
│                          │  [Business]              │
│     ████████████████     │                          │
│     ██  COVER     ██     │  Featured Article Title  │
│     ██  IMAGE     ██     │  That Spans Lines        │
│     ██            ██     │                          │
│     ████████████████     │  Excerpt text provides   │
│                          │  context about the       │
│                          │  article content...      │
│                          │                          │
│                          │  👤 Author · 📅 Date      │
│                          │  [ Read Article → ]      │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

---

### 13. Blog Post List Widget

Vertical list layout with image on one side and text content on the other. Ideal for sidebar sections, archive pages, or content-focused blog displays. Inspired by Squarespace List Summary Block, Elementor Classic Skin (1-col + image-left), and Wix Side-by-Side layout.

```typescript
// === BLOG POST LIST WIDGET SETTINGS ===
interface BlogPostListWidgetSettings {
  // === SECTION HEADER ===
  header: BlogSectionHeader;

  // === DATA SOURCE ===
  dataSource: BlogDataSource;

  // === LAYOUT ===
  layout: {
    imagePosition: "left" | "right" | "alternating" | "none";
    imageWidth: "small" | "medium" | "large";
    // small = 25%, medium = 33%, large = 40%
    gap: number;                       // Gap between items in px (default: 24)
    divider: {
      show: boolean;
      style: "solid" | "dashed" | "dotted";
      color?: string;
    };
  };

  // === ITEM DESIGN ===
  item: {
    // Image
    image: {
      show: boolean;
      aspectRatio: "1:1" | "4:3" | "16:9" | "3:2";
      borderRadius: number;
      hoverEffect: "none" | "zoom" | "brighten";
    };

    // Category Badge
    categoryBadge: {
      show: boolean;
      style: "pill" | "text-only" | "colored-text";
      color?: string;
    };

    // Title
    title: {
      show: boolean;
      htmlTag: "h3" | "h4" | "h5";
      maxLines: number;
      fontSize: "sm" | "md" | "lg";
      fontWeight: 500 | 600 | 700;
      color?: string;
      hoverColor?: string;
    };

    // Excerpt
    excerpt: {
      show: boolean;
      maxLength: number;
      color?: string;
      fontSize: "xs" | "sm" | "md";
    };

    // Meta
    meta: {
      show: boolean;
      items: Array<"author" | "date" | "readingTime" | "category">;
      dateFormat: "relative" | "short";
      color?: string;
      fontSize: "xs" | "sm";
    };

    // Hover
    hoverEffect: "none" | "highlight" | "shift-right" | "border-left";
  };

  // === PAGINATION ===
  pagination: {
    type: "none" | "load-more" | "numbered";
    loadMoreText: string;
  };
}
```

---

### 14. Blog Recent Posts Widget (Compact)

Minimal, compact list of recent posts. Designed for footer sections, sidebar areas, or anywhere a lightweight blog reference is needed. Inspired by WordPress Recent Posts block and Elementor compact post lists.

```typescript
// === BLOG RECENT POSTS WIDGET SETTINGS ===
interface BlogRecentPostsWidgetSettings {
  // === HEADER ===
  header: {
    show: boolean;
    text: string;                      // "Recent Posts", "Latest Articles"
    size: "sm" | "md" | "lg";
    color?: string;
    underline: boolean;                // Decorative underline below header
  };

  // === DATA SOURCE ===
  dataSource: {
    postCount: number;                 // Default: 5
    categories?: string[];             // Filter by categories (optional)
    orderBy: "date" | "random";
  };

  // === DISPLAY ===
  display: {
    style:
      | "title-only"                   // Just post titles as links
      | "title-date"                   // Title + date
      | "title-meta"                   // Title + date + category
      | "thumbnail"                    // Small thumbnail + title + date
      | "numbered";                    // Number prefix (1. 2. 3.) + title

    // Thumbnail (when style = "thumbnail")
    thumbnail: {
      size: number;                    // px (default: 60)
      borderRadius: number;            // px (default: 8)
      aspectRatio: "1:1" | "4:3";
    };

    // Typography
    titleFontSize: "xs" | "sm" | "md";
    titleColor?: string;
    titleHoverColor?: string;
    titleMaxLines: number;             // Line clamp (default: 2)
    dateFontSize: "xs" | "sm";
    dateColor?: string;
    dateFormat: "relative" | "short";  // "3 days ago" or "Jan 15"

    // Number styling (when style = "numbered")
    numberColor?: string;
    numberSize: "sm" | "md" | "lg";

    // Spacing
    itemGap: number;                   // Gap between items (default: 12)
    divider: {
      show: boolean;
      color?: string;
    };
  };

  // === FOOTER LINK ===
  viewAllLink: {
    show: boolean;
    text: string;                      // "View All Posts →"
    url: string;                       // "/blog"
    color?: string;
  };
}
```

#### Recent Posts Compact Layouts

```
TITLE-DATE STYLE:          THUMBNAIL STYLE:           NUMBERED STYLE:
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Recent Posts      │       │ Recent Posts      │       │ Recent Posts      │
│ ─────────────    │       │ ─────────────    │       │ ─────────────    │
│                  │       │                  │       │                  │
│ How to Form an   │       │ ┌────┐ How to    │       │ 01  How to Form  │
│ LLC in Wyoming   │       │ │ 🖼 │ Form an   │       │     an LLC in    │
│ 📅 2 days ago    │       │ └────┘ LLC in WY │       │     Wyoming      │
│                  │       │        📅 2d ago  │       │                  │
│ Best States for  │       │                  │       │ 02  Best States   │
│ Amazon Sellers   │       │ ┌────┐ Best      │       │     for Amazon   │
│ 📅 5 days ago    │       │ │ 🖼 │ States    │       │     Sellers      │
│                  │       │ └────┘ for Amazon │       │                  │
│ EIN Application  │       │        📅 5d ago  │       │ 03  EIN Guide    │
│ Complete Guide   │       │                  │       │     Complete     │
│ 📅 1 week ago    │       │ ┌────┐ EIN App   │       │                  │
│                  │       │ │ 🖼 │ Complete  │       │ View All Posts → │
│ View All →       │       │ └────┘ Guide     │       └──────────────────┘
└──────────────────┘       │        📅 1w ago  │
                           │                  │
                           │ View All Posts → │
                           └──────────────────┘
```

---

### Shared Blog Types (Reusable)

```typescript
// === SHARED TYPES (used across all blog widgets) ===

// Section header (reused by Grid, Carousel, List)
interface BlogSectionHeader {
  show: boolean;
  badge?: {
    show: boolean;
    text: string;
    icon?: string;
    style: "pill" | "outline" | "solid";
    bgColor?: string;
    textColor?: string;
  };
  heading: {
    text: string;
    size: "sm" | "md" | "lg" | "xl" | "2xl";
    color?: string;
    highlightWords?: string;
    highlightColor?: string;
  };
  subheading?: {
    show: boolean;
    text: string;
    color?: string;
  };
  viewAllLink: {
    show: boolean;
    text: string;
    url: string;
    style: "link" | "button-outline" | "button-solid";
    color?: string;
  };
  alignment: "left" | "center" | "space-between";
}

// Data source query builder (reused by Grid, Carousel, List)
interface BlogDataSource {
  source: "all" | "category" | "tag" | "featured" | "recent" | "manual";
  categories?: string[];
  tags?: string[];
  excludeCategories?: string[];
  postIds?: string[];
  postCount: number;
  offset: number;
  orderBy: "date" | "title" | "random" | "modified";
  orderDirection: "desc" | "asc";
  excludeCurrentPost: boolean;
}

// Card design (reused by Grid and Carousel)
interface BlogPostCard {
  style: "default" | "bordered" | "elevated" | "glassmorphism" | "minimal";
  backgroundColor?: string;
  borderRadius: number;
  border?: { width: number; color: string; style: "solid" | "dashed" };
  shadow: "none" | "sm" | "md" | "lg";
  padding: number;
  hoverEffect: "none" | "lift" | "shadow" | "border-color" | "scale" | "glow";
  hoverTransition: number;
  image: BlogCardImage;
  categoryBadge: BlogCardCategoryBadge;
  title: BlogCardTitle;
  excerpt: BlogCardExcerpt;
  meta: BlogCardMeta;
  readMore: BlogCardReadMore;
  contentPadding: number;
}
```

---

### Public Blog API Endpoint (Required)

Blog widgets need a **public API** (not admin-only) to fetch published posts:

```
GET /api/blog
  ?status=PUBLISHED (enforced)
  &category=llc-formation
  &tag=guides
  &featured=true
  &limit=6
  &offset=0
  &orderBy=date
  &orderDir=desc
  &exclude=post-id-here

Response: {
  posts: BlogPost[] (with categories, author),
  total: number,
  hasMore: boolean
}

GET /api/blog/[slug]
  Response: Single BlogPost with full content, categories, author
```

---

### Implementation Architecture

```
src/
├── components/
│   └── page-builder/
│       ├── widgets/
│       │   └── blog/                          # NEW DIRECTORY
│       │       ├── blog-post-grid.tsx          # Grid/Masonry/Magazine widget
│       │       ├── blog-post-carousel.tsx      # Carousel widget (Swiper)
│       │       ├── blog-featured-post.tsx      # Featured hero post
│       │       ├── blog-post-list.tsx          # List layout widget
│       │       ├── blog-recent-posts.tsx       # Compact recent posts
│       │       ├── shared/
│       │       │   ├── blog-card.tsx           # Reusable card component
│       │       │   ├── blog-section-header.tsx # Reusable section header
│       │       │   ├── blog-filter-tabs.tsx    # Category filter tabs
│       │       │   ├── blog-pagination.tsx     # Pagination component
│       │       │   ├── blog-skeleton.tsx       # Skeleton loading cards
│       │       │   └── use-blog-data.ts        # Shared data fetching hook
│       │       └── index.ts
│       │
│       └── settings/
│           └── widget-settings/
│               └── blog/                      # NEW DIRECTORY
│                   ├── blog-post-grid-settings.tsx
│                   ├── blog-post-carousel-settings.tsx
│                   ├── blog-featured-post-settings.tsx
│                   ├── blog-post-list-settings.tsx
│                   ├── blog-recent-posts-settings.tsx
│                   └── shared/
│                       ├── data-source-settings.tsx    # Reusable query builder UI
│                       ├── card-design-settings.tsx    # Reusable card settings
│                       └── section-header-settings.tsx # Reusable header settings
│
├── app/
│   └── api/
│       └── blog/                              # NEW PUBLIC API
│           ├── route.ts                       # GET /api/blog (public list)
│           └── [slug]/
│               └── route.ts                   # GET /api/blog/[slug] (public detail)
│
└── lib/
    └── page-builder/
        ├── types.ts                           # Add blog widget types + "blog" category
        └── defaults.ts                        # Add blog widget defaults
```

### Registration (register-widgets.ts)

```typescript
// Blog Widgets
registry.register({
  type: "blog-post-grid",
  name: "Blog Post Grid",
  description: "Display blog posts in a configurable grid layout",
  icon: "LayoutGrid",
  category: "blog",
  component: BlogPostGridWidget,
  settingsPanel: BlogPostGridSettings,
  defaultSettings: DEFAULT_BLOG_POST_GRID_SETTINGS,
});

registry.register({
  type: "blog-post-carousel",
  name: "Blog Post Carousel",
  description: "Horizontal carousel of blog posts",
  icon: "GalleryHorizontal",
  category: "blog",
  component: BlogPostCarouselWidget,
  settingsPanel: BlogPostCarouselSettings,
  defaultSettings: DEFAULT_BLOG_POST_CAROUSEL_SETTINGS,
});

registry.register({
  type: "blog-featured-post",
  name: "Blog Featured Post",
  description: "Highlight a single blog post hero-style",
  icon: "Newspaper",
  category: "blog",
  component: BlogFeaturedPostWidget,
  settingsPanel: BlogFeaturedPostSettings,
  defaultSettings: DEFAULT_BLOG_FEATURED_POST_SETTINGS,
});

registry.register({
  type: "blog-post-list",
  name: "Blog Post List",
  description: "Vertical list of blog posts with side images",
  icon: "List",
  category: "blog",
  component: BlogPostListWidget,
  settingsPanel: BlogPostListSettings,
  defaultSettings: DEFAULT_BLOG_POST_LIST_SETTINGS,
});

registry.register({
  type: "blog-recent-posts",
  name: "Recent Posts",
  description: "Compact list of recent posts for sidebar or footer",
  icon: "Clock",
  category: "blog",
  component: BlogRecentPostsWidget,
  settingsPanel: BlogRecentPostsSettings,
  defaultSettings: DEFAULT_BLOG_RECENT_POSTS_SETTINGS,
});
```

### Widget Browser Addition

```
┌─────────────────────────────────────────────────────────┐
│  📝 Blog                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Post    │ │ Post    │ │Featured │ │ Post    │      │
│  │ Grid    │ │Carousel │ │ Post    │ │ List    │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│  ┌─────────┐                                            │
│  │ Recent  │                                            │
│  │ Posts   │                                            │
│  └─────────┘                                            │
└─────────────────────────────────────────────────────────┘
```

### Implementation Priority

| Widget | Priority | Reason |
|--------|----------|--------|
| **Blog Post Grid** | P0 - Must Have | Most versatile — covers homepage sections, blog pages, category pages |
| **Blog Post Carousel** | P0 - Must Have | Essential for homepage — horizontal scroll is expected UX pattern |
| **Blog Featured Post** | P1 - Should Have | High-impact hero section for editorial feel |
| **Blog Post List** | P1 - Should Have | Alternative layout for content-focused pages |
| **Blog Recent Posts** | P2 - Nice to Have | Compact widget for footer/sidebar areas |

### Dependencies

1. **Public Blog API** (`/api/blog`) must be created first — all widgets depend on it
2. **Shared `useBlogData` hook** — centralized data fetching with caching
3. **Shared `BlogCard` component** — reused by Grid and Carousel
4. **Swiper.js** — already a dependency (used by Image Slider) — reused for Blog Carousel

---

### Implementation Scope (STRICT)

**This is NOT a UI mockup. This is a FULL-STACK implementation spec.**

Every blog widget listed above MUST be implemented as a fully working, end-to-end feature. Specifically:

| Layer | What Must Be Done | Details |
|-------|-------------------|---------|
| **Database** | No new models needed | BlogPost + BlogCategory already exist in `prisma/schema.prisma`. No migration required. |
| **Backend API** | Public blog API routes | `GET /api/blog` (list with filtering/pagination/sorting) + `GET /api/blog/[slug]` (single post). These are NEW public endpoints (existing ones are admin-only under `/api/admin/blog`). |
| **TypeScript Types** | Widget settings interfaces | Add all blog widget types to `src/lib/page-builder/types.ts` — `BlogPostGridWidgetSettings`, `BlogPostCarouselWidgetSettings`, `BlogFeaturedPostWidgetSettings`, `BlogPostListWidgetSettings`, `BlogRecentPostsWidgetSettings`, shared types (`BlogSectionHeader`, `BlogDataSource`, `BlogPostCard`). Add `"blog"` to `WidgetCategory`. Add 5 new entries to `WidgetType`. |
| **Defaults** | Default settings objects | Add `DEFAULT_BLOG_POST_GRID_SETTINGS`, `DEFAULT_BLOG_POST_CAROUSEL_SETTINGS`, `DEFAULT_BLOG_FEATURED_POST_SETTINGS`, `DEFAULT_BLOG_POST_LIST_SETTINGS`, `DEFAULT_BLOG_RECENT_POSTS_SETTINGS` to `src/lib/page-builder/defaults.ts`. |
| **Frontend Widgets** | 5 widget components | Each widget must render real blog data from the API, handle loading/empty states, support all layout options, be responsive. Located in `src/components/page-builder/widgets/blog/`. |
| **Settings Panels** | 5 settings panel components | Admin UI for configuring each widget (data source, layout, card design, styling). Located in `src/components/page-builder/settings/widget-settings/blog/`. |
| **Shared Components** | Reusable blog UI parts | `BlogCard`, `BlogSectionHeader`, `BlogFilterTabs`, `BlogPagination`, `BlogSkeleton`, `useBlogData` hook — shared across widgets. Located in `widgets/blog/shared/`. |
| **Widget Registration** | Register in widget registry | All 5 widgets registered in `src/lib/page-builder/register-widgets.ts` with correct category, icon, component, settingsPanel, defaultSettings. |
| **Page Builder Integration** | Widgets appear in widget browser | `"blog"` category visible in the widget browser panel with all 5 widgets selectable. |
| **Data Fetching** | Real API calls with caching | `useBlogData` hook fetches from `/api/blog` with proper query params, SWR/fetch caching, error handling. |
| **Responsive** | Mobile/Tablet/Desktop | Per-device column counts, element visibility, touch-friendly carousel. |
| **Loading States** | Skeleton + Error + Empty | Skeleton cards while loading, error message on failure, empty state when no posts found. |

**What is NOT in scope (already exists):**
- BlogPost/BlogCategory Prisma models (already exist)
- Blog admin CRUD pages (already exist at `/admin/content/blog`)
- Admin blog API routes (already exist at `/api/admin/blog`)
- Page builder core (sections, columns, widget renderer — already exist)

---

### Post-Implementation Verification Checklist

After implementation, verify every item below. All must pass.

#### 1. Backend API
- [ ] `GET /api/blog` returns published posts only (status=PUBLISHED enforced)
- [ ] `GET /api/blog?category=slug` filters by category correctly
- [ ] `GET /api/blog?tag=value` filters by tag correctly
- [ ] `GET /api/blog?limit=6&offset=0` pagination works
- [ ] `GET /api/blog?orderBy=date&orderDir=desc` sorting works
- [ ] `GET /api/blog?featured=true` returns featured posts only
- [ ] `GET /api/blog?exclude=postId` excludes specific post
- [ ] `GET /api/blog` response includes: `posts[]` (with categories, author), `total`, `hasMore`
- [ ] `GET /api/blog/[slug]` returns single post with full content, categories, author
- [ ] `GET /api/blog/[slug]` returns 404 for non-existent or unpublished posts
- [ ] API is public (no auth required)

#### 2. TypeScript Types (src/lib/page-builder/types.ts)
- [ ] `WidgetType` includes: `"blog-post-grid"`, `"blog-post-carousel"`, `"blog-featured-post"`, `"blog-post-list"`, `"blog-recent-posts"`
- [ ] `WidgetCategory` includes `"blog"`
- [ ] `BlogPostGridWidgetSettings` interface exported
- [ ] `BlogPostCarouselWidgetSettings` interface exported
- [ ] `BlogFeaturedPostWidgetSettings` interface exported
- [ ] `BlogPostListWidgetSettings` interface exported
- [ ] `BlogRecentPostsWidgetSettings` interface exported
- [ ] Shared types exported: `BlogSectionHeader`, `BlogDataSource`, `BlogPostCard`

#### 3. Default Settings (src/lib/page-builder/defaults.ts)
- [ ] `DEFAULT_BLOG_POST_GRID_SETTINGS` exported with sensible defaults
- [ ] `DEFAULT_BLOG_POST_CAROUSEL_SETTINGS` exported with sensible defaults
- [ ] `DEFAULT_BLOG_FEATURED_POST_SETTINGS` exported with sensible defaults
- [ ] `DEFAULT_BLOG_POST_LIST_SETTINGS` exported with sensible defaults
- [ ] `DEFAULT_BLOG_RECENT_POSTS_SETTINGS` exported with sensible defaults

#### 4. Widget Registration (src/lib/page-builder/register-widgets.ts)
- [ ] `blog-post-grid` registered with component, settingsPanel, defaultSettings, icon, category="blog"
- [ ] `blog-post-carousel` registered
- [ ] `blog-featured-post` registered
- [ ] `blog-post-list` registered
- [ ] `blog-recent-posts` registered

#### 5. Frontend — Blog Post Grid Widget
- [ ] Fetches posts from `/api/blog` based on dataSource settings
- [ ] Grid layout renders with correct column count (1-4)
- [ ] Masonry layout renders with variable height cards
- [ ] Magazine layout renders (1-large + small cards pattern)
- [ ] Cards show: image, category badge, title, excerpt, meta, read more (all toggleable)
- [ ] Category filter tabs appear when enabled and filter posts on click
- [ ] Pagination works: Load More button / Numbered / Infinite scroll
- [ ] Skeleton loading shows while data is fetching
- [ ] Empty state shows when no posts found
- [ ] Hover effects work on cards (lift, shadow, scale, etc.)
- [ ] Image hover effects work (zoom, brighten, overlay, etc.)
- [ ] Section header renders with badge, heading, subheading, view all link
- [ ] Responsive: columns change per breakpoint (desktop/tablet/mobile)
- [ ] Post title links to `/blog/[slug]`

#### 6. Frontend — Blog Post Carousel Widget
- [ ] Renders horizontal carousel using Swiper.js
- [ ] Correct slides per view at each breakpoint
- [ ] Autoplay works (play, pause on hover)
- [ ] Navigation arrows appear and work
- [ ] Pagination dots/lines appear and work
- [ ] Loop (infinite) works
- [ ] Touch/swipe works on mobile
- [ ] Cards inside carousel match BlogPostCard design
- [ ] Section header renders correctly

#### 7. Frontend — Blog Featured Post Widget
- [ ] Fetches single post (latest / featured / specific / category-latest)
- [ ] Overlay layout: image with gradient overlay, text on top
- [ ] Split-left layout: image left, content right
- [ ] Split-right layout: image right, content left
- [ ] Stacked layout: image top, content below
- [ ] Category badge, title, excerpt, meta, read more all visible and toggleable
- [ ] Image hover effect works (zoom, parallax, ken-burns)
- [ ] Content reveal animation works when enabled
- [ ] Responsive layout (split → stacked on mobile)

#### 8. Frontend — Blog Post List Widget
- [ ] Renders vertical list with image beside text
- [ ] Image position: left, right, alternating all work
- [ ] Dividers appear between items when enabled
- [ ] Item hover effects work (highlight, shift-right, border-left)
- [ ] All card elements visible and toggleable (image, badge, title, excerpt, meta)
- [ ] Pagination works (load more / numbered)

#### 9. Frontend — Blog Recent Posts (Compact) Widget
- [ ] Renders compact list of recent posts
- [ ] All 5 styles work: title-only, title-date, title-meta, thumbnail, numbered
- [ ] Thumbnail shows correctly sized images
- [ ] Numbered style shows 01, 02, 03... prefix
- [ ] Header with optional underline renders
- [ ] "View All Posts" footer link works
- [ ] Date format (relative vs short) works

#### 10. Settings Panels (Admin)
- [ ] Blog Post Grid settings panel: data source, layout, card design, filter tabs, pagination, animation
- [ ] Blog Post Carousel settings panel: data source, carousel options, card design, navigation
- [ ] Blog Featured Post settings panel: data source, layout type, image, content, animation
- [ ] Blog Post List settings panel: data source, layout, item design, pagination
- [ ] Blog Recent Posts settings panel: data source, display style, header, footer link
- [ ] All settings changes reflect immediately in the page builder preview
- [ ] Data source "manual" mode allows picking specific posts

#### 11. Page Builder Integration
- [ ] "Blog" category appears in widget browser panel
- [ ] All 5 blog widgets appear under "Blog" category with correct icons
- [ ] Dragging a blog widget into a section works
- [ ] Widget renders preview in the page builder canvas
- [ ] Settings panel opens when clicking on a blog widget
- [ ] Saving the page persists blog widget settings
- [ ] Published page renders blog widgets with real data from API

#### 12. Cross-Cutting
- [ ] `npm run build` passes with no TypeScript errors
- [ ] All widgets work in both light theme (frontend) and dark theme (admin panel)
- [ ] No console errors in browser
- [ ] Blog widgets work inside any page (home, custom pages, not just blog page)
- [ ] Multiple blog widgets on the same page work independently
- [ ] Empty blog (0 posts) shows empty state, not broken UI

---

---

## Changelog

### v3.4 (2026-02-08)
- **Blog Widgets**: Complete specification for 5 blog widgets
  - Based on analysis of: Elementor, Webflow, Divi, Squarespace, Wix, WordPress Gutenberg, Framer
  - **Blog Post Grid**: Grid/Masonry/Magazine layouts, 1-4 columns, query builder (all/category/tag/featured/manual), category filter tabs, 4 pagination types, skeleton loading, hover effects, responsive
  - **Blog Post Carousel**: Swiper-based horizontal slider, autoplay, arrows/dots, coverflow effect, peek next slide on mobile
  - **Blog Featured Post**: 4 layouts (overlay/split-left/split-right/stacked), gradient overlay, Ken Burns, parallax, content reveal animation
  - **Blog Post List**: Vertical list with image left/right/alternating, dividers, shift/highlight hover effects
  - **Blog Recent Posts**: 5 compact styles (title-only, title-date, title-meta, thumbnail, numbered), footer/sidebar optimized
  - Shared types: BlogSectionHeader, BlogDataSource, BlogPostCard (DRY across widgets)
  - Public API requirement: GET /api/blog with filtering, pagination, sorting
  - New widget category: `"blog"` added to WidgetCategory
  - Implementation architecture with shared components (blog-card, blog-section-header, blog-filter-tabs, use-blog-data hook)

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

*Document Version: 3.4 - Blog Widgets (2026-02-08)*
