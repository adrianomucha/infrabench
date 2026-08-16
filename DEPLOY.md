# Deploying Infrabench

Static site. No build step, no dependencies, no framework. Deploy the repo root
as-is.

    /                       suite index
    /og.png                 suite social card
    /rack-budget/           Rack Budget
    /rack-budget/og.png     tool social card
    /crash-cart/            Crash Cart
    /crash-cart/og.png      tool social card
    /where-the-power-is/    Where the power is
    /where-the-power-is/og.png  tool social card
    /assets/analytics.js    analytics opt-out hook, Vercel and Google

Every internal link is root-relative, so no configuration file, rewrite rule or
build command is required on any host.

---

## Hosting: Vercel

Recommended because the portfolio already lives there. The free Hobby tier covers
this entirely: static files, global CDN, automatic HTTPS, custom domains.

### Fastest path, live in about two minutes

    npm i -g vercel
    vercel            # from the repo root, accept the defaults
    vercel --prod

When asked for framework preset choose **Other**. Leave build command and output
directory empty. Vercel serves `/rack-budget/` from `rack-budget/index.html`
automatically.

### The path worth settling on

Git-backed, so adding Crash Cart later is a push rather than a re-upload, and every
change gets a preview URL before it goes live.

In Vercel: **Add New Project**, import `adrianomucha/infrabench`, framework preset
**Other**, no build command, root directory `./`, deploy. Pushes to `main` publish;
pushes to any other branch get a preview URL.

### Pointing infrabench.dev at it

In the Vercel project, **Settings > Domains > Add**, enter `infrabench.dev`. Vercel
then shows the exact records for your project. The general-purpose values are:

| Host  | Type  | Value                    |
|-------|-------|--------------------------|
| `@`   | A     | `76.76.21.21`            |
| `www` | CNAME | `cname.vercel-dns-0.com` |

Add those at whichever registrar holds the domain. Confirm with:

    vercel domains inspect infrabench.dev
    vercel certs ls

DNS propagation is usually minutes. The TLS certificate provisions automatically
once verification succeeds. If you add both apex and `www`, set a redirect between
them in project settings so there is one canonical URL.

If `rackbudget.com` also gets registered, add it as a second domain on the same
project and redirect it to `/rack-budget`.

### Alternatives

- **Netlify**: drag this folder onto the dashboard, or `netlify deploy --prod --dir .`
- **Cloudflare Pages**: connect the repo, build command empty, output directory `/`
- **GitHub Pages**: push the folder contents to a `gh-pages` branch. Note that a
  project page serves from a subpath, which breaks the root-relative links. Use a
  custom domain or a user/organisation page to avoid that.

---

## After deploying, check these four things

1. Both pages load: `/` and `/rack-budget/`.
2. The suite mark in the tool header returns to `/`, and the index "Open tool"
   button reaches the calculator.
3. Social cards unfurl. Paste both URLs into a card validator and confirm the
   images resolve at `/og.png` and `/rack-budget/og.png`. A broken unfurl is the
   most common launch-day mistake and it fails silently.
4. Copy a shareable link out of the calculator, open it in a private window, and
   confirm it restores the configuration and lands on the numbers.

---

## Analytics

Two counters run side by side on every page:

- **Vercel Web Analytics**, cookieless, for the deploy-side numbers.
- **Google Analytics 4**, property stream `Infrabench`, measurement ID
  `G-B4K7J0G5X6`, stream ID `15440681983`, stream URL `https://infrabench.dev/`.

The head of each page carries them in this order, and the order is load-bearing:

    /assets/analytics.js                      un-deferred, first
    https://cdn.vercel-insights.com/...       deferred
    https://www.googletagmanager.com/gtag/js  async, then the inline gtag config

`assets/analytics.js` runs first and un-deferred so both opt-outs are in place
before either counter can fire. Deferring it would let the first pageview escape.

The GA4 measurement ID appears twice per page, in the loader `src` and in the
`gtag('config', ...)` call, and once in `assets/analytics.js` as
`GA_MEASUREMENT_ID`. Changing properties means changing all three.

### Keeping your own visits out

Neither counter has a reliable dashboard setting to ignore your own traffic.
Vercel exposes a `beforeSend` hook that can drop an event in the browser before
it is sent. Google reads a `window['ga-disable-G-B4K7J0G5X6']` flag before every
hit. `assets/analytics.js` wires both to one `va-disable` key in `localStorage`,
so a single switch mutes the pair.

Turn it on once per browser, per site:

    https://infrabench.dev/?va-disable=1     stop counting this browser
    https://infrabench.dev/?va-disable=0     count it again

The parameter is stripped from the URL immediately after it is read, so it never
reaches an event or gets copied into a shared link. Setting it by hand works too:

    localStorage.setItem('va-disable', '1')
    localStorage.removeItem('va-disable')

Verify in the console on the site's own origin. `localStorage.getItem('va-disable')`
returns `"1"` when muted and `null` when counted, and
`window['ga-disable-G-B4K7J0G5X6']` returns `true` when muted. For proof events
are actually dropped rather than just flagged, filter the Network tab by
`vercel-insights` and by `google-analytics` and reload. A counted visit fires a
beacon from each after the scripts load, an opted-out one fires neither. Both
scripts still load either way, which is expected.

Worth knowing:

- `localStorage` is scoped per origin, so this is per site, per browser, per
  profile, per device. Incognito windows always count.
- Local development is uncounted on the Vercel side. The insights script is only
  wired up on the deployed site and generates no events against a file served off
  disk. Google Analytics is not so polite: gtag.js fires from a `file://` or
  `localhost` page too, so set the flag once in whatever browser you develop in,
  or filter `localhost` out as internal traffic in the GA4 admin.
- Clearing site data takes the flag with it. Privacy extensions that wipe storage
  on close will silently undo the opt-out.
- Every `localStorage` access is wrapped in `try`/`catch`. Some privacy modes
  throw on access rather than returning null, and the fallback is to count the
  visit. Better a stray pageview than a script error that breaks the page.
- This is client-side by nature. Any visitor can set the same flag. That is the
  same escape hatch an ad blocker already gives them, and Web Analytics is
  cookieless and anonymous regardless.

Adding a page means adding every analytics tag in the same order, or it counts you.

---

## Adding the next tool

1. `mkdir crash-cart` and copy `rack-budget/index.html` as the starting shell.
2. Keep the header block as-is. It carries the suite mark and links back to `/`.
3. Change the tool name in the header, the `<title>`, and the og tags.
4. Add a card to the `.tools` grid in the root `index.html` and flip its tag to Live.
5. Keep the white maker band at the bottom. It is the same on every page by design.
6. Keep the analytics tags in the head, in order: `/assets/analytics.js` first and
   un-deferred, then the deferred insights tag, then the async gtag.js loader and
   its inline config.

## Conventions worth preserving

- Signal green `#3DDC97` for UI accent, `#12A97A` for chart marks.
- Chart ramps are single-hue and validated for colour-blind separation before use.
- The suite chrome is dark. Adrian's brand (cobalt, chartreuse, white) appears only
  in the maker band, which marks the handoff from tool to person.
- Check interactive text contrast after any CSS change. A `.brand a` rule once
  outranked a button rule on specificity and painted a label cobalt on cobalt.
- Never use em-dashes in copy.
