# Downtown Perks — Codex Design & Quality Specification
> Complete instructions for any AI coding assistant working on this codebase.
> Every rule below applies to **every file, every component, every page, every piece of copy**.
> No exceptions. No partial compliance. When in doubt, over-conform.

---

## 1. The Non-Negotiables

Before touching any file, internalize these four principles:

1. **One visual language.** Every pixel comes from the token system defined below. No arbitrary hex codes, no one-off font sizes, no improvised shadows.
2. **Words people actually use.** Every string a user reads is written in plain English. No jargon, no tech speak, no passive voice, no filler.
3. **Media earns its place.** Every image, icon, and video is directly relevant to its context. Nothing decorative for decoration's sake.
4. **Fully wired means fully wired.** No placeholder buttons, no `console.log` CTAs, no `TODO` comments in shipped code. Every interactive element does exactly what it says.

---

## 2. Design Token Reference

All styling must come from these tokens. They live in `src/index.css` and `src/lib/design-system.js`. **Never hardcode a color, font, or shadow that conflicts with these.**

### 2.1 Colors

| Token | Value | Use for |
|---|---|---|
| `--dp-navy` | `#0B1F33` | Primary text, filled buttons, strong UI chrome |
| `--dp-gold` | `#C8A96A` | Selected states, focus rings, accents, active indicators |
| `--dp-border` | `rgba(11,31,51,0.08)` | All card and container borders |
| `--dp-border-hover` | `rgba(11,31,51,0.10)` | Border on hover |
| `--dp-placeholder` | `rgba(11,31,51,0.38)` | Input placeholder text |
| `--dp-muted` | `#425466` | Secondary body text, captions |

**Gold usage rules:**
- Gold is an accent only — never a fill for large surfaces
- Use it for: active tab indicators, focus rings, "live" status dots, saved-state button fills, perk/value highlights
- Never use gold as a background for blocks of body text

**Opacity shortcuts for navy** (use these instead of arbitrary rgba values):

| Tailwind class | Opacity | Use for |
|---|---|---|
| `text-[#0B1F33]` | 100% | Primary headings, labels |
| `text-[#0B1F33]/72` | 72% | Body text |
| `text-[#0B1F33]/62` | 62% | Secondary body |
| `text-[#0B1F33]/50` | 50% | Captions, metadata |
| `text-[#0B1F33]/44` | 44% | Form labels (uppercase) |
| `text-[#0B1F33]/40` | 40% | Placeholder equivalents |

### 2.2 Typography

Two fonts only. Do not import or reference any other font.

| Font | Variable | Use for |
|---|---|---|
| Instrument Serif / Playfair Display | `font-heading` | Hero headlines, section titles, editorial callouts |
| Inter | `font-body` (default) | All UI copy, body text, labels, navigation |

**Type scale — use exactly these sizes:**

```
Hero headline:     text-4xl md:text-6xl  font-heading font-medium leading-[1.05]
Section headline:  text-3xl md:text-4xl  font-heading font-medium leading-[1.1]
Card headline:     text-lg md:text-xl    font-heading font-medium leading-[1.2]
Body large:        text-[15px] md:text-base  leading-[1.7]
Body standard:     text-[14px]           leading-[1.7]
Body small:        text-[13px]           leading-[1.65]
UI standard:       text-[13px]           font-medium
UI small:          text-[12px]           font-medium
Label (uppercase): text-[11px]           font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/44
Eyebrow:           text-[10.5px]         font-semibold uppercase tracking-[0.14em] text-[#C8A96A]
```

**Prohibited:**
- `text-xs`, `text-sm`, `text-base` etc. (use explicit px sizes instead for precision)
- `font-bold` on body copy (use `font-semibold` max)
- `tracking-tight` or `tracking-wider` — use explicit `tracking-[-0.02em]` for headlines, `tracking-[0.04em]` for buttons

### 2.3 Border Radius

Use these values. Never use `rounded`, `rounded-md`, `rounded-xl`, `rounded-2xl` etc. without converting:

| Context | Value |
|---|---|
| Buttons, inputs, selects | `rounded-[7px]` |
| Cards, panels, drawers | `rounded-[10px]` |
| Large cards, modals, form containers | `rounded-[12px]` |
| Icon badges, avatar containers | `rounded-[10px]` |
| Status badges, pills, chips | `rounded-full` |
| Map pins | `rounded-[4px]` |

### 2.4 Shadows

