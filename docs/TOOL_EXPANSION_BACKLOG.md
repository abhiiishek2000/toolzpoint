# Tool expansion backlog

Research deliverable: a prioritized backlog of high-traffic, browser-only tools
ToolzPoint can add on top of the current 17. 127 candidates are listed below
across 11 categories (8 existing + 3 new), which comfortably clears the "at
least 100 tools" target even after cutting the weaker/harder ones during
implementation.

Every candidate was filtered against the constraints in [AGENTS.md](../AGENTS.md):
`execution: "client"` only, no accounts, no database, no uploading tool
inputs to a server. Anything that fundamentally needs a server (AI image
generation, background removal via ML API, live currency-exchange APIs,
backlink/rank-tracking data) was excluded rather than listed with an asterisk.

## Implementation progress — 2026-09-19

The catalog now contains 78 tools. The ten text utilities from Character Counter through ROT13 / Caesar Cipher (excluding text diff, speech and binary conversion) are implemented with local processing, bounded inputs, examples and tests. New entries remain `reviewed: false`. The tables below preserve the original research backlog, not a list of outstanding implementations.

### Cross-category additions

Added 27 tools covering every current category: binary text; URL parser, timestamps and JSON to CSV; tips, averages and ratios; simple interest, ROI and break-even; BMR; image conversion and rotation; PDF rotation and numbering; sitemaps and hashtag formatting; weight, length, speed, storage and number-base conversion; PINs; dice, random numbers and name picking; and a plain-text receipt maker. These entries remain unreviewed and noindex. This is a cross-category expansion, not completion of every research candidate.

