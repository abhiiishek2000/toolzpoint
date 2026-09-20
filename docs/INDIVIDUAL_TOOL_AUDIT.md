# Individual tool audit — 20 September 2026

This inventory accounts for all 100 stable tool routes: 82 calculated/text reports and 18 file/document/QR workflows. Reports inspect actual results, with bounded tables and local processing. This is an engineering audit; it does not grant human-reviewed health, legal or publication approval.

Each row has its own case in tests/e2e/individual-audit.spec.ts (desktop and mobile). The 82 generic tools also have named cases in tests/individual-tools.test.ts; independently specified calculation examples remain in the domain test suites. File cases open downloaded PDFs or inspect image headers. Verification totals and environmental limitations are recorded below after the final run.

| Tool                                | Individual result experience                                           | Verification                                   |
| ----------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Word Counter                        | Word frequency breakdown                                               | Domain report + browser workflow               |
| JSON Formatter                      | JSON structure explorer                                                | Domain report + browser workflow               |
| Percentage Calculator               | Percentage calculation breakdown                                       | Domain report + browser workflow               |
| Age Calculator                      | Age timeline                                                           | Domain report + browser workflow               |
| Base64 Encoder / Decoder            | Base64 encoding inspection                                             | Domain report + browser workflow               |
| URL Encoder / Decoder               | URL escape inspection                                                  | Domain report + browser workflow               |
| UUID Generator                      | UUID batch inspection                                                  | Domain report + browser workflow               |
| Slug Generator                      | URL slug review                                                        | Domain report + browser workflow               |
| UTM Link Builder                    | Campaign tracking parameters                                           | Domain report + browser workflow               |
| SIP Calculator                      | SIP assumption ledger; monthly/yearly schedule, chart and CSV          | Domain report + browser workflow               |
| Nutrition Calculator                | Macronutrient energy breakdown                                         | Domain report + browser workflow               |
| BMI Calculator                      | Adult BMI reference bands                                              | Domain report + browser workflow               |
| Image Compressor                    | Compression quality and size report                                    | Actual file export/inspection browser workflow |
| Image Resizer                       | Resize dimensions and aspect ratio                                     | Actual file export/inspection browser workflow |
| Merge PDF                           | Merged PDF source order                                                | Actual file export/inspection browser workflow |
| Images to PDF                       | Image-to-page mapping                                                  | Actual file export/inspection browser workflow |
| QR Code Generator                   | QR encoding and print specification                                    | Actual file export/inspection browser workflow |
| Password Generator                  | Password batch checks                                                  | Domain report + browser workflow               |
| Coin Flip                           | Coin flip distribution                                                 | Domain report + browser workflow               |
| EMI / Loan Calculator               | Loan repayment assumptions; monthly/yearly schedule, chart and CSV     | Domain report + browser workflow               |
| Compound Interest Calculator        | Compounding assumption ledger; monthly/yearly schedule, chart and CSV  | Domain report + browser workflow               |
| Temperature Converter               | Conversion input audit                                                 | Domain report + browser workflow               |
| Discount Calculator                 | Sale price comparison                                                  | Domain report + browser workflow               |
| Ideal Weight Calculator             | Devine formula components                                              | Domain report + browser workflow               |
| Case Converter                      | Compare text case formats                                              | Domain report + browser workflow               |
| Hash Generator                      | Digest specification                                                   | Domain report + browser workflow               |
| JWT Decoder                         | Unverified JWT claims                                                  | Domain report + browser workflow               |
| Meta Tag Generator                  | Metadata field checks                                                  | Domain report + browser workflow               |
| Split PDF                           | Extracted page mapping                                                 | Actual file export/inspection browser workflow |
| Passport & ID Photo Maker           | Photo crop and export checks                                           | Actual file export/inspection browser workflow |
| Date Difference Calculator          | Date interval in different units                                       | Domain report + browser workflow               |
| Pregnancy Due Date Calculator       | Pregnancy date calculation                                             | Domain report + browser workflow               |
| Ovulation Calculator                | Estimated cycle timeline                                               | Domain report + browser workflow               |
| GST Calculator                      | Tax reconciliation                                                     | Domain report + browser workflow               |
| Water Intake Calculator             | Water estimate in common units                                         | Domain report + browser workflow               |
| Body Fat Percentage Calculator      | Body-fat measurement audit                                             | Domain report + browser workflow               |
| Waist-to-Hip Ratio Calculator       | Waist-to-hip calculation                                               | Domain report + browser workflow               |
| Heart Rate Zone Calculator          | Training zone reference                                                | Domain report + browser workflow               |
| Savings Goal Calculator             | Savings target assumptions; monthly/yearly schedule, chart and CSV     | Domain report + browser workflow               |
| Invoice Maker                       | Invoice export verification                                            | Actual file export/inspection browser workflow |
| Biodata Maker                       | Biodata sharing review                                                 | Actual file export/inspection browser workflow |
| Character Counter                   | Where the characters come from                                         | Domain report + browser workflow               |
| Lorem Ipsum Generator               | Paragraph plan                                                         | Domain report + browser workflow               |
| Duplicate Line Remover              | Duplicate lines removed                                                | Domain report + browser workflow               |
| Remove Line Breaks                  | Line joining review                                                    | Domain report + browser workflow               |
| Text Line Sorter                    | Sorted line order                                                      | Domain report + browser workflow               |
| Find & Replace                      | Replacement report                                                     | Domain report + browser workflow               |
| Whitespace/Trim Tool                | Whitespace cleanup report                                              | Domain report + browser workflow               |
| Text Reverser                       | Grapheme-safe reversal                                                 | Domain report + browser workflow               |
| NATO Phonetic Alphabet              | Letter-by-letter phonetic guide                                        | Domain report + browser workflow               |
| ROT13 / Caesar Cipher               | Cipher alphabet mapping                                                | Domain report + browser workflow               |
| Text / Binary Converter             | UTF-8 byte inspector                                                   | Domain report + browser workflow               |
| URL Parser                          | Query parameters in order                                              | Domain report + browser workflow               |
| Unix Timestamp Converter            | Timestamp equivalents                                                  | Domain report + browser workflow               |
| JSON to CSV Converter               | CSV column audit                                                       | Domain report + browser workflow               |
| Tip Calculator                      | Bill splitting ledger                                                  | Domain report + browser workflow               |
| Average & Median Calculator         | Sorted distribution & frequency                                        | Domain report + browser workflow               |
| Ratio Calculator                    | Equivalent ratios                                                      | Domain report + browser workflow               |
| Simple Interest Calculator          | Simple interest assumptions; monthly/yearly schedule, chart and CSV    | Domain report + browser workflow               |
| ROI Calculator                      | Investment proceeds reconciliation                                     | Domain report + browser workflow               |
| Break-Even Calculator               | Profit around break-even                                               | Domain report + browser workflow               |
| BMR / Resting Energy Calculator     | Resting energy equation terms                                          | Domain report + browser workflow               |
| XML Sitemap Generator               | Sitemap URL inventory                                                  | Domain report + browser workflow               |
| Hashtag Formatter & Counter         | Cleaned hashtag list                                                   | Domain report + browser workflow               |
| Weight Converter                    | Conversion input audit                                                 | Domain report + browser workflow               |
| Length Converter                    | Conversion input audit                                                 | Domain report + browser workflow               |
| Speed Converter                     | Conversion input audit                                                 | Domain report + browser workflow               |
| Data Storage Converter              | Conversion input audit                                                 | Domain report + browser workflow               |
| Number Base Converter               | The same integer in common bases                                       | Domain report + browser workflow               |
| PIN Code Generator                  | PIN batch checks                                                       | Domain report + browser workflow               |
| Dice Roller                         | Individual dice results                                                | Domain report + browser workflow               |
| Random Number Generator             | Random draw frequencies                                                | Domain report + browser workflow               |
| Random Name Picker                  | Name draw transparency                                                 | Domain report + browser workflow               |
| Payment Receipt Maker               | Receipt verification checklist                                         | Domain report + browser workflow               |
| Image Format Converter              | Format conversion specification                                        | Actual file export/inspection browser workflow |
| Image Rotate & Flip                 | Rotation and flip operations                                           | Actual file export/inspection browser workflow |
| Rotate PDF                          | Rotation by page                                                       | Actual file export/inspection browser workflow |
| Add Page Numbers to PDF             | Page number placement                                                  | Actual file export/inspection browser workflow |
| Macro (Protein/Carb/Fat) Calculator | Macronutrient energy breakdown                                         | Domain report + browser workflow               |
| Sleep Cycle Calculator              | Sleep window comparison                                                | Domain report + browser workflow               |
| Calories Burned Calculator          | Activity energy by duration                                            | Domain report + browser workflow               |
| Reorder & Delete PDF Pages          | Rebuilt page order                                                     | Actual file export/inspection browser workflow |
| PDF Page Count & Info Viewer        | Page-by-page PDF inspection                                            | Actual file export/inspection browser workflow |
| Watermark PDF                       | Watermark on each page                                                 | Actual file export/inspection browser workflow |
| Mortgage Calculator                 | Mortgage payment components; monthly/yearly schedule, chart and CSV    | Domain report + browser workflow               |
| Fixed Deposit (FD) Calculator       | Fixed deposit assumptions; monthly/yearly schedule, chart and CSV      | Domain report + browser workflow               |
| Recurring Deposit (RD) Calculator   | Recurring deposit assumptions; monthly/yearly schedule, chart and CSV  | Domain report + browser workflow               |
| Inflation Calculator                | Inflation scenario assumptions; monthly/yearly schedule, chart and CSV | Domain report + browser workflow               |
| Net Worth Calculator                | Assets and liabilities ledger                                          | Domain report + browser workflow               |
| GPA Calculator                      | Course-by-course GPA calculation                                       | Domain report + browser workflow               |
| Quadratic Equation Solver           | Quadratic solution steps                                               | Domain report + browser workflow               |
| Work Hours Calculator               | Shift-by-shift timesheet                                               | Domain report + browser workflow               |
| Timezone Converter                  | Time zone comparison                                                   | Domain report + browser workflow               |
| Roman Numeral Converter             | Roman numeral decomposition                                            | Domain report + browser workflow               |
| Open Graph Preview Generator        | Social preview truncation                                              | Domain report + browser workflow               |
| Social Post Character Counter       | Compare platform character budgets                                     | Domain report + browser workflow               |
| Password Strength Checker           | Password characteristics, not a security guarantee                     | Domain report + browser workflow               |
| Lottery Number Generator            | Lottery draw pools                                                     | Domain report + browser workflow               |
| Social Media Image Resizer          | Social image crop specification                                        | Actual file export/inspection browser workflow |
| Resume Maker                        | Resume export inspection                                               | Actual file export/inspection browser workflow |

