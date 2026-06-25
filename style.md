# Liquid Round Design System

This document outlines the visual philosophy, design tokens, color palette, typography guidelines, and component specifications for the **Flowtime** ("Liquid Round") application. 

---

## 🌸 Visual Philosophy: "Liquid Roundness"
The design system marries extreme geometric softness with high-contrast functional clarity. It is custom-tailored for users seeking a "Minimal Zen" productivity experience that feels organic and fluid rather than cold, mechanical, or rigid.

### Core Principles
1. **Geometric Softness**: Sharp corners are completely avoided. Pill shapes and highly rounded corners (`3rem` or `9999px`) dominate the geometry to mimic natural, flowing water droplets.
2. **Solid Opaque Planes**: Instead of standard glassmorphism effects, layers are represented by pure, solid opaque colors with soft ambient shadows to convey tactile physical height.
3. **High-Contrast State Signaling**: Visual cues are immediate and binary. The interface adapts instantly to the user's focus state (Focus Red vs. Rest Green).

---

## 🎨 Color Tokens
The color palette is divided into highly functional colors designed to guide the eye and represent state changes dynamically.

| Token | Hex Value | Application / Meaning |
| :--- | :--- | :--- |
| **Focus Red (Primary)** | `#b3272e` | Active work sessions, core focus indicators, high-energy operations |
| **Focus Container** | `#ff5f5f` | Highlight badges, tags, and active background tabs in Work phase |
| **Rest Green (Secondary)**| `#006d3e` | Break periods, water trackers, recovery state signaling |
| **Rest Container** | `#1fff9b` | Background accents for active Break tabs or resting cards |
| **Level 0 (Background)** | `#f9f9f9` | The lowest background canvas plane |
| **Level 1 (Card/Surface)** | `#ffffff` | Elevated primary cards and container blocks |
| **Content Primary** | `#1a1c1c` | High legibility text, headings, and labels |
| **Content Secondary** | `#59413f` | Descriptive labels, secondary texts, and placeholder prompts |

---

## ✍️ Typography Guidelines
A dual-font pairing strategy is used to maintain structural hierarchy and readable clarity.

### 1. Headings & Displays (**Sora**)
- **Aesthetic**: Geometric, futuristic, and wide circular proportions.
- **Usage**: Used for main headers, timer numerals, and primary numbers.
- **Token Specifications**:
  - `display-lg`: `48px` (Line Height `56px`, Weight `700`, Letter Spacing `-0.02em`)
  - `display-lg-mobile`: `36px` (Line Height `42px`, Weight `700`, Letter Spacing `-0.02em`)
  - `headline-md`: `24px` (Line Height `32px`, Weight `600`)

### 2. Body & Technical Labels (**Inter**)
- **Aesthetic**: Utilitarian, highly legible, clean, and modern.
- **Usage**: Used for body copy, micro-labels, timestamps, and input text.
- **Token Specifications**:
  - `body-lg`: `18px` (Line Height `28px`, Weight `400`)
  - `body-md`: `16px` (Line Height `24px`, Weight `400`)
  - `label-md`: `14px` (Line Height `20px`, Weight `600`, Letter Spacing `0.01em`)
  - `label-sm`: `12px` (Line Height `16px`, Weight `500`)

---

## 📐 Elevation & Depth Specs
Separation of depth mimics solid layers of paper floating at differing heights above the `#f9f9f9` background plane.

- **Level 0 (Base Canvas)**: Background color `#f9f9f9`
- **Level 1 (Ambient Cards)**: White (`#ffffff`) background with extremely soft, diffused ambient shadow:
  ```css
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  ```
- **Level 2 (Lifted Controls)**: White (`#ffffff`) background with a high-contrast pronounced floating shadow:
  ```css
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  ```

---

## 🧩 Fluid Shapes & Components

### 1. Floating Bottom Navigation Bar
- **Shape**: A highly rounded pill-shaped bar anchored at the bottom for quick thumb reach.
- **Active State ("Liquid Drop")**: The active tab uses a fully circular, vibrant colored background container (Focus Red for work tabs, Rest Green for rest tabs) with high-contrast white icons.

### 2. Micro-Interaction Chips & Badges
- **Tag Shape**: Maximum available radius (`rounded-full`).
- **Dynamic Transition**: Inhaling and exhaling triggers smooth radial scaling. Water tracking icons have an active float bounce behavior.

### 3. Progressive Circle Timer Ring
- **Form**: Thick circular stroke utilizing rounded caps (`stroke-linecap="round"`) representing the countdown progression.
- **Color Change**: Color switches dynamically between Primary `#b3272e` (Focus) and Secondary `#006d3e` (Rest).