Only use these shadow definitions. Mix-and-match levels, don't invent new ones.

```
Resting card:    shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)]
Elevated card:   shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)]
Primary button:  shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)]
Button hover:    shadow-[0_4px_14px_rgba(11,31,51,0.22),0_10px_24px_rgba(11,31,51,0.14)]
Form container:  shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]
```

### 2.5 Spacing

Use the system from `src/lib/design-system.js`. Key values:

```
Section vertical:    py-14 md:py-20
Hero vertical:       py-20 md:py-24
Page horizontal:     px-6 md:px-8
Container max:       max-w-6xl mx-auto
Card gap standard:   gap-4
Card internal pad:   p-5
```

### 2.6 Z-Index Layers

```
Map base:       z-[0]    (--z-map)
Map controls:   z-[10]   (--z-map-controls)
Navbar:         z-[100]  (--z-nav)
Overlay:        z-[200]  (--z-overlay)
Drawer:         z-[300]  (--z-drawer)
Toast:          z-[400]  (--z-toast)
```

Never use `z-50`, `z-10`, `z-20` etc. Use these exact values.

---

## 3. Component Standards

### 3.1 Buttons

**Always use `<Button>` from `src/components/ui/button.jsx`.** Do not write raw `<button>` elements in page/section components unless inside a tightly scoped sub-component (e.g. form submit inside a contained form function).

When you must write a raw button (e.g. inline icon action), use this exact pattern:

```jsx
// Primary action button
<button className="inline-flex items-center gap-2 px-4 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(11,31,51,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">

// Secondary / outline button
<button className="inline-flex items-center gap-2 px-4 h-9 rounded-[7px] border border-[rgba(11,31,51,0.10)] bg-white text-[12.5px] font-semibold text-[#0B1F33]/62 transition-all duration-150 hover:-translate-y-px hover:border-[rgba(11,31,51,0.16)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">

// Ghost / icon button
<button className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-[#0B1F33]/50 hover:bg-[rgba(11,31,51,0.06)] hover:text-[#0B1F33] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
```

**Button copy rules:**
- Use sentence case: "Save changes" not "Save Changes"
- Be specific: "Add perk" not "Submit", "Save profile" not "Save", "Get directions" not "Go"
- Loading state: replace text only, keep same dimensions — "Saving…" not a spinner overlay
- Disabled: `disabled:opacity-50 disabled:pointer-events-none` — never just grey text

**Button sizes:**
- Default workspace/form actions: `h-9` (36px)
- Navigation / hero CTAs: `h-10` (40px) or `h-11` (44px)
- Inline icon-only: `h-7 w-7` or `h-8 w-8`
- Minimum tap target on mobile: 44px — use padding to expand if needed

### 3.2 Cards

**Always use `<Card>` from `src/components/ui/card.jsx`** for content cards. The Card component renders:
```
bg-white border border-[rgba(11,31,51,0.07)] rounded-[10px]
shadow-[0_2px_8px_rgba(11,31,51,0.04),0_8px_24px_rgba(11,31,51,0.05)]
```

For list item rows (not full cards), use this pattern:
```jsx
<div className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
```

For inline form containers:
```jsx
<div className="p-6 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]">
```

**Never use:**
- `bg-card/40` (semi-transparent card — always solid white)
- `bg-primary/5` (navy tint for containers — always white or `#F7F8FB`)
- `rounded-xl`, `rounded-2xl`, `rounded-3xl` (use `rounded-[10px]` or `rounded-[12px]`)
- `border-border/50` (use `border-[rgba(11,31,51,0.07)]`)

### 3.3 Form Inputs

Every `<input>`, `<select>`, and `<textarea>` must use this style:

```jsx
// Input
<input className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors placeholder:text-[#0B1F33]/25" />

// Select
<select className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors" />

// Textarea
<textarea className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors resize-none placeholder:text-[#0B1F33]/25" />
```

Form labels always use:
```jsx
<label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">
```

**Never use:**
- `bg-muted/30` for inputs
- `rounded-lg` for inputs (use `rounded-[7px]`)
- `focus:border-primary/40` (use `focus:border-[rgba(200,169,106,0.5)]`)

### 3.4 Status Badges and Pills

All status indicators must be `rounded-full` pill badges. Never `rounded-[2px]` or `rounded-sm`.