## Corrections from the audit

- Quadratic roots preserve small roots; negative leading coefficients produce readable complex roots.
- Lottery bonus counts cannot exceed their pool; net-worth rows require a label and amount.
- Password analysis flags common/repeated patterns, bounds work to 1,024 characters, and masks input.
- PDF inspection runs in a cancellable 45-second worker and lists each page (up to 400).
- Image previews validate dimensions before decoding. Every image operation includes original/processed comparison.
- Split/organize PDFs enforce page bounds. File results provide original-to-output page mappings or dimensions and operation settings.
- Document makers report actual exported PDF page and byte counts, have resets, and hide stale reports. Partially filled invoice/resume entries are validated rather than silently dropped.
- Invoice dates are validated and cannot have an earlier due date.
- Waist-to-hip screening uses the WHO reference thresholds (0.90 male / 0.85 female), replacing the unsupported three-tier WHO attribution. Source: https://www.who.int/publications/i/item/9789241501491 . Below threshold does not imply individual low risk. Human clinical review remains a release gate.

## SEO and publication

All routes retain stable URLs, server-rendered descriptions, method and example content, three FAQs, related links, canonical URLs and matching structured data. Generic FAQ blocks now describe the individual report. Keywords describe actual capabilities; rankings are not guaranteed. Existing reviewed flags and indexing configuration are preserved. Confirm canonical origin, operator/contact/policies, health review and rollback monitoring before production publication.

