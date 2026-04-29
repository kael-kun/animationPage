# Design Guidelines

## 📖 Overview

An interactive, immersive landing page that visualizes a network of people connected by "thank you letters." Each person is represented as a node whose size scales with their letter count. Nodes are linked with animated electric/particle effects. Clicking a node triggers a smooth, cinematic transition to a detailed profile view.

## 📐 Layout & Structure

| Region             | Description                                                                                  |
| :----------------- | :------------------------------------------------------------------------------------------- |
| **Hero Canvas**    | Full-screen interactive WebGL/Canvas background housing the network visualization.           |
| **Header Overlay** | Minimal top bar: Logo, search/filter, toggle for dark/light mode, and reduced-motion switch. |
| **Legend/Scale**   | Bottom-left floating badge explaining node sizing (10px = 1 letter, etc.).                   |
| **Detail Panel**   | Right-side (or bottom on mobile) slide-up panel showing person details. Appears on click.    |
| **Fallback View**  | Mobile/tablet < 768px: auto-switches to a responsive card grid with static connections.      |

## 📊 Node Sizing & Data Mapping

To prevent visual dominance by outliers, use square-root or logarithmic scaling:

```javascript
// Example scaling logic
const getScale = (count) => Math.sqrt(count) * baseMultiplier;
```

| Letter Count Range | Visual Size                 | Glow Intensity             |
| :----------------- | :-------------------------- | :------------------------- |
| 1–10               | Small (12–22px)             | Subtle (20% opacity)       |
| 11–50              | Medium (23–40px)            | Medium (40% opacity)       |
| 51–150             | Large (41–64px)             | Strong (60–80% opacity)    |
| 151+               | Max (capped) + pulsing ring | High + animated outer halo |

## ✨ Animation & Particle Effects

### 🔗 Connection Lines & Electric Particles

- **Base Lines:** Thin semi-transparent curves (`stroke-opacity: 0.15`, `stroke-width: 1.5px`).
- **Electric Arcs:** Animated gradient strokes using `stroke-dasharray` + `stroke-dashoffset` keyframes.
- **Particle Travelers:** Small glowing dots (2–4px) that flow along paths at randomized speeds.

**Tech Approach:**

- Canvas/WebGL for performance (Three.js custom shaders or PixiJS particle containers).
- **Fallback:** SVG `<path>` + CSS `@keyframes` with `offset-path` for modern browsers.

```css
/* Example Dash Animation */
@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}
```

### 💫 Node Hover & Idle States

- **Idle:** Gentle breathing scale (`transform: scale(1.02)` every 4s).
- **Hover:** Outer glow expands, connection lines brighten, particles accelerate toward cursor.
- **Active/Selected:** Node scales to 1.3x, background dims, other nodes fade to 30% opacity.

## 🖱️ Interaction & Transition Flow

| Step | Action                 | Animation Spec                                                                                  |
| :--- | :--------------------- | :---------------------------------------------------------------------------------------------- |
| 1    | User hovers node       | ease-out 150ms, glow + cursor change                                                            |
| 2    | User clicks node       | 0.4s morph: node expands, camera zooms slightly, background blurs (`filter: blur(4px)`)         |
| 3    | Detail panel opens     | Slide from right `cubic-bezier(0.22, 1, 0.36, 1)`, staggered text fade-in (0.1s delay per line) |
| 4    | Close detail           | Reverse animation, network returns to idle state                                                |
| 5    | Keyboard/Screen Reader | Tab navigates nodes, Enter opens details, Esc closes                                            |

**GSAP Timeline Example (Pseudocode):**

```javascript
const tl = gsap.timeline();
tl.to(node, { scale: 1.3, duration: 0.4 }).to(
  ".detail-panel",
  { x: 0, ease: "expo.out" },
  "-=0.2",
);
```

## 🛠️ Tech Stack Recommendations

| Layer                | Recommended Tools                                                             |
| :------------------- | :---------------------------------------------------------------------------- |
| **Framework**        | React / Next.js or Vue / Nuxt                                                 |
| **Rendering**        | Three.js (WebGL) or PixiJS for particles; D3-force for layout                 |
| **Animation**        | GSAP + Framer Motion or CSS @keyframes + View Transitions API                 |
| **State Management** | Zustand / Pinia / Redux Toolkit                                               |
| **Performance**      | `requestAnimationFrame`, object pooling, IntersectionObserver, WebGL batching |