The BMR tool reuses the existing nutrition domain function. Its equation reference is [Mifflin et al. (1990)](https://pubmed.ncbi.nlm.nih.gov/2305711/); the output is an estimate of resting energy, not a prescribed intake. Product decisions for live exchange rates, tax jurisdictions, browser speech privacy, and advanced PDF/JavaScript processing remain deferred.

## Research basis

Web search across current (Sept 2026) "most popular free online tools"
roundups, calculator-keyword-demand articles, developer-tool directories, and
trend pieces on AI/LLM tooling consistently surfaced the same clusters:

- PDF utilities (merge/split/compress/convert) — iLovePDF/PDF2Go/Smallpdf-style
- Finance & loan calculators (EMI, GST, compound interest, SIP) — highest
  volume skews toward India-market search demand, which matches the existing
  SIP calculator and nutrition calculator already in this catalog
- Developer formatting/encoding tools (JSON, Base64, JWT, regex, hash, UUID)
- Text utilities (case converter, lorem ipsum, counters, diff)
- Image tools (compress, resize, convert, watermark, EXIF strip)
- Password/security generators
- Unit/currency/timezone converters
- **AI token counters** (GPT/Claude/Gemini) — a genuinely new-in-2026 high-growth
  category driven by prompt-engineering and API cost estimation

Sources: [Semrush trending websites](https://www.semrush.com/trending-websites/global/all) ·
[Zenixtools – 25 most popular utility websites](https://www.zenixtools.com/blog/most-popular-utility-websites) ·
[EMICalcs – 44 free finance calculators](https://emicalcs.com/) ·
[FWD Tools – developer tools](https://fwdtools.com/developer-tools/) ·
[GPT for Work – tokenizer](https://gptforwork.com/tools/tokenizer) ·
[ConvertKr – 40+ best free PDF tools](https://convertkr.com/best-free-online-pdf-tools/) ·
[Case Converter Tools](https://caseconverter.tools/)

## Proposed new categories

The existing 8 categories (`src/lib/tool-registry.ts`) don't have a clean home
for three well-established, high-traffic clusters. Adding them is a small,
additive change to that file:

| New category slug | Name               | Why it needs its own home                                                                                                                                                                                           |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `converters`      | Converters         | Unit/temperature/timezone/currency conversion is one of the single highest-volume search categories on the web ("cm to inches", "celsius to fahrenheit"). Burying it inside Calculators or Developer undersells it. |
| `security`        | Security & privacy | Password generators and strength checkers are searched by a general (non-developer) audience at very high volume — distinct intent from `Developer`.                                                                |
| `random-fun`      | Random & fun       | Coin flip / dice roller / random picker are massive evergreen search terms ("flip a coin") with their own casual intent, distinct from serious calculators.                                                         |

## Backlog by category

Tier legend — **T1**: pure arithmetic/string logic, no new dependency, fastest
to ship. **T2**: needs a browser Web API (Canvas/File/SubtleCrypto/Intl) or a
small new client-side library. **T3**: real complexity or a product decision
needed before building (flagged individually below the table).

### Text (existing: word-counter)

| Slug                             | Name                    | Why it's high-traffic                                                             | Tier |
| -------------------------------- | ----------------------- | --------------------------------------------------------------------------------- | ---- |
| text-case-converter              | Case Converter          | UPPER/lower/Title/Sentence/camel/snake — near-universal writer & dev need         | T1   |
| character-counter                | Character Counter       | Tweet/SMS/meta-description limit checking is searched independently of word count | T1   |
| lorem-ipsum-generator            | Lorem Ipsum Generator   | Standard designer/dev placeholder text, evergreen volume                          | T1   |
| duplicate-line-remover           | Duplicate Line Remover  | Common data-cleaning micro-task                                                   | T1   |
| remove-line-breaks               | Remove Line Breaks      | Pasting from PDFs/emails leaves broken lines; very specific high-intent query     | T1   |
| text-sorter                      | Text Line Sorter        | Alphabetical/numeric/length sort + dedupe of pasted lists                         | T1   |
| find-and-replace-text            | Find & Replace          | Bulk text editing without opening an editor                                       | T1   |
| whitespace-remover               | Whitespace/Trim Tool    | Cleans extra spaces/tabs from pasted text                                         | T1   |
| text-reverser                    | Text Reverser           | Novelty + genuine QA/testing use, steady search volume                            | T1   |
| text-diff-checker                | Text Diff Checker       | Compare two drafts/configs; strong recurring developer + writer demand            | T2   |
| text-to-speech                   | Text to Speech          | Uses the browser's built-in SpeechSynthesis API — no upload                       | T2   |
| nato-phonetic-alphabet-converter | NATO Phonetic Alphabet  | Niche but consistently searched (call-sign, radio, spelling on calls)             | T1   |
| binary-text-converter            | Text ⇄ Binary Converter | Classic "encode my name in binary" long-tail query                                | T1   |
| rot13-caesar-cipher              | ROT13 / Caesar Cipher   | Educational cipher tool, steady long-tail                                         | T1   |
| speech-to-text                   | Speech to Text          | High demand, but Web Speech API browser support is inconsistent (flag below)      | T3   |

### Developer (existing: json-formatter, base64-encoder-decoder, url-encoder-decoder, uuid-generator)

| Slug                      | Name                                 | Why it's high-traffic                                                                | Tier |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ | ---- |
| jwt-decoder               | JWT Decoder                          | Every web dev debugging auth needs this; decode-only, no signature verify            | T1   |
| regex-tester              | Regex Tester                         | Perennial top-10 developer-tool search term                                          | T1   |
| hash-generator            | Hash Generator (SHA-1/256/512)       | SubtleCrypto is built into the browser; no upload                                    | T1   |
| csv-to-json-converter     | CSV to JSON                          | Extremely common data-wrangling task                                                 | T1   |
| json-to-csv-converter     | JSON to CSV                          | Inverse of the above, equally searched                                               | T1   |
| xml-formatter             | XML Formatter/Validator              | Legacy-format demand stays surprisingly high                                         | T1   |
| html-minifier             | HTML Minifier                        | Pairs naturally with existing JSON minify pattern                                    | T1   |
| html-beautifier           | HTML Beautifier                      | Inverse of minifier; both searched heavily                                           | T1   |
| css-minifier              | CSS Minifier                         | Standard front-end build-adjacent utility                                            | T1   |
| css-beautifier            | CSS Beautifier                       | Inverse of minifier                                                                  | T1   |
| color-converter           | Color Converter (HEX/RGB/HSL)        | Designer + dev staple, huge volume                                                   | T1   |
| timestamp-converter       | Unix Timestamp Converter             | Native `Date`/`Intl`; constant developer need                                        | T1   |
| markdown-previewer        | Markdown Previewer                   | Must sanitize rendered HTML output (flag below)                                      | T2   |
| http-status-code-lookup   | HTTP Status Code Lookup              | Static reference table, cheap to build, steady search volume                         | T1   |
| url-parser                | URL Parser                           | Native `URL` API; break a link into scheme/host/path/query                           | T1   |
| css-gradient-generator    | CSS Gradient Generator               | Visual + copy-paste code, strong shareable-tool traffic                              | T1   |
| box-shadow-generator      | CSS Box-Shadow Generator             | Same pattern as gradient generator, pairs well                                       | T1   |
| yaml-json-converter       | YAML ⇄ JSON Converter                | Needs a small YAML parser dependency                                                 | T2   |
| cron-expression-explainer | Cron Expression Explainer            | Logic-heavy but pure JS; sysadmin/dev staple                                         | T2   |
| user-agent-parser         | User-Agent Parser                    | Regex-based, inherently approximate — label as such                                  | T2   |
| **ai-token-counter**      | AI Token Counter (GPT/Claude/Gemini) | 2026's fastest-growing tool category per research; needs a bundled tokenizer lib     | T2   |
| js-minifier               | JavaScript Minifier                  | Real correctness risk on arbitrary input; scope to whitespace/comments only or defer | T3   |

### Calculators (existing: percentage-calculator, age-calculator)

| Slug                       | Name                                  | Why it's high-traffic                                                 | Tier |
| -------------------------- | ------------------------------------- | --------------------------------------------------------------------- | ---- |
| date-difference-calculator | Date Difference Calculator            | "Days between two dates" is a top calculator query, distinct from age | T1   |
| time-duration-calculator   | Time Duration Calculator              | Add/subtract hours:minutes:seconds                                    | T1   |
| countdown-timer            | Countdown to Date                     | Event/deadline countdowns, evergreen shareable tool                   | T1   |
| discount-calculator        | Discount/Sale Price Calculator        | Shopping-season evergreen spike traffic                               | T1   |
| tip-calculator             | Tip Calculator                        | Classic top-10 utility calculator                                     | T1   |
| average-calculator         | Average / Mean-Median-Mode Calculator | Student + data-cleaning use                                           | T1   |
| ratio-calculator           | Ratio Calculator                      | Recipe scaling, mixing, finance ratios                                | T1   |
| gpa-calculator             | GPA Calculator                        | Massive recurring student-season search spikes                        | T1   |
| quadratic-equation-solver  | Quadratic Equation Solver             | Steady student search volume                                          | T1   |
| scientific-calculator      | Scientific Calculator                 | High baseline search volume as a utility page                         | T1   |
| work-hours-calculator      | Work Hours / Timesheet Calculator     | Payroll-adjacent, recurring weekly searches                           | T1   |

### Finance (existing: sip-calculator)

| Slug                             | Name                              | Why it's high-traffic                                                                         | Tier |
| -------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| emi-loan-calculator              | EMI / Loan Calculator             | One of the single highest-volume finance-calculator terms                                     | T1   |
| compound-interest-calculator     | Compound Interest Calculator      | Extremely high, evergreen                                                                     | T1   |
| simple-interest-calculator       | Simple Interest Calculator        | Pairs with compound interest, both searched heavily                                           | T1   |
| gst-calculator                   | GST Calculator                    | Very high India-market volume; matches existing SIP audience                                  | T1   |
| mortgage-calculator              | Mortgage Calculator               | Huge global volume, especially US/UK                                                          | T1   |
| fd-calculator                    | Fixed Deposit (FD) Calculator     | Pairs naturally with existing SIP calculator                                                  | T1   |
| rd-calculator                    | Recurring Deposit (RD) Calculator | Same audience as FD/SIP                                                                       | T1   |
| roi-calculator                   | ROI Calculator                    | Business + marketing recurring search term                                                    | T1   |
| break-even-calculator            | Break-Even Point Calculator       | Small-business staple                                                                         | T1   |
| inflation-calculator             | Inflation Calculator              | Evergreen, spikes with economic news cycles                                                   | T1   |
| savings-goal-calculator          | Savings Goal Calculator           | "How much to save monthly for X" intent                                                       | T1   |
| credit-card-payoff-calculator    | Credit Card Payoff Calculator     | High personal-finance intent                                                                  | T1   |
| net-worth-calculator             | Net Worth Calculator              | Simple summation tool, strong personal-finance demand                                         | T1   |
| ctc-to-in-hand-salary-calculator | Take-Home Salary Calculator       | Very high India-market volume, but tax slabs are jurisdiction- and year-specific (flag below) | T3   |

### Health & nutrition (existing: nutrition-calculator, bmi-calculator)

| Slug                           | Name                                | Why it's high-traffic                                                                                                                                | Tier |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| bmr-calculator                 | BMR Calculator                      | Independently searched at high volume even though it's related to the existing nutrition calculator — check for overlap before building (flag below) | T1   |
| ideal-weight-calculator        | Ideal Weight Calculator             | Very high recurring volume, cite Devine/Robinson formula source                                                                                      | T1   |
| body-fat-percentage-calculator | Body Fat % Calculator               | US Navy method is a well-documented client-side formula                                                                                              | T1   |
| waist-to-hip-ratio-calculator  | Waist-to-Hip Ratio Calculator       | WHO-referenced, steady health search volume                                                                                                          | T1   |
| water-intake-calculator        | Daily Water Intake Calculator       | Very high seasonal (summer) search spikes                                                                                                            | T1   |
| heart-rate-zone-calculator     | Heart Rate Zone Calculator          | Fitness-tracker-adjacent, strong steady demand                                                                                                       | T1   |
| macro-calculator               | Macro (Protein/Carb/Fat) Calculator | Fitness/diet-culture evergreen high volume                                                                                                           | T1   |
| pregnancy-due-date-calculator  | Pregnancy Due Date Calculator       | Naegele's rule; very high volume, needs clear medical-disclaimer                                                                                     | T1   |
| ovulation-calculator           | Ovulation Calculator                | Pairs with due-date calculator, same disclaimer pattern                                                                                              | T1   |
| sleep-cycle-calculator         | Sleep Cycle Calculator              | 90-minute-cycle math; strong recurring demand                                                                                                        | T1   |
| calories-burned-calculator     | Calories Burned Calculator          | Needs a MET-value reference table, cite source                                                                                                       | T2   |

### Images (existing: image-compressor, image-resizer)

| Slug                       | Name                                   | Why it's high-traffic                                               | Tier |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------- | ---- |
| image-format-converter     | Image Format Converter (PNG/JPG/WEBP)  | Extremely common "convert X to Y" image query                       | T1   |
| image-to-base64            | Image to Base64                        | Developer staple for inlining small assets                          | T1   |
| base64-to-image            | Base64 to Image                        | Inverse of the above                                                | T1   |
| image-rotator-flipper      | Image Rotate/Flip                      | Simple canvas transform, high baseline volume                       | T1   |
| svg-to-png-converter       | SVG to PNG Converter                   | Common design-handoff task                                          | T1   |
| social-media-image-resizer | Social Media Image Resizer             | Presets for IG/FB/X/LinkedIn/YouTube; reuses existing resizer logic | T1   |
| image-color-picker         | Image Color Picker / Palette Extractor | Canvas pixel read; popular designer tool                            | T2   |
| image-cropper              | Image Cropper                          | Needs a crop-selection UI on canvas                                 | T2   |
| favicon-generator          | Favicon Generator                      | Multi-size PNG/ICO export from one image                            | T2   |
| exif-metadata-viewer       | EXIF Metadata Viewer & Remover         | Strong "remove GPS location from photo" privacy angle               | T2   |
| image-watermark-tool       | Image Watermark Tool                   | Canvas text/image compositing                                       | T2   |
| meme-generator             | Meme Generator                         | Canvas text overlay on template/uploaded image                      | T2   |
| photo-collage-maker        | Photo Collage Maker                    | Real layout-engine complexity; lower priority                       | T3   |

### PDF tools (existing: merge-pdf, images-to-pdf)

| Slug                    | Name                         | Why it's high-traffic                                                                                            | Tier |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---- |
| split-pdf               | Split PDF                    | Direct counterpart to merge-pdf, equally searched, pdf-lib already a dependency                                  | T1   |
| rotate-pdf              | Rotate PDF                   | pdf-lib supports page rotation directly                                                                          | T1   |
| organize-pdf-pages      | Reorder / Delete PDF Pages   | pdf-lib supports page manipulation directly                                                                      | T1   |
| pdf-page-counter        | PDF Page Count & Info Viewer | Trivial with pdf-lib, still independently searched                                                               | T1   |
| watermark-pdf           | Watermark PDF                | pdf-lib drawText/drawImage over pages                                                                            | T1   |
| add-page-numbers-to-pdf | Add Page Numbers to PDF      | pdf-lib drawText per page                                                                                        | T1   |
| pdf-to-images           | PDF to JPG/PNG               | Needs pdf.js for rendering — new dependency                                                                      | T2   |
| pdf-to-text             | PDF to Text Extractor        | Needs pdf.js text-layer extraction — new dependency                                                              | T2   |
| compress-pdf            | Compress PDF                 | Real client-side compression is limited (mostly image downsampling inside the PDF); scope expectations carefully | T3   |

### SEO & social (existing: slug-generator, utm-builder, qr-code-generator)

| Slug                           | Name                                    | Why it's high-traffic                                                                         | Tier |
| ------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| meta-tag-generator             | Meta Tag Generator                      | Core on-page SEO utility, very high volume                                                    | T1   |
| open-graph-preview-generator   | Open Graph Preview Generator            | Shareable, visual — strong link-building/social traffic                                       | T1   |
| twitter-card-generator         | X/Twitter Card Generator                | Pairs with OG preview, same audience                                                          | T1   |
| robots-txt-generator           | robots.txt Generator                    | Classic SEO-tool-directory staple                                                             | T1   |
| sitemap-generator              | XML Sitemap Generator                   | Builds sitemap XML from a pasted URL list, no crawling needed                                 | T1   |
| keyword-density-checker        | Keyword Density Checker                 | Long-standing SEO-tools category staple                                                       | T1   |
| serp-snippet-preview           | Google SERP Snippet Preview             | Visual live-preview tool, strong shareability                                                 | T1   |
| seo-title-meta-length-checker  | Title & Meta Description Length Checker | Very commonly searched pixel/character-limit checker                                          | T1   |
| social-media-character-counter | Social Post Character Counter           | Per-platform limits (X/Threads/Instagram/LinkedIn)                                            | T1   |
| utm-qr-code-generator          | UTM + QR Code Generator                 | Combines two existing tools' logic into one differentiated offering                           | T1   |
| hashtag-generator              | Hashtag Formatter & Counter             | Without a tag-relevance dataset this is really a formatter/counter — scope the claim honestly | T2   |

### Converters (new category)

| Slug                    | Name                                       | Why it's high-traffic                                                   | Tier |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ---- |
| temperature-converter   | Temperature Converter (°C/°F/K)            | One of the single highest-volume standalone conversion queries          | T1   |
| weight-converter        | Weight Converter (kg/lb/oz/stone)          | Constant top-volume unit conversion                                     | T1   |
| length-converter        | Length/Distance Converter (cm/in/ft/km/mi) | Constant top-volume unit conversion                                     | T1   |
| speed-converter         | Speed Converter (km/h, mph, m/s, knots)    | Steady niche-but-frequent demand                                        | T1   |
| data-storage-converter  | Data Storage Converter (KB/MB/GB/TB)       | Common dev/consumer question                                            | T1   |
| timezone-converter      | Timezone Converter                         | `Intl.DateTimeFormat` handles this natively, no library needed          | T1   |
| number-base-converter   | Number Base Converter (bin/oct/dec/hex)    | Steady developer + student demand                                       | T1   |
| roman-numeral-converter | Roman Numeral Converter                    | Small but very consistent long-tail volume                              | T1   |
| currency-converter      | Currency Converter                         | Needs a rate-data source decision since there's no backend (flag below) | T3   |

### Security & privacy (new category)

| Slug                      | Name                                  | Why it's high-traffic                                                                            | Tier |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| password-generator        | Password Generator                    | One of the highest-volume utility-tool searches on the entire web                                | T1   |
| pin-code-generator        | PIN Code Generator                    | Simple numeric variant of the above, independently searched                                      | T1   |
| password-strength-checker | Password Strength Checker             | Pairs naturally with the generator; simplified entropy-based scoring, no heavy dependency needed | T1   |
| passphrase-generator      | Passphrase Generator (Diceware-style) | Growing security-conscious-user demand; needs a bundled wordlist asset                           | T2   |
| file-checksum-verifier    | File Checksum Verifier                | File API + SubtleCrypto reading a local file, never uploaded                                     | T2   |
| text-encryption-tool      | Text Encryption/Decryption (AES)      | Real crypto UX (key derivation, salt/IV) — needs careful correctness review                      | T3   |

### Random & fun (new category)

| Slug                     | Name                      | Why it's high-traffic                                           | Tier |
| ------------------------ | ------------------------- | --------------------------------------------------------------- | ---- |
| coin-flip                | Coin Flip                 | "Flip a coin" is a massive, extremely consistent search term    | T1   |
| dice-roller              | Dice Roller               | Same category as coin flip, tabletop-gaming crossover traffic   | T1   |
| random-number-generator  | Random Number Generator   | Core utility, huge steady volume                                | T1   |
| random-name-picker       | Random Name / Team Picker | Classroom/team-building recurring use case                      | T1   |
| lottery-number-generator | Lottery Number Generator  | High seasonal spikes around jackpots                            | T1   |
| yes-no-decision-wheel    | Yes/No Decision Wheel     | Novelty tool, strong shareability, animation is optional polish | T2   |

## Suggested first build batch (Tier 1, spread across categories)

If picking one batch to prove the pattern before scaling up, these 12 are the
best mix of highest search intent + lowest implementation risk (all pure
logic, no new dependencies beyond what's already installed):

1. `password-generator` (Security & privacy)
2. `coin-flip` (Random & fun)
3. `emi-loan-calculator` (Finance)
4. `compound-interest-calculator` (Finance)
5. `temperature-converter` (Converters)
6. `text-case-converter` (Text)
7. `hash-generator` (Developer)
8. `jwt-decoder` (Developer)
9. `split-pdf` (PDF tools — mirrors existing merge-pdf/pdf-lib usage)
10. `discount-calculator` (Calculators)
11. `meta-tag-generator` (SEO & social)
12. `bmr-calculator` (Health & nutrition — pending the overlap check below)

## Flags requiring a decision before/while building

- **`ctc-to-in-hand-salary-calculator`**: tax slabs are jurisdiction- and
  tax-year-specific. Either scope explicitly to one stated country/year with a
  prominent "illustrative only" disclaimer (matching the existing health-tool
  disclaimer pattern in `src/app/tools/[slug]/page.tsx`), or drop it.
- **`currency-converter`**: no backend means no live FX feed. Options are (a)
  a static rate table bundled at build time with a visible "rates as of
  [date], for estimates only" notice, refreshed manually on a schedule, or (b)
  drop it. This needs a product call, not an engineering one.
- **`bmr-calculator`**: check whether `nutrition-calculator`'s domain logic
  (`src/features/tools/nutrition-calculator/`) already exposes BMR — if so,
  this becomes a thin, SEO-targeted landing page reusing that logic rather
  than new domain code.
- **`js-minifier`**: minifying arbitrary JavaScript correctly (without
  breaking ASI edge cases) is a real correctness risk. Recommend scoping to
  comment/whitespace stripping only, with an explicit limitation note, or
  deferring in favor of the lower-risk `css-minifier`/`html-minifier`.
- **`text-encryption-tool`**: uses `SubtleCrypto` AES-GCM with a
  passphrase-derived key (PBKDF2). Needs the same "independently checked
  examples" rigor AGENTS.md requires elsewhere, since a subtly wrong salt/IV
  scheme is a real security bug, not just a UX bug.
- **`speech-to-text`**: the Web Speech API's recognition side has inconsistent
  browser support (weak/absent outside Chromium). Ship `text-to-speech`
  (synthesis, broadly supported) first and treat recognition as optional.
- **`hashtag-generator`**: without a relevance dataset this can only format
  and count hashtags, not suggest new ones — name and describe it honestly as
  a formatter, not a "generator" that invents tags.
- **MD5 in `hash-generator`**: `SubtleCrypto` doesn't implement MD5 (it's
  cryptographically broken). Lead with SHA-1/256/512 via `SubtleCrypto`; only
  add MD5 if a small pure-JS implementation is acceptable for a
  legacy-compatibility checksum use case.

## Mechanical checklist for adding one tool

Confirmed by reading the current codebase (`src/lib/tool-registry.ts`,
`src/components/ToolWorkspace.tsx`, `src/components/Icon.tsx`,
`tests/registry.test.ts`):

1. Add an entry to `src/lib/catalog-data.json`: `slug`, `name`, `category`
   (must match a name in `src/lib/tool-registry.ts`'s `categories`), `icon`
   (must exist in `src/components/Icon.tsx`'s import map — add the
   `lucide-react` import if it's new), `shortDescription`, `intro` (60+ words,
   enforced by `tests/registry.test.ts`), `how`, `examples` (2+,
   independently verified — not just plausible-looking), `limitations`,
   `faq` (3+), `keywords`, `status: "published"`, `execution: "client"`,
   `featured`, `publishedAt`/`updatedAt`, `reviewed: false`, `relatedSlugs`
   (4+, each must resolve to a real slug).
2. Add pure calculation/validation logic in
   `src/features/tools/<slug>/domain.ts` — no React, no network, no storage
   (per `AGENTS.md`).
3. Wire the UI: add a `Field[]` entry to the `definitions` map in
   `src/components/ToolWorkspace.tsx` for simple form-based tools, or a
   dedicated component (following the `FileStudio`/`QrCreator` pattern) for
   file-based or custom-UI tools.
4. Add domain tests with independently-verified expected outputs (see
   `tests/domain.test.ts` for the existing pattern).
5. Bump the hard-coded total in `tests/registry.test.ts`
   (`expect(tools).toHaveLength(17)` → new count).
6. Update the "Included tools" list in `README.md`.
7. Leave `reviewed: false` until a human checks the content — this keeps new
   tools `noindex` and out of the sitemap automatically, per the existing
   publication policy in `AGENTS.md`/`README.md`.

## Tally

- Existing published tools: 17
- New candidates in this backlog: 127 (Text 15 · Developer 22 · Calculators 11
  · Finance 14 · Health & nutrition 11 · Images 13 · PDF tools 9 · SEO &
  social 11 · Converters 9 · Security & privacy 6 · Random & fun 6)
- Tier 1 (ready to build now, no new dependency): ~100
- Tier 2 (needs a Web API or small new library): ~20
- Tier 3 (needs a product/scope decision first, listed above): 7