## Final verification

Verified with Node 24.21.0:

- `npm run format:check`, `npm run lint`, `npm run typecheck`: passed.
- `npm test`: 305 tests passed across 14 files. Includes independently specified schedule balances, course weighting, overnight shifts, UTF-8 byte values, nutrient allocations, break-even scenarios, PDF page inspection and audit regressions.
- `npm run build -- --webpack`: passed; 256 routes generated.
- `npm run test:e2e -- --workers=4`: 340 tests passed. Every one of the 100 tools has an individual workflow on desktop and mobile. Each result page is scanned for serious/critical accessibility violations. Actual downloaded files, resets, metadata, narrow-screen fit, reduced motion, dark mode and schedule exports are covered by the suite.
- Initial word-counter JavaScript is approximately 143.5 KiB gzip, below the unchanged 170 KiB gate. Time-zone options are separated from calculation code, and calculation/report modules load after interaction.
- Manual browser inspection verified the SIP chart and schedule layout and the invoice overflow fix.
- `git diff --check`: passed.

Environmental limitation: the default Turbopack `npm run build` previously failed with `binding to a port — Operation not permitted (os error 1)`, including a permission-elevated retry. The supported Webpack build above is the production artifact used for browser tests. Local browser tests require permission to bind port 3000; their approved runs passed. No lint, type or accessibility failures were suppressed, and the JavaScript budget was not raised.

This verifies the implemented workflows on Playwright Chromium desktop/mobile profiles. It does not establish search rankings, production real-user performance, clinical approval, or compatibility with every browser/file. Human review and the existing launch requirements in AGENTS.md remain necessary before enabling production indexing or deployment.
