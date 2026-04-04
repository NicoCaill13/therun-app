# Design System Strategy: The Cinematic Athlete

## 1. Overview & Creative North Star
**Creative North Star: "Urban Kineticism"**

This design system is not a utility; it is a broadcast. It moves away from the polite, sterile layouts of traditional fitness trackers and embraces the raw, high-energy aesthetic of urban night running. The "Urban Kineticism" philosophy dictates that the UI should feel like a living, breathing part of the city—gritty, high-contrast, and relentlessly forward-moving.

We break the "template" look by using **Aggressive Asymmetry** and **Cinematic Scaling**. Layouts should feel like editorial spreads, where massive headlines bleed off the grid and photography is treated as a structural element rather than a decoration. We favor "The Big Reveal"—using high-resolution, low-light photography layered behind vibrant orange accents to create a sense of depth and atmospheric tension.

---

## 2. Colors: High-Voltage Contrast
The palette is built on a foundation of "Deep Space" blacks to make the "Athletic Orange" feel electric.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through background color shifts. Use `surface-container-low` for large section blocks sitting on a `surface` background. This creates a "molded" look rather than a "sketched" look.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical plates stacked in a dark room.
*   **Base:** `surface-dim` (#0e0e0e) for the deep background.
*   **Middle Layer:** `surface-container` (#1a1919) for secondary content blocks.
*   **Top Layer:** `surface-container-highest` (#262626) for interactive cards.
By nesting a `surface-container-highest` card inside a `surface-container-low` section, we create a sophisticated, tactile depth without a single line.

### The "Glass & Gradient" Rule
To capture the "Cinematic" feel, use **Liquid Gradients**. Main CTAs should transition from `primary` (#ff8f6f) to `primary-container` (#ff7851) at a 135-degree angle. Floating elements (like music controls during a run) must use `surface-variant` at 60% opacity with a `20px backdrop-blur` to create a "Smoked Glass" effect.

---

## 3. Typography: The Editorial Impact
We utilize a high-contrast pairing: the technical, wide-set **Lexend** for data and headlines, and the refined, humanistic **Manrope** for reading.

*   **Display-LG (Lexend, 3.5rem):** Reserved for "Hero Stats" (e.g., total miles). Use `-0.05em` letter spacing to make it feel dense and powerful.
*   **Headline-LG (Lexend, 2.0rem):** For screen titles. Embrace intentional asymmetry—align these to the far left or right, breaking the standard center-stack.
*   **Body-LG (Manrope, 1rem):** Used for instructional content. Increased line height (1.6) ensures readability against high-contrast backgrounds.
*   **Label-MD (Space Grotesk, 0.75rem):** Our "Technical Metadata" font. Use all-caps for labels like "HEART RATE" or "SPLITS" to evoke a stopwatch/instrumentation feel.

---

## 4. Elevation & Depth: Tonal Layering
We do not use "Drop Shadows" in the traditional sense. We use light to define form.

*   **The Layering Principle:** Instead of a shadow, use `surface-bright` (#2c2c2c) as a thin "inner glow" or a top-edge highlight to give an object a 3D metallic feel.
*   **Ambient Shadows:** If a card must float, use a shadow color of `#000000` with 40% opacity, but with a `64px` blur. This creates a soft, ambient "puddle" of darkness rather than a harsh edge.
*   **The "Ghost Border":** For interactive states (like a selected run type), use a 1px border using `outline-variant` (#494847) at **20% opacity**. It should be felt, not seen.
*   **Depth through Photography:** Use `surface-container-lowest` (#000000) gradients to fade photography into the UI, making the interface feel like it’s emerging from the shadows of the city.

---

## 5. Components: Built for Speed

### Buttons
*   **Primary:** Massive, full-width blocks. Background: `primary-fixed-dim` (#ff5d2b). Text: `on_primary_fixed` (#000000). Shape: `md` (0.375rem) for a sharp, aggressive look.
*   **Tertiary:** No background. Text: `primary`. Iconography should be "Heavy" weight to match the Lexend headers.

### Cards & Lists
*   **Rule:** **No Divider Lines.**
*   To separate list items (e.g., Recent Runs), alternate the background slightly between `surface-container` and `surface-container-high`, or use a `16px` vertical gap.
*   **Run Card:** A `surface-container-low` container with a `primary` vertical accent bar (4px wide) on the left edge to denote "Active" or "High Performance."

### Performance Gauges (Signature Component)
Instead of standard progress bars, use **Conic Gradients** using `primary` to `primary-dim`. This mimics the tachometer of a sports car, reinforcing the high-energy theme.

### Inputs
*   **States:** Default state uses `surface-container-highest`. On focus, the background remains, but the "Ghost Border" (outline) increases to 40% opacity. Label text moves to `label-sm` in `primary` color.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use "Over-sized" typography. If a stat is important, make it massive.
*   **DO** use high-resolution photography with a "Noir" or "Gritty" filter (low saturation, high contrast).
*   **DO** utilize the `full` roundedness scale for small pills/chips to contrast against the `md` roundedness of large containers.

### Don’t:
*   **DON'T** use 100% white (#ffffff) for long-form body text; use `on_surface_variant` (#adaaaa) to reduce eye strain in dark mode.
*   **DON'T** use centered layouts for everything. Push content to the edges to create an "Editorial" energy.
*   **DON'T** use standard Material Design blue for links. Everything interactive is Orange (#ff5722) or White.

---

## Upcoming Runs — Desktop screen (see `code.html`)

Platform-specific layout tokens that **differ from mobile** for this route:

*   **Hero display:** **~8rem** class display: both `UPCOMING` and `RUNS` on **`on_surface`** (#ffffff) — **italic**, aggressive negative tracking (“editorial bleed”). **No** orange-only second line like mobile.
*   **Subcopy:** `Body-LG`-scale paragraph under hero in `on_surface_variant` (full sentence, relaxed line height).
*   **Create Event:** **`primary_fixed_dim`** inline control with label + icon, aligned to **end** of the hero row (md/upper breakpoint), **not** a thumb-zone FAB.
*   **Events region:** **12-column grid**: **~8 columns** for a **featured** tall card (photo-forward, gradient scrim, status + calendar meta, oversized title, inline metadata row); **~4 columns** for a **vertical rail** of compact cards (status + time header, italic title, location line, host row).
*   **Rail cards:** Upper row splits **status pill** (left) and **time** (right, primary); title is editorial italic; location as uppercase metadata; organizer as `Host: …` — structurally lighter than mobile feed cards.
*   **Top nav:** Full-width sticky bar, secondary word links + primary “Get Started”-style CTA density — not the same as mobile’s compact top bar.