export default function PrivacyPolicyPage() {
  return (
    <main className="legal-wrap">
      <div className="wrap legal-content">
        <h1 className="section-title size-l">Privacy Policy</h1>
        <p className="legal-updated">Last updated: September 2026</p>

        <p>
          Cherri (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This
          policy explains what information we collect, how we use it, and
          the choices you have.
        </p>

        <h2>1. Information we collect</h2>
        <p>When you create an account and use Cherri, we may collect:</p>
        <ul>
          <li>Account information: name, email address, and password (stored securely via our authentication provider)</li>
          <li>Profile information: height, weight, age, gender, activity level, and wellness goals</li>
          <li>Usage data: meals logged, water intake, weight entries, meal plans, and app interactions</li>
          <li>Photos: if you use meal-scanning features, photos you upload are processed to identify food, as described below</li>
        </ul>

        <h2>2. How we use your information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and personalize the Cherri experience, including calorie and macro targets, insights, and meal plans</li>
          <li>Improve our food database and nutrition estimates over time</li>
          <li>Communicate with you about your account or updates to Cherri</li>
        </ul>

        <h2>3. Third-party services</h2>
        <p>Cherri relies on the following third-party services to operate:</p>
        <ul>
          <li><strong>Supabase</strong>, for authentication and database storage</li>
          <li><strong>Google Gemini (or similar AI providers)</strong>, for analyzing meal photos when you use the Snap a Plate feature. Photos sent for analysis are subject to that provider&apos;s own data handling terms</li>
          <li><strong>Sanity</strong>, for managing blog content</li>
          <li><strong>Vercel</strong>, for hosting</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>

        <h2>4. Data storage and security</h2>
        <p>
          Your data is stored using industry-standard practices, including
          access controls that ensure only you can view your personal
          logs and entries. No system is perfectly secure, and we
          encourage you to use a strong, unique password.
        </p>

        <h2>5. Your rights</h2>
        <p>
          You can access, update, or delete most of your information
          directly within your account settings. To request full account
          deletion or ask questions about your data, contact us at{' '}
          <a href="mailto:hello@cherri.com">hello@cherri.com</a>.
        </p>

        <h2>6. Children&apos;s privacy</h2>
        <p>
          Cherri is not intended for use by children under 16. We do not
          knowingly collect information from children under this age.
        </p>

        <h2>7. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Continued use of
          Cherri after changes means you accept the updated policy.
        </p>

        <h2>8. Contact us</h2>
        <p>
          Questions about this policy? Reach us at{' '}
          <a href="mailto:hello@cherri.com">hello@cherri.com</a>.
        </p>
      </div>
    </main>
  );
}