import type { LegalBodyProps } from "../legal";
/** CashyAi privacy text, ported verbatim from the app's original source. */
export function CashyAiPrivacy({ doc: p }: LegalBodyProps) {
  return (
    <>
      <p>
        This Privacy Policy describes our policies and procedures on the
        collection, use, and disclosure of your information when you use{" "}
        {p.appName}, and tells you about your privacy rights and how the law
        protects you.
      </p>
      <section>
        <h2>Definitions</h2>
        <ul>
          <li>
            <strong>Application</strong> means the software program named{" "}
            {p.appName}, provided by the Company.
          </li>
          <li>
            <strong>Company</strong> (&ldquo;the Company&rdquo;,
            &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;) refers to{" "}
            {p.appName}.
          </li>
          <li>
            <strong>Country</strong> refers to: India.
          </li>
          <li>
            <strong>Personal Data</strong> is any information that relates to an
            identified or identifiable individual.
          </li>
          <li>
            <strong>Service</strong> refers to the Application.
          </li>
          <li>
            <strong>You</strong> means the individual accessing or using the
            Service.
          </li>
        </ul>
      </section>
      <section>
        <h2>Collecting and using your personal data</h2>
        <h3>Types of data collected</h3>
        <p>
          <strong>Personal Data.</strong> While using the Service, we may ask
          you to provide certain personally identifiable information that can be
          used to contact or identify you, including:
        </p>
        <ul>
          <li>Email address (for Google Drive backup)</li>
          <li>Usage data</li>
        </ul>
        <p>
          <strong>Usage Data</strong> is collected automatically and may include
          your device&apos;s IP address, browser type and version, the pages of
          our Service that you visit, the time and date of your visit, time
          spent on those pages, unique device identifiers, and other diagnostic
          data.
        </p>
        <h3>Use of your personal data</h3>
        <p>The Company may use personal data for the following purposes:</p>
        <ul>
          <li>
            <strong>To provide and maintain our Service</strong>, including to
            monitor its usage.
          </li>
          <li>
            <strong>To manage your account</strong> and give you access to the
            functionalities available to you as a user.
          </li>
          <li>
            <strong>To contact you</strong> about updates or informative
            communications related to the Service&apos;s functionality,
            including security updates, when necessary.
          </li>
          <li>
            <strong>To manage your requests</strong> to us.
          </li>
        </ul>
      </section>
      <section>
        <h2>On-device machine learning &amp; privacy</h2>
        <p>
          Our Application uses 100% on-device machine learning (TensorFlow Lite)
          and local probabilistic reasoning to provide financial insights,
          safe-spend calculations, and AI chat features.
        </p>
        <ul>
          <li>
            <strong>Zero cloud data sharing:</strong> all financial analysis and
            AI processing occurs strictly on your device. Your transaction data,
            notes, and balances never leave your phone.
          </li>
          <li>
            <strong>No third-party AI API keys:</strong> no external API keys or
            cloud service subscriptions are required.
          </li>
          <li>
            <strong>Complete offline privacy:</strong> your data remains
            confidential, private, and stored solely on your local device.
          </li>
        </ul>
      </section>
      <section>
        <h2>Analytics &amp; crash reporting</h2>
        <p>
          We use Firebase Analytics and Firebase Crashlytics (Google) to
          understand app usage and diagnose crashes.
        </p>
        <ul>
          <li>
            <strong>What&apos;s collected:</strong> app interactions and screen
            views, device/OS information, app version, and crash/error logs with
            stack traces.
          </li>
          <li>
            <strong>What&apos;s never included:</strong> this diagnostic data is
            entirely separate from your financial data. Firebase never receives
            your expenses, income, balances, notes, bills, contacts, or split
            details. That data stays on your device, per the on-device machine
            learning section above.
          </li>
          <li>
            <strong>Third-party processing:</strong> this data is processed by
            Google per{" "}
            <a href="https://policies.google.com/privacy">
              Google&apos;s Privacy Policy
            </a>
            . You can review Firebase&apos;s own data handling at{" "}
            <a href="https://firebase.google.com/support/privacy">
              firebase.google.com/support/privacy
            </a>
            .
          </li>
        </ul>
      </section>
      <section>
        <h2>Google Sign-In &amp; Google Drive backup</h2>
        <p>
          {p.appName} uses Google Sign-In for exactly one feature: backing up
          your app data to your own Google Drive and restoring it later. This is
          optional — the app is fully usable without signing in.
        </p>
        <ul>
          <li>
            <strong>Basic profile (email):</strong> shown in Settings so you can
            see which Google account a backup is signed in with.
          </li>
          <li>
            <strong>
              <code>drive.appdata</code> scope:
            </strong>{" "}
            lets the app read and write only its own hidden application-data
            folder in your Drive. The app cannot see, list, or modify any other
            file in your Google Drive with this scope.
          </li>
        </ul>
        <p>
          We never request access to your Gmail, contacts, calendar, general
          Drive files, or any other Google data.
        </p>
      </section>
      <section>
        <h2>Security of your personal data</h2>
        <p>
          The security of your personal data is important to us, but remember
          that no method of transmission over the Internet or method of
          electronic storage is 100% secure. While we strive to use commercially
          acceptable means to protect your personal data, we cannot guarantee
          its absolute security.
        </p>
      </section>
      <section>
        <h2>Children&apos;s privacy</h2>
        <p>
          Our Service does not address anyone under the age of 13. We do not
          knowingly collect personally identifiable information from anyone
          under the age of 13. If you are a parent or guardian and are aware
          that your child has provided us with personal data, please contact us
          so we can remove it.
        </p>
      </section>
      <section>
        <h2>Changes to this privacy policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of changes by posting the new Privacy Policy on this page. You are
          advised to review this page periodically.
        </p>
      </section>
      <section>
        <h2>Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy, contact us by
          email: <a href={`mailto:${p.supportEmail}`}>{p.supportEmail}</a>.
        </p>
      </section>
    </>
  );
}
