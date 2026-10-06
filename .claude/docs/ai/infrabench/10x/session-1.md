# 10x Analysis: Infrabench (all four tools)
Session 1 | Date: 2026-10-06

## Current Value

Four static, client-side tools on public data, each a console with a rail of inputs, five live
figures, a picture, a ranked table and explanation in tabs. Every setup is a shareable URL.

| Tool | Answers | Inputs today | What you can try today |
|---|---|---|---|
| **Crash Cart** | Which drives do I pull this week? | 5 fleet profiles, size, protection scheme, SMART coverage, rebuild speed, pulls a week, look ahead | Week player, racks fill green, 4 what-ifs (double the crew, turn off SMART, five years ahead, reset) |
| **Where the power is** | Which grid can energize my load by my date? | MW, needed-by year, gas bridge, two assumptions | Drag the deadline, 5 what-ifs, sort by time, carbon or price |
| **Outage replay** | How long did the status page stay green? | 6 incidents, your paging threshold | Play or scrub the replay, drag your threshold, log jumps |
| **Rack Budget** | What fits in my megawatts? | Power or fleet, rack profile, PUE, margin | Hall or campus redraws, waterfall, every profile side by side, 5 what-ifs |

**Who uses it.** The people who do the work: siting and capacity planners, SREs, and fleet
and hardware operators. They come with a real number and want an answer they can paste into a
doc, a ticket or a budget ask. Today they get a well-modeled answer to a *generic* fleet,
region list or incident.

*Decided after session 1:* these are work tools, not games. No scores, challenges or
share-bait. A visitor judging the craft is served by the tools being good at the job.

**The gap.** All four tools answer "what if?" well. None of them yet answers "*so what do I do,
and what does it cost?*" for *my* situation. Each tool is also an island, even though their
numbers chain naturally:
Rack Budget's megawatts are Where the power is's input, and the power page's price and carbon
are exactly what Rack Budget's "energy a year" figure is missing.

## The Question

What would make an operator open one of these before a planning meeting instead of a
spreadsheet?

---

## Massive Opportunities

### 1. Bring your own data
**What**: Paste or drop your real inputs, parsed in the browser and never uploaded.
- Crash Cart: a CSV of drives (model, age, SMART counters), or raw `smartctl -A` output.
- Rack Budget: a mixed rack list.
- Outage replay: a Statuspage incident JSON.

