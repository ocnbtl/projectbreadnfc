---
name: Scantap Signal Ledger
description: A restrained operational system for review work that earns trust through clarity.
colors:
  signal-blue: "#155eef"
  signal-blue-dark: "#0f49bf"
  signal-blue-soft: "#edf4ff"
  graphite: "#111318"
  ink-soft: "#4f5766"
  steel-50: "#f7f9fc"
  steel-100: "#eef2f7"
  steel-200: "#dfe5ed"
  steel-300: "#c8d0dc"
  white: "#ffffff"
  danger: "#e5484d"
  danger-soft: "#fff0f0"
  success: "#15803d"
  success-soft: "#e8f7ee"
  danger-dark: "#b4232a"
  warning: "#f6ad10"
  google-blue: "#4285f4"
  control-graphite: "#15181e"
  control-graphite-raised: "#20242c"
  control-graphite-border: "#2c313b"
  control-nav-text: "#b8c0cc"
  control-muted: "#667080"
  control-success: "#29a761"
  control-warning: "#e69225"
  control-warning-soft: "#fff0d8"
  control-danger: "#d54349"
  control-danger-soft: "#fde1e2"
typography:
  display:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "clamp(2.7rem, 5.1vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  product-title:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  control-title:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "3rem"
    mobileFontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
  product-metadata:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
  product-label:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
  product-control:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
  product-body:
    fontFamily: "Arial, Helvetica Neue, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "10px"
  md: "16px"
  lg: "24px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
---

# Design System: Scantap Signal Ledger

## Overview

**Creative North Star: "The Signal Ledger"**

Scantap feels like a clear operating record: calm enough to trust, dense enough to run a business, and deliberate about every state. Cobalt signals selection and action. Graphite establishes authority. Cool grays separate working layers without making the product feel cold or technical for its own sake.

The public website can persuade with larger type and physical product imagery. The authenticated application operates at a tighter scale: familiar navigation, direct language, predictable controls, and information that leads to a decision.

**Key Characteristics:**

- Restrained cobalt, graphite, white, and cool gray
- One workhorse sans family with compact product hierarchy
- Clear state labels and low-noise operational density
- Rounded working surfaces with restrained structural depth
- Motion reserved for state change and feedback

## Colors

Signal blue is scarce and meaningful; cool neutrals carry most of the surface.

### Primary

- **Signal Blue:** Primary actions, focus, current navigation, connected state, and active data.
- **Deep Signal:** Pressed and high-contrast blue states.
- **Signal Wash:** Selected rows, informational feedback, and quiet active regions.

### Neutral

- **Graphite:** Primary copy and the darkest application rail.
- **Working Ink:** Secondary explanations and supporting metadata.
- **Steel Layers:** Canvas, navigation, separators, disabled states, and quiet panels.
- **White:** Primary task canvas and controls.

### Named Rules

**The One Signal Rule.** Cobalt identifies something actionable, selected, connected, or focused; it is never scattered as decoration.

**The Honest State Rule.** Success, warning, danger, stale, and disconnected states use their semantic color and a written label together.

## Typography

**Display Font:** Arial with Helvetica Neue and Segoe UI fallbacks  
**Body Font:** Arial with Helvetica Neue and Segoe UI fallbacks

**Character:** Crisp, familiar, and highly legible. The same family moves from marketing scale to compact operational labels without introducing ornamental voices.

### Hierarchy

- **Display:** Bold, tightly set, and reserved for public persuasion.
- **Product title:** Fixed-size, bold, and immediately subordinate to the current organization context.
- **Section title:** Strong enough to scan, never oversized inside the application.
- **Body:** Comfortable for explanations with a 65–75 character measure.
- **Label:** Compact and bold; sentence case by default.
- **Product metadata:** 11px only for short timestamps, counts, and provenance; never for instructions.
- **Product label:** 12px for status, field, and navigation support.
- **Product control:** 13px for buttons and compact interactive text.
- **Product body:** 14px for operational explanations and records.

**The Task Scale Rule.** Authenticated screens use fixed sizes and tighter ratios; responsive behavior changes layout, not product typography.

## Layout

The public site uses a centered maximum-width shell. The product uses a persistent application rail, a contextual sidebar when useful, and a fluid task canvas. Dense review and team surfaces may use tables or split panes; empty and onboarding states use a narrower reading measure.

At tablet widths, secondary navigation becomes a horizontal strip or drawer. At phone widths, the task canvas becomes a single column, tables become labeled records, and persistent actions remain reachable without covering content.

## Elevation & Depth

Depth is structural and restrained. Most separation comes from tonal layers and borders. Small ambient shadows lift dropdowns and compact panels; larger shadows are reserved for public product imagery or a true overlay.

### Shadow Vocabulary

- **Working lift:** A short downward offset with a soft, low-opacity blur for menus and focused task panels.
- **Presentation lift:** A wider ambient shadow for public product and dashboard demonstrations only.

**The Flat-First Rule.** A working surface starts flat. It earns elevation through hierarchy, interaction, or overlay behavior.

## Shapes

Controls and working panels use gently curved 10–16px corners. Large public compositions may use 24px. Pills are limited to compact filters, roles, and statuses. Borders stay one pixel; heavier outlines belong only to keyboard focus.

## Components

### Buttons

- **Shape:** Gently curved controls using the small radius.
- **Primary:** Signal blue with white text; concise action labels.
- **Hover / Focus:** Darker blue on hover and a visible blue-offset focus ring.
- **Secondary:** White or steel with graphite text and a structural border.

### Chips

- **Style:** Compact, sentence-case labels for role, source, status, and filters.
- **State:** Selected chips use Signal Wash plus Signal Blue text; semantic statuses retain their own colors.

### Cards / Containers

- **Corner Style:** Medium radius for working regions.
- **Background:** White on a steel canvas.
- **Shadow Strategy:** Flat by default; lift only when hierarchy needs it.
- **Border:** One-pixel steel separator.

### Inputs / Fields

- **Style:** White field, one-pixel steel border, compact padding.
- **Focus:** Signal Blue outline plus border shift.
- **Error / Disabled:** Written recovery guidance; semantic tint never replaces text.

### Navigation

Persistent product navigation uses graphite or a cool steel layer. The current destination combines a visible shape, icon, and label. Mobile navigation remains a conventional drawer or compact row rather than an invented gesture.

### Signal Ledger

The ledger is the recurring summary language: a compact row of distinct events—tap, page open, review, and reply—with separate labels and no implied conversion that the data cannot prove.

## Do's and Don'ts

### Do:

- **Do** make the next task visible within seconds.
- **Do** combine color, iconography, and copy for important states.
- **Do** keep organization and location context visible around sensitive actions.
- **Do** let dense information use familiar tables, lists, and split panes.

### Don't:

- **Don't** use Signal Blue as ambient decoration.
- **Don't** hide permission boundaries or provider limitations behind disabled-looking controls.
- **Don't** turn every object into an equal card.
- **Don't** use ornamental motion, glass, or gradients inside task workflows.
