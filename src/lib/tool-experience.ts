import type { ToolDefinition } from "./tool-registry";

// Result interpretation is specific to the actual operation, not a claim that
// a calculation has been professionally reviewed or that an estimate is certain.
export const resultGuides: Record<string, string> = {
  "word-counter":
    "Use words for a draft's length and characters for a field limit. Reading time is an estimate at 200 words per minute; punctuation and emoji can affect other counts.",
  "json-formatter":
    "The output is valid JSON syntax. Formatting does not verify the meaning of your data; check large integers and duplicate keys before replacing the original.",
  "percentage-calculator":
    "Check the selected calculation: a percentage of an amount, one number as a percentage of another, or a change from the original value. A negative change means a decrease.",
  "age-calculator":
    "Years, months and days describe calendar age on the selected date. Total days is a different measure; the next birthday uses the same reference date.",
  "base64-encoder-decoder":
    "Encoded output represents UTF-8 text in Base64. Decode to check a round trip. Base64 makes text transferable; it does not protect a secret.",
  "url-encoder-decoder":
    "Use component mode for a query value or path segment. Full URL mode preserves URL separators. Check the mode before copying the output into a link.",
  "uuid-generator":
    "Each line is a newly generated version 4 UUID. Copy the values you need; running the generator again creates a different set.",
  "slug-generator":
    "Check that the slug still describes the page after punctuation or unsupported characters are removed. Changing an existing public URL may require a redirect.",
  "utm-builder":
    "Check the destination and each campaign value before sharing. Consistent source and medium names make campaign reports easier to compare.",
  "sip-calculator":
    "Estimated total includes your deposits and modeled returns. Compare the deposited amount with growth in the chart, then inspect each month or year in the schedule below.",
  "nutrition-calculator":
    "Resting energy and daily energy are different estimates. The activity multiplier changes daily energy; protein, fat and carbohydrate grams follow your chosen energy split.",
  "bmi-calculator":
    "BMI relates weight to height; the category is a general adult screening reference. It does not measure body composition or diagnose your health.",
  "image-compressor":
    "Compare the preview and output file size with the original. Inspect fine text and sharp edges at full size before downloading a smaller image.",
  "image-resizer":
    "Check the output width and height in pixels. The image fits within your chosen box while keeping its proportions; small images are not enlarged.",
  "merge-pdf":
    "Check the file order and combined page count before downloading. The first file becomes the beginning of the merged PDF.",
  "images-to-pdf":
    "Check image order, page orientation and fit in the output. Your chosen sequence becomes the page sequence in the PDF.",
  "qr-code-generator":
    "Scan the preview with a second device before printing. Check the exact destination and leave the quiet border intact for reliable scanning.",
  "password-generator":
    "Choose one generated password for each account and save it in a password manager. Generating again replaces the displayed set.",
  "coin-flip":
    "Heads and tails show the counts in this run; the sequence shows their order. Short runs need not have equal counts, and past flips do not predict the next one.",
  "emi-loan-calculator":
    "EMI is the regular loan payment. Total payment includes principal and interest. The schedule shows how each payment reduces the balance; lender fees are separate.",
  "compound-interest-calculator":
    "Maturity amount includes your starting principal and accumulated interest. The schedule shows modeled growth at the selected compounding frequency, including any partial final period.",
  "temperature-converter":
    "Check the input and output scales. Temperature conversions use offsets as well as multiplication, so zero on one scale need not be zero on another.",
  "discount-calculator":
    "Sale price is the amount after the discount; savings is the difference from the original price. Additional tax or delivery fees are not included.",
  "ideal-weight-calculator":
    "Treat the displayed estimate as a height-based adult reference, not a personal target. Body composition and individual health needs are outside this calculation.",
  "text-case-converter":
    "Check names, abbreviations and sentence boundaries in the output. Automatic case changes cannot infer the intended capitalization of every word.",
  "hash-generator":
    "The digest identifies the exact input bytes under the selected algorithm. A changed space or line ending changes the digest; compare using the same algorithm.",
  "jwt-decoder":
    "The header and payload are decoded claims only. This tool does not verify the signature, issuer, audience or trustworthiness of the token.",
  "meta-tag-generator":
    "Check the generated title, description, canonical and social fields before adding them to your page head. Search engines can choose different snippets.",
  "split-pdf":
    "Check your selected page numbers and the output page count. The downloaded PDF contains only the requested pages in the supported order.",
  "passport-photo-maker":
    "Inspect the crop, face placement, background, dimensions and file size. Verify the receiving authority's exact requirements before submitting the photo.",
  "date-difference-calculator":
    "Total days measures the interval between the two dates. Calendar years, months and days describe the same interval differently because months have different lengths.",
  "pregnancy-due-date-calculator":
    "The due date and gestational age are calendar estimates based on the supplied dates and cycle length. Clinical dating may differ.",
  "ovulation-calculator":
    "The fertile window is a calendar estimate, not confirmation of ovulation. Irregular cycles can shift the dates; do not use this estimate for contraception.",
  "gst-calculator":
    "Total price includes the base price and GST. Inclusive mode extracts tax from a total; exclusive mode adds tax to a base. Confirm the applicable GST rate and treatment separately.",
  "water-intake-calculator":
    "The daily amount is a general estimate from weight and activity. Climate, food intake, medical conditions and individual needs can change fluid requirements.",
  "body-fat-calculator":
    "The result is an estimate from tape measurements. Measurement position and technique affect the answer; it is not a direct measurement of body fat.",
  "waist-hip-ratio-calculator":
    "The ratio is waist circumference divided by hip circumference. Use the same unit for both measurements; the category is a general reference, not a diagnosis.",
  "heart-rate-zone-calculator":
    "Each range is a percentage of an age-predicted maximum heart rate. Individual maximum heart rate and safe exercise intensity can differ.",
  "savings-goal-calculator":
    "The monthly deposit is added at month-end under the assumed return. Follow deposits and growth in the schedule to see how the projected balance reaches your goal.",
  "invoice-maker":
    "Review seller and buyer details, line items, taxes, total and payment information in the preview. A generated invoice does not confirm that payment was received.",
  "biodata-maker":
    "Check the preview for spelling, photo placement and page fit. Include only personal details you are comfortable sharing before downloading the PDF.",
  "character-counter":
    "Unicode characters, UTF-16 units and UTF-8 bytes answer different questions. Use the metric required by your receiving platform, especially for emoji and accented text.",
  "lorem-ipsum-generator":
    "Use the paragraphs to test spacing and page layout. Replace placeholder copy with finished content before publishing.",
  "duplicate-line-remover":
    "The first occurrence of each exact line is kept. Check spacing and letter case if lines that look alike remain in the result.",
  "remove-line-breaks":
    "Check word boundaries after joining lines. Paragraph structure is removed, so review the result before replacing a formatted document.",
  "text-sorter":
    "Check the selected ordering. UTF-16 order differs from dictionary order; shortest-first compares line length rather than meaning.",
  "find-and-replace-text":
    "Every exact match is replaced. Review the output for unintended matches inside longer words before copying it over your original.",
  "whitespace-remover":
    "The output trims and collapses whitespace. Check deliberate spacing, indentation and paragraph layout before using it as final copy.",
  "text-reverser":
    "Visible character clusters stay together while their order is reversed. This helps preserve combined emoji and accented characters.",
  "nato-phonetic-alphabet-converter":
    "Read the phonetic words in order to spell the original Latin letters. Review digits and punctuation separately when reading the result aloud.",
  "rot13-caesar-cipher":
    "The chosen shift changes Latin letters. Apply the inverse shift to recover the text. This educational cipher is not secure encryption.",
  "binary-text-converter":
    "Each eight-bit group represents a UTF-8 byte. A non-ASCII character may use several groups; preserve their order when decoding.",
  "url-parser":
    "The fields show the parsed URL components. Parsing does not visit the link or establish whether the destination is safe or available.",
  "timestamp-converter":
    "Check whether the input uses seconds or milliseconds. The ISO result is in UTC; a local display may show a different calendar date.",
  "json-to-csv-converter":
    "Check column names, missing fields and quoted values in the CSV. Spreadsheet formula-like cells are neutralized; the output represents flat records.",
  "tip-calculator":
    "The total includes the bill and tip. Per-person values divide the total evenly; rounding can leave a small amount to settle separately.",
  "average-calculator":
    "Compare the mean with the median to spot the effect of unusually large or small values. Count, minimum and maximum help check that the full list was included.",
  "ratio-calculator":
    "Both sides are divided by their greatest common divisor. The simplified ratio preserves the original proportion without changing the relative quantities.",
  "simple-interest-calculator":
    "Interest grows from the original principal only. Use the schedule to see equal full-year interest increments; this model does not compound earned interest.",
  "roi-calculator":
    "Net gain is proceeds minus cost. ROI expresses that gain as a percentage of cost; a negative result means a loss and does not describe an annualized return.",
  "break-even-calculator":
    "The unit count rounds up so contribution covers fixed costs. Contribution per unit is selling price minus variable cost; confirm those costs use the same basis.",
  "bmr-calculator":
    "BMR estimates resting daily energy expenditure. It does not include your full daily activity or determine an individual food intake target.",
  "sitemap-generator":
    "Check that every listed URL is canonical and intended for indexing. Generating XML does not crawl the site, submit the sitemap or guarantee indexing.",
  "hashtag-generator":
    "The output cleans only the tags you supplied. Review relevance and platform limits; this tool does not measure popularity or predict reach.",
  "weight-converter":
    "The main result uses your chosen output unit. The reference table below shows the same mass in every supported unit for an easy cross-check.",
  "length-converter":
    "The main result uses your chosen output unit. Compare the equivalent values in the reference table and check whether your task needs finer precision.",
  "speed-converter":
    "The reference table expresses the same speed in different distance-per-time units. Check the target unit before copying the number.",
  "data-storage-converter":
    "Decimal KB, MB and GB differ from binary KiB, MiB and GiB. The table shows both conventions; bits and bytes also differ by a factor of eight.",
  "number-base-converter":
    "The output is an exact signed integer in the chosen base. Digits above nine use letters; fractions and decimal separators are not supported.",
  "pin-code-generator":
    "Each line is a random numeric PIN. Preserve leading zeros and check the receiving system's length requirements.",
  "dice-roller":
    "The roll list gives every die value and the total adds them together. Check the number of sides before comparing results with a game rule.",
  "random-number-generator":
    "Both endpoints are included in the possible range. Repeated values can occur unless the selected operation explicitly guarantees uniqueness.",
  "random-name-picker":
    "The selected entry comes from your supplied list. Repeated entries can affect selection chances; check the list before using it for a draw.",
  "receipt-maker":
    "Review the payer, payee, amount, currency and payment reference. This is a receipt draft, not proof that a payment was completed.",
  "image-format-converter":
    "Check the output format, file size and appearance. Transparency and image quality may change when converting between PNG, JPG and WebP.",
  "image-rotator-flipper":
    "Check the preview for both rotation and mirroring. A mirrored image can reverse text even when its orientation looks correct.",
  "rotate-pdf":
    "Inspect the page orientation in the downloaded PDF. Rotation applies to the supported set of pages and does not change their text content.",
  "add-page-numbers-to-pdf":
    "Check the starting number, placement and page margins. Existing content near the label position may overlap the new page numbers.",
  "macro-calculator":
    "Protein and carbohydrate use four calories per gram, fat uses nine. Check that the energy percentages describe the split you intended.",
  "sleep-cycle-calculator":
    "The suggested times use a simplified 90-minute cycle model and sleep-onset allowance. Actual sleep cycles and sleep needs vary.",
  "calories-burned-calculator":
    "The energy estimate depends on body weight, duration and the selected activity's MET value. Actual effort and individual efficiency can differ.",
  "organize-pdf-pages":
    "Check the new page sequence before saving. Repeated page numbers duplicate pages; omitted numbers remove them from the output.",
  "pdf-page-counter":
    "Use the page count and dimensions to check the document. Metadata is supplied by the file and is not verified authorship or proof of origin.",
  "watermark-pdf":
    "Inspect every page size and orientation for readability and overlap. A visible watermark does not encrypt the PDF or prevent copying.",
  "mortgage-calculator":
    "Total monthly payment adds loan repayment, property tax and insurance. The schedule below covers principal and interest only; other ownership costs are excluded.",
  "fd-calculator":
    "Maturity includes principal plus modeled quarterly compound interest. Check the schedule against the deposit provider's crediting, tax and early-withdrawal terms.",
  "rd-calculator":
    "The maturity projection adds monthly deposits and illustrative quarterly interest. Compare the schedule with your bank's actual RD method before relying on it.",
  "inflation-calculator":
    "Future equivalent value is the amount needed later to buy today's basket. Purchasing power in today's money shows what a fixed amount could buy after inflation.",
  "net-worth-calculator":
    "Net worth is total assets minus total liabilities. A negative result means liabilities exceed assets; use valuations from the same date.",
  "gpa-calculator":
    "The GPA weights each grade by its course credits. Check your institution's grading rules and treatment of repeats or pass/fail courses.",
  "quadratic-equation-solver":
    "The discriminant determines whether the roots are distinct real, repeated real or complex. Substitute the displayed roots into the original equation to check them.",
  "work-hours-calculator":
    "Each shift subtracts its unpaid break before totals are added. Check overnight shifts carefully; the result is elapsed work time, not a payroll policy decision.",
  "timezone-converter":
    "Read the date as well as the clock time: a conversion can cross midnight. Daylight-saving transitions can make some local times ambiguous or nonexistent.",
  "roman-numeral-converter":
    "The result follows conventional Roman numeral notation for the supported integer range. Check subtractive pairs such as IV and IX when reading it.",
  "open-graph-preview-generator":
    "The title and description preview is illustrative. Social platforms may use different truncation, cached metadata and image cropping.",
  "social-media-character-counter":
    "Compare each platform's count with its limit. Platform-specific URL or emoji counting can differ; confirm the final post in the destination editor.",
  "password-strength-checker":
    "The score estimates length and character variety, not resistance to every attack. It does not check breach databases or detect all predictable phrases.",
  "lottery-number-generator":
    "Numbers are unique within this draw and stay inside your chosen range. Randomly generated picks do not improve the probability of winning.",
  "social-media-image-resizer":
    "Check the preset dimensions and the crop preview. Keep faces, text and logos away from areas that the destination platform may crop further.",
  "resume-maker":
    "Check the PDF preview for spelling, dates, page breaks and contact details. A template helps presentation; tailor the content to the role before sharing.",
  "volume-converter":
    "The main result uses your chosen output unit. The reference table below shows the same volume in every supported unit for an easy cross-check.",
  "area-converter":
    "The main result uses your chosen output unit. The reference table below shows the same area in every supported unit for an easy cross-check.",
  "business-days-calculator":
    "Business days count Monday through Friday, inclusive of both the start and end date. Listed holidays are only excluded when they fall on a weekday inside that range.",
  "countdown-timer":
    'The countdown is calculated once from the two date-and-time values you enter; it does not update automatically as real time passes. Recalculate with a later "from" value for a fresh countdown.',
  "cagr-calculator":
    "CAGR is the constant yearly growth rate that would take the initial value to the final value over the given years. It smooths real fluctuations into a single average rate.",
  "sales-tax-calculator":
    "Exclusive mode adds tax on top of a base price; inclusive mode extracts the tax already inside a total. Confirm which one matches your receipt before comparing totals.",
  "color-converter":
    "Hex, RGB and HSL describe the same color in different notations. Paste any one of the three formats to see the other two; rounding can shift the last digit slightly.",
  "reading-time-calculator":
    "The estimate divides your word count by the selected words-per-minute pace. Dense technical text or lists can take longer to read than the estimate suggests.",
  "text-diff-checker":
    "The comparison is exact, line-by-line text matching, not a semantic diff. A single changed character marks the whole line as different; check whitespace and case if a line looks identical but is flagged as changed.",
  "dog-age-calculator":
    "The estimate uses a size-adjusted curve, not a fixed multiplier, since small and giant breeds age at different rates after the first two years. Treat it as a general reference, not a veterinary assessment.",
  "magic-8-ball":
    "The answer is drawn at random from the classic set of replies. It is a novelty response, unrelated to the question you typed, and repeated shakes can repeat an answer.",
  "love-calculator":
    "The compatibility score is a deterministic calculation based on the two names, not a real measure of romantic compatibility. The same two names always give the same score in any order.",
};

