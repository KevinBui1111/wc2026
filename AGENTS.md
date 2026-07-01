# 2026 FIFA World Cup Knockout Brackets Page
The single-page HTML application includes:

## Features
- Live data fetching from the openfootball/worldcup.json GitHub repository
- Full bracket visualization with Round of 32 → Round of 16 → Quarter-Finals → Semi-Finals → Final, plus 3rd Place match
- Three view modes via tab buttons: Full Bracket (symmetric left/right converging to center Final), Left Half only, Right Half only
- Match cards showing:
  - 🏳️ Country flags (via flagcdn.com with 80+ country code mappings)
  - Team names
  - Full-time scores
  - Penalty shootout scores (when applicable)
  - Extra time / AET and PEN labels
  - Match number, date, and venue
  - Green highlight for winners, faded styling for eliminated teams
  - 🏆 Champion badge on the Final winner

## Design
- Dark gradient background with glassmorphic card design
- Inter font for clean typography
- Purple/violet accent color scheme with amber highlights for the Final
- SVG connector lines between bracket rounds
- Hover animations on match cards
- Responsive horizontal scrolling for the wide bracket layout
- Loading spinner and error state with retry button
- Informative footer with legend

## Data Handling
- Handles multiple score formats (score.ft, score.et, score.p, score.pen)
- Canonicalizes round name variants (Quarter-final / Quarterfinals, etc.)
- Gracefully shows "TBD" for matches not yet played
- Shows a message if knockout data isn't available yet

---

# Update by prompt `2-correct-order.prompt`

## What was fixed
The core problem: The previous version used a naive split(matches) approach — simply cutting the array in half by index position. This meant R16 match #90 (whose feeder matches are R32 #73 and #75) could end up positioned next to completely unrelated R32 matches.

The solution: I rebuilt the entire bracket using the official FIFA bracket tree structure derived from the [upstream source file](https://github.com/openfootball/worldcup/blob/master/2026--usa/cup_finals.txt):

## Hardcoded bracket tree (verified against FIFA)
- Left half: R32 matches [74,77] → R16 #89, R32 [73,75] → R16 #90, R32 [83,84] → R16 #93, R32 [81,82] → R16 #94, then R16 [89,90] → QF #97, R16 [93,94] → QF #98, then QF [97,98] → SF #101
- Right half: R32 matches [76,78] → R16 #91, R32 [79,80] → R16 #92, R32 [86,88] → R16 #95, R32 [85,87] → R16 #96, then R16 [91,92] → QF #99, R16 [95,96] → QF #100, then QF [99,100] → SF #102
- Final: SF #101 winner vs SF #102 winner = Match #104
- 3rd Place: SF #101 loser vs SF #102 loser = Match #103

## Recursive nested flexbox layout
Instead of flat columns with flex:1 spacing (which breaks alignment), the bracket now uses recursively nested flex containers:

- Each R16 group is a flex row: [2 R32 cards stacked] → [connector] → [R16 card centered]
- Each QF group wraps 2 R16 groups: [2 R16 groups stacked] → [connector] → [QF card centered]
- Each SF wraps 2 QF groups similarly
- This guarantees every match is perfectly centered between its two feeder matches

## Connector lines using CSS ::before/::after
Pure CSS bracket lines (no SVG) — a bracket-shaped border connects each pair of matches to the next round, with both left-pointing and right-pointing variants.

---

# Update by prompt `3-manul-score.prompt`

## Changes Made
### 1. ⏰ Match Time Display
- Updated the fdt(d, t) function to accept a second parameter for the time string
- The card now reads m.time from the JSON data (e.g. "16:30 UTC-4") and displays it after the date separated by ·
- Example display: "Sun, Jun 29 · 16:30 UTC-4"

### 2. 🌲 Dark Green Color Scheme
Replaced all purple/violet (rgba(139,92,246,...), #8b5cf6) references with dark green (rgba(22,163,74,...), #16a34a):

- Background gradient: deep forest green (#040d04 → #0a1f0a → #071510)
- Connector bracket lines: green-tinted
- Card hover glow: green shadow
- Tab buttons: green active state / green hover borders
- Spinner: green top-border
- Scrollbar thumb: green
- Header text gradient: green-400 → emerald-300 → amber-400
- Modal styling: dark green gradient background, green border, green focus rings
- Third-place card: green tint instead of purple

### 3. ✏️ Manual Score Input + Auto-Propagation
This is the largest feature addition:

- Editable match cards: Any card with both teams known shows a yellow ✏️ Click to enter score hint and gets a yellow-glow cursor on hover
- Score modal: Clicking opens a dark-green modal with:
  - Team flags and names
  - Number inputs for each team's score
  - Save, Cancel, and Clear Score buttons
  - Keyboard support (Enter to save, Escape to cancel)
- WINNER_MAP: A complete mapping of all 32 matches defining where each winner propagates (e.g., W73 → M90.team1, W74 → M89.team1, etc.)
- LOSER_MAP: Semi-final losers propagate to 3rd-place match (#103)
- propagateWinner(): When a score is saved, the winner's name and flag are automatically placed into the correct team slot of the next round's match
- clearDownstream(): If a score is changed/cleared, all downstream teams and scores are recursively cleared to prevent stale data
- renderAll(): Processes all matches in order (R32 → R16 → QF → SF → Final) to ensure the full bracket chain is always consistent
- Manual scores persist across re-renders and are marked with a small ✏️ icon
- Clear Score button removes a manual entry and cascades the clearing downstream