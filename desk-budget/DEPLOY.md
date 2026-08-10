# Deploying

Static site. No build step, no dependencies, no framework. Deploy the repo root as-is.

    /                       the calculator
    /og.png                 social card
    /favicon.svg            mark
    /favicon.png            mark, raster fallback
    /apple-touch-icon.png   home screen icon
    /assets/analytics.js    Web Analytics opt-out hook

Every internal link is root-relative, so no configuration file, rewrite rule or build
command is required on any host. That also means **this has to be deployed from a
domain root, not a subpath.** A GitHub Pages project page would break the links; use a
custom domain or a user page.

---

## Hosting: Vercel

The free Hobby tier covers this entirely: static files, global CDN, automatic HTTPS,
custom domains.

    npm i -g vercel
    vercel            # from the repo root, accept the defaults
    vercel --prod

When asked for framework preset choose **Other**. Leave build command and output
directory empty.

The path worth settling on is git-backed: **Add New Project**, import the repo,
framework preset **Other**, no build command, root directory `./`, deploy. Pushes to
`main` publish; pushes to any other branch get a preview URL.

### Pointing a domain at it

In the Vercel project, **Settings > Domains > Add**. Vercel then shows the exact
records for your project. The general-purpose values are:

| Host  | Type  | Value                    |
|-------|-------|--------------------------|
| `@`   | A     | `76.76.21.21`            |
| `www` | CNAME | `cname.vercel-dns-0.com` |

If you add both apex and `www`, set a redirect between them so there is one canonical
URL.

### Alternatives

- **Netlify**: drag the folder onto the dashboard, or `netlify deploy --prod --dir .`
- **Cloudflare Pages**: connect the repo, build command empty, output directory `/`

---

## After deploying, check these four things

1. The page loads and the calculator computes on first paint.
2. The social card unfurls. Paste the URL into a card validator and confirm the image
   resolves at `/og.png`. A broken unfurl is the most common launch-day mistake and it
   fails silently.
3. Copy a shareable link out of the calculator, open it in a private window, and
   confirm it restores the set and lands on the numbers.
4. The catalogue and model ladder tables scroll inside their own boxes on a phone,
   rather than dragging the page sideways.

---

## Keeping your own visits out of Web Analytics

Vercel Web Analytics has no dashboard setting to ignore your own traffic. No IP
filter, no toggle. The only supported hook is `beforeSend`, which runs in the browser
on every event and can drop it before anything is sent.

`assets/analytics.js` wires that hook to a `va-disable` key in `localStorage`. It
loads un-deferred, directly above the insights tag, so the hook is queued before the
insights script runs. Order matters. Deferring it would let the first pageview escape.

Turn it on once per browser, per site:

    https://<domain>/?va-disable=1     stop counting this browser
    https://<domain>/?va-disable=0     count it again

The parameter is stripped from the URL immediately after it is read, so it never
reaches an event or gets copied into a shared link.

`localStorage` is scoped per origin, so this is per site, per browser, per profile,
per device. Incognito windows always count. Local development is already uncounted:
the insights script generates no events against a file served off disk.

---

## Conventions worth preserving

- Signal green `#3DDC97` for UI accent. Chart ramps are single-hue and validated for
  colour-blind separation before use.
- Every constant the model uses is printed on the page. If a number moves into the
  code without appearing in the method section, that is a bug.
- Load figures are sustained draw under real work, never power supply nameplates.
- Never use em-dashes in copy.