const titleOverrides: Record<string, string> = {
  "sip-calculator": "SIP Calculator – Monthly Investment & Yearly Returns",
  "compound-interest-calculator":
    "Compound Interest Calculator with Growth Schedule",
  "emi-loan-calculator": "EMI Loan Calculator with Amortization Schedule",
  "mortgage-calculator": "Mortgage Calculator with Monthly Payment Schedule",
  "savings-goal-calculator": "Savings Goal Calculator – Monthly Savings Plan",
  "fd-calculator": "FD Calculator – Fixed Deposit Interest & Maturity",
  "rd-calculator": "RD Calculator – Recurring Deposit Maturity Schedule",
};

export function toolSeo(tool: ToolDefinition) {
  const suffix =
    tool.shortDescription.length > 120
      ? " Free online."
      : " Free online, with examples. No sign-up or uploads.";
  return {
    title: titleOverrides[tool.slug] ?? `${tool.name} Online – Free`,
    description: `${tool.shortDescription}${suffix}`,
  };
}

export function toolSteps(tool: ToolDefinition) {
  const file = ["Images", "PDF tools"].includes(tool.category);
  const document = tool.category === "Documents & design";
  return [
    {
      title: file
        ? "Choose your files"
        : document
          ? "Add your details"
          : "Enter your input",
      text: file
        ? "Select files from your device and check the supported formats and size limits."
        : document
          ? "Fill in the labeled fields. Keep a copy of any details you need for later."
          : `Enter your own values or use an example to explore ${tool.name.toLowerCase()}.`,
    },
    {
      title: file || document ? "Check the preview" : "Review the result",
      text: resultGuides[tool.slug]!,
    },
    {
      title: file || document ? "Download and verify" : "Compare or copy",
      text:
        file || document
          ? "Download the finished file, then open it to check the content, layout and dimensions before sharing."
          : "Adjust one input to compare outcomes. Copy the result when ready, or reset for a new calculation.",
    },
  ];
}
