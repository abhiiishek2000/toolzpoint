import type { LegalBodyProps } from "../legal";
/** Wend privacy policy, ported verbatim from wend_app/docs/legal/privacy.html. */
export function WendPrivacy({ doc: p }: LegalBodyProps) {
  const mail = <a href={`mailto:${p.supportEmail}`}>{p.supportEmail}</a>;
  return (
    <>
      <p>
        App: Wend: GLP-1 Tracker &amp; Journal · Developer: ToolzPoint (Abhishek
        Kumar), India · Contact: {mail}
      </p>
      <p>
        Wend is a personal journal for people taking GLP-1 medication. This
        policy explains what Wend collects, why, who processes it, and the
        choices you have. Wend does not sell your data, does not show ads, and
        does not use advertising or analytics trackers.
      </p>
      <p>
        <strong>Wend is not a medical device</strong> and does not diagnose,
        treat, cure, or prevent any medical condition. Always follow your
        prescriber&apos;s guidance and consult a healthcare professional for
        medical advice.
      </p>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>
              Google account name, email address and account ID (when you sign
              in with Google):
            </strong>{" "}
            to create and secure your account. Your first name pre-fills your
            profile.
          </li>
          <li>
            <strong>Health and wellness entries you log:</strong> medication
            name and class, doses and injection sites, dose plan from your
            prescriber, weight, goal weight, food, protein and calories, water,
            symptoms and their severity, workouts, non-scale wins, medication
            costs and refill dates. These show your history, trends, reminders,
            weekly recap and doctor summary. This is the core of the app.
          </li>
          <li>
            <strong>Meal photos you choose to analyze:</strong> stored privately
            in your account and sent to OpenAI to estimate calories and protein.
            You review every estimate before it is saved.
          </li>
          <li>
            <strong>Community posts (only if you opt in):</strong> shown to
            other members who opted in. Posts are shown{" "}
            <strong>without your name or account ID</strong>. We keep reports
            and blocks to keep the community safe.
          </li>
          <li>
            <strong>
              Subscription status (via Google Play / App Store and RevenueCat):
            </strong>{" "}
            to unlock Premium. We never receive your card details.
          </li>
          <li>
            <strong>
              Body weight from Health Connect (Android) or Apple Health (iOS),
              only if you turn it on:
            </strong>{" "}
            to import weigh-ins and to save weights you log in Wend back to
            Health Connect / Apple Health.
          </li>
        </ul>
        <p>
          Notification preferences and similar settings stay on your device.
        </p>
      </section>
      <section>
        <h2>Health Connect and Apple Health</h2>
        <p>
          If you connect Health Connect or Apple Health, Wend reads and writes{" "}
          <strong>body weight only</strong>. Wend&apos;s use of information
          received from Health Connect adheres to the{" "}
          <a href="https://support.google.com/googleplay/android-developer/answer/12991134">
            Health Connect Permissions policy
          </a>
          , including the Limited Use requirements. Data from Health Connect or
          Apple Health is used only to provide weight tracking features to you.
          It is never used for advertising, never sold, and never shared with
          third parties except as needed to operate the service described here.
          You can disconnect at any time in Wend&apos;s Settings or in Health
          Connect / the Health app.
        </p>
      </section>
      <section>
        <h2>Service providers</h2>
        <ul>
          <li>
            <strong>Supabase</strong> hosts your account, entries and private
            photos, with access limited to your own account.
          </li>
          <li>
            <strong>Google</strong> provides sign-in and, on Android, billing
            and Health Connect.
          </li>
          <li>
            <strong>OpenAI</strong> receives a meal photo only when you ask Wend
            to analyze it. Under OpenAI&apos;s API terms, data sent through the
            API is not used to train its models by default.
          </li>
          <li>
            <strong>RevenueCat</strong> verifies subscriptions using an
            anonymous account ID and store purchase records.
          </li>
          <li>
            <strong>Apple</strong> provides billing and Apple Health on iOS.
          </li>
        </ul>
        <p>
          These providers process data on our behalf to run the app. Data may be
          processed outside your country, including in the United States.
        </p>
      </section>
      <section>
        <h2>Security</h2>
        <p>
          Data is encrypted in transit. Database rules ensure each account can
          only read and change its own entries. Photos are stored in a private
          bucket. Sign-in sessions are kept in your device&apos;s secure
          storage.
        </p>
      </section>
      <section>
        <h2>Your choices and rights</h2>
        <ul>
          <li>
            <strong>Export:</strong> Settings → Export my data gives you a copy
            of everything in your account.
          </li>
          <li>
            <strong>Delete:</strong> Settings → Delete account &amp; data
            permanently deletes your account, entries and photos from our
            systems. Deleting your account does not cancel a store subscription;
            cancel it in Google Play or the App Store.
          </li>
          <li>
            <strong>Edit:</strong> you can edit or delete individual entries at
            any time.
          </li>
          <li>
            <strong>Contact:</strong> email {mail} for access, correction or
            deletion requests, or any privacy question.
          </li>
        </ul>
      </section>
      <section>
        <h2>Retention</h2>
        <p>
          We keep your data while your account exists. When you delete your
          account, your data is deleted from our systems. Store and subscription
          records kept by Google, Apple and RevenueCat follow their own
          retention policies.
        </p>
      </section>
      <section>
        <h2>Children</h2>
        <p>
          Wend is intended for adults 18 and older and is not directed to
          children.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes, we will update the date above and, for
          significant changes, tell you in the app.
        </p>
      </section>
    </>
  );
}