```jsx
// Active / live (gold)
<span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-[rgba(200,169,106,0.1)] text-[#8B6B2F] border-[rgba(200,169,106,0.3)]">Active</span>

// Neutral / upcoming (soft navy)
<span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-[rgba(11,31,51,0.05)] text-[#0B1F33]/60 border-[rgba(11,31,51,0.12)]">Upcoming</span>

// Muted / inactive
<span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/40 border-[rgba(11,31,51,0.08)]">Past</span>
```

Status indicator dots:
```jsx
// Live / active dot (with glow)
<span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] shadow-[0_0_4px_rgba(200,169,106,0.5)]" />

// Neutral dot
<span className="w-1.5 h-1.5 rounded-full bg-[rgba(11,31,51,0.2)]" />
```

### 3.5 Loading Spinners

Always circular. Never square or rounded-corner.
```jsx
<div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
```

For full-page loading:
```jsx
<div className="flex items-center justify-center py-16">
  <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
</div>
```

### 3.6 Empty States

All empty states follow this structure — gold icon badge, clear headline, short body, primary CTA:
```jsx
<div className="text-center py-16 px-4">
  <div className="w-12 h-12 rounded-[10px] border border-[rgba(200,169,106,0.25)] bg-[rgba(200,169,106,0.07)] flex items-center justify-center mx-auto mb-4 shadow-[0_2px_8px_rgba(200,169,106,0.1)]">
    <Icon className="w-5 h-5 text-[#C8A96A]" />
  </div>
  <h3 className="mb-1.5 text-[15px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{headline}</h3>
  <p className="text-[13px] text-[#0B1F33]/50 mb-6 max-w-sm mx-auto leading-relaxed">{body}</p>
  {/* Primary action button */}
</div>
```

### 3.7 Navigation

**Navbar** (`src/components/Navbar.jsx`):
- Height: `h-[64px]` — do not change
- Background: `bg-white/92 backdrop-blur-[12px]` with `border-b border-[rgba(11,31,51,0.06)]`
- Logo: always navy `#0B1F33` mark + "Downtown Perks" in `font-heading`
- Desktop nav links: `text-[13px] font-medium text-[#0B1F33]/68 hover:text-[#0B1F33] transition-colors`
- Active nav link: `text-[#0B1F33] font-semibold`
- Hamburger: `md:hidden` only — desktop navigation is always horizontal links
- Mobile menu: opens below navbar at `top-[64px]`, white bg, same border pattern

**Tab navigation within pages:**
- Use Framer Motion `layoutId` for the animated active indicator — a gold underline that slides
- Tab button: `text-[13px] font-medium` base, `font-semibold text-[#0B1F33]` when active
- The `layoutId` indicator: `bg-[#C8A96A] h-[2px] rounded-full absolute bottom-0`
- Never use a static `border-b-2 border-primary` for active tabs

### 3.8 Section Headers

All major sections use this pattern:
```jsx
<div className="mb-8 md:mb-10">
  {/* Optional eyebrow */}
  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] mb-2">{eyebrow}</p>
  <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.1] text-[#0B1F33]">{headline}</h2>
  {/* Optional subheadline */}
  <p className="mt-3 text-[15px] text-[#0B1F33]/62 leading-[1.7] max-w-2xl">{subheadline}</p>
</div>
```

### 3.9 Page Backgrounds

| Context | Background |
|---|---|
| Marketing pages (home, landing, partner pages) | `bg-white` |
| App/workspace pages | `bg-[#F7F8FB]` |
| Map contexts | `bg-[#E8ECF0]` (Leaflet default) |
| Dark sections (hero areas, proof blocks) | `bg-[#0B1F33]` |

Never use `bg-background`, `bg-muted`, `bg-secondary` for page backgrounds — use the explicit values above.

### 3.10 Motion and Animation

All animation uses Framer Motion. Import from `framer-motion`. Do not use CSS `@keyframes` for entrance animations — only for continuous effects (e.g. `animate-spin`, `animate-pulse`).

