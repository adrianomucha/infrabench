# Desk Budget

**What your hardware draws, and what AI it can actually run.**
A free calculator for everyday gear, on published specs, with every constant on the page.

> **Working name.** The project is real, the name is a placeholder. See
> [Renaming](#renaming) for the exact places it appears.

---

Gear pages publish a price and a hero shot. They do not publish the two numbers you
live with: what a set of hardware costs to leave switched on, and which AI models
actually fit in the memory you bought.

Build a set from a catalogue of real machines and it answers both, from maker
specifications, with the arithmetic shown rather than asserted.

## The two answers

**Power and cost.** Annual kilowatt hours, split into the work, the on-but-idle hours,
and the always-on floor. That split is the point: for most home setups the floor is
the larger half, so the gear that never turns off writes the bill, not the peak
everybody shops on. A representative day is drawn against the branch circuit ceiling.

**What AI runs.** The largest open-weight model that fits your memory, and the speed
its bandwidth allows.

```
Tower + RTX 5090 + 32 inch display + router
  -> at load                       = 675 W
  -> 3 h load, 5 h idle, router on = 2.55 kWh per day
  -> x 365 at 18.44 cents          = 929 kWh, 171 dollars a year
  -> peak 852 W / 1,440 W          = 59 percent of a 15 A circuit
  -> 32 GB VRAM less 1 GB          = 31.0 GB usable
  -> Qwen3 32B at Q4: 19.9 GB      = fits
  -> 1,792 GB/s x 0.75 / 18.0 GB   = about 75 tokens a second
```

## Why two answers and not one

Because two different things bind, and they fail differently.

**Capacity decides whether a model runs. Bandwidth decides how fast it answers.** A
128 GB unified-memory box holds a 70B that a 32 GB card cannot, and then generates it
at single digit tokens per second. A 5090 runs everything that fits at 75 tokens a
second and simply cannot load the 70B at all. Neither number alone tells you which
machine to buy.

Mixture-of-experts models make the point sharpest. gpt-oss 120B stores 120 billion
parameters but reads only 5.1 billion per token, so it needs a large machine to load
and then outruns a dense 32B on the same hardware. The tool sizes memory on total
parameters and speed on active ones, which is why that row behaves the way real
machines do.

## The method

**Published data only.** Every figure is something you could look up yourself: maker
specifications, published reviews, the EIA residential average, NEC article 210 for
continuous-load derating.

**Load is not nameplate.** Load figures are sustained draw under real work, not the
rating on the power supply. Where a maker publishes a maximum continuous rating, that
is the peak column.

**Constants in the open.** Generation speed is bandwidth x 0.75 over bytes read per
token. Q4_K_M is charged at 4.5 bits per weight. macOS hands the GPU about 75 percent
of unified memory. All of it is printed on the page, so if you disagree with a
constant you know exactly which one to argue with.

**One decision out.** The tool ends by naming the thing that will actually stop you:
the breaker, the idle floor, or the gigabytes you are short.

## Technical notes

Plain HTML, CSS and vanilla JavaScript. One file. No framework, no bundler, no build
step, no dependencies at runtime or at deploy time. Both charts are inline SVG
generated in about forty lines each. The whole model is readable with view-source.

Every input is encoded in the URL, so any configuration is a link you can paste into a
thread and argue about.

### Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

That is the entire toolchain.

### Deploying

See **[DEPLOY.md](DEPLOY.md)**.

## Renaming

The name lives in a small, enumerable set of places. A rename is a find-and-replace
plus two images:

| Where | What |
|-------|------|
| `index.html` | `<title>`, the `og:title` and `og:description` meta tags, the header mark, and the footer credit |
| `README.md` | this file |
| `favicon.svg` | the `aria-label` |
| `og.png` | regenerate the card, which carries the name in its top-left mark |
| `apple-touch-icon.png`, `favicon.png` | only if the mark itself changes |

Nothing in the calculator, the catalogue or the model ladder refers to the name, so
the arithmetic is unaffected.

## Sources

Hardware figures come from maker specifications and published reviews: Apple tech
specs for maximum continuous power and memory bandwidth, NVIDIA for GeForce board
power and bandwidth and for the DGX Spark GB10 figures, AMD and Framework for Ryzen
AI Max. The default electricity rate is the US residential average reported by the
[EIA](https://www.eia.gov/electricity/monthly/update/end-use.php). Continuous-load
derating on the North American circuits follows NEC article 210.

Figures are public as of August 2026 and change fast. These are planning heuristics,
not benchmarks. Measure your own gear with a plug meter before spending money.

## Related

[Infrabench](https://infrabench.io) runs the same method at data center scale: rack
density, cooling tons, white space, and drive failure triage on public fleet
telemetry.

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Adrian Mucha](https://portfolio-repo-gilt.vercel.app), a product designer
working on the software most designers avoid: data centers, AI tooling, and operator
consoles where a wrong click costs real money.
