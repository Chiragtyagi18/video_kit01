import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VideoShare AI",
  description: "Privacy Policy for VideoShare AI users.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 px-4 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-amber-800/20 bg-amber-800/10 p-8 shadow-2xl backdrop-blur-lg">
        <h1 className="mb-6 text-3xl font-bold text-amber-900">Privacy Policy</h1>

        <div className="space-y-6 text-stone-700 leading-7">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">1. Information We Collect</h2>
            <p>
              We may collect account information, usage details, and content metadata needed to provide
              and improve the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">2. How We Use Information</h2>
            <p>
              Your information is used to operate core features, secure accounts, and support service
              reliability and improvements.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">3. Data Sharing</h2>
            <p>
              We do not sell personal information. Data may be shared with trusted service providers to
              run the platform, subject to appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">4. Data Security</h2>
            <p>
              We use reasonable technical and organizational measures to protect your data, though no
              system can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-amber-900">5. Contact</h2>
            <p>
              If you have privacy questions, contact the VideoShare AI support team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
