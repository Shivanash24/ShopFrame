import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.container}>
        <div className={styles.card}>
          
          <div className={styles.logoWrapper}>
            <img src="/shopframe-logo.jpg" alt="ShopFrame Logo" className={styles.logoImage} />
          </div>

          <h1 className={styles.heading}>
            Welcome to <span className={styles.highlight}>ShopFrame</span>
          </h1>
          <p className={styles.text}>
            Build a premium, high-converting storefront in minutes. Discover world-class layout sections, customize effortlessly, and scale your business.
          </p>

          {showForm && (
            <div className={styles.formContainer}>
              <Form className={styles.form} method="post" action="/auth/login">
                <label className={styles.label}>
                  <span className={styles.labelText}>Store Domain</span>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputPrefix}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <input 
                      className={styles.input} 
                      type="text" 
                      name="shop" 
                      placeholder="my-shop" 
                      autoComplete="off"
                    />
                  </div>
                  <span className={styles.inputHint}>e.g: my-shop-domain.myshopify.com</span>
                </label>
                <div className={styles.buttonGroup}>
                  <button className={styles.button} type="submit">
                    Log in
                  </button>
                  <button className={styles.buttonSecondary} type="submit">
                    Install App
                  </button>
                </div>
              </Form>
            </div>
          )}

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className={styles.featureTitle}>Premium Layouts</div>
              <div className={styles.featureDesc}>Access a library of world-class, high-converting layout sections built for modern commerce.</div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div className={styles.featureTitle}>Easy Customization</div>
              <div className={styles.featureDesc}>Effortlessly match your brand with our intuitive styling and section configuration tools.</div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className={styles.featureTitle}>Lightning Fast</div>
              <div className={styles.featureDesc}>Optimized for speed and performance to ensure maximum conversions and great SEO.</div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
