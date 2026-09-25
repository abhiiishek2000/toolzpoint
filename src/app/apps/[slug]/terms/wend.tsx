import Link from "next/link";
import type { LegalBodyProps } from "../legal";
/** Wend terms of use, ported verbatim from wend_app/docs/legal/terms.html. */
export function WendTerms({ doc: d, slug }: LegalBodyProps) {
  return (
    <>
      <p>
        App: Wend: GLP-1 Tracker &amp; Journal · Developer: ToolzPoint (Abhishek
        Kumar), India · Contact:{" "}
        <a href={`mailto:${d.supportEmail}`}>{d.supportEmail}</a>
      </p>
      <p>
        By using Wend you agree to these terms. If you don&apos;t agree, please
        don&apos;t use the app.
      </p>
      <section>
        <h2>Not medical advice</h2>
        <p>
          Wend is a personal tracking journal.{" "}
          <strong>
            It is not a medical device and does not diagnose, treat, cure, or
            prevent any medical condition.
          </strong>{" "}
          Wend does not recommend doses or changes to your treatment; the dose
          plan in the app is only what you enter from your prescriber. AI meal
          estimates and workout plans are general information and may be
          inaccurate. Always follow your prescriber&apos;s guidance and consult
          a healthcare professional before making medical decisions. If you
          think you have a medical emergency, contact emergency services.
        </p>
      </section>
      <section>
        <h2>Eligibility and your account</h2>
        <p>
          You must be 18 or older. You sign in with your Google (or Apple)
          account and are responsible for activity on it. Keep the information
          you log accurate for your own use.
        </p>
      </section>
      <section>
        <h2>Premium subscriptions</h2>
        <p>
          Premium is an auto-renewing subscription sold through Google Play or
          the App Store. Payment is charged to your store account. It renews at
          the same price unless you cancel at least 24 hours before the end of
          the current period. You can manage or cancel it in your store account
          settings. Refunds follow Google Play&apos;s or Apple&apos;s policies.
          Deleting your Wend account does not cancel a subscription.
        </p>
        <p>
          Free accounts include 3 AI photo scans in total. Premium includes up
          to 30 photo scans per day. Failed analyses don&apos;t count toward
          either limit.
        </p>
      </section>
      <section>
        <h2>Community</h2>
        <p>
          Community is optional. Be kind and don&apos;t post medical advice
          presented as fact, sales or promotion of medication, personal
          information, or anything illegal, hateful or harassing. You can report
          or block posts. We may hide posts or restrict accounts that break
          these rules. You keep ownership of what you post and give us
          permission to display it to other opted-in members.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t misuse the service: no attempts to access other
          people&apos;s data, to disrupt the service, or to reverse engineer it
          except where the law allows.
        </p>
      </section>
      <section>
        <h2>Your data</h2>
        <p>
          Our <Link href={`/apps/${slug}/privacy`}>Privacy Policy</Link>{" "}
          explains how we handle your data. You can export or delete your data
          from Settings at any time.
        </p>
      </section>
      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          Wend is provided &ldquo;as is&rdquo; without warranties of any kind,
          to the extent the law allows. To the extent permitted by law, we are
          not liable for indirect or consequential losses, or for decisions made
          based on information in the app. Nothing in these terms limits rights
          you have under consumer protection law.
        </p>
      </section>
      <section>
        <h2>Changes and termination</h2>
        <p>
          We may update these terms; we&apos;ll change the date above and tell
          you in the app about significant changes. You can stop using Wend and
          delete your account at any time.
        </p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India, without limiting any
          mandatory consumer protections of the country where you live.
        </p>
      </section>
    </>
  );
}
