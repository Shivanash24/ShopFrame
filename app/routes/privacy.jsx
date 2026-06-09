import { json } from "@remix-run/node";
import { Meta, Links } from "@remix-run/react";

export const meta = () => {
  return [
    { title: "Privacy Policy | ShopFrame" },
    { name: "description", content: "Privacy Policy for the ShopFrame Shopify App." },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <main style={styles.content}>
          <section style={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy describes how ShopFrame ("we", "our", or "us") collects, uses, and shares your personal information when you use our Shopify App (the "App") and the services provided by the App.
            </p>
          </section>

          <section style={styles.section}>
            <h2>2. Information We Collect</h2>
            <p>When you install the App, we automatically access certain types of information from your Shopify account:</p>
            <ul>
              <li><strong>Merchant Information:</strong> We collect your shop's name, primary email address, domain, and shop category to provide and maintain our services.</li>
              <li><strong>Usage Data:</strong> We collect data about how you interact with our templates and customization tools to improve our App's features and performance.</li>
            </ul>
            <p>We do <strong>not</strong> collect or process your end-customers' personal information (such as names, addresses, or payment details) as our App functions purely as a storefront design and template customization tool.</p>
          </section>

          <section style={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide and operate the App, including rendering templates on your storefront.</li>
              <li>To provide customer support and respond to your inquiries.</li>
              <li>To improve and optimize our App (e.g., by generating analytics about how our customers browse and interact with the App).</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2>4. Sharing Your Information</h2>
            <p>
              We do not sell your personal information to third parties. We may share your information in the following limited circumstances:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> We may share information with third-party service providers (like MongoDB Atlas for data hosting) who perform services on our behalf.</li>
              <li><strong>Legal Compliance:</strong> We may share your information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2>5. Data Retention</h2>
            <p>
              When you install the App, we will maintain your Merchant Information for our records unless and until you ask us to delete this information. If you uninstall the App, you may request data deletion by contacting us, and we will delete your data within the timeframe required by Shopify's terms.
            </p>
          </section>

          <section style={styles.section}>
            <h2>6. Your Rights</h2>
            <p>
              If you are a resident of certain territories (such as the EEA or California), you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>
          </section>

          <section style={styles.section}>
            <h2>7. Changes</h2>
            <p>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
            </p>
          </section>

          <section style={styles.section}>
            <h2>8. Contact Us</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>support@shopframe.app</strong> (or your provided support email).
            </p>
          </section>
        </main>
        
        <footer style={styles.footer}>
          <p>&copy; {new Date().getFullYear()} ShopFrame. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: "#f4f6f8",
    color: "#111",
    lineHeight: "1.6",
    minHeight: "100vh",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "3rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  header: {
    borderBottom: "1px solid #e1e3e5",
    paddingBottom: "1.5rem",
    marginBottom: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: "0 0 0.5rem 0",
  },
  lastUpdated: {
    color: "#6b7177",
    fontSize: "0.95rem",
    margin: 0,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  footer: {
    marginTop: "3rem",
    borderTop: "1px solid #e1e3e5",
    paddingTop: "1.5rem",
    textAlign: "center",
    color: "#6b7177",
    fontSize: "0.9rem",
  }
};