**Why 10x**: It turns four demos into four working tools. The model already runs per batch
(Crash Cart's `compute()` iterates model and age cohorts), so a parsed CSV is just a custom profile.
**Unlocks**: Repeat use, a real pull sheet, and credibility with the operator audience.
**Effort**: High (parsers, validation, privacy copy, edge cases).
**Risk**: Messy inputs. Statuspage JSON may be blocked from the browser by CORS (paste
instead of fetch). Expectations of accuracy go up.
**Score**: 🔥 for Crash Cart (CSV and smartctl), 🤔 for the other two.

### 2. One project across the suite
**What**: The tools hand off to each other as one planning flow:
- Rack Budget → Where the power is: "Find grid for 30 MW".
- Where the power is → Rack Budget: "What fits in this region?", which carries the region's ¢/kWh and g/kWh back.
- Rack Budget's "Energy a year" then gains **$ a year** and **t CO₂ a year**.

**Why 10x**: Each tool gets better because the others exist (compounding). It tells the
suite's story, "power first, then heat, then floor", as a path you click through, not prose.
**Unlocks**: An energy bill, a carbon figure and siting from one starting number. Later,
a single project summary across tools.
**Effort**: Low for the handoff links, since both already keep `mw` in the URL. Medium for carrying
price and carbon. High for a joint "project" view.
**Risk**: Little; the model numbers already exist on both pages.
**Score**: 🔥

---

## Medium Opportunities

### 1. Pin a scenario, compare A against B
**What**: A "Pin" button keeps the current setup as A. Every figure, chart and table row
then shows A against your live setup B, until you clear it. It generalizes the existing
"before your change" ghost lines and change chips, which only remember one step back.
**Why 10x**: The real questions are comparisons: RAID 6 or 17+3, GB200 or Kyber,
300 MW now or 1 GW in 2031. Today you hold one setup in your head and change the other.
**Impact**: Turns each tool into a decision tool, and the summary copy becomes "A vs B".
**Effort**: Medium (a shared component; every tool already has `vals()`/`kpiBase` deltas).
**Score**: 🔥

### 2. Crash Cart: spares for the cart
**What**: How many spare drives of each model to keep on the cart for the next 4, 8 or 12 weeks:
planned pulls plus expected failures, with a confidence band. Shown as a short list:
"ST12000NM0007 × 26, MG07ACA14TA × 31…".
**Why 10x**: It's the literal crash cart, and a task operators do by hand every month.
The expected failures per batch are already computed (`expFail`, `p30`).
**Impact**: A second deliverable, a parts order, next to the pull sheet.
**Effort**: Medium.
**Score**: 🔥

### 3. Outage replay: design your detection
**What**: Instead of one threshold number, build a detection stack from parts: a synthetic check every
1 or 5 min, an error-rate alert over a 5 min window, a Downdetector watch, the vendor status
page. The replay shows which signal fires first on each incident and when.
**Why 10x**: It answers what an SRE actually decides: which monitors to pay for. The
threshold slider is a stand-in for that.
**Impact**: The verdict changes from "you'd be 59 min ahead" to "your synthetic check fires at
17:56; the error alert at 18:01; the page at 19:05".
**Effort**: Medium (signal timings per incident need sourcing; some are already in the log).
**Score**: 👍

### 4. Where the power is: a 2D trade-off view
**What**: An optional scatter of the regions, carbon against price. Regions that make your date
are solid, the rest hollow, so the cheap-and-clean corner jumps out.
**Why 10x**: The table has the columns, but the trade-off only shows up in two dimensions.
**Impact**: Answers "cleanest that is also cheap" at a glance.
**Effort**: Medium.
**Score**: 👍

### 5. Rack Budget: mixed halls
**What**: Real halls mix racks (GPU racks plus storage plus network). Add rows of "N × profile".
**Why 10x**: Lets a planner model their actual design rather than a pure GB200 hall.
**Effort**: Medium.
**Score**: 🤔 (useful but complex; the GPU-count mode below gets most buyers most of the way)

### 6. Export for the planning doc
**What**: Take the work out of the page in the shape the next step needs: the ranked table as
CSV, the pull sheet and spares list as CSV for a ticket, the hall or replay as a PNG for a slide.
Each tool already copies a text summary; this covers the table and the picture.
**Why 10x**: The answer ends up in a doc, a ticket or a parts order, not on this page.
**Effort**: Low to Medium.
**Score**: 👍

---

## Small Gems

### 1. Rack Budget: start from GPUs
**What**: A third direction next to power and fleet: "I need 10,000 GPUs" gives racks, MW, floor and heat.
**Why powerful**: AI buyers think in GPUs, not racks or megawatts.
**Effort**: Low (inverse of the fleet mode: racks = ceil(GPUs / GPUs per rack)).
**Score**: 🔥

### 2. Crash Cart: what one more pull buys
**What**: Beside the pulls-a-week slider: "+1 pull a week clears the list 3 weeks sooner and
takes 40 TB off 30-day risk."
**Why powerful**: It's the sentence a manager needs to approve more crew time, and the plan
already computes `lastWeek` and the per-week series.
**Effort**: Low.
**Score**: 🔥

### 3. Outage replay: what the dark window cost
**What**: An optional revenue-per-minute (or SLA credit) input. "74 minutes dark ≈ $X before the
status page said a word", for each incident and in total.
**Why powerful**: It turns an interesting fact into a business case for your own monitoring.
**Effort**: Low.
**Score**: 👍

### 4. Reference builds
**What**: Sourced reference points to check a plan against: Colossus (≈150 MW, 100k H100),
Stargate Abilene (1.2 GW), a typical 2019 colo.
**Why powerful**: A sanity check: "my 30 MW plan is a fifth of Colossus".
**Effort**: Low to Medium (sourcing each number honestly is the work).
**Score**: 🤔

### 5. Explain this number
**What**: Hover or focus a figure to see its formula with your values filled in
(e.g. "30 MW ÷ 1.20 × 0.85 ÷ 120 kW = 177"). The Method tab has the formulas, but far from the figures.
**Why powerful**: Trust. Operators argue with numbers they can't trace.
**Effort**: Low to Medium.
**Score**: 👍

### 6. Remember my last setup
**What**: Reopen a tool where you left it (local storage), with "Start over" one click away.
**Why powerful**: Repeat visitors skip re-entering their fleet or load.
**Effort**: Low.
**Score**: 🤔 (URLs already carry state, and bookmarks may be enough)

---

## Recommended Priority

### Shipped (quick wins)
- **Rack Budget ↔ Where the power is**, carrying price and carbon: Rack Budget shows $ a year
  and t CO₂ for the grid you pick.
- **Rack Budget: start from GPUs.**
- **Crash Cart: what one more pull buys.**
- **Outage replay: what the dark window cost.**

### Do Next (high leverage)
1. **Pin and compare A vs B (shared across all four).**
   - Why: every real decision is a comparison: RAID 6 or 17+3, GB200 or Kyber, ERCOT or PJM.
   - Start with Rack Budget, then roll it to the other three.
2. **Crash Cart spares planner.**
   - Why: a second real deliverable (a parts order), and a monthly task done by hand today.
3. **Explain this number.**
   - Why: operators argue with numbers they can't trace. Low effort, and it builds trust in all four.
4. **Bring your own data, starting with Crash Cart CSV and smartctl.**
   - Why: it turns a model of a generic fleet into your fleet's pull sheet.
   - Risk: messy inputs and an accuracy burden.

### Explore (strategic bets)
1. **Design your detection (Outage replay).**
   - Risk: signal timings need sourcing.
   - Upside: the SRE's real decision, which monitors to pay for.
2. **Bring your own data for the other tools** (a rack list, a Statuspage incident JSON).
3. **Mixed halls (Rack Budget).**

### Backlog
- **Export for the planning doc:** after compare, so it can export A vs B.
- **2D trade-off view:** nice, but the table already serves it.
- **Reference builds:** waits on sourcing.
- **Remember last setup:** URLs mostly cover it.

### Dropped
- **Game modes** ("Call it", Triage, Make the date) and **share cards**: these are work tools.

---

## Questions

### Answered
- **Q**: Can the tools pass state to each other without a backend?
  **A**: Yes. Every tool keeps its whole setup in the URL hash (`mw`, `yr`, `p`, `pue`…), so a
  handoff is a link.
- **Q**: Does Crash Cart already compute what a spares planner needs?
  **A**: Yes. Per batch it has `n`, `p30` and `expFail`, plus a week-by-week plan.
- **Q**: Does the power page have price and carbon per region?
  **A**: Yes. Each region carries `price` (¢/kWh) and `co2` (g/kWh).

- **Q**: Who is the audience?
  **A**: The people who do the work. No games or share-bait.
- **Q**: Are dollar figures welcome?
  **A**: Yes, with the assumption on the page: the grid's ¢/kWh is named next to the bill, and
  the outage cost a minute is the reader's own input.

### Open
- **Q**: Reference builds name companies and projects. Is that a line you want to cross, given
  every number must be sourced?

## Next Steps
- [x] Decide the audience: operators.
- [x] Build the four quick wins.
- [ ] Build pin and compare in Rack Budget, then the other three.
- [ ] Research: public timing for synthetic checks and Downdetector spikes per incident (for detection design).
- [ ] Validate: put compare and the spares planner in front of two operators; watch where they hesitate.
