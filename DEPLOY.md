# Deploying Infrabench

Static site. No build step, no dependencies, no framework. Deploy the repo root
as-is.

    /                    suite index
    /og.png              suite social card
    /assets/site.css     shared stylesheet, loaded by every page
    /rack-budget/        Rack Budget
    /rack-budget/og.png  tool social card

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

### Pointing infrabench.io at it

In the Vercel project, **Settings > Domains > Add**, enter `infrabench.io`. Vercel
then shows the exact records for your project. The general-purpose values are:

| Host  | Type  | Value                    |
|-------|-------|--------------------------|
| `@`   | A     | `76.76.21.21`            |
| `www` | CNAME | `cname.vercel-dns-0.com` |

Add those at whichever registrar holds the domain. Confirm with:

    vercel domains inspect infrabench.io
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

## Adding the next tool

1. `mkdir crash-cart` and copy `rack-budget/index.html` as the starting shell.
2. Keep the header block as-is. It carries the suite mark and links back to `/`.
3. Change the tool name in the header, the `<title>`, and the og tags.
4. Add a card to the `.tools` grid in the root `index.html` and flip its tag to Live.
5. Keep the white maker band at the bottom. It is the same on every page by design.

## Conventions worth preserving

- Signal green `#3DDC97` for UI accent, `#12A97A` for chart marks.
- Chart ramps are single-hue and validated for colour-blind separation before use.
- The suite chrome is dark. Adrian's brand (cobalt, chartreuse, white) appears only
  in the maker band, which marks the handoff from tool to person.
- Check interactive text contrast after any CSS change. A `.brand a` rule once
  outranked a button rule on specificity and painted a label cobalt on cobalt.
- Never use em-dashes in copy.
