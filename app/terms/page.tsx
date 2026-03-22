import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | VideoShare AI",
  description: "Terms and Conditions for using VideoShare AI.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 px-4 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-amber-800/20 bg-amber-800/10 p-8 shadow-2xl backdrop-blur-lg">
        <h1 className="mb-6 text-3xl font-bold text-amber-900">Terms of Service</h1>

        <div className="space-y-6 text-stone-700 leading-7">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using VideoShare AI, you agree to be bound by these Terms of Service.
              If you do not agree, please stop using the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">2. User Responsibilities</h2>
            <p>
              You are responsible for the content you upload and must ensure you have the right to use
              and share that content.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">3. Prohibited Use</h2>
            <p>
              You must not use this service for unlawful, abusive, or infringing activity, including
              uploading malicious or unauthorized content.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">4. Service Availability</h2>
            <p>
              We may update, suspend, or discontinue features at any time to maintain or improve the
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">5. Contact</h2>
            <p>
              For questions regarding these terms, contact the VideoShare AI support team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