**Standard patterns (use these, don't invent new ones):**

```jsx
// Section reveal (scroll-triggered)
<motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
>

// Card/item staggered reveal
<motion.div
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
>

// Drawer / panel entrance
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 12 }}
  transition={{ duration: 0.3 }}
>

// Tab indicator (layoutId spring)
<motion.div
  layoutId="[unique-scope-id]-tab-indicator"
  transition={{ type: "spring", stiffness: 500, damping: 40 }}
/>
```

**Rules:**
- All `AnimatePresence` must wrap conditional renders that mount/unmount
- Never animate `width` or `height` directly — use `scaleX`/`scaleY` or `layoutId`
- Duration: 150–200ms for micro-interactions, 300–450ms for reveals, never more than 600ms

---

## 4. Plain Language Writing Standards

Every string of copy a user reads must pass these tests before it ships.

### 4.1 The Core Rules

**1. Say exactly what it does.** If a button saves their work, say "Save changes." Not "Submit," not "Confirm," not "Update."

**2. Use the same words your users use.** Test: would a non-technical person say this out loud? If not, rewrite it.

**3. Shorter is always better.** If you can remove a word without losing meaning, remove it.

**4. Active voice.** "Your perk is live on the map" not "The perk has been activated."

**5. No product jargon in user-facing copy.** Words like "entity," "payload," "component," "module," "instance," "boolean," "toggle state," "sync" — if it belongs in code, it does not belong in copy.

### 4.2 Common Rewrites

| ❌ Don't write | ✅ Write instead |
|---|---|
| "Submit" | "Save changes" / "Create perk" / "Book now" |
| "Loading..." | "Finding spots nearby…" / "Getting your perks…" |
| "An error occurred" | "Something went wrong — try again" |
| "No data available" | "Nothing here yet" |
| "Toggle visibility" | "Show on map" / "Hide from map" |
| "Configure your settings" | "Set up your profile" |
| "This feature is not currently available" | "Coming soon" |
| "Authentication required" | "Sign in to continue" |
| "Your session has expired" | "You've been signed out — sign back in" |
| "Invalid input" | "Check this field and try again" |
| "Venue entity" | "Venue" |
| "RSVP count" | "People going" |
| "Member-gated content" | "Members only" |
| "Onboarding flow" | "Getting started" |
| "Select a category" | "What type is this?" |
| "Filter by parameter" | "Filter by" |

### 4.3 Placeholder and Helper Text

- Placeholders show an example, not a label: `"e.g. 15% off all drinks"` not `"Enter value"`
- Helper text is one sentence: `"Shown on the downtown map to people nearby."`
- Error messages tell them what to fix: `"Add a title to continue"` not `"This field is required"`

### 4.4 Headings and Eyebrows

- Eyebrows (uppercase labels above headlines): 3–5 words, all caps, gold — e.g. `"FOR VENUES"`, `"MEMBER PERKS"`, `"YOUR SPOT ON THE MAP"`
- Headlines: sentence case, no period — `"Everything worth doing downtown"`
- Subheadlines: one or two sentences max, 16–20 words ideal

### 4.5 Empty States

- Headline: friendly, not apologetic — `"No events yet"` not `"You haven't created any events"`
- Body: what they'll get when they act — `"Add your first event and it will appear on the map."` not `"There are currently no events associated with this account."`
- CTA: the exact action — `"Add an event"` not `"Get started"`

### 4.6 Confirmation and Feedback

- Success: brief, specific — `"Saved"` (with check icon), `"Perk is live"`
- Destructive confirm: explain the consequence — `"Delete this perk? It'll be removed from the map."` not `"Are you sure?"`
- Progress: use present continuous — `"Saving…"` `"Creating perk…"` `"Getting directions…"`

---

## 5. Media, Images, and Video

### 5.1 The Standard: Contextual Relevance

Every image, video, icon, and illustration must be directly and obviously connected to the content it accompanies. Ask: **if this image disappeared, would the user notice something was missing?** If the answer is no, remove the image.

### 5.2 Images

**What qualifies:**
- A photo of the actual venue, event, or location shown in a venue/event card
- A real person testimonial paired with their actual name and role
- A map screenshot or UI mockup demonstrating an actual feature
- A photo of downtown Austin that is geographically and contextually accurate for this product
- Brand logos for named partner brands (Four Seasons, Equinox, Lululemon, etc.) — only official assets

**What doesn't qualify:**
- Generic stock photos of "people using phones" or "business handshakes"
- Abstract gradient images used as section backgrounds with no content relationship
- Photos of cityscapes that are not Austin
- Images that repeat across multiple sections for different content

**Technical requirements:**
- All images: `alt` attribute describing what is shown (not "image" or "photo")
- Images in cards: use `object-cover` with a defined `aspect-ratio`
- Hero images: ensure sufficient contrast for text overlaid on top (overlay if needed)
- Lazy load all images below the fold: `loading="lazy"`

**Placeholder pattern** (when real image is unavailable):
```jsx
<div className="relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F0F3F7] via-[#F7F8FB] to-[#EEF1F6]">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(200,169,106,0.08),transparent_60%)]" />
  <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-[#0B1F33] text-[#C8A96A] shadow-[0_12px_32px_rgba(11,31,51,0.18)]">
    <Icon className="w-6 h-6" />
  </div>
</div>
```

### 5.3 Icons

- Icon library: Lucide React only (`lucide-react`) — do not import from other icon sets
- Size in text contexts: `w-3.5 h-3.5` (14px) for inline, `w-4 h-4` (16px) for standalone
- Size in badges/decorative: `w-5 h-5` (20px)
- Icon color must match surrounding text color — never a different color than its label
- Exception: status icons (e.g. gold star for saved, gold dot for live) may use accent color

### 5.4 Video

- Every video must have a clear play button with a label describing what it shows
- Autoplay only for muted ambient loops — never for content the user needs to hear
- Every autoplaying video must have `muted` and `playsInline` attributes
- Provide a still frame thumbnail that shows meaningful content, not a black frame
- If a video is testimonial or demo content, accompany it with a text caption

---

## 6. Functional Completeness

Every interactive element must do what it says. This section defines what "wired" means.

### 6.1 The Completeness Checklist

Before marking any component or page as done, verify every item:

**Buttons and CTAs:**
- [ ] Click handler is attached and does exactly what the label says
- [ ] Loading state shown during async actions (text changes to "Saving…", button disabled)
- [ ] Success feedback shown after completion (toast, text change, or visual confirmation)
- [ ] Error state handled — user sees a friendly message, not a blank failure
- [ ] Disabled state visually distinct and not just greyed text

**Forms:**
- [ ] All required fields validated before submit
- [ ] Validation errors shown inline, adjacent to the field they reference
- [ ] Form submits to the correct data function (`createWorkspaceItem`, `updateWorkspaceItem`, etc.)
- [ ] Saving state: button text changes, form inputs disabled
- [ ] Saved state: success feedback visible (check icon, toast, or text confirmation)
- [ ] Cancel button closes/resets the form without saving anything
- [ ] Form clears after successful save

**Navigation:**
- [ ] Every nav link routes to an existing, rendered page
- [ ] Active state shown for current route
- [ ] Back button/close button returns user to the previous state, not a blank screen
- [ ] Mobile menu closes after navigation

**Lists and data views:**
- [ ] Empty state shown when list has no items
- [ ] Loading state shown while data fetches
- [ ] Error state shown if fetch fails (with retry option)
- [ ] Edit action opens correct item pre-filled
- [ ] Delete action has confirmation and actually removes the item from both state and storage
- [ ] After add/edit/delete, the list refreshes to reflect the change

**Modals and drawers:**
- [ ] Open/close animation uses Framer Motion `AnimatePresence`
- [ ] ESC key closes the modal
- [ ] Clicking outside the modal closes it (for non-critical actions)
- [ ] Focus is trapped inside the modal while open
- [ ] Scroll is locked on the background while modal is open

**Map interactions:**
- [ ] Pin click opens the detail drawer with correct entity data
- [ ] Drawer close returns to results panel without losing map state
- [ ] Directions button opens Google Maps with correct coordinates
- [ ] Save/unsave button updates state immediately (optimistic update)
- [ ] Filter chips update map results in real time

### 6.2 Data Wiring Patterns

The app uses these data functions from `src/api/entities.js`. Use the correct one for each operation:

```
listWorkspaceItems("Perk" | "Event", "perks" | "events", user.email)   → fetch list
createWorkspaceItem("Perk" | "Event", "perks" | "events", user.email, data)  → create
updateWorkspaceItem("Perk" | "Event", "perks" | "events", user.email, id, data)  → update
deleteWorkspaceItem("Perk" | "Event", "perks" | "events", user.email, id)  → delete
```

After every mutation (create/update/delete), call `load()` to refresh the list. Do not manually update state arrays — always reload from source.

### 6.3 State Management

- Map state: `src/store/unified-map-store.js` (Zustand)
- Resident app: `src/store/resident-store.js`
- Local workspace state (perks, events): `useState` + localStorage via `getStoredItems` / `saveStoredItems`
- Do not create new stores for per-page state — use `useState` and `useReducer`

### 6.4 Error Handling

Every async operation must have a `try/catch`. Errors must be caught and surfaced:

```jsx
// Pattern for data loading
const load = () => {
  setLoading(true);
  fetchData()
    .then(data => { setItems(data || []); setLoading(false); })
    .catch(() => {
      setItems(getFallbackData()); // use local storage fallback
      setLoading(false);
      // optionally: setError(true) to show error state
    });
};
```

Never `console.error` without also showing the user something useful.

---

## 7. Page and Section Structure

### 7.1 Marketing Pages

Every marketing page (`Home`, `Landing`, `ForBuildings`, partner pages) follows this structure:

1. **Hero** — headline, subheadline, 1–2 CTAs, relevant visual. No more than 3 elements.
2. **Social proof** — logos, stats, or a single strong testimonial
3. **Value proposition** — 3 cards maximum, each with icon, headline, and 1-sentence description
4. **How it works** — numbered steps (3–4 max), plain language
5. **Proof / results** — real data, real names, real numbers. No fake metrics.
6. **CTA** — repeat the primary action with a reason to act now

**Rules:**
- No more than one primary CTA button per visible viewport
- Secondary CTAs are ghost/outline variant, smaller size
- Section spacing: `py-14 md:py-20` between sections
- Every section has a unique `id` for anchor links

### 7.2 App Pages (Workspace, Dashboard, Map)

App pages are functional, not editorial. Layout rules:

1. **Page header** — title, optional subtitle, primary action (top right)
2. **Content area** — `bg-[#F7F8FB]` background, cards/lists with `bg-white`
3. **Tab navigation** — when multiple views exist, use animated tab indicator
4. **Content** — cards at `rounded-[10px]` with proper shadow, consistent padding

No hero sections, no marketing prose, no decorative gradients in app pages.

### 7.3 The Map

The map is the product's core UI. Treat it as sacred:
- Map fills the full available height below the navbar
- Never put opaque elements over the map that aren't in the drawer/panel layer
- Map pins use `src/lib/map/entityPinResolver.js` — never hardcode pin styles
- Results panel is on the left on desktop, slides up from bottom on mobile
- Detail drawer replaces results panel (not overlays it) on pin click

---

## 8. Enforcement: How to Self-Check Your Work

Before submitting any change, run through this checklist:

### Visual Consistency
- [ ] Every color comes from the token list in Section 2.1 — no arbitrary hex values
- [ ] Every border radius matches the table in Section 2.3
- [ ] Every shadow matches the list in Section 2.4
- [ ] Typography uses only the scale in Section 2.2
- [ ] Buttons use the variants from Section 3.1

### Copy Quality
- [ ] Every piece of user-facing text passes the "would a non-technical person understand this?" test
- [ ] No field is labelled "Submit" — it says what it does
- [ ] Empty states have headlines, body copy, and a CTA
- [ ] Error messages tell the user what to do, not what went wrong technically

### Media
- [ ] Every image has a descriptive `alt` attribute
- [ ] Every image is relevant to the content it accompanies
- [ ] No generic stock photos
- [ ] Videos have `muted`, `playsInline` if autoplaying

### Functional Completeness
- [ ] Every button has an `onClick` or `type="submit"` — no dead buttons
- [ ] Every form has validation and both success + error handling
- [ ] Every loading state has a visible indicator
- [ ] Every list has loading, empty, and error states
- [ ] Every modal/drawer can be closed (ESC, click outside, or explicit close button)

### Code Quality
- [ ] No `console.log` in any component
- [ ] No `TODO` comments in shipped code
- [ ] No unused imports
- [ ] All async functions have `try/catch`
- [ ] No hardcoded user data, IDs, or mock objects in production components

---

## 9. Quick Reference Card

```
Primary color:     #0B1F33 (navy)
Accent color:      #C8A96A (gold)
Page bg (app):     #F7F8FB
Page bg (mktg):    #FFFFFF
Border:            rgba(11,31,51,0.08)
Border hover:      rgba(11,31,51,0.10)

Button radius:     rounded-[7px]
Card radius:       rounded-[10px]
Form container:    rounded-[12px]
Pills/badges:      rounded-full

Heading font:      font-heading (Instrument Serif / Playfair)
Body font:         Inter (default)

Nav height:        h-[64px]
Bottom nav height: 84px (--dp-bottom-nav-h)

Transition fast:   duration-150 ease-out
Transition smooth: duration-300

Focus ring:        focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50
```

---

*Last updated: June 2026. Maintained alongside `src/lib/design-system.js` and `src/index.css`.*
*Any conflict between this document and those files: this document wins on principles, the code files win on specific token values.*
