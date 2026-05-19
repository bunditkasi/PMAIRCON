# PMAIRCON Frontend Modernization Design

Date: 2026-05-19
Project: PMAIRCON
Scope: Visual redesign of the existing web app without changing the current information architecture or navigation flow.

## Goal

Refresh the existing PMAIRCON web application into a modern, calm, professional operations interface that feels credible for central operations teams and comfortable for all-day use.

The redesign should:

- Preserve the current branch, unit, PM, and repair flows.
- Improve visual hierarchy and perceived product quality.
- Make monitoring and navigation feel clearer at a glance.
- Stay light, readable, and mobile-friendly.

## Design Direction

Chosen direction: `Professional Operations`

Chosen palette family: `Green-Slate`

Target personality:

- Calm and operational rather than flashy.
- Premium and reliable rather than startup-generic.
- Clean and airy rather than dense or heavily card-based.
- Easy on the eyes for long dashboard sessions.

## Visual System

### Color

Use a restrained green-slate palette:

- Background: pale green-gray or misted stone tone.
- Primary surfaces: clean white.
- Secondary surfaces: muted sage-gray panels.
- Accent: dark muted green for highlights, buttons, active states, and links.
- Text: deep slate for primary content, softened slate for secondary content.
- Success/status: green family already aligned with the base palette.
- Warning/attention: warm amber used sparingly.

The UI should avoid heavy saturation, neon tones, and overly dark backgrounds.

### Typography

Typography should feel calm, technical, and trustworthy:

- Use a more editorial and intentional sans-serif stack rather than a default system feel.
- Headings should be compact, confident, and slightly tighter tracked.
- Body text should be soft and readable.
- Labels and metadata should be understated, not loud or overly uppercase-heavy.

The typography must create strong hierarchy without making the interface feel corporate-stiff.

### Shape, Borders, and Elevation

- Rounded corners should be moderate, not bubble-like.
- Cards and panels should feel light, with restrained borders and soft shadows.
- Major surfaces should look like panels on a clean control board, not floating tiles everywhere.
- Avoid visual clutter from too many nested containers.

### Motion

Use subtle motion only:

- Gentle hover lift or surface tint changes.
- Soft page-load fade and slide transitions.
- No overly playful animations.

## Information Architecture

The redesign will preserve the current route structure and user journey:

- Dashboard
- Branch Detail
- Unit Detail
- PM Form
- Repair Form

No new major sections, navigation concepts, or dashboard workflows should be introduced during this design pass.

## Screen Designs

### 1. Dashboard

Purpose:

- Give central users a clear operational overview.
- Help them move quickly into a branch.

Layout:

- A refined header with product title, short operational description, and back/home action.
- A summary strip for top-level metrics with stronger visual rhythm and clearer status presentation.
- A large branch directory section designed as a clean operational catalog rather than a generic card grid.

Visual treatment:

- Summary metrics should feel like control indicators rather than plain boxes.
- Branch entries should look scannable, with clear code, outlet shorthand, and supplier assignment.
- The branch directory should use whitespace, subtle separators, and stronger list structure to reduce noise.

Key improvement:

The dashboard should feel like a monitoring workspace, not a demo page.

### 2. Branch Detail

Purpose:

- Show branch identity and associated units clearly.
- Help users move into unit-level records without friction.

Layout:

- A branch identity panel with branch code, outlet name, and supplier.
- A unit inventory section with clearer unit rows and stronger click targets.
- Optional room for future metadata blocks without redesigning the page again.

Visual treatment:

- Branch identity should feel stable and anchored at the top.
- Unit rows should read like operational records, not plain list bullets.
- Spacing should support quick scanning for branches with many units.

Key improvement:

The page should feel like a clean branch console rather than a simple detail card.

### 3. Unit Detail

Purpose:

- Surface the latest PM and repair status at a glance.
- Provide obvious actions to submit PM and repair logs.

Layout:

- A unit header with unit ID and branch context.
- Two primary status panels: latest PM and latest repair.
- Clear action buttons for `Submit PM` and `Submit repair`.

Visual treatment:

- Status panels should feel like paired operational modules with distinct emphasis.
- Dates, issue summaries, and record counts should be visually separated for easy reading.
- Action buttons should feel product-grade and more intentional than text links.

Key improvement:

The page should instantly answer: what unit is this, what happened recently, and what should I do next?

### 4. PM and Repair Forms

Purpose:

- Make technician submission feel simple, focused, and reliable.
- Keep the forms comfortable on both desktop and mobile.

Layout:

- Compact header with unit context.
- A clean single-column form body.
- Grouped fields with clear spacing and predictable reading order.
- Strong submit action area that remains obvious without overwhelming the page.

Visual treatment:

- Inputs should feel calm and enterprise-grade, not default browser controls.
- Labels should be clear and human-readable.
- Empty states and helper text should reduce hesitation for field entry.

Key improvement:

Technicians should be able to complete the form quickly with minimal cognitive load.

## Component Strategy

The redesign should introduce a consistent UI layer rather than one-off page styling:

- App shell spacing rules
- Section headers
- Metric cards
- Record rows
- Status panels
- Primary and secondary buttons
- Form fields and grouped field blocks

This keeps the redesign coherent and makes future screens easier to add.

## Responsive Behavior

Desktop:

- Maintain a spacious control-room feel.
- Use wider sections and balanced spacing.

Tablet:

- Collapse multi-column sections carefully without losing hierarchy.

Mobile:

- Prioritize a clear stacked layout.
- Keep touch targets generous.
- Ensure metric blocks and action buttons remain readable and tappable.

## Accessibility

The redesign should preserve or improve:

- Text contrast
- Focus visibility
- Semantic heading structure
- Touch target size
- Reduced-motion friendliness

## Non-Goals

This design pass does not include:

- New data architecture
- New reporting logic
- Authentication redesign
- QR image generation UI
- Full replacement of current business flows

## Recommended Approach

Recommended implementation approach: targeted UI modernization on the existing Next.js routes and components.

Why:

- Fastest path to visible improvement.
- Lowest risk to current production flow.
- Keeps existing navigation and live data integration intact.
- Allows visual polish without blocking future PM/repair write integrations.

## Acceptance Criteria

The redesign is successful when:

- The app feels like a polished operations product rather than a prototype.
- Dashboard, branch, unit, and form pages share one coherent visual language.
- Users can navigate faster because hierarchy and actions are clearer.
- The UI remains comfortable for long viewing sessions.
- The redesign ships without breaking the current routes and data reads.
