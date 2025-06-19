import type { Route } from "./+types/_landing.terms";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Service - ModelRules" },
    { name: "description", content: "Terms of Service for ModelRules" },
  ];
}

export default function TermsPage({}: Route.ComponentProps) {
  const updatedAt = new Date("05/10/2025").toLocaleDateString();
  return (
    <div className="relative mx-auto max-w-3xl px-6 pt-40 lg:pb-16 md:pt-48">
      <h1 className="text-3xl font-light mb-8">
        Terms of Service for ModelRules
      </h1>

      <p className="text-sm text-muted-foreground mb-8">
        Last Updated: {updatedAt}
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">1. Introduction</h2>
        <p className="mb-4">
          Welcome to ModelRules ("the Service"), an open-source software
          provided under the Apache License 2.0. By accessing or using
          ModelRules, you agree to be bound by these Terms of Service ("Terms").
        </p>
        <p>
          ModelRules is maintained by the project contributors and is provided
          free of charge with no subscription fees or payments required.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">2. Definitions</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="font-medium">Service</strong>: The ModelRules
            software, API, and related components.
          </li>
          <li>
            <strong className="font-medium">User</strong>: Any individual or
            entity that uses the Service.
          </li>
          <li>
            <strong className="font-medium">API Keys</strong>: Authentication
            credentials provided by third-party LLM providers.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">3. License and Open Source</h2>
        <p className="mb-4">
          ModelRules is licensed under the Apache License 2.0, a copy of which
          can be found at
          <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
            className="text-primary hover:underline mx-1"
          >
            https://www.apache.org/licenses/LICENSE-2.0
          </a>
          .
        </p>
        <p>
          You are permitted to use, modify, and distribute the software in
          accordance with this license. Any contributions to the project will
          also be governed by the Apache License 2.0.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">4. User Responsibilities</h2>
        <h3 className="text-xl font-light mt-6 mb-3">4.1 Account Security</h3>
        <p className="mb-4">
          You are responsible for maintaining the security of your account and
          any API keys you store in the Service. We cannot and will not be
          liable for any loss or damage from your failure to comply with this
          security obligation.
        </p>
        <h3 className="text-xl font-light mt-6 mb-3">4.2 Acceptable Use</h3>
        <p className="mb-4">You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Violate laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>
            Circumvent rate limits or terms of service of third-party providers
          </li>
          <li>
            Conduct unauthorized penetration testing or vulnerability scanning
          </li>
          <li>
            Attempt to gain unauthorized access to other users' accounts or data
          </li>
        </ul>
        <h3 className="text-xl font-light mt-6 mb-3">
          4.3 API Keys and Third-Party Services
        </h3>
        <p className="mb-4">You are responsible for:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            Obtaining proper authorization to use any third-party API keys
          </li>
          <li>
            Complying with the terms of service of any third-party providers
          </li>
          <li>Any charges incurred through your use of third-party services</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">
          5. Disclaimers and Limitations of Liability
        </h2>
        <h3 className="text-xl font-light mt-6 mb-3">
          5.1 Service Provided "As Is"
        </h3>
        <p className="mb-4 uppercase">
          The service is provided "as is", without warranty of any kind, express
          or implied, including but not limited to the warranties of
          merchantability, fitness for a particular purpose, and
          noninfringement.
        </p>
        <h3 className="text-xl font-light mt-6 mb-3">
          5.2 Limitation of Liability
        </h3>
        <p className="mb-4 uppercase">
          In no event shall the authors, copyright holders, or contributors be
          liable for any claim, damages, or other liability, whether in an
          action of contract, tort or otherwise, arising from, out of, or in
          connection with the service or the use or other dealings in the
          service.
        </p>
        <h3 className="text-xl font-light mt-6 mb-3">5.3 Availability</h3>
        <p>
          We do not guarantee that the Service will be available at all times.
          The Service may be subject to limitations, delays, and other problems
          inherent in the use of the internet and electronic communications.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">
          6. Data and Content Ownership
        </h2>
        <p>
          Any data you process through the Service remains your property. The
          Service does not claim ownership of any content processed through it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to the Service
          without prior notice for any user who violates these Terms.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will
          provide notice of significant changes by posting the new Terms on the
          project repository and/or website.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">9. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the applicable jurisdiction, without regard to its conflict of
          law provisions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">10. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us through
          the project repository.
        </p>
      </section>
    </div>
  );
}
