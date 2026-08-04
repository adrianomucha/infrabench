<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo/glyph/infrabench-logo-glyph.svg">
  <img alt="Infrabench" src=".github/assets/logo/glyph/infrabench-logo-glyph-light.svg" height="44">
</picture>

<p><strong>Published specs, corrected for reality.</strong><br>
Open tools for the people who build data centers.</p>

<p>
  <img alt="Build: none required" src="https://img.shields.io/badge/build-none%20required-3DDC97?style=flat-square&labelColor=0E1116">
  <img alt="Dependencies: zero" src="https://img.shields.io/badge/dependencies-0-3DDC97?style=flat-square&labelColor=0E1116">
  <img alt="Data: public only" src="https://img.shields.io/badge/data-public%20only-3DDC97?style=flat-square&labelColor=0E1116">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-8B97A8?style=flat-square&labelColor=0E1116">
</p>

---

Nameplate numbers are optimistic. A rack is rated for 600 kW, a drive is rated for
five years, an interconnection queue is rated in gigawatts. None of those survive
contact with a real site.

Infrabench is a small set of free tools that do the correction, on public data,
with every constant shown on the page. No accounts, no tracking, no lead forms.

![Rack Budget](.github/assets/rack-budget.png)

## The bench

| # | Tool | What it answers | Status |
|---|------|-----------------|--------|
| 01 | **[Rack Budget](rack-budget/)** | You have the megawatts. What actually fits, what heat comes off it, and how much floor it needs. | **Live** |
| 02 | **[Crash Cart](crash-cart/)** | Which drives to pull this week, ranked by risk times blast radius, on 13 years of public fleet telemetry. | **Live** |
| 03 | **Where the power is** | Where you can actually energize a few hundred megawatts before the end of the decade. | Planned |
| 04 | **Outage replay** | What the console showed during a real cloud incident, and how long the truth took to surface. | Planned |

## Rack Budget

Runs the same model in both directions. Start from a power budget and get the fleet,
or start from the fleet and get the power you have to go ask a utility for.

```
30 MW at the fence
  -> divide by PUE 1.20            = 25.0 MW of IT capacity
  -> hold back a 15 percent margin = 21.25 MW usable for compute
  -> divide by 120 kW per GB200    = 177 racks
  -> times 72 GPUs                 = 12,744 GPUs
  -> 21.24 MW of heat / 3.517      = 6,039 tons, 5,435 on the liquid loop
  -> 177 racks x 40 sq ft          = 7,080 sq ft of white space
```

The result draws the hall it describes: racks in rows the way they really sit, hot
and cold aisles between row pairs, row-end CDUs when the archetype is liquid cooled,
and a floor plate scaled to the white space.

![The isometric hall](.github/assets/hall.png)

Rack archetypes run from a 6 kW legacy 42U to the 600 kW Rubin Ultra / Kyber rack,
so the density cliff is visible rather than described. Every input is encoded in the
URL, so any configuration is a link you can paste into a thread and argue about.

## How these are built

**Public data only.** Every input is something you could download yourself. Nothing
proprietary, nothing behind an NDA, nothing you have to take on trust.

**Constants in the open.** Each tool states its assumptions and shows the arithmetic
that produced every number. If you disagree with a constant, you know exactly which
one to argue with.

**One decision out.** Numbers on a screen are data. Each tool ends by naming the
thing that will actually stop you, because that is the part someone has to act on.

## Technical notes

Plain HTML, CSS and vanilla JavaScript. One file per tool. No framework, no bundler,
no build step, no dependencies at runtime or at deploy time. The isometric hall is
SVG polygons generated in about sixty lines rather than a 3D library. The whole
model is readable with view-source.

Chart colour is validated rather than eyeballed. The megawatt split is a single-hue
ordinal ramp (`#4FE3A5` to `#1E9E73` to `#125C46`) checked for monotone lightness,
adjacent step separation and contrast against the dark surface. An earlier
three-hue version was rejected for failing colour-blind separation at deltaE 7.3
under protanopia.

The accent is rationed. Green means one thing — a number that came from data, or a
thing that is live — and everything else is neutral: hovers, links, section numerals
and ornament all resolve to white or grey. The isometric hall follows the same rule.
Racks render in graphite the way real cabinets look, and the only colour in the
drawing is the row-end CDUs, so the green marks the liquid loop rather than the
whole room. An accent smeared across every interaction state stops reading as a
signal, which is the entire job this one has.

### Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

That is the entire toolchain.

### Deploying

See **[DEPLOY.md](DEPLOY.md)** for the Vercel walkthrough, DNS records, the
post-deploy checklist, and how to add the next tool.

## Sources

Rack power figures come from NVIDIA platform disclosures as reported by
[Data Center Dynamics](https://www.datacenterdynamics.com/en/analysis/nvidia-gtc-jensen-huang-data-center-rack-density/),
[Silicon Report](https://www.siliconreport.com/nvidia-vera-rubin-everything-we-know-33727d4d)
and [TechRadar Pro](https://www.techradar.com/pro/megawatt-class-ai-server-racks-may-well-become-the-norm-before-2030-as-nvidia-displays-600kw-kyber-rack-design).
PUE bands come from [Uptime Institute](https://intelligence.uptimeinstitute.com/resource/mapping-pue-trends-data-center-region-age-and-size)
survey data. Figures are public as of 2026 and change fast.

These are planning heuristics for the first conversation, not engineering
submittals. Nothing here replaces a mechanical engineer.

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Adrian Mucha](https://portfolio-repo-gilt.vercel.app), a product designer
working on the software most designers avoid: data centers, AI tooling, and operator
consoles where a wrong click costs real money.
