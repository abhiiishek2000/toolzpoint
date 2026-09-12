"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="page-container error-page">
      <h1>Something didn’t load.</h1>
      <p>Please try again. Your tool inputs haven’t been sent to a server.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
