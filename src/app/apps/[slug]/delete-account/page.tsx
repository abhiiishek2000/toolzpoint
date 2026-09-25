import { notFound } from "next/navigation";
import Link from "next/link";
import { metadata, notFoundMetadata } from "@/lib/seo";
import { wendDoc, type LegalDoc } from "../legal";
/** Account deletion instructions, required by Google Play for apps with accounts. */
const pages: Record<string, LegalDoc> = { wend: wendDoc };
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = pages[slug];
  return d
    ? metadata(
        `Delete your ${d.appName} account`,
        `How to delete your ${d.appName} account and data.`,
        `/apps/${slug}/delete-account`,
      )
    : notFoundMetadata;
}
export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = pages[slug];
  if (!d) notFound();
  const subject = encodeURIComponent(`Delete my ${d.appName} account`);
  return (
    <main id="main" className="page-container prose-page">
      <div className="eyebrow">
        {d.appName.toUpperCase()} / ACCOUNT DELETION
      </div>
      <h1>Delete your {d.appName} account</h1>
      <p className="page-lead">
        You can delete your {d.appName} account and all of its data at any time.{" "}
        {d.appName} is developed by ToolzPoint.
      </p>
      <section>
        <h2>In the app</h2>
        <ol>
          <li>Open {d.appName} and sign in.</li>
          <li>Go to Profile → Settings → Delete account &amp; data.</li>
          <li>Confirm. Deletion happens immediately.</li>
        </ol>
      </section>
      <section>
        <h2>Without the app</h2>
        <p>
          Email{" "}
          <a href={`mailto:${d.supportEmail}?subject=${subject}`}>
            {d.supportEmail}
          </a>{" "}
          from the Google account you use to sign in, with the subject
          &ldquo;Delete my {d.appName} account&rdquo;. We delete the account
          within 30 days and confirm by email.
        </p>
      </section>
      <section>
        <h2>Delete some of your data</h2>
        <p>
          You can delete individual entries without deleting your account: in
          the app, go to Log → History, pick an entry and delete it. Deleting a
          meal logged from a photo also deletes the stored photo. Community
          posts can be deleted from the Community screen.
        </p>
      </section>
      <section>
        <h2>What is deleted</h2>
        <p>
          Your account and profile, every entry you logged (medication doses,
          weight, food, water, symptoms, workouts, wins, costs and refills),
          your meal photos, and your community posts, reports and blocks. We
          don&apos;t keep a copy.
        </p>
        <p>
          Deleting your account does not cancel a Google Play or App Store
          subscription; cancel it in your store account. Purchase records held
          by Google, Apple and RevenueCat follow their own retention policies.
        </p>
      </section>
      <p className="updated">
        See the <Link href={`/apps/${slug}/privacy`}>Privacy Policy</Link> ·
        Back to <Link href={`/apps/${slug}`}>{d.appName}</Link>
      </p>
    </main>
  );
}
