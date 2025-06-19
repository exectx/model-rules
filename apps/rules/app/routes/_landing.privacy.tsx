import type { Route } from "./+types/_landing.privacy"; // Assuming you might have types

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy - ModelRules" },
    { name: "description", content: "Privacy Policy for ModelRules" },
  ];
}

export default function PrivacyPolicyPage() {
  const updatedAt = new Date("05/10/2025").toLocaleDateString();
  return (
    <div className="relative mx-auto max-w-3xl px-6 pt-40 lg:pb-16 md:pt-48">
      <h1 className="text-3xl font-light mb-8">
        Privacy Policy for ModelRules
      </h1>

      <p className="text-sm text-muted-foreground mb-8">Last Updated: {updatedAt}</p>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">1. Introduction</h2>
        <p>
          This Privacy Policy explains how the project maintainers collect, use,
          and protect information when you use ModelRules ("the Service"). This
          policy applies to all users of the Service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">2. Information We Collect</h2>

        <h3 className="text-xl font-light mt-6 mb-3">
          2.1 Information You Provide
        </h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="font-medium">Account information</strong>: Email
            address and authentication credentials.
          </li>
          <li>
            <strong className="font-medium">Configuration data</strong>:
            Provider routes, parameter overrides, and other settings.
          </li>
          <li>
            <strong className="font-medium">API keys</strong>: Keys for
            third-party services that you choose to store in ModelRules.
          </li>
        </ul>

        <h3 className="text-xl font-light mt-6 mb-3">
          2.2 Automatically Collected Information
        </h3>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="font-medium">Usage data</strong>: Information
            about how you use the Service, including request patterns, error
            rates, and performance metrics.
          </li>
          <li>
            <strong className="font-medium">Technical data</strong>: IP
            addresses, browser information, device information, and cookies.
          </li>
        </ul>

        <h3 className="text-xl font-light mt-6 mb-3">
          2.3 What We Do Not Collect
        </h3>
        <p className="mb-4">We do not intentionally collect or store:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>The content of your requests to third-party LLM providers.</li>
          <li>Responses from third-party LLM providers.</li>
          <li>
            Any personal information beyond what is necessary for operating the
            Service.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">3. How We Use Information</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Provide, maintain, and improve the Service</li>
          <li>Monitor and ensure the security of the Service</li>
          <li>Detect and prevent fraud or abuse</li>
          <li>Analyze usage patterns to enhance functionality</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">
          4. Data Storage and Security
        </h2>

        <h3 className="text-xl font-light mt-6 mb-3">
          4.1 Where Data is Stored
        </h3>
        <p className="mb-4">
          Data is stored in Cloudflare KV storage. When self-hosting, data is
          stored according to your configured storage mechanism.
        </p>

        <h3 className="text-xl font-light mt-6 mb-3">4.2 Security Measures</h3>
        <p className="mb-4">
          We implement appropriate security measures to protect your
          information, including:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Encryption of sensitive data (including API keys)</li>
          <li>Authentication mechanisms to prevent unauthorized access</li>
          <li>Regular security assessments</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">5. Sharing of Information</h2>
        <p className="mb-4">
          We do not sell, trade, or rent your personal information to others. We
          may share information in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>When required by law</li>
          <li>To protect our rights or the safety of our users</li>
          <li>
            With service providers who help us operate the Service (subject to
            confidentiality agreements)
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">6. Your Rights and Choices</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>Access, correct, or delete your personal information</li>
          <li>Object to our processing of your information</li>
          <li>Export your data in a portable format</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">7. Cookies and Tracking</h2>
        <p>
          The Service may use cookies or similar tracking technologies to
          enhance user experience and collect usage data. You can control
          cookies through your browser settings.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">8. Third-Party Services</h2>
        <p>
          The Service integrates with third-party LLM providers. When you use
          these integrations, any data transmitted to these providers is subject
          to their privacy policies and terms of service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">9. Children's Privacy</h2>
        <p>
          The Service is not intended for use by individuals under the age of
          16. We do not knowingly collect personal information from children.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          users of material changes by posting the new policy on the project
          repository and/or website.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          through the project repository.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-light mb-5">
          12. Additional Rights for EU/EEA Users
        </h2>
        <p>
          If you are in the European Union or European Economic Area, you have
          additional rights under the GDPR, including the right to lodge a
          complaint with a supervisory authority.
        </p>
      </section>
    </div>
  );
}