## ♿ Accessibility & Performance

| Concern             | Solution                                                                          |
| :------------------ | :-------------------------------------------------------------------------------- |
| **Reduced Motion**  | Detect `prefers-reduced-motion`, disable particle flow, replace with static lines |
| **Keyboard Nav**    | `tabindex="0"` on nodes, `aria-selected`, `role="button"`                         |
| **Screen Readers**  | Hidden `<ul>` with person names & counts, announced on focus                      |
| **Large Datasets**  | Cluster nearby nodes, use LOD, virtualize off-screen particles                    |
| **Mobile Fallback** | Disable WebGL, render static SVG network or card list with tap-to-expand          |

## 📝 Example Data Structure

```json
{
  "people": [
    {
      "id": "p1",
      "name": "Elena R.",
      "avatar": "/avatars/elena.jpg",
      "letterCount": 87,
      "details": {
        "role": "Community Lead",
        "bio": "...",
        "joined": "2023-02-14"
      }
    },
    {
      "id": "p2",
      "name": "Elena R.",
      "avatar": "/avatars/elena.jpg",
      "letterCount": 87,
      "details": {
        "role": "Community Lead",
        "bio": "...",
        "joined": "2023-02-14"
      }
    }
  ]
}
```

## 🎨 Visual Style Guide

| Element              | Value                                                                   |
| :------------------- | :---------------------------------------------------------------------- |
| **Background**       | `#0B0F19` (deep space navy)                                             |
| **Primary Accent**   | `#00E5FF` (electric cyan)                                               |
| **Secondary Accent** | `#A259FF` (violet glow)                                                 |
| **Text**             | `#F8FAFC` (primary), `#94A3B8` (secondary)                              |
| **Font**             | Inter, SF Pro, or Geist (sans-serif, variable weight)                   |
| **Node Border**      | 1.5px `rgba(255,255,255,0.2)` + outer glow box-shadow                   |
| **Easing**           | `cubic-bezier(0.25, 0.1, 0.25, 1)` for UI, `power2.inOut` for particles |

---

## 🚀 Enhanced Features (v2 Implementation)

This section documents additional features implemented beyond the initial vision, providing guidelines for AI replication.

### 🎯 Interactive Node Dragging

| Feature | Implementation |
| :------ | :-------------- |
| **Trigger** | `onMouseDown` event on node `<g>` element |
| **Mechanism** | Set node `fx` and `fy` properties (d3-force fixed position) |
| **Movement** | Global `window.addEventListener('mousemove')` updates position |
| **Boundaries** | Clamp to 50px from edges: `Math.max(50, Math.min(width - 50, x))` |
| **Release** | Clear `fx`/`fy` to null, simulation continues naturally |
| **Alpha Boost** | `simulation.alpha(0.3).restart()` on drag start for responsiveness |

**Code Pattern:**
```javascript
onMouseDown={(e) => {
  e.preventDefault();
  node.fx = node.x;
  node.fy = node.y;
  simulation.alpha(0.3).restart();
  draggingRef.current = node.id;
}}
```

### ✨ Drag Trail Effect

When dragging a node, spawn trailing particles behind it:
- **Particle count**: Keep last 20 positions
- **Animation**: Fade out over 0.4s with shrinking size (6px → 1px)
- **Color**: `#00E5FF` (cyan) with CSS animation `trailFade`

### ⚡ Energy Wave on Release

When releasing a dragged node, emit a ripple through connected nodes:
- **Trigger**: `mouseup` event with connected nodes check
- **Animation**: Expand from 50px to 250px radius over 1s
- **Color**: Purple (`#A259FF`) if has connections, cyan if none
- **CSS Animation**: `energyExpand` keyframe

### 🔗 Enhanced Connection Highlighting

When hovering a node, connected nodes receive special styling:
- **Glow**: Increase `.node-glow` opacity to 80%
- **Border**: Add 3px cyan stroke to connected nodes
- **Dimming**: Non-connected, non-selected nodes dim to 30% opacity

**CSS Pattern:**
```css
.node.connected .node-glow {
  opacity: 0.8 !important;
  filter: drop-shadow(0 0 15px var(--accent-primary));
}
```

### 🌊 Background Canvas Effects

#### Floating Particles (50 dots)
- **Size**: 1-3px radius
- **Movement**: Slow drift (0.3px per frame)
- **Opacity**: 0.1-0.4 (randomized)
- **Color**: `#00E5FF`

#### Floating Orbs (8 large)
- **Size**: 40-100px radius
- **Movement**: Very slow drift (0.15px per frame)
- **Gradient**: Radial gradient with hue 170-230 (cyan to blue range)
- **Opacity**: Very subtle (0.03 at center, fading to transparent)

#### Pulsing Grid
- **Pattern**: 40px grid using CSS gradients
- **Animation**: Subtle breathing (40px → 42px → 40px over 8s)
- **Opacity**: 3% to avoid distraction

### 💫 Continuous Node Movement

The network simulation runs continuously (not just initially):

| Setting | Value | Effect |
| :------- | :----- | :------ |
| `alphaDecay` | 0.005 | Very slow decay for ongoing movement |
| `velocityDecay` | 0.2 | Smooth, natural deceleration |
| Center force | 0.05 | Gentle attraction to center |
| X/Y forces | 0.01 | Subtle directional pull |
| Collision radius | `size + 15` | Prevent overlap |

**Pulse Animation**: Every 3 seconds, apply small random velocity to all nodes:
```javascript
setInterval(() => {
  nodes.forEach(node => {
    const angle = Math.random() * Math.PI * 2;
    node.vx += Math.cos(angle) * 0.5;
    node.vy += Math.sin(angle) * 0.5;
  });
  simulation.alpha(0.1).restart();
}, 3000);
```

### 🎯 Double-Click Focus Feature

- **Single click**: Select node, show detail panel
- **Double click**: Toggle "focus" mode
  - Focused node: Full opacity, pulsing glow
  - Other nodes: Dim to 30% opacity
  - Click focused node again or click elsewhere to unfocus

### 🎨 Tier-Based Particle Colors

Particles on connection lines now match node tier colors:

| Tier | Color | Hex |
| :---- | :----- | :--- |
| Bronze | Orange | `#FF9800` |
| Silver | Cyan | `#00BCD4` |
| Gold | Purple/Pink | `#A259FF` / `#E91E63` |

### 🖱️ Edge Boundary Feedback

When dragging node near canvas edge:
- **Effect**: Body box-shadow flashes cyan
- **Threshold**: 55px from edge
- **Duration**: 150ms flash

### 🎭 State Management (Zustand)

All interactive state managed via Zustand store:

```javascript
const useStore = create((set) => ({
  selectedNode: null,
  hoveredNode: null,
  reducedMotion: false,
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  selectNode: (id) => set({ selectedNode: id }),
  setHoveredNode: (id) => set({ hoveredNode: id }),
}));
```

### ♿ Reduced Motion Support

All animations respect `prefers-reduced-motion`:
- Background canvas: Disabled
- Link particles: Disabled
- Node breathing: Disabled
- Hover/selection effects: Disabled
- Drag trails: Disabled
- Energy waves: Disabled
- Grid pulse: Disabled

**Detection:**
```javascript
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mediaQuery.matches) {
  useStore.getState().toggleReducedMotion();
}
```

---

## 📁 Implementation Files

| File | Purpose |
| :---- | :------- |
| `src/components/NodeNetwork.jsx` | Main visualization, d3-force simulation, all interactions |
| `src/App.css` | All animations, styling, keyframes |
| `src/stores/useStore.js` | Zustand state management |
| `src/data/people.js` | Person data + connection definitions |

---

## 🔧 AI Prompt Template for Replication

When prompting an AI to recreate this project, use:

```
Create a React interactive node network visualization with:
1. D3-force continuous simulation (alphaDecay: 0.005, velocityDecay: 0.2)
2. Canvas background with 50 floating particles + 8 gradient orbs
3. SVG nodes with avatars, tier-based colors (bronze/silver/gold)
4. Link particles flowing along connections
5. Hover: burst effect on nodes with 50+ letters
6. Click: selection ripple on nodes with 150+ letters
7. Drag: custom drag with trail particles and edge boundary flash
8. Release: energy wave propagating to connected nodes
9. Hover connected: nodes glow brighter, non-connected dim
10. Double-click: focus mode (dim others)
11. All animations disabled when prefers-reduced-motion is true
12. Zustand for state management
```

---

## 📋 Changelog

| Version | Date | Changes |
| :------- | :--- | :------- |
| 1.0 | Initial | Basic node network with detail panel |
| 2.0 | +Features | All enhanced features documented in this section | |
